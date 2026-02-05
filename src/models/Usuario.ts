// src/models/Usuario.ts
export interface Usuario {
  id: string; // UUID proporcionado por Supabase Auth
  email?: string;
  /**
   * El rol del usuario, vive en la tabla 'profiles'.
   * Puede ser 'administrador' o 'operario'.
   */
  role: 'administrador' | 'operario';
}
