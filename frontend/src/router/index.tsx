import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import LandingPage from '../pages/auth/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import AppLayout from '../components/layout/AppLayout';
import AdminLayout from '../components/layout/AdminLayout';
import AppDashboardPage from '../pages/app/DashboardPage';
import FoldersPage from '../pages/app/FoldersPage';
import FolderDetailPage from '../pages/app/FolderDetailPage';
import ServicesPage from '../pages/app/ServicesPage';
import ConversationPage from '../pages/app/ConversationPage';
import GuidedJourneyPage from '../pages/app/GuidedJourneyPage';
import ChecklistsPage from '../pages/app/ChecklistsPage';
import DocumentsPage from '../pages/app/DocumentsPage';
import ResourcesPage from '../pages/app/ResourcesPage';
import ProcedureDetailPage from '../pages/app/ProcedureDetailPage';
import ProfilePage from '../pages/app/ProfilePage';
import DashboardPage from '../pages/admin/DashboardPage';
import UsersPage from '../pages/admin/UsersPage';
import CategoriesPage from '../pages/admin/CategoriesPage';
import ProceduresPage from '../pages/admin/ProceduresPage';
import ProcedureEditPage from '../pages/admin/ProcedureEditPage';
import KnowledgeDocsPage from '../pages/admin/KnowledgeDocsPage';
import ImportDocPage from '../pages/admin/ImportDocPage';
import FaqSourcesPage from '../pages/admin/FaqSourcesPage';
import AISettingsPage from '../pages/admin/AISettingsPage';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/app',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <AppDashboardPage /> },
      { path: 'dashboard', element: <AppDashboardPage /> },
      { path: 'folders', element: <FoldersPage /> },
      { path: 'folders/:id', element: <FolderDetailPage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'conversations', element: <ConversationPage /> },
      { path: 'conversations/:id', element: <ConversationPage /> },
      { path: 'journey', element: <GuidedJourneyPage /> },
      { path: 'checklists', element: <ChecklistsPage /> },
      { path: 'documents', element: <DocumentsPage /> },
      { path: 'resources', element: <ResourcesPage /> },
      { path: 'resources/:id', element: <ProcedureDetailPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminRoute><AdminLayout /></AdminRoute>,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'procedures', element: <ProceduresPage /> },
      { path: 'procedures/new', element: <ProcedureEditPage /> },
      { path: 'procedures/:id', element: <ProcedureEditPage /> },
      { path: 'knowledge', element: <KnowledgeDocsPage /> },
      { path: 'knowledge/import', element: <ImportDocPage /> },
      { path: 'faq-sources', element: <FaqSourcesPage /> },
      { path: 'ai-settings', element: <AISettingsPage /> },
    ],
  },
]);
