/**
 * Floating pixel count display component
 * Shows total pixel count in a floating, always-visible badge
 */

import { Box, Typography } from '@mui/material';
import { useStore } from '../../store';

/**
 * Floating pixel count component
 * Displays total pixel count in a prominent floating badge
 */
export const FloatingPixelCount = () => {
  const pixels = useStore((state) => state.pixels);
  const totalPixels = pixels.length;

  if (totalPixels === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '12px',
        boxShadow: (theme) => theme.palette.mode === 'dark' 
          ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
          : '0 4px 20px rgba(0, 0, 0, 0.08)',
        px: 2.5,
        py: 1.5,
        minWidth: 120,
        textAlign: 'center',
        transition: 'all 0.15s ease',
        '&:hover': {
          boxShadow: (theme) => theme.palette.mode === 'dark' 
            ? '0 6px 24px rgba(0, 0, 0, 0.4)' 
            : '0 6px 24px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          fontSize: '0.625rem',
          fontWeight: 600,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          mb: 0.25,
        }}
      >
        Total Pixels
      </Typography>
      <Typography
        variant="h5"
        sx={{
          fontSize: '1.375rem',
          fontWeight: 700,
          color: 'primary.main',
          lineHeight: 1,
        }}
      >
        {totalPixels.toLocaleString()}
      </Typography>
    </Box>
  );
};
