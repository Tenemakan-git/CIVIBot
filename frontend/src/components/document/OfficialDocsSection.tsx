import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileSignature, Download, X, Loader2 } from 'lucide-react';
import {
  officialDocService,
  type TemplateSummary,
} from '../../services/officialDoc.service';

/** Section "Documents à générer" d'un dossier : modèles pré-remplis + historique. */
export default function OfficialDocsSection({ folderId }: { folderId: string }) {
  const qc = useQueryClient();
  const [active, setActive] = useState<TemplateSummary | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  const templatesQ = useQuery({
    queryKey: ['doc-templates', folderId],
    queryFn: () => officialDocService.templates(folderId),
  });
  const generatedQ = useQuery({
    queryKey: ['doc-generated', folderId],
    queryFn: () => officialDocService.generated(folderId),
  });

  const genMut = useMutation({
    mutationFn: (p: { templateKey: string; fields: Record<string, string> }) =>
      officialDocService.generate(folderId, p.templateKey, p.fields),
    onSuccess: async (doc) => {
      setActive(null);
      setValues({});
      qc.invalidateQueries({ queryKey: ['doc-generated', folderId] });
      qc.invalidateQueries({ queryKey: ['folder', folderId] });
      await officialDocService.download(folderId, doc.id, doc.filename);
    },
  });

  const askFields = (t: TemplateSummary) =>
    t.fields.filter((f) => f.source === 'ask');

  const onGenerate = (t: TemplateSummary) => {
    if (askFields(t).length > 0) {
      setActive(t);
      setValues({});
    } else {
      genMut.mutate({ templateKey: t.key, fields: {} });
    }
  };

  const missingRequired = active
    ? askFields(active).filter(
        (f) => f.required && !(values[f.key] ?? '').trim(),
      )
    : [];

  const templates = templatesQ.data ?? [];
  const generated = generatedQ.data ?? [];

  if (templatesQ.isLoading) return null;
  if (templates.length === 0) return null;

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-gray-400">
          <FileSignature size={16} />
        </span>
        <h2 className="font-semibold text-gray-800">Documents à générer</h2>
      </div>

      <ul className="space-y-2.5">
        {templates.map((t) => (
          <li
            key={t.key}
            className="rounded-lg border border-gray-100 p-3 transition hover:border-orange-200 hover:bg-orange-50/30"
          >
            <p className="text-sm font-medium text-gray-800">{t.titre}</p>
            <p className="mt-0.5 text-xs text-gray-500">{t.description}</p>
            <button
              onClick={() => onGenerate(t)}
              disabled={genMut.isPending}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700 disabled:opacity-50"
            >
              {genMut.isPending && genMut.variables?.templateKey === t.key ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <FileSignature size={13} />
              )}
              Générer
            </button>
          </li>
        ))}
      </ul>

      {generated.length > 0 && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Déjà générés
          </p>
          <ul className="space-y-1.5">
            {generated.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2"
              >
                <span className="flex-1 truncate text-sm text-gray-700">
                  {d.titre}
                </span>
                <button
                  onClick={() =>
                    officialDocService.download(folderId, d.id, d.filename)
                  }
                  className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-800"
                >
                  <Download size={13} /> PDF
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal de saisie des champs */}
      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-900">{active.titre}</h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Complétez les informations pour pré-remplir le document.
                </p>
              </div>
              <button
                onClick={() => setActive(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {askFields(active).map((f) => (
                <div key={f.key}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {f.label}
                    {f.required && <span className="text-red-500"> *</span>}
                  </label>
                  <input
                    type="text"
                    value={values[f.key] ?? ''}
                    placeholder={f.example}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [f.key]: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setActive(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() =>
                  genMut.mutate({ templateKey: active.key, fields: values })
                }
                disabled={missingRequired.length > 0 || genMut.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
              >
                {genMut.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <FileSignature size={14} />
                )}
                Générer le document
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
