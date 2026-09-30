import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** UX-only guard. Real data security must come from backend permissions / Row Level Security. */
export default function ProtectedRoute({ requireOnboarded = true }) {
  const { user, loading, onboarded } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="route-loading" role="status">Loading…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  if (requireOnboarded && !onboarded) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

export function GuestRoute() {
  const { user, loading, onboarded, recovery } = useAuth();
  if (loading) return <div className="route-loading" role="status">Loading…</div>;
  if (user && !recovery) return <Navigate to={onboarded ? '/home' : '/onboarding'} replace />;
  return <Outlet />;
}
