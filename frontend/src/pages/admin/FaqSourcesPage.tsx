import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { Plus, Trash2 } from 'lucide-react';

export default function FaqSourcesPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'faq' | 'sources'>('faq');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({});

  const { data: faqs = [], isLoading: faqLoading } = useQuery({
    queryKey: ['admin-faq'],
    queryFn: () => api.get('/admin/faq').then(r => r.data),
  });

  const { data: sources = [], isLoading: srcLoading } = useQuery({
    queryKey: ['admin-sources'],
    queryFn: () => api.get('/admin/sources').then(r => r.data),
  });

  const createFaqMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/faq', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-faq'] }); setShowForm(false); setForm({}); },
  });

  const createSrcMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/sources', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-sources'] }); setShowForm(false); setForm({}); },
  });

  const deleteFaqMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/faq/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-faq'] }),
  });

  const deleteSrcMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/sources/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-sources'] }),
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">FAQ & Sources</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg">
          <Plus size={16} /> Ajouter
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {[{ id: 'faq', label: 'FAQ' }, { id: 'sources', label: 'Sources' }].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id as any); setShowForm(false); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t.id ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="bg-white border rounded-xl p-4 mb-6 space-y-3">
          {tab === 'faq' ? (
            <>
              <input value={form.question || ''} onChange={e => setForm({ ...form, question: e.target.value })}
                placeholder="Question" className="w-full border rounded-lg px-3 py-2" />
              <textarea value={form.reponse || ''} onChange={e => setForm({ ...form, reponse: e.target.value })}
                placeholder="Réponse" rows={3} className="w-full border rounded-lg px-3 py-2 resize-none" />
            </>
          ) : (
            <>
              <input value={form.organisme || ''} onChange={e => setForm({ ...form, organisme: e.target.value })}
                placeholder="Organisme" className="w-full border rounded-lg px-3 py-2" />
              <input value={form.url || ''} onChange={e => setForm({ ...form, url: e.target.value })}
                placeholder="URL (optionnel)" className="w-full border rounded-lg px-3 py-2" />
            </>
          )}
          <div className="flex gap-2">
            <button onClick={() => tab === 'faq' ? createFaqMutation.mutate(form) : createSrcMutation.mutate(form)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg">Créer</button>
            <button onClick={() => setShowForm(false)} className="border px-4 py-2 rounded-lg">Annuler</button>
          </div>
        </div>
      )}

      {tab === 'faq' && (
        faqLoading ? <LoadingSpinner /> : (
          <div className="space-y-3">
            {(faqs as any[]).map((faq: any) => (
              <div key={faq.id} className="bg-white border rounded-xl p-4">
                <div className="flex justify-between">
                  <p className="font-semibold text-gray-800">{faq.question}</p>
                  <button onClick={() => deleteFaqMutation.mutate(faq.id)} className="text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-gray-600 text-sm mt-1">{faq.reponse}</p>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'sources' && (
        srcLoading ? <LoadingSpinner /> : (
          <div className="space-y-3">
            {(sources as any[]).map((src: any) => (
              <div key={src.id} className="bg-white border rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{src.organisme}</p>
                  {src.url && <a href={src.url} target="_blank" rel="noreferrer" className="text-orange-500 text-sm hover:underline">{src.url}</a>}
                </div>
                <button onClick={() => deleteSrcMutation.mutate(src.id)} className="text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
