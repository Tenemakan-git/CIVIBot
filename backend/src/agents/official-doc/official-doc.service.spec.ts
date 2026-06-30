import * as os from 'os';
import * as path from 'path';
import { BadRequestException } from '@nestjs/common';

// Répertoire de stockage isolé pour les tests (lu à la construction du service).
process.env.DOC_STORAGE_DIR = path.join(os.tmpdir(), 'civibot-doc-test');

import { OfficialDocService } from './official-doc.service';

function makeService(overrides: { domaine?: string } = {}) {
  const view = {
    titre: 'Mon acte de naissance',
    domaine: overrides.domaine ?? 'etat_civil',
    procedureSlug: null,
  };
  const folders = {
    getView: jest.fn().mockResolvedValue(view),
    recordTimeline: jest.fn().mockResolvedValue(undefined),
  };
  const prisma = {
    user: {
      findUnique: jest.fn().mockResolvedValue({
        nom: 'Koné',
        prenom: 'Awa',
        telephone: '+225 0700000000',
      }),
    },
    generatedDocument: {
      create: jest.fn().mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'doc-1', createdAt: new Date(), ...data }),
      ),
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn(),
    },
  };
  const renderer = {
    render: jest.fn().mockResolvedValue(Buffer.from('%PDF-1.4 test')),
  };
  const llm = {
    complete: jest.fn().mockResolvedValue({ text: 'Corps rédigé par le LLM.' }),
  };

  const service = new OfficialDocService(
    folders as any,
    prisma as any,
    renderer as any,
    llm as any,
  );
  return { service, folders, prisma, renderer, llm };
}

describe('OfficialDocService', () => {
  it('liste les templates applicables au domaine du dossier', async () => {
    const { service } = makeService({ domaine: 'etat_civil' });
    const templates = await service.listTemplates('folder-1', 'user-1');
    const keys = templates.map((t) => t.key);
    expect(keys).toContain('demande-acte-naissance');
    expect(keys).toContain('lettre-requisition');
    expect(keys).not.toContain('declaration-cepici-entreprise');
  });

  it('génère un document statique en remplissant les champs user + ask', async () => {
    const { service, prisma, renderer } = makeService();
    const doc = await service.generate('folder-1', 'user-1', 'demande-acte-naissance', {
      dateNaissance: '12/05/1998',
      lieuNaissance: 'Abidjan, Cocody',
      nombreCopies: '2',
    });

    expect(renderer.render).toHaveBeenCalledTimes(1);
    const model = renderer.render.mock.calls[0][0];
    expect(model.expediteur.nom).toBe('Awa Koné');
    expect(model.corps).toContain('Awa Koné');
    expect(model.corps).toContain('12/05/1998');
    expect(model.corps).toContain('2 copie(s)');

    // persistance + métadonnées renvoyées
    expect(prisma.generatedDocument.create).toHaveBeenCalledTimes(1);
    expect(doc.filename).toMatch(/^demande-acte-naissance-folder-1-\d+\.pdf$/);
    expect(doc.buffer.slice(0, 5).toString()).toBe('%PDF-');
  });

  it('refuse la génération si un champ requis est manquant', async () => {
    const { service } = makeService();
    await expect(
      service.generate('folder-1', 'user-1', 'demande-acte-naissance', {
        dateNaissance: '12/05/1998',
        // lieuNaissance + nombreCopies manquants
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('utilise le LLM pour rédiger le corps des templates à instruction', async () => {
    const { service, llm, renderer } = makeService();
    await service.generate('folder-1', 'user-1', 'lettre-requisition', {
      objetDemande: "obtention d'un certificat de résidence",
    });

    expect(llm.complete).toHaveBeenCalledTimes(1);
    const model = renderer.render.mock.calls[0][0];
    expect(model.corps).toBe('Corps rédigé par le LLM.');
  });

  it("refuse un template hors du domaine du dossier", async () => {
    const { service } = makeService({ domaine: 'etat_civil' });
    await expect(
      service.generate('folder-1', 'user-1', 'declaration-cepici-entreprise', {}),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
