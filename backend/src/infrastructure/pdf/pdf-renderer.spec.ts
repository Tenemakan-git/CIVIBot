import { PdfRenderer } from './pdf-renderer';

describe('PdfRenderer (pdfkit)', () => {
  it('produit un buffer PDF valide à partir du modèle de dossier', async () => {
    const renderer = new PdfRenderer();

    const buffer = await renderer.render({
      titre: 'Acte de naissance',
      domaine: 'etat_civil',
      statut: 'en_cours',
      progression: 40,
      cout: '5 000 FCFA',
      delai: '7 jours',
      steps: [{ ordre: 1, titre: 'Demande', description: 'Au centre' }],
      documents: [{ nom: 'CNI', statut: 'fourni', obligatoire: true }],
      checklists: [{ titre: 'À préparer', items: [{ texte: 'Copie CNI', coche: true, ordre: 1 }] }],
      sources: [{ organisme: 'Service Public CI', url: 'https://www.service-public.ci' }],
      tips: ['Arriver tôt'],
    });

    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.slice(0, 5).toString()).toBe('%PDF-');
  });

  it('gère un dossier vide sans erreur', async () => {
    const renderer = new PdfRenderer();
    const buffer = await renderer.render({
      titre: 'Vide',
      domaine: 'etat_civil',
      statut: 'ouvert',
      progression: 0,
      steps: [],
      documents: [],
      checklists: [],
      sources: [],
      tips: [],
    });
    expect(buffer.slice(0, 5).toString()).toBe('%PDF-');
  });
});
