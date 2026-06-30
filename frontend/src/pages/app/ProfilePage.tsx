import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../services/api';

export default function ProfilePage() {
  const user = useAuthStore(s => s.user);
  const [tab, setTab] = useState<'info' | 'security'>('info');
  const [saved, setSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwError, setPwError] = useState('');

  const changePassword = async () => {
    try {
      await api.patch('/users/me/password', { currentPassword, newPassword });
      setSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setPwError(e.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon profil</h1>

      <div className="flex gap-2 mb-6">
        {[{ id: 'info', label: 'Informations' }, { id: 'security', label: 'Sécurité' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === t.id ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </div>
            <div>
              <p className="font-bold text-gray-900">{user?.prenom} {user?.nom}</p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{user?.role?.nom}</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="bg-white border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Changer le mot de passe</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe actuel</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          {pwError && <p className="text-red-500 text-sm">{pwError}</p>}
          {saved && <p className="text-green-600 text-sm">Mot de passe modifié !</p>}
          <button onClick={changePassword} disabled={!currentPassword || !newPassword}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
            Changer le mot de passe
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
