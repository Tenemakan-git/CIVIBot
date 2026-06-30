import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { Plus, Edit, Trash2, CheckCircle, Circle } from 'lucide-react';

export default function ProceduresPage() {
  const queryClient = useQueryClient();

  const { data: procedures = [], isLoading } = useQuery({
    queryKey: ['admin-procedures'],
    queryFn: () => api.get('/admin/procedures').then(r => r.data),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/procedures/${id}/publish`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-procedures'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/procedures/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-procedures'] }),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Procédures</h1>
        <Link to="/admin/procedures/new"
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg">
          <Plus size={16} /> Nouvelle procédure
        </Link>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Titre', 'Catégorie', 'Statut', 'Coût', 'Délai', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(procedures as any[]).map((proc: any) => (
              <tr key={proc.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{proc.titre}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{proc.categorie?.nom}</span>
                </td>
                <td className="px-4 py-3">
                  {proc.actif ? (
                    <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle size={12} /> Publié</span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-400 text-xs"><Circle size={12} /> Brouillon</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 text-sm">{proc.cout || '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-sm">{proc.delai || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {!proc.actif && (
                      <button onClick={() => publishMutation.mutate(proc.id)}
                        className="text-xs text-green-600 hover:underline">Publier</button>
                    )}
                    <Link to={`/admin/procedures/${proc.id}`}
                      className="text-orange-500 hover:text-orange-700"><Edit size={14} /></Link>
                    <button onClick={() => deleteMutation.mutate(proc.id)}
                      className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
