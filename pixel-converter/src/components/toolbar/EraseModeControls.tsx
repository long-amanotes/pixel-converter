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
          boxShadow: '0 2px 4px rgba(211, 47, 47, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(211, 47, 47, 0.4)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: '0 2px 4px rgba(211, 47, 47, 0.3)',
          },
          transition: 'all 0.2s',
        }}
      >
        Erase Selected ({selectedPixels.size})
      </Button>

      {/* Deselect All Button */}
      <Button
        variant="outlined"
        onClick={handleDeselectAll}
        disabled={selectedPixels.size === 0}
        size="small"
        sx={{
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
          transition: 'all 0.2s',
        }}
      >
        Deselect All
      </Button>
    </Box>
  );
};
