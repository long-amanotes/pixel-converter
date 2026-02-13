/**
 * ZoomControls - Metronic 9 inspired zoom slider
 */

import React from 'react';
import { Box, Slider, Typography, alpha, useTheme } from '@mui/material';
import { useStore } from '../../store';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 2.0;

export const ZoomControls: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const zoomScale = useStore((state) => state.zoomScale);
  const setZoomScale = useStore((state) => state.setZoomScale);

  const handleZoomChange = (_event: Event, value: number | number[]) => {
    const zoomValue = Array.isArray(value) ? value[0] : value;
    if (zoomValue !== undefined) {
      setZoomScale(zoomValue / 100);
    }
  };

  const zoomPercentage = Math.round(zoomScale * 100);

  return (
    <Box
      data-tour="zoom-controls"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        minWidth: 180,
      }}
    >
      <Typography 
        variant="body2" 
        sx={{ 
          fontSize: '0.75rem', 
          fontWeight: 500, 
          color: 'text.secondary',
        }}
      >
        Zoom
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
          maxWidth: 120,
          '& .MuiSlider-thumb': {
            width: 14,
            height: 14,
            bgcolor: 'primary.main',
            border: '2px solid',
            borderColor: isDark ? '#1B1B29' : '#FFFFFF',
            boxShadow: '0 2px 6px rgba(62, 151, 255, 0.3)',
            transition: 'all 0.15s ease',
            '&:hover': {
              boxShadow: '0 3px 8px rgba(62, 151, 255, 0.4)',
              transform: 'scale(1.1)',
            },
          },
          '& .MuiSlider-track': {
            height: 4,
            borderRadius: 2,
            background: 'linear-gradient(90deg, #3E97FF 0%, #7239EA 100%)',
            border: 'none',
          },
          '& .MuiSlider-rail': {
            height: 4,
            borderRadius: 2,
            bgcolor: isDark ? alpha('#FFFFFF', 0.1) : alpha('#000000', 0.08),
          },
          '& .MuiSlider-valueLabel': {
            bgcolor: isDark ? '#1E293B' : '#1F2937',
            borderRadius: '6px',
            fontSize: '0.6875rem',
            fontWeight: 600,
          },
        }}
        aria-label="Zoom level"
      />
      <Typography
        variant="body2"
        sx={{
          minWidth: 42,
          textAlign: 'center',
          fontWeight: 600,
          fontSize: '0.75rem',
          color: 'text.primary',
          bgcolor: isDark ? alpha('#FFFFFF', 0.05) : alpha('#000000', 0.04),
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
