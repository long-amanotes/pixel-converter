/**
 * useStorageRestore hook - Restores saved state from localStorage on mount
 * 
 * Requirements:
 * - Restore uploaded image and state when page loads
 * - Protect user progress across page resets
 */

import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { loadImageFromStorage, loadStateFromStorage, hasStoredData } from '../utils/storageUtils';

export interface UseStorageRestoreReturn {
  /**
   * Whether the restoration is in progress
   */
  isRestoring: boolean;
  
  /**
   * Whether there is saved data available
   */
  hasSavedData: boolean;
  
  /**
   * Error if restoration failed
   */
  error: Error | null;
}

/**
 * Custom hook to restore application state from localStorage
 * Automatically runs on mount
 * 
 * @returns Restoration status
 */
export const useStorageRestore = (): UseStorageRestoreReturn => {
  const [isRestoring, setIsRestoring] = useState(true);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const setPixels = useStore((state) => state.setPixels);
  const setSize = useStore((state) => state.setSize);
  const setPalette = useStore((state) => state.setPalette);
  const setColorTypes = useStore((state) => state.setColorTypes);
  const setOriginalImage = useStore((state) => state.setOriginalImage);
  const setScaleMode = useStore((state) => state.setScaleMode);
  
  useEffect(() => {
    const restoreState = async () => {
      try {
        // Check if there's saved data
        const hasSaved = hasStoredData();
        setHasSavedData(hasSaved);
        
        if (!hasSaved) {
          setIsRestoring(false);
          return;
        }
        
        // Load state from storage
        const savedState = loadStateFromStorage();
        
        // Restore state to store
        if (savedState.size !== undefined) {
          setSize(savedState.size);
        }
        
        if (savedState.palette !== undefined) {
          setPalette(savedState.palette);
        }
        
        if (savedState.colorTypes !== undefined) {
          setColorTypes(savedState.colorTypes);
        }
        
        if (savedState.scaleMode !== undefined) {
          setScaleMode(savedState.scaleMode);
        }
        
        // Load and restore original image
        const image = await loadImageFromStorage();
        if (image) {
          setOriginalImage(image);
        }
        
        // Restore pixels last (after size and palette are set)
        if (savedState.pixels !== undefined) {
          setPixels(savedState.pixels);
        }
        
      } catch (err) {
        console.error('Failed to restore state from storage:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsRestoring(false);
      }
    };
    
    restoreState();
  }, [setPixels, setSize, setPalette, setColorTypes, setOriginalImage, setScaleMode]);
  
  return {
    isRestoring,
    hasSavedData,
    error,
  };
};
