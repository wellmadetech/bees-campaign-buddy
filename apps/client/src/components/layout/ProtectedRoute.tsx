import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Asset Creators don't have a dashboard — redirect to campaigns
  if (user?.role === 'content_creator' && location.pathname === '/') {
    return <Navigate to="/campaigns" replace />;
  }

  return <Outlet />;
}
