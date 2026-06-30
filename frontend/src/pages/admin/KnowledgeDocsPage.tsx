import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { knowledgeAdminService } from '../../services/admin/knowledge.service';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { Plus, Trash2, RefreshCw, FileText } from 'lucide-react';

export default function KnowledgeDocsPage() {
  const queryClient = useQueryClient();

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['admin-knowledge'],
    queryFn: knowledgeAdminService.list,
  });

  const reindexMutation = useMutation({
    mutationFn: knowledgeAdminService.reindex,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-knowledge'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: knowledgeAdminService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-knowledge'] }),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Base de connaissance</h1>
        <Link to="/admin/knowledge/import"
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg">
          <Plus size={16} /> Importer un PDF
        </Link>
      </div>

      {(docs as any[]).length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText size={48} className="mx-auto mb-3 opacity-50" />
          <p>Aucun document indexé. Importez des PDFs pour alimenter la RAG.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Titre', 'Catégorie', 'Organisme', 'Chunks', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(docs as any[]).map((doc: any) => (
                <tr key={doc.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{doc.titre}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{doc.categorie || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{doc.organisme || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                      {doc._count?.chunks || 0} chunks
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${doc.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {doc.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => reindexMutation.mutate(doc.id)}
                        disabled={reindexMutation.isPending}
                        className="text-orange-400 hover:text-orange-600" title="Réindexer">
                        <RefreshCw size={14} />
                      </button>
                      <button onClick={() => deleteMutation.mutate(doc.id)}
                        className="text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
