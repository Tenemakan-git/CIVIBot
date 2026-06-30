import { getQuestionnaire } from './questionnaire';

describe('Questionnaire (intégrité de l’arbre)', () => {
  const q = getQuestionnaire();
  const ids = new Set(q.questions.map((n) => n.id));

  it('a un point de départ valide', () => {
    expect(ids.has(q.start)).toBe(true);
  });

  it('a des identifiants de question uniques', () => {
    expect(ids.size).toBe(q.questions.length);
  });

  it('ne contient que des liens `next` vers des questions existantes', () => {
    for (const node of q.questions) {
      for (const opt of node.options) {
        if (opt.next) expect(ids.has(opt.next)).toBe(true);
      }
    }
  });

  it('a au moins une option par question et des valeurs non vides', () => {
    for (const node of q.questions) {
      expect(node.options.length).toBeGreaterThan(0);
      for (const opt of node.options) {
        expect(opt.value.trim()).not.toBe('');
        expect(opt.label.trim()).not.toBe('');
      }
    }
  });

  it("n'a aucune question orpheline (toutes atteignables depuis `start`)", () => {
    const reachable = new Set<string>();
    const visit = (id: string) => {
      if (reachable.has(id)) return;
      reachable.add(id);
      const node = q.questions.find((n) => n.id === id);
      node?.options.forEach((o) => o.next && visit(o.next));
    };
    visit(q.start);
    expect(reachable.size).toBe(q.questions.length);
  });
});
