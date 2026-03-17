import { useCallback, useEffect, useState } from 'react';
import type { Galpon } from '../models/Galpon';
import GalponService from '../services/GalponService';
import { useAuth } from '../AuthContext';
import { SelectedGalponContext } from '../hooks/useSelectedGalpon';

const STORAGE_KEY = 'operario_galpon_id';

export const SelectedGalponProvider = ({ children }: { children: React.ReactNode }) => {
  const { auth } = useAuth();
  const [selectedGalpon, setSelectedGalpon] = useState<Galpon | null>(null);
  const [assignedGalpones, setAssignedGalpones] = useState<Galpon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [preferredGalponId, setPreferredGalponId] = useState<number | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? Number(raw) : null;
    setPreferredGalponId(Number.isFinite(parsed) ? parsed : null);
  }, []);

  useEffect(() => {
    if (auth.status === 'authenticated' && auth.role === 'operario') {
      const fetchGalpones = async () => {
        try {
          setLoading(true);
          const galpones = await GalponService.getAssignedGalpones(auth.session.user.id);
          setAssignedGalpones(galpones);
          if (galpones.length > 0) {
            const preferred = preferredGalponId
              ? galpones.find((item) => item.id === preferredGalponId)
              : null;
            setSelectedGalpon(preferred ?? galpones[0]);
          } else {
            setSelectedGalpon(null);
          }
        } catch (err) {
          setError(err as Error);
        } finally {
          setLoading(false);
        }
      };
      fetchGalpones();
    } else if (auth.status === 'unauthenticated' || (auth.status === 'authenticated' && auth.role === 'administrador')) {
      setAssignedGalpones([]);
      setSelectedGalpon(null);
      setLoading(false);
    }
  }, [auth, preferredGalponId]);

  useEffect(() => {
    if (!selectedGalpon) return;
    window.localStorage.setItem(STORAGE_KEY, selectedGalpon.id.toString());
  }, [selectedGalpon]);

  useEffect(() => {
    if (assignedGalpones.length === 0) return;
    if (selectedGalpon && assignedGalpones.some((item) => item.id === selectedGalpon.id)) {
      return;
    }
    setSelectedGalpon(assignedGalpones[0]);
  }, [assignedGalpones, selectedGalpon]);

  const handleSetSelectedGalpon = useCallback((galpon: Galpon | null) => {
    setSelectedGalpon(galpon);
    if (galpon) {
      window.localStorage.setItem(STORAGE_KEY, galpon.id.toString());
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value = {
    selectedGalpon,
    setSelectedGalpon: handleSetSelectedGalpon,
    assignedGalpones,
    loading,
    error,
  };

  return (
    <SelectedGalponContext.Provider value={value}>
      {children}
    </SelectedGalponContext.Provider>
  );
};

export default SelectedGalponProvider;
