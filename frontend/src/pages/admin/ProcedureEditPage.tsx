import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function ProcedureEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    titre: '', description: '', cout: '', delai: '', eligibilite: '', resume: '', categorieId: '',
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => api.get('/categories').then(r => r.data),
  });

  const { data: proc, isLoading } = useQuery({
    queryKey: ['admin-procedure', id],
    queryFn: () => id && !isNew ? api.get(`/admin/procedures/${id}`).then(r => r.data) : null,
    enabled: !isNew,
  });

  useEffect(() => {
    if (proc) {
      setForm({
        titre: proc.titre || '',
        description: proc.description || '',
        cout: proc.cout || '',
        delai: proc.delai || '',
        eligibilite: proc.eligibilite || '',
        resume: proc.resume || '',
        categorieId: proc.categorieId || '',
      });
    }
  }, [proc]);

  const save = async () => {
    setSaving(true);
    try {
      if (isNew) {
        await api.post('/admin/procedures', form);
      } else {
        await api.patch(`/admin/procedures/${id}`, form);
      }
      navigate('/admin/procedures');
    } finally {
      setSaving(false);
    }
  };

  if (!isNew && isLoading) return <LoadingSpinner />;

  const fields = [
    { key: 'titre', label: 'Titre', type: 'text' },
    { key: 'cout', label: 'Coût', type: 'text' },
    { key: 'delai', label: 'Délai', type: 'text' },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{isNew ? 'Nouvelle procédure' : 'Modifier la procédure'}</h1>

      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Catégorie</label>
          <select value={form.categorieId} onChange={e => setForm({ ...form, categorieId: e.target.value })}
            className="w-full border rounded-lg px-3 py-2">
            <option value="">Sélectionner une catégorie</option>
            {(categories as any[]).map((c: any) => (
              <option key={c.id} value={c.id}>{c.domaine?.nom} — {c.nom}</option>
            ))}
          </select>
        </div>

        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium mb-1">{f.label}</label>
            <input value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              className="w-full border rounded-lg px-3 py-2" />
          </div>
        ))}

        {['description', 'eligibilite', 'resume'].map(field => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1 capitalize">{field}</label>
            <textarea value={(form as any)[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}
              rows={3} className="w-full border rounded-lg px-3 py-2 resize-none" />
          </div>
        ))}

        <div className="flex gap-2 pt-2">
          <button onClick={save} disabled={saving || !form.titre || !form.categorieId}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg disabled:opacity-50">
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          <button onClick={() => navigate('/admin/procedures')} className="border px-6 py-2 rounded-lg">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
