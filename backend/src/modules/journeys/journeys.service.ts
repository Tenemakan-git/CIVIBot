import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrchestratorService } from '../../orchestration/orchestrator.service';
import type { AgentContext } from '../../core/agent/agent-context';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { getQuestionnaire } from './questionnaire';

@Injectable()
export class JourneysService {
  constructor(
    private prisma: PrismaService,
    private orchestrator: OrchestratorService,
  ) {}

  /** Arbre de questions branché du parcours guidé. */
  questionnaire() {
    return getQuestionnaire();
  }

  findAll(userId: string) {
    return this.prisma.guidedSession.findMany({
      where: { userId },
      include: { answers: { orderBy: { ordre: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string, userId: string) {
    return this.prisma.guidedSession.findFirst({
      where: { id, userId },
      include: { answers: { orderBy: { ordre: 'asc' } } },
    });
  }

  create(userId: string) {
    return this.prisma.guidedSession.create({ data: { userId } });
  }

  async addAnswer(sessionId: string, userId: string, dto: AnswerQuestionDto) {
    await this.prisma.guidedSession.findFirstOrThrow({ where: { id: sessionId, userId } });
    return this.prisma.guidedAnswer.create({
      data: { sessionId, ...dto },
    });
  }

  /**
   * Termine le parcours : synthétise les réponses en une intention, lance le
   * pipeline agentique (qui crée le dossier + plan + orientation + documents)
   * et lie le résultat à la session. Idempotent : un parcours déjà généré
   * renvoie son dossier existant.
   */
  async complete(sessionId: string, userId: string) {
    const session = await this.prisma.guidedSession.findFirstOrThrow({
      where: { id: sessionId, userId },
      include: { answers: { orderBy: { ordre: 'asc' } } },
    });

    if (session.statut === 'termine' && session.folderId) {
      return {
        sessionId,
        folderId: session.folderId,
        conversationId: session.conversationId,
      };
    }

    const userMessage = this.synthesize(session.answers);
    const conversation = await this.prisma.conversation.create({
      data: { userId, titre: 'Parcours guidé' },
    });

    const ctx: AgentContext = {
      runId: crypto.randomUUID(),
      folderId: '',
      userId,
      conversationId: conversation.id,
      locale: 'fr',
      userMessage,
      outputs: {},
      metadata: { source: 'guided-journey' },
    };

    try {
      await this.orchestrator.run(ctx);
    } catch {
      // Pipeline résilient : on conserve ce qui a été produit (au moins le dossier).
    }

    const folderId = ctx.folderId || null;
    await this.prisma.guidedSession.update({
      where: { id: sessionId },
      data: { statut: 'termine', folderId, conversationId: conversation.id },
    });

    return { sessionId, folderId, conversationId: conversation.id };
  }

  /** Transforme les réponses du questionnaire en message d'intention. */
  private synthesize(answers: { question: string; reponse: string }[]): string {
    if (answers.length === 0) {
      return 'Aide-moi à identifier la démarche administrative adaptée à ma situation.';
    }
    return [
      'Voici les informations de mon parcours guidé :',
      ...answers.map((a) => `- ${a.question} ${a.reponse}`),
      'Établis ma démarche administrative adaptée (étapes, documents, coûts, délais).',
    ].join('\n');
  }
}
