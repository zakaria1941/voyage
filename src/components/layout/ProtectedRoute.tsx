import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageSpinner } from '@/components/ui/Spinner';

export function ProtectedRoute() {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageSpinner label="Checking your session…" />;
  if (!profile) return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}

export function AdminRoute() {
  const { profile, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageSpinner label="Checking your session…" />;
  if (!profile) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

export function GuestOnlyRoute() {
  const { profile, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (profile) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
