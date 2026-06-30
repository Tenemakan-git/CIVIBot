import { ChecklistAgent } from './checklist.agent';
import { AgentName } from '../../core/agent/agent-name.enum';
import { makeContext, withOutput } from '../../test-utils/agent-context.fixture';

function makeAgent(completeJson: jest.Mock) {
  const prisma = { checklist: { create: jest.fn().mockResolvedValue({}) } };
  return { agent: new ChecklistAgent({ completeJson } as any, prisma as any), prisma };
}

describe('ChecklistAgent', () => {
  it('génère une checklist et la persiste rattachée au dossier', async () => {
    const { agent, prisma } = makeAgent(
      jest.fn().mockResolvedValue({
        titre: 'À préparer',
        items: [
          { libelle: 'Photocopie CNI', obligatoire: true, termine: false, ordre: 1 },
          { libelle: 'Timbre fiscal', obligatoire: false, termine: false, ordre: 2 },
        ],
      }),
    );

    const res = await agent.execute(makeContext({ folderId: 'folder-1' }));

    expect(res.status).toBe('success');
    expect(res.data.items).toHaveLength(2);
    expect(prisma.checklist.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ folderId: 'folder-1', userId: 'user-1' }),
      }),
    );
  });

  it('filtre les items qui doublonnent les documents requis', async () => {
    const { agent, prisma } = makeAgent(
      jest.fn().mockResolvedValue({
        titre: 'À faire',
        items: [
          { libelle: "Fournir la pièce d'identité", ordre: 1 },
          { libelle: 'Prendre rendez-vous à la mairie', ordre: 2 },
          { libelle: 'Acte de naissance', ordre: 3 },
        ],
      }),
    );
    const ctx = makeContext({ folderId: 'folder-1' });
    withOutput(ctx, AgentName.Procedure, {
      requiredDocuments: [{ nom: "Pièce d'identité" }, { nom: 'Acte de naissance' }],
    });

    const res = await agent.execute(ctx);

    const libelles = res.data.items.map((i) => i.libelle);
    expect(libelles).toEqual(['Prendre rendez-vous à la mairie']);
    expect(res.data.items[0].ordre).toBe(1); // renuméroté
    // persistée avec le seul item d'action restant
    const persistedItems = prisma.checklist.create.mock.calls[0][0].data.items.create;
    expect(persistedItems).toHaveLength(1);
  });

  it('ne persiste pas quand aucun item n\'est généré', async () => {
    const { agent, prisma } = makeAgent(jest.fn().mockResolvedValue({ items: [] }));

    const res = await agent.execute(makeContext({ folderId: 'folder-1' }));

    expect(res.status).toBe('partial');
    expect(prisma.checklist.create).not.toHaveBeenCalled();
  });
});
