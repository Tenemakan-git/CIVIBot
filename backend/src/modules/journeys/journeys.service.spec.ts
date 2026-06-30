import { JourneysService } from './journeys.service';

function makeService(session: any) {
  const prisma = {
    guidedSession: {
      findFirstOrThrow: jest.fn().mockResolvedValue(session),
      update: jest.fn().mockResolvedValue({}),
    },
    conversation: {
      create: jest.fn().mockResolvedValue({ id: 'conv-new' }),
    },
  };
  const orchestrator = {
    run: jest.fn(async (ctx: any) => {
      ctx.folderId = 'folder-generated'; // l'orchestrateur crée le dossier
    }),
  };
  return {
    service: new JourneysService(prisma as any, orchestrator as any),
    prisma,
    orchestrator,
  };
}

describe('JourneysService.complete', () => {
  it('synthétise les réponses, lance le pipeline et lie le dossier généré', async () => {
    const { service, prisma, orchestrator } = makeService({
      id: 's1',
      statut: 'en_cours',
      folderId: null,
      answers: [
        { question: 'Quelle démarche ?', reponse: "Création d'entreprise", ordre: 0 },
        { question: 'Objectif ?', reponse: 'Créer mon activité', ordre: 1 },
      ],
    });

    const res = await service.complete('s1', 'user-1');

    // le message d'intention reprend les réponses
    const ctx = orchestrator.run.mock.calls[0][0];
    expect(ctx.userMessage).toContain("Création d'entreprise");
    expect(ctx.userMessage).toContain('Créer mon activité');
    expect(ctx.metadata.source).toBe('guided-journey');

    // persistance du résultat sur la session
    expect(prisma.guidedSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 's1' },
        data: expect.objectContaining({
          statut: 'termine',
          folderId: 'folder-generated',
          conversationId: 'conv-new',
        }),
      }),
    );
    expect(res).toEqual({
      sessionId: 's1',
      folderId: 'folder-generated',
      conversationId: 'conv-new',
    });
  });

  it('est idempotent : un parcours déjà généré ne relance pas le pipeline', async () => {
    const { service, orchestrator, prisma } = makeService({
      id: 's1',
      statut: 'termine',
      folderId: 'folder-existant',
      conversationId: 'conv-existante',
      answers: [],
    });

    const res = await service.complete('s1', 'user-1');

    expect(orchestrator.run).not.toHaveBeenCalled();
    expect(prisma.conversation.create).not.toHaveBeenCalled();
    expect(res.folderId).toBe('folder-existant');
  });
});
