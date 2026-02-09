import { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { UserRole } from './models/Usuario';

export type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; session: Session; role: UserRole };

export interface AuthContextValue {
  auth: AuthState;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth debe usarse dentro de un AuthContext.Provider');
  }
  return ctx;
}
