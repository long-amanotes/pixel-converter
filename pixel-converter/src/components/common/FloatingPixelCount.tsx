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
        border: '2px solid',
        borderColor: 'primary.main',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        px: 2.5,
        py: 1.5,
        minWidth: 140,
        textAlign: 'center',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
        },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          fontSize: '10px',
          fontWeight: 600,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          mb: 0.5,
        }}
      >
        Total Pixels
      </Typography>
      <Typography
        variant="h5"
        sx={{
          fontSize: '24px',
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
