import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Map, MapPin, CheckSquare, FileText, FolderOpen, BookOpen, User, Plus, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useConversationStore } from '../../stores/conversationStore';
import NotificationBell from '../notifications/NotificationBell';

export default function Sidebar() {
  const navigate = useNavigate();
  const logout = useAuthStore(s => s.logout);
  const setActiveConversation = useConversationStore(s => s.setActiveConversation);
  const setMessages = useConversationStore(s => s.setMessages);

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/conversations').then(r => r.data),
  });

  const navItems = [
    { to: '/app/dashboard', icon: <LayoutDashboard size={18} />, label: 'Tableau de bord' },
    { to: '/app/folders', icon: <FolderOpen size={18} />, label: 'Mes dossiers' },
    { to: '/app/services', icon: <MapPin size={18} />, label: 'Où aller' },
    { to: '/app/journey', icon: <Map size={18} />, label: 'Parcours guidé' },
    { to: '/app/checklists', icon: <CheckSquare size={18} />, label: 'Mes checklists' },
    { to: '/app/documents', icon: <FileText size={18} />, label: 'Mes documents' },
    { to: '/app/resources', icon: <BookOpen size={18} />, label: 'Ressources' },
    { to: '/app/profile', icon: <User size={18} />, label: 'Mon profil' },
  ];

  const newConversation = () => {
    setActiveConversation(null);
    setMessages([]);
    navigate('/app/conversations');
  };

  return (
    <aside className="w-64 border-r flex flex-col bg-gray-50 shrink-0">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg"><span className="text-orange-600">Civi</span><span className="text-green-600">Bot</span></span>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <button onClick={newConversation}
              title="Nouvelle conversation"
              className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500">
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {(conversations as any[]).slice(0, 20).map((c: any) => (
          <NavLink key={c.id} to={`/app/conversations/${c.id}`}
            className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm truncate ${
              isActive ? 'bg-orange-50 text-orange-700' : 'text-gray-700 hover:bg-gray-100'
            }`}>
            <MessageSquare size={14} />
            <span className="truncate">{c.titre}</span>
          </NavLink>
        ))}
      </div>

      <div className="border-t p-2 space-y-1">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              isActive ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-100'
            }`}>
            {item.icon}
            {item.label}
          </NavLink>
        ))}
        <button onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 w-full">
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
