import { createContext, useContext } from 'react';
import type { Galpon } from '../models/Galpon';

export interface SelectedGalponContextType {
  selectedGalpon: Galpon | null;
  setSelectedGalpon: (galpon: Galpon | null) => void;
  assignedGalpones: Galpon[];
  loading: boolean;
  error: Error | null;
}

export const SelectedGalponContext = createContext<SelectedGalponContextType | undefined>(undefined);

export const useSelectedGalpon = () => {
  const context = useContext(SelectedGalponContext);
  if (context === undefined) {
    throw new Error('useSelectedGalpon must be used within a SelectedGalponProvider');
  }
  return context;
};
