import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import type { UserRole } from '../models/Usuario';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const { auth } = useAuth();

  if (auth.status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(auth.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
