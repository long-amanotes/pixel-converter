/**
 * Sidebar component for the Pixel Converter
 * Contains all control panels in a scrollable layout
 * 
 * Requirements:
 * - 12.2: Show contextual controls based on the selected edit mode
 */

import { Box, Paper } from '@mui/material';
import { ReactNode } from 'react';

interface SidebarComponentProps {
  children?: ReactNode;
}

/**
 * Main sidebar container with scrollable layout
 * Provides a consistent container for all sidebar panels
 */
export const SidebarComponent = ({ children }: SidebarComponentProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        width: 380,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: '#fff',
        borderLeft: '1px solid #ddd',
        borderRadius: 0,
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          // Custom scrollbar styling
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
            '&:hover': {
              background: '#555',
            },
          },
        }}
      >
        {children}
      </Box>
    </Paper>
  );
};
