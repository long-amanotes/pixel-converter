/**
 * PaintModeControls - Controls for paint edit mode
 * Provides color picker and action buttons for painting pixels
 * 
 * Validates: Requirements 5.3
 */

import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useStore } from '../../store';

/**
 * PaintModeControls component
 * Shows color picker, "Apply to Selected" button, and "Deselect All" button
 * when paint mode is active
 */
export const PaintModeControls: React.FC = () => {
  const [paintColor, setPaintColor] = useState('#000000');
  const selectedPixels = useStore((state) => state.selectedPixels);
  const applyPaintColor = useStore((state) => state.applyPaintColor);
  const clearSelection = useStore((state) => state.clearSelection);
  const saveState = useStore((state) => state.saveState);

  /**
   * Handle color picker change
   */
  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPaintColor(event.target.value);
  };

  /**
   * Apply the selected paint color to all selected pixels
   */
  const handleApplyToSelected = () => {
    if (selectedPixels.size === 0) {
      return;
    }

    // Save state for undo
    saveState();

    // Apply paint color to selected pixels
    const pixelKeys = Array.from(selectedPixels);
    applyPaintColor(pixelKeys, paintColor);

    // Clear selection after applying
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
      {/* Color Picker */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ fontSize: '13px', fontWeight: 500, color: '#666' }}>
          Paint Color:
        </Typography>
        <input
          type="color"
          value={paintColor}
          onChange={handleColorChange}
          style={{
            width: 40,
            height: 40,
            border: '1px solid #ddd',
            borderRadius: 6,
            cursor: 'pointer',
          }}
          title="Select paint color"
        />
      </Box>

      {/* Apply to Selected Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleApplyToSelected}
        disabled={selectedPixels.size === 0}
        size="small"
        sx={{
          boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(33, 150, 243, 0.4)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)',
          },
          transition: 'all 0.2s',
        }}
      >
        Apply to Selected ({selectedPixels.size})
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
