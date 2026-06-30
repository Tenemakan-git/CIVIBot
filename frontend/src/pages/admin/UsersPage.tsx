import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAdminService } from '../../services/admin/user.service';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { UserX, UserCheck } from 'lucide-react';

export default function UsersPage() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: userAdminService.list,
  });

  const suspendMutation = useMutation({
    mutationFn: userAdminService.suspend,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const activateMutation = useMutation({
    mutationFn: userAdminService.activate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Utilisateurs</h1>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Nom', 'Email', 'Rôle', 'Statut', 'Inscription', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(users as any[]).map((u: any) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{u.prenom} {u.nom}</p>
                </td>
                <td className="px-4 py-3 text-gray-600 text-sm">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    u.role?.nom === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>{u.role?.nom}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    u.statut === 'actif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>{u.statut}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-sm">
                  {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-4 py-3">
                  {u.statut === 'actif' ? (
                    <button onClick={() => suspendMutation.mutate(u.id)}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                      <UserX size={14} /> Suspendre
                    </button>
                  ) : (
                    <button onClick={() => activateMutation.mutate(u.id)}
                      className="flex items-center gap-1 text-xs text-green-500 hover:text-green-700">
                      <UserCheck size={14} /> Activer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
