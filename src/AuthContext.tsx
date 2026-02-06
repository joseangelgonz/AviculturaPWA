import { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { UserRole } from './models/Usuario';

export type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; session: Session; role: UserRole };

export interface AuthContextValue {
  auth: AuthState;
}

export const AuthContext = createContext<AuthContextValue>({ auth: { status: 'loading' } });

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
