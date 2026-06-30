import { NotificationAgent } from './notification.agent';

function makeAgent(existingNotif: any = null) {
  const folders = { recordNotification: jest.fn().mockResolvedValue(undefined) };
  const prisma = {
    folderNotification: { findFirst: jest.fn().mockResolvedValue(existingNotif) },
  };
  return { agent: new NotificationAgent(folders as any, prisma as any), folders };
}

describe('NotificationAgent (réactif)', () => {
  it('crée une notification de retard quand le dossier est en retard', async () => {
    const { agent, folders } = makeAgent(null);

    await agent.onProgress({
      folderId: 'f1',
      userId: 'u1',
      progress: 30,
      late: true,
      ageDays: 20,
    });

    expect(folders.recordNotification).toHaveBeenCalledWith(
      'f1',
      expect.objectContaining({ type: 'retard' }),
    );
  });

  it('déduplique : pas de doublon si une notif de retard non lue existe déjà', async () => {
    const { agent, folders } = makeAgent({ id: 'n1' });

    await agent.onProgress({
      folderId: 'f1',
      userId: 'u1',
      progress: 30,
      late: true,
      ageDays: 20,
    });

    expect(folders.recordNotification).not.toHaveBeenCalled();
  });

  it('notifie l\'arrivée de nouvelles informations officielles', async () => {
    const { agent, folders } = makeAgent(null);

    await agent.onKnowledgeCommitted({ folderId: 'f1', documents: 2 });

    expect(folders.recordNotification).toHaveBeenCalledWith(
      'f1',
      expect.objectContaining({ type: 'nouvelle_info' }),
    );
  });
});
