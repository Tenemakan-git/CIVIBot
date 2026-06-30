import { MonitoringAgent } from './monitoring.agent';
import { Events } from '../../core/events/event-names';

function makeAgent() {
  const folders = { recordTimeline: jest.fn().mockResolvedValue(undefined) };
  const events = { emit: jest.fn() };
  return { agent: new MonitoringAgent(folders as any, events as any), folders, events };
}

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000);

describe('MonitoringAgent (réactif)', () => {
  it('détecte un retard sur un dossier ancien non terminé et le trace', async () => {
    const { agent, folders, events } = makeAgent();

    await agent.onFolderChanged({
      folderId: 'f1',
      userId: 'u1',
      domaine: 'etat_civil',
      statut: 'en_cours',
      progression: 30,
      createdAt: daysAgo(20),
    });

    expect(folders.recordTimeline).toHaveBeenCalled();
    expect(events.emit).toHaveBeenCalledWith(
      Events.Monitoring.ProgressComputed,
      expect.objectContaining({ late: true, progress: 30 }),
    );
  });

  it('ne signale pas de retard pour un dossier récent', async () => {
    const { agent, folders, events } = makeAgent();

    await agent.onFolderChanged({
      folderId: 'f1',
      userId: 'u1',
      domaine: 'etat_civil',
      statut: 'en_cours',
      progression: 30,
      createdAt: daysAgo(1),
    });

    expect(folders.recordTimeline).not.toHaveBeenCalled();
    expect(events.emit).toHaveBeenCalledWith(
      Events.Monitoring.ProgressComputed,
      expect.objectContaining({ late: false }),
    );
  });
});
