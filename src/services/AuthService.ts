import { supabase } from './supabaseClient';
import type { Session, User } from '@supabase/supabase-js';
import type { UserRole } from '../models/Usuario';

const AuthService = {
  /**
   * Registra un nuevo usuario con email y contraseña.
   * @param email El correo electrónico del usuario.
   * @param password La contraseña del usuario.
   * @returns Un objeto con el usuario registrado o un error.
   */
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data.user;
  },

  /**
   * Inicia sesión de un usuario con email y contraseña.
   * @param email El correo electrónico del usuario.
   * @param password La contraseña del usuario.
   * @returns Un objeto con la sesión y el usuario o un error.
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Cierra la sesión del usuario actual.
   * @returns Un error si la operación falla.
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Obtiene la sesión actual del usuario.
   * @returns La sesión del usuario o null si no hay sesión activa.
   */
  async getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Obtiene el usuario actualmente autenticado.
   * @returns El objeto de usuario o null si no hay usuario autenticado.
   */
  async getUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  /**
   * Obtiene el rol del usuario desde la tabla 'profiles'.
   */
  async getRole(userId: string): Promise<UserRole> {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    if (error || !data) return 'operario';
    const VALID_ROLES: readonly string[] = ['administrador', 'operario'];
    return VALID_ROLES.includes(data.role) ? (data.role as UserRole) : 'operario';
  },

  /**
   * Suscribe a los cambios en el estado de autenticación.
   * @param callback La función a ejecutar cuando cambia el estado de autenticación.
   * @returns Una función para cancelar la suscripción.
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return subscription.unsubscribe;
  },
};

export default AuthService;