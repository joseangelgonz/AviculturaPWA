// src/models/Usuario.ts
export type UserRole = 'administrador' | 'operario';

export interface Usuario {
  id: string; // UUID proporcionado por Supabase Auth
  email?: string;
  role: UserRole;
}
