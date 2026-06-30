import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Tag, FileText, Database, Upload, HelpCircle, Settings, LogOut, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const logout = useAuthStore(s => s.logout);

  const navItems = [
    { to: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Tableau de bord' },
    { to: '/admin/users', icon: <Users size={18} />, label: 'Utilisateurs' },
    { to: '/admin/categories', icon: <Tag size={18} />, label: 'Catégories' },
    { to: '/admin/procedures', icon: <FileText size={18} />, label: 'Procédures' },
    { to: '/admin/knowledge', icon: <Database size={18} />, label: 'Base de connaissance' },
    { to: '/admin/knowledge/import', icon: <Upload size={18} />, label: 'Importer PDF' },
    { to: '/admin/faq-sources', icon: <HelpCircle size={18} />, label: 'FAQ & Sources' },
    { to: '/admin/ai-settings', icon: <Settings size={18} />, label: 'Paramètres IA' },
  ];

  return (
    <aside className="w-64 border-r flex flex-col bg-gray-900 text-white shrink-0">
      <div className="p-4 border-b border-gray-700">
        <span className="font-bold text-lg"><span className="text-orange-400">Civi</span><span className="text-green-400">Bot</span><span className="text-gray-300"> Admin</span></span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              isActive ? 'bg-orange-600 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}>
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="border-t border-gray-700 p-2 space-y-1">
        <NavLink to="/app" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800">
          <MessageSquare size={18} /> Vue citoyen
        </NavLink>
        <button onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-gray-800 w-full">
          <LogOut size={18} /> Déconnexion
        </button>
      </div>
    </aside>
  );
}
