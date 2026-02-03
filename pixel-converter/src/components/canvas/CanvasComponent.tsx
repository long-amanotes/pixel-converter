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

import React, { useRef } from 'react';
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
export const CanvasComponent: React.FC<CanvasComponentProps> = ({
  width = 800,
  height = 600,
  onDragOver,
  onDrop,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasPixels = useStore((state) => state.pixels.length > 0);

  // Use the useCanvas hook to handle all canvas logic
  const { canvasRef, handleMouseDown, handleMouseMove, handleMouseUp } = useCanvas({
    width,
    height,
  });

  return (
    <Box
      ref={containerRef}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
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
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        backgroundImage:
          'linear-gradient(45deg, rgba(0,0,0,0.04) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.04) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.04) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.04) 75%)',
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px',
        // Custom scrollbar styling
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0,0,0,0.25)',
          borderRadius: '4px',
          '&:hover': {
            background: 'rgba(0,0,0,0.35)',
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
            inset: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            p: 3,
            bgcolor: (theme) => alpha(theme.palette.background.paper, 0.82),
            backdropFilter: 'blur(6px)',
            border: '1px dashed',
            borderColor: 'divider',
            pointerEvents: 'none',
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Drop an image to start
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Paste (Ctrl+V) or use “Upload Image”.
            </Typography>
          </Box>
        </Paper>
      )}
      <canvas
        ref={canvasRef}
        style={{
          // Pixelated rendering CSS (Req 3.1)
          imageRendering: 'pixelated',
          border: '1px solid rgba(0, 0, 0, 0.25)',
          borderRadius: '8px',
          cursor: 'crosshair',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
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
};
