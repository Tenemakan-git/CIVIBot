import { Inject, Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { AgentName } from '../../core/agent/agent-name.enum';
import { AgentContext, readOutput } from '../../core/agent/agent-context';
import { LLM_PROVIDER } from '../../core/ports/llm.port';
import type { ILlmProvider, LlmMessage } from '../../core/ports/llm.port';
import { PrismaService } from '../../prisma/prisma.service';
import { OrchestratorService } from '../../orchestration/orchestrator.service';
import {
  HandleConversationParams,
  IConversationAgent,
} from './contracts/conversation.contract';
import { KnowledgeAnswerDto } from '../knowledge/dto/knowledge-io.dto';

/** Forme lâche du verdict Quality lue depuis le contexte (sans couplage DTO). */
interface QualityVerdict {
  passed: boolean;
  confidence: number;
  hallucinationRisk: number;
}

/** Forme lâche de la sortie Orientation (sans couplage au DTO de l'agent). */
interface OrientationPoint {
  nom: string;
  type: string;
  adresse: string;
  ville: string;
  telephone: string | null;
  horaires: string | null;
  url: string | null;
  distanceKm?: number | null;
}

/**
 * Conversation Agent — façade d'entrée/sortie. Gère le contexte conversationnel,
 * délègue la décision à l'Orchestrator, puis synthétise et diffuse (SSE) la
 * réponse finale ancrée dans le contexte assemblé par les agents.
 */
@Injectable()
export class ConversationAgent implements IConversationAgent {
  private readonly logger = new Logger(ConversationAgent.name);

  constructor(
    private readonly orchestrator: OrchestratorService,
    private readonly prisma: PrismaService,
    @Inject(LLM_PROVIDER) private readonly llm: ILlmProvider,
  ) {}

  async handle(params: HandleConversationParams, res: Response): Promise<void> {
    const start = Date.now();
    const conversationId = await this.ensureConversation(
      params.userId,
      params.conversationId,
      params.message,
    );

    await this.prisma.message.create({
      data: { conversationId, sender: 'USER', contenu: params.message },
    });

    this.openSse(res);
    this.send(res, { type: 'status', state: 'started', conversationId });

    const ctx: AgentContext = {
      runId: crypto.randomUUID(),
      folderId: params.folderId ?? '',
      userId: params.userId,
      conversationId,
      locale: 'fr',
      userMessage: params.message,
      outputs: {},
      metadata: {},
    };

    // Position du navigateur (consentie) → exploitée par l'Orientation Agent.
    if (typeof params.lat === 'number' && typeof params.lng === 'number') {
      ctx.metadata.userLocation = { lat: params.lat, lng: params.lng };
    }

    try {
      await this.orchestrator.run(ctx, {
        onAgentStep: (agent, status) =>
          this.send(res, { type: 'agent_step', agent, status }),
      });
    } catch (err) {
      this.logger.error(`Orchestration échouée: ${(err as Error).message}`);
      // On poursuit en mode dégradé (réponse sans contexte agentique).
    }

    // Contexte documentaire issu du Knowledge Agent
    const knowledge = readOutput<KnowledgeAnswerDto>(ctx, AgentName.Knowledge);
    this.send(res, {
      type: 'sources',
      sources: (knowledge?.data?.chunks ?? []).map((c) => ({
        id: c.id,
        titre: c.titre,
        extrait: c.extrait,
      })),
      folderId: ctx.folderId || null,
    });

    // Orientation : services compétents (triés par proximité si position connue).
    const orientation = readOutput<{ servicePoints: OrientationPoint[] }>(
      ctx,
      AgentName.Orientation,
    );
    const servicePoints = orientation?.data?.servicePoints ?? [];
    const located = !!ctx.metadata.userLocation;
    if (servicePoints.length > 0) {
      this.send(res, { type: 'services', services: servicePoints, located });
    }

    // Verdict du Quality Agent : pilote le mode de synthèse (prudent si échec).
    const quality = readOutput<QualityVerdict>(ctx, AgentName.Quality);
    this.send(res, {
      type: 'quality',
      passed: quality?.data?.passed ?? true,
      confidence: quality?.data?.confidence ?? null,
      hallucinationRisk: quality?.data?.hallucinationRisk ?? null,
    });

    await this.streamAnswer(
      ctx,
      conversationId,
      knowledge?.data?.context ?? '',
      quality?.data?.passed === false,
      this.orientationContext(servicePoints, located),
      res,
      start,
    );
  }

  /** Bloc de prompt orientant le bot vers le service compétent le plus proche. */
  private orientationContext(
    points: OrientationPoint[],
    located: boolean,
  ): string {
    if (points.length === 0) return '';
    const lines = points.slice(0, 3).map((p, i) => {
      const dist =
        located && typeof p.distanceKm === 'number'
          ? ` — à ~${p.distanceKm} km`
          : '';
      const h = p.horaires ? ` (${p.horaires})` : '';
      return `${i + 1}. ${p.nom}, ${p.adresse}, ${p.ville}${dist}${h}`;
    });
    const intro = located
      ? "Services administratifs compétents les plus proches de l'utilisateur (le plus proche en premier) :"
      : 'Services administratifs compétents pour cette démarche :';
    return (
      `${intro}\n${lines.join('\n')}\n` +
      "Si l'utilisateur demande où se rendre, recommande en priorité le premier de cette liste " +
      '(avec son adresse), sans inventer d\'autres adresses.'
    );
  }

  // ── Synthèse finale (streaming) ──
  private async streamAnswer(
    ctx: AgentContext,
    conversationId: string,
    context: string,
    cautious: boolean,
    orientation: string,
    res: Response,
    start: number,
  ): Promise<void> {
    const settings = await this.prisma.aiSettings.findFirst();
    const basePrompt =
      settings?.promptSysteme ??
      "Tu es CiviBot, assistant administratif pour la Côte d'Ivoire. Réponds en français, clairement.";
    const cautionGuard = cautious
      ? "\n\nIMPORTANT (contrôle qualité): l'ancrage documentaire est faible. Si le contexte ne contient pas l'information, dis-le explicitement, N'INVENTE RIEN, et invite l'utilisateur à vérifier auprès de l'organisme officiel compétent."
      : '';
    const orientationGuard = orientation ? `\n\n${orientation}` : '';
    const system =
      (context
        ? `${basePrompt}\n\nContexte documentaire pertinent :\n${context}`
        : basePrompt) +
      cautionGuard +
      orientationGuard;

    const messages = await this.buildHistory(conversationId);

    let full = '';
    try {
      const result = await this.llm.stream(
        { tier: 'generation', system, messages },
        {
          onText: (text) => {
            full += text;
            this.send(res, { type: 'chunk', content: text });
          },
        },
      );

      await this.prisma.message.create({
        data: {
          conversationId,
          sender: 'AI',
          contenu: full,
          tokens: result.outputTokens || null,
          modeleUtilise: result.model,
        },
      });
      await this.prisma.aiLog.create({
        data: {
          conversationId,
          prompt: ctx.userMessage,
          reponse: full,
          modele: result.model,
          tokensInput: result.inputTokens,
          tokensOutput: result.outputTokens,
          dureeMs: Date.now() - start,
          cout: result.inputTokens * 0.000003 + result.outputTokens * 0.000015,
        },
      });

      this.send(res, { type: 'done', model: result.model });
      res.end();
    } catch (err) {
      this.send(res, {
        type: 'error',
        message:
          "Aucune IA disponible pour le moment. Réessayez plus tard ou vérifiez la configuration.",
      });
      this.logger.error(`Streaming échoué: ${(err as Error).message}`);
      res.end();
    }
  }

  private async buildHistory(conversationId: string): Promise<LlmMessage[]> {
    const history = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });
    return history.map((m) => ({
      role: m.sender === 'USER' ? ('user' as const) : ('assistant' as const),
      content: m.contenu,
    }));
  }

  private async ensureConversation(
    userId: string,
    conversationId: string | undefined,
    message: string,
  ): Promise<string> {
    if (conversationId) {
      const conv = await this.prisma.conversation.findFirst({
        where: { id: conversationId, userId },
      });
      if (conv) return conv.id;
    }
    const created = await this.prisma.conversation.create({
      data: { userId, titre: message.slice(0, 60) },
    });
    return created.id;
  }

  // ── SSE helpers ──
  private openSse(res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
  }

  private send(res: Response, payload: Record<string, unknown>): void {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  }
}
