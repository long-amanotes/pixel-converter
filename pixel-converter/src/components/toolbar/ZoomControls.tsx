/**
 * ZoomControls - Zoom slider and percentage display
 * Allows users to adjust canvas zoom from 10% to 200%
 * 
 * Validates: Requirements 3.2
 */

import React from 'react';
import { Box, Slider, Typography } from '@mui/material';
import { useStore } from '../../store';

/**
 * Minimum zoom scale (10%)
 */
const MIN_ZOOM = 0.1;

/**
 * Maximum zoom scale (200%)
 */
const MAX_ZOOM = 2.0;

/**
 * ZoomControls provides a slider to adjust the canvas zoom level
 * and displays the current zoom percentage
 */
export const ZoomControls: React.FC = () => {
  const zoomScale = useStore((state) => state.zoomScale);
  const setZoomScale = useStore((state) => state.setZoomScale);

  /**
   * Handle zoom slider change
   * Converts slider value (10-200) to zoom scale (0.1-2.0)
   */
  const handleZoomChange = (_event: Event, value: number | number[]) => {
    const zoomValue = Array.isArray(value) ? value[0] : value;
    if (zoomValue !== undefined) {
      // Convert percentage to scale (e.g., 100 -> 1.0)
      setZoomScale(zoomValue / 100);
    }
  };

  // Convert zoom scale to percentage for display (e.g., 1.0 -> 100)
  const zoomPercentage = Math.round(zoomScale * 100);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        minWidth: 200,
      }}
    >
      <Typography variant="body2" sx={{ fontSize: '0.8125rem', fontWeight: 500, color: 'text.secondary' }}>
        Zoom:
      </Typography>
      <Slider
        value={zoomPercentage}
        onChange={handleZoomChange}
        min={MIN_ZOOM * 100}
        max={MAX_ZOOM * 100}
        step={5}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => `${value}%`}
        sx={{ 
          flex: 1,
          maxWidth: 140,
          '& .MuiSlider-thumb': {
            width: 16,
            height: 16,
            bgcolor: 'primary.main',
            border: '2px solid',
            borderColor: 'background.paper',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
            '&:hover': {
              boxShadow: '0 3px 6px rgba(0, 0, 0, 0.2)',
            },
          },
          '& .MuiSlider-track': {
            height: 4,
            borderRadius: 2,
            bgcolor: 'primary.main',
          },
          '& .MuiSlider-rail': {
            height: 4,
            borderRadius: 2,
            bgcolor: 'grey.200',
          },
        }}
        aria-label="Zoom level"
      />
      <Typography
        variant="body2"
        sx={{
          minWidth: 45,
          textAlign: 'center',
          fontWeight: 600,
          fontSize: '0.8125rem',
          color: 'text.primary',
          bgcolor: 'grey.100',
          px: 1,
          py: 0.5,
          borderRadius: '6px',
        }}
      >
        {zoomPercentage}%
      </Typography>
    </Box>
  );
};
