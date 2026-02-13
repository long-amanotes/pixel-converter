/**
 * Reusable loading spinner component with customizable size and message
 */

import { Box, CircularProgress, Typography } from '@mui/material';
import { memo } from 'react';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = memo(function LoadingSpinner({
  size = 40,
  message,
  fullScreen = false,
}: LoadingSpinnerProps) {
  return (
    <Box
      role="status"
      aria-live="polite"
      aria-busy="true"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        ...(fullScreen && {
          position: 'fixed',
          inset: 0,
          bgcolor: 'background.default',
          zIndex: 9999,
        }),
      }}
    >
      <CircularProgress size={size} aria-label="Loading" />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
});
