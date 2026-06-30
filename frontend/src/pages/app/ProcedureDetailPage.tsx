import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { CheckCircle, Clock, DollarSign, FileText, HelpCircle, Link2, ListOrdered } from 'lucide-react';
import { useState } from 'react';

type Tab = 'description' | 'pieces' | 'etapes' | 'faq' | 'sources';

export default function ProcedureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>('description');

  const { data: proc, isLoading } = useQuery({
    queryKey: ['procedure', id],
    queryFn: () => api.get(`/procedures/${id}`).then(r => r.data),
  });

  if (isLoading) return <LoadingSpinner />;
  if (!proc) return <div className="p-6 text-gray-500">Procédure non trouvée</div>;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'description', label: 'Description', icon: <FileText size={14} /> },
    { id: 'pieces', label: `Pièces (${proc.documents?.length || 0})`, icon: <CheckCircle size={14} /> },
    { id: 'etapes', label: `Étapes (${proc.steps?.length || 0})`, icon: <ListOrdered size={14} /> },
    { id: 'faq', label: `FAQ (${proc.faqs?.length || 0})`, icon: <HelpCircle size={14} /> },
    { id: 'sources', label: 'Sources', icon: <Link2 size={14} /> },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-2">
        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
          {proc.categorie?.domaine?.nom} · {proc.categorie?.nom}
        </span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{proc.titre}</h1>
      <div className="flex gap-4 text-sm text-gray-500 mb-6">
        {proc.delai && <span className="flex items-center gap-1"><Clock size={14} />{proc.delai}</span>}
        {proc.cout && <span className="flex items-center gap-1"><DollarSign size={14} />{proc.cout}</span>}
      </div>

      <div className="flex gap-1 mb-6 border-b">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
              tab === t.id ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'description' && (
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed">{proc.description}</p>
          {proc.eligibilite && (
            <div className="mt-4 bg-orange-50 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-2">Éligibilité</h3>
              <p className="text-orange-700">{proc.eligibilite}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'pieces' && (
        <div className="space-y-3">
          {proc.documents?.map((doc: any) => (
            <div key={doc.id} className="flex items-start gap-3 p-3 border rounded-lg">
              <CheckCircle size={18} className={doc.obligatoire ? 'text-red-500' : 'text-gray-400'} />
              <div>
                <p className="font-medium text-gray-800">{doc.nom}</p>
                {doc.remarque && <p className="text-sm text-gray-500">{doc.remarque}</p>}
                <span className={`text-xs ${doc.obligatoire ? 'text-red-500' : 'text-gray-400'}`}>
                  {doc.obligatoire ? 'Obligatoire' : 'Optionnel'}
                </span>
              </div>
            </div>
          ))}
          {proc.documents?.length === 0 && <p className="text-gray-400">Aucun document requis.</p>}
        </div>
      )}

      {tab === 'etapes' && (
        <div className="space-y-4">
          {proc.steps?.map((step: any) => (
            <div key={step.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {step.ordre}
                </div>
                <div className="w-0.5 bg-gray-200 flex-1 mt-1" />
              </div>
              <div className="pb-4">
                <h4 className="font-semibold text-gray-800">{step.titre}</h4>
                <p className="text-sm text-gray-600 mt-1">{step.description}</p>
              </div>
            </div>
          ))}
          {proc.steps?.length === 0 && <p className="text-gray-400">Aucune étape définie.</p>}
        </div>
      )}

      {tab === 'faq' && (
        <div className="space-y-4">
          {proc.faqs?.map((faq: any) => (
            <div key={faq.id} className="border rounded-lg p-4">
              <p className="font-semibold text-gray-800 mb-2">{faq.question}</p>
              <p className="text-gray-600 text-sm">{faq.reponse}</p>
            </div>
          ))}
          {proc.faqs?.length === 0 && <p className="text-gray-400">Aucune FAQ disponible.</p>}
        </div>
      )}

      {tab === 'sources' && (
        <div className="space-y-3">
          {proc.sources?.map((src: any) => (
            <div key={src.id} className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium text-gray-700">{src.organisme}</span>
              {src.url && (
                <a href={src.url} target="_blank" rel="noreferrer" className="text-orange-600 text-sm hover:underline flex items-center gap-1">
                  <Link2 size={14} /> Voir
                </a>
              )}
            </div>
          ))}
          {proc.sources?.length === 0 && <p className="text-gray-400">Aucune source disponible.</p>}
        </div>
      )}
      </div>
    </div>
  );
}
