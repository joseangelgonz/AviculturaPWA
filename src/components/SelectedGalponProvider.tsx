import { useState, useEffect } from 'react';
import type { Galpon } from '../models/Galpon';
import GalponService from '../services/GalponService';
import { useAuth } from '../AuthContext';
import { SelectedGalponContext } from '../hooks/useSelectedGalpon';

export const SelectedGalponProvider = ({ children }: { children: React.ReactNode }) => {
  const { auth } = useAuth();
  const [selectedGalpon, setSelectedGalpon] = useState<Galpon | null>(null);
  const [assignedGalpones, setAssignedGalpones] = useState<Galpon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (auth.status === 'authenticated' && auth.role === 'operario') {
      const fetchGalpones = async () => {
        try {
          setLoading(true);
          const galpones = await GalponService.getAssignedGalpones(auth.session.user.id);
          setAssignedGalpones(galpones);
          if (galpones.length > 0) {
            setSelectedGalpon(galpones[0]);
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
  }, [auth]);

  const value = {
    selectedGalpon,
    setSelectedGalpon,
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
