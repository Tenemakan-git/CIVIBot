import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const CLAUDE_MODELS = [
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (recommandé)' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 (rapide)' },
  { value: 'claude-opus-4-8', label: 'Claude Opus 4.8 (puissant)' },
];

const GEMINI_MODELS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (recommandé)' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
];

export default function AISettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/admin/ai-settings').then(r => setSettings(r.data));
  }, []);

  const save = async () => {
    setSaving(true);
    await api.patch('/admin/ai-settings', settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!settings) return <LoadingSpinner />;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Paramètres IA</h1>

      <div className="bg-white border rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Modèle principal
              <span className="ml-2 text-xs text-orange-600 font-normal bg-orange-50 px-1.5 py-0.5 rounded">Anthropic</span>
            </label>
            <select
              value={settings.modele}
              onChange={e => setSettings({ ...settings, modele: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {CLAUDE_MODELS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
              <option value={settings.modele}>{!CLAUDE_MODELS.find(m => m.value === settings.modele) ? settings.modele : ''}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Modèle de secours
              <span className="ml-2 text-xs text-green-600 font-normal bg-green-50 px-1.5 py-0.5 rounded">Google Gemini</span>
            </label>
            <select
              value={settings.modeleSecours}
              onChange={e => setSettings({ ...settings, modeleSecours: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {GEMINI_MODELS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Activé automatiquement si le modèle principal est indisponible</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
          <p className="font-medium mb-1">Clés API requises dans le fichier <code className="bg-amber-100 px-1 rounded">.env</code> :</p>
          <ul className="space-y-0.5 text-xs font-mono">
            <li>ANTHROPIC_API_KEY=sk-ant-... (pour Claude)</li>
            <li>GEMINI_API_KEY=AIza... (pour Gemini — obtenir sur <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="underline">aistudio.google.com</a>)</li>
          </ul>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Température : <span className="text-orange-600 font-bold">{settings.temperature}</span>
          </label>
          <input type="range" min="0" max="1" step="0.1" value={settings.temperature}
            onChange={e => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
            className="w-full accent-orange-600" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Précis (0)</span><span>Créatif (1)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Max tokens</label>
            <input type="number" value={settings.maxTokens}
              onChange={e => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Chunks RAG (top-k)</label>
            <input type="number" value={settings.topK}
              onChange={e => setSettings({ ...settings, topK: parseInt(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Prompt système</label>
          <textarea value={settings.promptSysteme}
            onChange={e => setSettings({ ...settings, promptSysteme: e.target.value })}
            rows={6} className="w-full border rounded-lg px-3 py-2 text-sm font-mono resize-none" />
        </div>

        <button onClick={save} disabled={saving}
          className={`px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50 ${
            saved ? 'bg-green-600' : 'bg-orange-600 hover:bg-orange-700'
          }`}>
          {saving ? 'Sauvegarde...' : saved ? 'Sauvegardé !' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  );
}
