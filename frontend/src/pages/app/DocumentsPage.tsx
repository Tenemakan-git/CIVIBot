import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, Trash2, Eye } from 'lucide-react';
import { documentService } from '../../services/document.service';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: documentService.list,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => documentService.upload(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: documentService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes documents</h1>
        <button onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50">
          <Upload size={16} />
          {uploadMutation.isPending ? 'Upload...' : 'Ajouter un PDF'}
        </button>
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
      </div>

      {(documents as any[]).length === 0 ? (
        <EmptyState
          title="Aucun document"
          description="Uploadez vos documents PDF pour une analyse et un résumé par l'IA."
          action={
            <button onClick={() => fileInputRef.current?.click()}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg">
              Ajouter un document
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {(documents as any[]).map((doc: any) => (
            <div key={doc.id} className="bg-white border rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="text-red-600" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{doc.nom}</p>
                  <p className="text-xs text-gray-500">{(doc.taille / 1024).toFixed(0)} Ko</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setSelectedDoc(selectedDoc?.id === doc.id ? null : doc)}
                    className="p-1.5 text-gray-400 hover:text-orange-600">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => deleteMutation.mutate(doc.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {selectedDoc?.id === doc.id && doc.analysis?.resume && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                  <p className="font-medium text-gray-700 mb-1">Résumé IA</p>
                  {doc.analysis.resume}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
