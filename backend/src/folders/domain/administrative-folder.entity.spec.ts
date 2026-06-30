import { AdministrativeFolder } from './administrative-folder.entity';
import { FolderStatus } from './folder-status.vo';
import { Domain } from '../../core/agent/domain.enum';

function newFolder() {
  return AdministrativeFolder.create({
    userId: 'u1',
    domaine: Domain.CreationEntreprise,
    titre: 'Créer une SARL',
  });
}

describe('AdministrativeFolder (aggregate root)', () => {
  it('naît "ouvert" avec une progression nulle', () => {
    const f = newFolder();
    expect(f.statut).toBe(FolderStatus.Ouvert);
    expect(f.progression).toBe(0);
  });

  it('passe en "en_cours" dès qu\'il y a de la progression', () => {
    const f = newFolder();
    f.updateProgress(40);
    expect(f.statut).toBe(FolderStatus.EnCours);
    expect(f.progression).toBe(40);
  });

  it('passe en "complet" à 100%', () => {
    const f = newFolder();
    f.updateProgress(100);
    expect(f.statut).toBe(FolderStatus.Complet);
  });

  it('borne la progression entre 0 et 100', () => {
    const f = newFolder();
    f.updateProgress(150);
    expect(f.progression).toBe(100);
    f.updateProgress(-10);
    expect(f.progression).toBe(0);
  });

  it('autorise la terminaison et interdit les transitions invalides', () => {
    const f = newFolder();
    f.terminate();
    expect(f.statut).toBe(FolderStatus.Termine);
    // depuis "termine", aucune transition n'est permise
    expect(() => f.transitionTo(FolderStatus.EnCours)).toThrow();
  });

  it('réhydrate depuis un snapshot et reste cohérent', () => {
    const f = newFolder();
    f.updateProgress(60);
    const snap = f.toSnapshot();
    const rehydrated = AdministrativeFolder.fromSnapshot(snap);
    expect(rehydrated.progression).toBe(60);
    expect(rehydrated.statut).toBe(FolderStatus.EnCours);
  });

  it('refuse un titre vide', () => {
    const f = newFolder();
    expect(() => f.rename('  ')).toThrow();
  });
});
