/**
 * CanvasComponent - Main canvas for rendering and interacting with pixel art
 * 
 * Requirements:
 * - 3.1: Render pixels at current zoom level with pixelated rendering
 * - 3.2: Update display scale from 10% to 200% when zoom slider is adjusted
 * - 3.3: Highlight selected pixels with green border
 * - 3.4: Highlight active color group pixels with blue border
 * - 3.5: Highlight active color type pixels with purple border
 * - 3.6: Highlight active data group pixels with red border
 * - 3.7: Display selection rectangle with dashed border during drag
 * - 3.8: Maintain proper aspect ratio and centering within container
 * - 5.1: Allow assigning pixels to data groups via rectangle selection
 * - 5.2: Allow assigning pixels to color types via rectangle selection
 * - 5.3: Allow selecting pixels and applying a chosen color
 * - 5.4: Allow selecting pixels and removing them
 */

import React, { memo, useRef, useCallback } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useCanvas } from '../../hooks';
import { useStore } from '../../store';
import { FloatingPixelCount } from '../common';

interface CanvasComponentProps {
  width?: number;
  height?: number;
  onDragOver?: (event: React.DragEvent) => void;
  onDrop?: (event: React.DragEvent) => void;
}

/**
 * CanvasComponent renders the pixel art canvas with zoom support and interaction
 * Uses the useCanvas hook to encapsulate rendering and interaction logic
 */
export const CanvasComponent: React.FC<CanvasComponentProps> = memo(function CanvasComponent({
  width = 800,
  height = 600,
  onDragOver,
  onDrop,
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasPixels = useStore((state) => state.pixels.length > 0);
  const editMode = useStore((state) => state.editMode);
  const size = useStore((state) => state.size);

  // Use the useCanvas hook to handle all canvas logic
  const { canvasRef, handleMouseDown, handleMouseMove, handleMouseUp } = useCanvas({
    width,
    height,
  });

  // Memoized event handlers
  const onMouseLeave = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  // Accessibility: Announce canvas state to screen readers
  const canvasLabel = hasPixels
    ? `Pixel art canvas, ${size}x${size} pixels, ${editMode} mode active. Use mouse to select pixels.`
    : 'Empty canvas. Drop an image or paste from clipboard to start editing.';

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
        backgroundColor: 'background.paper',
        overflow: 'auto',
        p: 2,
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: (theme) => theme.palette.mode === 'dark' 
          ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
          : '0 4px 20px rgba(0, 0, 0, 0.06)',
        backgroundImage: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.03) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.03) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.03) 75%)'
            : 'linear-gradient(45deg, #f0f0f0 25%, #fafafa 25%), linear-gradient(-45deg, #f0f0f0 25%, #fafafa 25%), linear-gradient(45deg, #fafafa 75%, #f0f0f0 75%), linear-gradient(-45deg, #fafafa 75%, #f0f0f0 75%)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        outline: 'none',
        '&:focus-visible': {
          boxShadow: (theme) => `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
        },
        // Custom scrollbar styling
        '&::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0,0,0,0.15)',
          borderRadius: '3px',
          '&:hover': {
            background: 'rgba(0,0,0,0.25)',
          },
        },
      }}
    >
      <FloatingPixelCount />
      
      {!hasPixels && (
        <Paper
          elevation={0}
          sx={{
            position: 'absolute',
            inset: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            p: 4,
            bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(8px)',
            border: '2px dashed',
            borderColor: 'grey.300',
            borderRadius: '16px',
            pointerEvents: 'none',
          }}
        >
          <Box>
            <Typography 
              variant="h6" 
              fontWeight={700}
              sx={{ 
                color: 'text.primary',
                mb: 1,
              }}
            >
              Drop an image to start
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '0.875rem',
              }}
            >
              Paste (Ctrl+V) or use "Upload Image"
            </Typography>
          </Box>
        </Paper>
      )}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          imageRendering: 'pixelated',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
          cursor: 'crosshair',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
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
