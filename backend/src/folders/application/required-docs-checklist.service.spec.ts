import { RequiredDocsChecklistService } from './required-docs-checklist.service';

function makeService(over: { docs?: any[]; existingChecklist?: any } = {}) {
  const prisma = {
    administrativeFolder: {
      findUnique: jest.fn().mockResolvedValue({ userId: 'user-1' }),
    },
    folderDocument: {
      findMany: jest.fn().mockResolvedValue(
        over.docs ?? [
          { id: 'd1', nom: 'CNI', statut: 'fourni', obligatoire: true },
          { id: 'd2', nom: 'Photo', statut: 'manquant', obligatoire: false },
        ],
      ),
      findUnique: jest.fn().mockResolvedValue({ id: 'd1', folderId: 'f1' }),
      update: jest.fn().mockResolvedValue({}),
    },
    checklist: {
      findFirst: jest.fn().mockResolvedValue(over.existingChecklist ?? null),
      create: jest.fn().mockResolvedValue({ id: 'cl1' }),
    },
    checklistItem: {
      deleteMany: jest.fn().mockResolvedValue({}),
      createMany: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({}),
    },
  };
  const folders = { recomputeProgress: jest.fn().mockResolvedValue({}) };
  return {
    service: new RequiredDocsChecklistService(prisma as any, folders as any),
    prisma,
    folders,
  };
}

describe('RequiredDocsChecklistService', () => {
  it('construit la checklist miroir : coche = statut, lien document, libellé optionnel', async () => {
    const { service, prisma } = makeService();
    await service.sync('f1');

    expect(prisma.checklist.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ titre: 'Documents à fournir', folderId: 'f1' }),
      }),
    );
    const items = prisma.checklistItem.createMany.mock.calls[0][0].data;
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ texte: 'CNI', coche: true, folderDocumentId: 'd1' });
    expect(items[1]).toMatchObject({ texte: 'Photo (optionnel)', coche: false, folderDocumentId: 'd2' });
  });

  it('réutilise la checklist existante (idempotent) et reconstruit les items', async () => {
    const { service, prisma } = makeService({ existingChecklist: { id: 'cl-ex' } });
    await service.sync('f1');
    expect(prisma.checklist.create).not.toHaveBeenCalled();
    expect(prisma.checklistItem.deleteMany).toHaveBeenCalledWith({ where: { checklistId: 'cl-ex' } });
  });

  it('ne crée rien si le dossier n’a aucun document', async () => {
    const { service, prisma } = makeService({ docs: [] });
    await service.sync('f1');
    expect(prisma.checklist.create).not.toHaveBeenCalled();
    expect(prisma.checklistItem.createMany).not.toHaveBeenCalled();
  });

  it('setDocProvided synchronise document + items liés + progression', async () => {
    const { service, prisma, folders } = makeService();
    await service.setDocProvided('d1', true);

    expect(prisma.folderDocument.update).toHaveBeenCalledWith({
      where: { id: 'd1' },
      data: { statut: 'fourni' },
    });
    expect(prisma.checklistItem.updateMany).toHaveBeenCalledWith({
      where: { folderDocumentId: 'd1' },
      data: { coche: true },
    });
    expect(folders.recomputeProgress).toHaveBeenCalledWith('f1');
  });
});
