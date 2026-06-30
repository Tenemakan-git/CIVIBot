import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryAdminService } from '../../services/admin/category.service';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { Plus, Trash2 } from 'lucide-react';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ nom: '', slug: '', domaineId: '' });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: categoryAdminService.list,
  });

  const { data: domaines = [] } = useQuery({
    queryKey: ['domaines'],
    queryFn: categoryAdminService.getDomaines,
  });

  const createMutation = useMutation({
    mutationFn: () => categoryAdminService.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setShowCreate(false);
      setForm({ nom: '', slug: '', domaineId: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoryAdminService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] }),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Catégories</h1>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg">
          <Plus size={16} /> Nouvelle catégorie
        </button>
      </div>

      {showCreate && (
        <div className="bg-white border rounded-xl p-4 mb-6 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
              placeholder="Nom" className="border rounded-lg px-3 py-2" />
            <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })}
              placeholder="Slug (ex: naissance)" className="border rounded-lg px-3 py-2" />
            <select value={form.domaineId} onChange={e => setForm({ ...form, domaineId: e.target.value })}
              className="border rounded-lg px-3 py-2">
              <option value="">Choisir un domaine</option>
              {(domaines as any[]).map((d: any) => (
                <option key={d.id} value={d.id}>{d.nom}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => createMutation.mutate()} disabled={!form.nom || !form.slug || !form.domaineId}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">Créer</button>
            <button onClick={() => setShowCreate(false)} className="border px-4 py-2 rounded-lg">Annuler</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Nom', 'Slug', 'Domaine', 'Procédures', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(categories as any[]).map((cat: any) => (
              <tr key={cat.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{cat.nom}</td>
                <td className="px-4 py-3 text-gray-500 text-sm font-mono">{cat.slug}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{cat.domaine?.nom}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-sm">{cat._count?.procedures || 0}</td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteMutation.mutate(cat.id)}
                    className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
