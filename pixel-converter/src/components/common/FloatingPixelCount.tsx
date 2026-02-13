/**
 * Floating pixel count - Metronic 9 inspired design
 */

import { Box, Typography, alpha, useTheme } from '@mui/material';
import { useStore } from '../../store';

export const FloatingPixelCount = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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
        bgcolor: isDark ? '#1B1B29' : '#FFFFFF',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '10px',
        boxShadow: isDark 
          ? '0 4px 20px rgba(0, 0, 0, 0.4)' 
          : '0 4px 20px rgba(0, 0, 0, 0.1)',
        px: 2,
        py: 1.5,
        minWidth: 100,
        textAlign: 'center',
        transition: 'all 0.15s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isDark 
            ? '0 8px 24px rgba(0, 0, 0, 0.5)' 
            : '0 8px 24px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          fontSize: '0.5625rem',
          fontWeight: 700,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          mb: 0.5,
        }}
      >
        Pixels
      </Typography>
      <Typography
        variant="h5"
        sx={{
          fontSize: '1.25rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #3E97FF 0%, #7239EA 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
        }}
      >
        {totalPixels.toLocaleString()}
      </Typography>
    </Box>
  );
};
