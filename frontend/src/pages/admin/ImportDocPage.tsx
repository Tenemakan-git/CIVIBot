import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, Loader } from 'lucide-react';
import { knowledgeAdminService } from '../../services/admin/knowledge.service';

const STEPS = ['Upload du PDF', 'Extraction texte', 'Découpage chunks', 'Embeddings Voyage AI', 'Indexation pgvector', 'Terminé'];

export default function ImportDocPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [titre, setTitre] = useState('');
  const [categorie, setCategorie] = useState('');
  const [organisme, setOrganisme] = useState('');
  const [currentStep, setCurrentStep] = useState(-1);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleImport = async () => {
    if (!file) return;
    setCurrentStep(0);
    try {
      setCurrentStep(1);
      await knowledgeAdminService.import(file, titre || file.name, categorie || undefined, organisme || undefined);
      for (let i = 2; i <= 4; i++) {
        await new Promise(r => setTimeout(r, 400));
        setCurrentStep(i);
      }
      setCurrentStep(5);
      setDone(true);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erreur lors de l\'import');
      setCurrentStep(-1);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Importer un document PDF</h1>

      {currentStep === -1 && (
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Titre</label>
            <input value={titre} onChange={e => setTitre(e.target.value)}
              className="w-full border rounded-lg px-3 py-2" placeholder="Titre du document" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Catégorie</label>
              <input value={categorie} onChange={e => setCategorie(e.target.value)}
                className="w-full border rounded-lg px-3 py-2" placeholder="ex: État civil" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Organisme</label>
              <input value={organisme} onChange={e => setOrganisme(e.target.value)}
                className="w-full border rounded-lg px-3 py-2" placeholder="ex: Mairie d'Abidjan" />
            </div>
          </div>
          <div className="border-2 border-dashed rounded-xl p-8 text-center">
            <input type="file" accept=".pdf" onChange={e => setFile(e.target.files?.[0] || null)}
              className="hidden" id="file-input" />
            <label htmlFor="file-input" className="cursor-pointer">
              {file ? (
                <p className="text-orange-600 font-medium">{file.name}</p>
              ) : (
                <>
                  <p className="text-gray-400 mb-1">Glissez un PDF ici ou</p>
                  <p className="text-orange-600 hover:underline">Choisir un fichier</p>
                </>
              )}
            </label>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button onClick={handleImport} disabled={!file}
            className="w-full bg-orange-600 text-white py-2 rounded-lg disabled:opacity-50 font-medium">
            Importer et indexer
          </button>
        </div>
      )}

      {currentStep >= 0 && (
        <div className="bg-white border rounded-xl p-6 space-y-3">
          <h2 className="font-semibold text-gray-800 mb-4">Traitement en cours...</h2>
          {STEPS.map((step, i) => (
            <div key={step} className={`flex items-center gap-3 p-3 rounded-lg ${
              i < currentStep ? 'bg-green-50' : i === currentStep ? 'bg-orange-50' : 'bg-gray-50'
            }`}>
              {i < currentStep ? <CheckCircle size={18} className="text-green-600" />
                : i === currentStep ? <Loader size={18} className="text-orange-600 animate-spin" />
                : <Circle size={18} className="text-gray-300" />}
              <span className={`text-sm ${i <= currentStep ? 'font-medium' : 'text-gray-400'}`}>{step}</span>
            </div>
          ))}
          {done && (
            <button onClick={() => navigate('/admin/knowledge')}
              className="w-full bg-green-600 text-white py-2 rounded-lg mt-4 font-medium">
              Voir les documents
            </button>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      )}
    </div>
  );
}
