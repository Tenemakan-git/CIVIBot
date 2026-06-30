import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../prisma/prisma.service';
import { FolderService } from '../../folders/application/folder.service';
import { LLM_PROVIDER } from '../../core/ports/llm.port';
import type { ILlmProvider } from '../../core/ports/llm.port';
import {
  OfficialDocModel,
  OfficialDocRenderer,
} from '../../infrastructure/pdf/official-doc-renderer';
import {
  DocumentTemplate,
  TemplateField,
} from './templates/document-template.types';
import { getTemplate, templatesForDomaine } from './templates/document-templates';
import {
  GeneratedDocMeta,
  TemplateSummary,
} from './dto/official-doc.dto';

export interface GeneratedDoc extends GeneratedDocMeta {
  storageKey: string;
  buffer: Buffer;
}

/**
 * Application de la génération de documents officiels pré-remplis.
 * Remplit déterministiquement les champs `user`/`folder`, rédige le corps via
 * LLM si le template le demande, rend le PDF et persiste l'artefact.
 */
@Injectable()
export class OfficialDocService {
  private readonly storageDir =
    process.env.DOC_STORAGE_DIR ||
    path.join(process.cwd(), 'storage', 'documents');

  private readonly system =
    "Tu es l'assistant de rédaction administrative de CiviBot (Côte d'Ivoire). " +
    'Tu rédiges un texte formel, poli et concis en français.';

  constructor(
    private readonly folders: FolderService,
    private readonly prisma: PrismaService,
    private readonly renderer: OfficialDocRenderer,
    @Inject(LLM_PROVIDER) private readonly llm: ILlmProvider,
  ) {}

  /** Templates applicables au dossier (contrôle d'appartenance via getView). */
  async listTemplates(
    folderId: string,
    userId: string,
  ): Promise<TemplateSummary[]> {
    const view = await this.folders.getView(folderId, userId);
    return templatesForDomaine(view.domaine, view.procedureSlug).map((t) => ({
      key: t.key,
      titre: t.titre,
      description: t.description,
      fields: t.fields.map((f) => ({
        key: f.key,
        label: f.label,
        required: f.required,
        source: f.source,
        example: f.example,
      })),
    }));
  }

  /** Liste les documents déjà générés pour un dossier. */
  async listGenerated(
    folderId: string,
    userId: string,
  ): Promise<GeneratedDocMeta[]> {
    await this.folders.getView(folderId, userId); // ownership
    const rows = await this.prisma.generatedDocument.findMany({
      where: { folderId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      templateKey: r.templateKey,
      titre: r.titre,
      filename: r.filename,
      bytes: r.bytes,
      createdAt: r.createdAt,
    }));
  }

  /** Génère un document à partir d'un template et des champs saisis. */
  async generate(
    folderId: string,
    userId: string,
    templateKey: string,
    askFields: Record<string, string> = {},
  ): Promise<GeneratedDoc> {
    const view = await this.folders.getView(folderId, userId); // ownership
    const template = getTemplate(templateKey);
    if (!template) throw new NotFoundException('Modèle de document introuvable');
    if (!template.domaines.includes(view.domaine)) {
      throw new BadRequestException(
        "Ce modèle ne s'applique pas au domaine de ce dossier",
      );
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const values = this.resolveFields(template, view, user, askFields);
    const corps = await this.buildCorps(template, values);

    const dateStr = new Date().toLocaleDateString('fr-FR');
    const model: OfficialDocModel = {
      titre: template.titre,
      expediteur: {
        nom: values.nomComplet || `${user.prenom} ${user.nom}`.trim(),
        telephone: values.telephone || user.telephone || null,
      },
      destinataire: template.destinataire,
      lieuDate: `Le ${dateStr}`,
      objet: this.interpolate(template.objet, values),
      corps,
      signatureLabel: 'Signature',
    };

    const buffer = await this.renderer.render(model);

    fs.mkdirSync(this.storageDir, { recursive: true });
    const filename = `${template.key}-${folderId}-${Date.now()}.pdf`;
    const storageKey = path.join(this.storageDir, filename);
    fs.writeFileSync(storageKey, buffer);

    const row = await this.prisma.generatedDocument.create({
      data: {
        folderId,
        templateKey: template.key,
        titre: template.titre,
        storageKey,
        filename,
        bytes: buffer.length,
        fields: values,
      },
    });

    await this.folders.recordTimeline(folderId, {
      type: 'agent_step',
      label: `Document généré : ${template.titre}`,
    });

    return {
      id: row.id,
      templateKey: template.key,
      titre: template.titre,
      filename,
      bytes: buffer.length,
      createdAt: row.createdAt,
      storageKey,
      buffer,
    };
  }

  /** Relit le fichier d'un document généré (contrôle d'appartenance). */
  async getFile(
    folderId: string,
    docId: string,
    userId: string,
  ): Promise<{ buffer: Buffer; filename: string }> {
    await this.folders.getView(folderId, userId); // ownership
    const row = await this.prisma.generatedDocument.findFirst({
      where: { id: docId, folderId },
    });
    if (!row) throw new NotFoundException('Document introuvable');
    if (!fs.existsSync(row.storageKey)) {
      throw new NotFoundException('Fichier du document introuvable');
    }
    return { buffer: fs.readFileSync(row.storageKey), filename: row.filename };
  }

  // ── Remplissage ──

  private resolveFields(
    template: DocumentTemplate,
    view: { titre: string; domaine: string; procedureSlug: string | null },
    user: { nom: string; prenom: string; telephone: string | null },
    askFields: Record<string, string>,
  ): Record<string, string> {
    const values: Record<string, string> = {};
    const missing: string[] = [];

    for (const field of template.fields) {
      const value = this.readField(field, view, user, askFields);
      values[field.key] = value;
      if (field.required && !value.trim()) missing.push(field.label);
    }

    if (missing.length > 0) {
      throw new BadRequestException(
        `Champs requis manquants : ${missing.join(', ')}`,
      );
    }
    return values;
  }

  private readField(
    field: TemplateField,
    view: { titre: string; domaine: string; procedureSlug: string | null },
    user: { nom: string; prenom: string; telephone: string | null },
    askFields: Record<string, string>,
  ): string {
    switch (field.source) {
      case 'user':
        if (field.key === 'nomComplet')
          return `${user.prenom} ${user.nom}`.trim();
        if (field.key === 'telephone') return user.telephone ?? '';
        return '';
      case 'folder':
        if (field.key === 'titre') return view.titre;
        if (field.key === 'domaine') return view.domaine;
        if (field.key === 'procedure') return view.procedureSlug ?? '';
        return '';
      case 'ask':
      default:
        return (askFields[field.key] ?? '').trim();
    }
  }

  private async buildCorps(
    template: DocumentTemplate,
    values: Record<string, string>,
  ): Promise<string> {
    if (template.bodyInstruction) {
      const instruction = this.interpolate(template.bodyInstruction, values);
      const result = await this.llm.complete({
        tier: 'generation',
        system: this.system,
        messages: [{ role: 'user', content: instruction }],
      });
      return result.text.trim();
    }
    return this.interpolate(template.staticBody ?? '', values);
  }

  /** Remplace les {{cle}} par la valeur correspondante (vide si absente). */
  private interpolate(tpl: string, values: Record<string, string>): string {
    return tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) =>
      (values[key] ?? '').trim(),
    );
  }
}
