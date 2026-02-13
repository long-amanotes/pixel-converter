/**
 * CanvasComponent - Metronic 9 inspired canvas area
 */

import React, { memo, useRef, useCallback } from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';
import { useCanvas } from '../../hooks';
import { useStore } from '../../store';
import { FloatingPixelCount } from '../common';

interface CanvasComponentProps {
  width?: number;
  height?: number;
  onDragOver?: (event: React.DragEvent) => void;
  onDrop?: (event: React.DragEvent) => void;
}

export const CanvasComponent: React.FC<CanvasComponentProps> = memo(function CanvasComponent({
  width = 800,
  height = 600,
  onDragOver,
  onDrop,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const hasPixels = useStore((state) => state.pixels.length > 0);
  const editMode = useStore((state) => state.editMode);
  const size = useStore((state) => state.size);

  const { canvasRef, handleMouseDown, handleMouseMove, handleMouseUp } = useCanvas({
    width,
    height,
  });

  const onMouseLeave = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  const canvasLabel = hasPixels
    ? `Pixel art canvas, ${size}x${size} pixels, ${editMode} mode active.`
    : 'Empty canvas. Drop an image or paste from clipboard.';

  return (
    <Box
      ref={containerRef}
      role="application"
      aria-label={canvasLabel}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={onMouseLeave}
      tabIndex={0}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        bgcolor: isDark ? '#1B1B29' : '#FFFFFF',
        overflow: 'auto',
        p: 3,
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: isDark 
          ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
          : '0 4px 20px rgba(0, 0, 0, 0.06)',
        // Checkerboard pattern
        backgroundImage: isDark
          ? `linear-gradient(45deg, ${alpha('#FFFFFF', 0.03)} 25%, transparent 25%), 
             linear-gradient(-45deg, ${alpha('#FFFFFF', 0.03)} 25%, transparent 25%), 
             linear-gradient(45deg, transparent 75%, ${alpha('#FFFFFF', 0.03)} 75%), 
             linear-gradient(-45deg, transparent 75%, ${alpha('#FFFFFF', 0.03)} 75%)`
          : `linear-gradient(45deg, #F0F0F0 25%, #FAFAFA 25%), 
             linear-gradient(-45deg, #F0F0F0 25%, #FAFAFA 25%), 
             linear-gradient(45deg, #FAFAFA 75%, #F0F0F0 75%), 
             linear-gradient(-45deg, #FAFAFA 75%, #F0F0F0 75%)`,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        outline: 'none',
        transition: 'all 0.2s ease',
        '&:focus-visible': {
          boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.25)}`,
        },
        '&::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
          borderRadius: '3px',
          '&:hover': {
            background: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
          },
        },
      }}
    >
      <FloatingPixelCount />
      
      {!hasPixels && (
        <Box
          sx={{
            position: 'absolute',
            inset: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            p: 4,
            bgcolor: isDark ? alpha('#1B1B29', 0.95) : alpha('#FFFFFF', 0.95),
            backdropFilter: 'blur(8px)',
            border: '2px dashed',
            borderColor: isDark ? alpha('#FFFFFF', 0.15) : alpha('#000000', 0.12),
            borderRadius: '16px',
            pointerEvents: 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '16px',
              bgcolor: isDark ? alpha('#3E97FF', 0.15) : alpha('#3E97FF', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <UploadIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              color: 'text.primary',
              mb: 1,
              fontSize: '1.125rem',
            }}
          >
            Drop an image to start
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.875rem',
              maxWidth: 280,
            }}
          >
            Drag & drop, paste with <Box component="span" sx={{ fontFamily: 'monospace', bgcolor: isDark ? alpha('#FFFFFF', 0.1) : alpha('#000000', 0.06), px: 1, py: 0.25, borderRadius: '4px', fontSize: '0.75rem' }}>Ctrl+V</Box>, or click Upload
          </Typography>
        </Box>
      )}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          imageRendering: 'pixelated',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
          borderRadius: '8px',
          cursor: 'crosshair',
          boxShadow: isDark 
            ? '0 8px 24px rgba(0, 0, 0, 0.4)' 
            : '0 8px 24px rgba(0, 0, 0, 0.1)',
          background: 'transparent',
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </Box>
  );
});
