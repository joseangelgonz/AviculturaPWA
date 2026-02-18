const isDev = import.meta.env.DEV;

/**
 * Registra errores de servicios solo en desarrollo.
 * En producción se omiten los detalles técnicos del error (nombres de tablas/columnas).
 */
export function logServiceError(context: string, error: unknown): void {
  if (isDev) {
    console.error(context, error);
  }
}

const SUPABASE_ERROR_MESSAGES: Record<string, string> = {
  '23505': 'Ya existe un registro con estos datos.',
  '23503': 'El registro referenciado no existe.',
  '23502': 'Falta un campo obligatorio.',
  '23514': 'El valor ingresado está fuera del rango permitido.',
  '42501': 'No tienes permisos para realizar esta acción.',
  'PGRST116': 'No se encontró el registro solicitado.',
};

/**
 * Convierte un error de Supabase/PostgreSQL en un mensaje amigable para el usuario.
 * Oculta detalles técnicos (nombres de tablas/columnas) que no deben exponerse en la UI.
 */
export function getSupabaseErrorMessage(error: unknown, fallback = 'Ocurrió un error. Intenta de nuevo.'): string {
  if (!error || typeof error !== 'object') return fallback;

  const err = error as { code?: string; message?: string };
  if (err.code && SUPABASE_ERROR_MESSAGES[err.code]) {
    return SUPABASE_ERROR_MESSAGES[err.code];
  }

  return fallback;
}
