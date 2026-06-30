import { OfficialDocRenderer } from './official-doc-renderer';

describe('OfficialDocRenderer (pdfkit)', () => {
  it('produit un buffer PDF valide à partir du modèle de lettre', async () => {
    const renderer = new OfficialDocRenderer();

    const buffer = await renderer.render({
      titre: "Demande de copie d'acte de naissance",
      expediteur: { nom: 'Awa Koné', telephone: '+225 0700000000' },
      destinataire: "Monsieur l'Officier de l'état civil",
      lieuDate: 'Abidjan, le 30/06/2026',
      objet: "Demande de copie d'acte de naissance",
      corps: 'Madame, Monsieur,\n\nJe soussignée Awa Koné...\n\nSalutations distinguées.',
      signatureLabel: 'Signature',
    });

    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.slice(0, 5).toString()).toBe('%PDF-');
  });

  it('gère un expéditeur sans téléphone et un corps vide sans erreur', async () => {
    const renderer = new OfficialDocRenderer();
    const buffer = await renderer.render({
      titre: 'Vide',
      expediteur: { nom: 'Test User' },
      destinataire: 'Autorité',
      lieuDate: 'Abidjan, le 30/06/2026',
      objet: 'Test',
      corps: '',
      signatureLabel: 'Signature',
    });
    expect(buffer.slice(0, 5).toString()).toBe('%PDF-');
  });
});
