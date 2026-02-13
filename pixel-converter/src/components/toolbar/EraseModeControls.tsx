/**
 * EraseModeControls - Controls for erase edit mode
 * Provides action buttons for erasing pixels
 * 
 * Validates: Requirements 5.4
 */

import React from 'react';
import { Box, Button } from '@mui/material';
import { useStore } from '../../store';

/**
 * EraseModeControls component
 * Shows "Erase Selected" button and "Deselect All" button
 * when erase mode is active
 */
export const EraseModeControls: React.FC = () => {
  const selectedPixels = useStore((state) => state.selectedPixels);
  const eraseSelectedPixels = useStore((state) => state.eraseSelectedPixels);
  const clearSelection = useStore((state) => state.clearSelection);
  const saveState = useStore((state) => state.saveState);

  /**
   * Erase all selected pixels
   */
  const handleEraseSelected = () => {
    if (selectedPixels.size === 0) {
      return;
    }

    // Save state for undo
    saveState();

    // Erase selected pixels
    const pixelKeys = Array.from(selectedPixels);
    eraseSelectedPixels(pixelKeys);

    // Clear selection after erasing
    clearSelection();
  };

  /**
   * Clear all selected pixels
   */
  const handleDeselectAll = () => {
    clearSelection();
  };

  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
      {/* Erase Selected Button */}
      <Button
        variant="contained"
        color="error"
        onClick={handleEraseSelected}
        disabled={selectedPixels.size === 0}
        size="small"
        sx={{
          borderRadius: '10px',
          px: 2,
          py: 0.75,
          fontWeight: 600,
          fontSize: '0.8125rem',
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(241, 65, 108, 0.35)',
          },
          transition: 'all 0.15s ease',
        }}
      >
        Erase ({selectedPixels.size})
      </Button>

      {/* Deselect All Button */}
      <Button
        variant="outlined"
        onClick={handleDeselectAll}
        disabled={selectedPixels.size === 0}
        size="small"
        sx={{
          borderRadius: '10px',
          px: 2,
          py: 0.75,
          fontWeight: 600,
          fontSize: '0.8125rem',
          textTransform: 'none',
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
          },
          transition: 'all 0.15s ease',
        }}
      >
        Deselect
      </Button>
    </Box>
  );
};
