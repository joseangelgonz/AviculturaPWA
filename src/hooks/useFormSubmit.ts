import { useState, useCallback } from 'react';
import { getSupabaseErrorMessage } from '../services/supabaseErrors';

interface FormMessage {
  type: 'success' | 'error';
  text: string;
}

interface UseFormSubmitReturn {
  loading: boolean;
  message: FormMessage | null;
  setMessage: (msg: FormMessage | null) => void;
  handleSubmit: (fn: () => Promise<void>, errorFallback?: string) => Promise<void>;
}

export function useFormSubmit(): UseFormSubmitReturn {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<FormMessage | null>(null);

  const handleSubmit = useCallback(async (fn: () => Promise<void>, errorFallback?: string) => {
    setLoading(true);
    setMessage(null);
    try {
      await fn();
    } catch (err: unknown) {
      const errorMsg = getSupabaseErrorMessage(err, errorFallback ?? 'Ocurrió un error. Intenta de nuevo.');
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, message, setMessage, handleSubmit };
}
