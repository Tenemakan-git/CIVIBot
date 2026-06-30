import { PdfAgent } from './pdf.agent';
import { AgentName } from '../../core/agent/agent-name.enum';
import { makeContext, withOutput } from '../../test-utils/agent-context.fixture';

function makeAgent() {
  const pdf = {
    generate: jest.fn().mockResolvedValue({
      buffer: Buffer.from('%PDF-1.4'),
      storageKey: '/tmp/dossier.pdf',
      filename: 'dossier.pdf',
      bytes: 1234,
    }),
  };
  return { agent: new PdfAgent(pdf as any), pdf };
}

describe('PdfAgent', () => {
  it('génère le PDF du dossier et renvoie l\'artefact', async () => {
    const { agent, pdf } = makeAgent();

    const res = await agent.execute(makeContext({ folderId: 'folder-1' }));

    expect(pdf.generate).toHaveBeenCalledWith('folder-1', 'user-1', []);
    expect(res.data.filename).toBe('dossier.pdf');
    expect(res.data.bytes).toBe(1234);
  });

  it('transmet les conseils du Procedure Agent au rendu', async () => {
    const { agent, pdf } = makeAgent();
    const ctx = makeContext({ folderId: 'folder-1' });
    withOutput(ctx, AgentName.Procedure, { tips: ['Arriver tôt'] });

    await agent.execute(ctx);

    expect(pdf.generate).toHaveBeenCalledWith('folder-1', 'user-1', ['Arriver tôt']);
  });
});
