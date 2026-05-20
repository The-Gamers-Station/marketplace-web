import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Auth bootstrap still in progress — show nothing (App's PageLoader covers this)
  if (isLoading) return null;

  if (!isAuthenticated) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ redirectTo: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
