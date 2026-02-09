import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Obtener las variables de entorno de Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar que las variables de entorno estén presentes
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required.');
}

// Crear y exportar el cliente de Supabase con tipos generados
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
