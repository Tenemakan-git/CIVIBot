import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (!['admin', 'super-admin'].includes(user.role.nom)) return <Navigate to="/app" replace />;
  return <>{children}</>;
}
