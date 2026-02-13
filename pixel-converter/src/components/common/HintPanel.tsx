/**
 * HintPanel - Instructions dialog
 * Displays usage instructions for the pixel art converter
 *
 * Requirements:
 * - 12.1: Display a collapsible instructions hint panel
 */

import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

export type HintPanelProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * HintPanel component
 * Presents instructions in a non-intrusive dialog (opened from the toolbar).
 */
export const HintPanel: React.FC<HintPanelProps> = ({ open, onClose }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          border: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: 'grey.50',
          borderBottom: '1px solid',
          borderColor: 'divider',
          fontWeight: 600,
          fontSize: '1.125rem',
          py: 2,
          px: 3,
        }}
      >
        💡 Help & Shortcuts
      </DialogTitle>
      <DialogContent dividers sx={{ py: 3, px: 3 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: '12px',
            bgcolor: 'primary.light',
            border: '1px solid',
            borderColor: 'primary.main',
            mb: 3,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} color="primary.dark" sx={{ mb: 0.5 }}>
            🚀 Getting started
          </Typography>
          <Typography variant="body2" color="primary.dark" sx={{ opacity: 0.85, fontSize: '0.8125rem' }}>
            Upload an image, or drag and drop it onto the canvas. You can also paste from clipboard.
          </Typography>
        </Box>

        <Box sx={{ mt: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 0.5 }}>
            🎨 Modes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
            Group Data • Color Type • Paint • Erase
          </Typography>
        </Box>

        <Box sx={{ mt: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 0.5 }}>
            📦 Group Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
            Drag a rectangle to assign pixels to a data group.
          </Typography>
        </Box>

        <Box sx={{ mt: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 0.5 }}>
            🎯 Color Type
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
            Drag a rectangle to assign pixels to a color type.
          </Typography>
        </Box>

        <Box sx={{ mt: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 0.5 }}>
            ✏️ Paint / Erase
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
            Select pixels, then apply a color (Paint) or remove them (Erase).
          </Typography>
        </Box>

        <Box 
          sx={{ 
            mt: 2.5,
            p: 2,
            borderRadius: '12px',
            bgcolor: 'grey.100',
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
            ⌨️ Shortcuts
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div" sx={{ fontSize: '0.8125rem' }}>
            <Box component="span" sx={{ fontFamily: 'monospace', bgcolor: 'grey.200', px: 1, py: 0.5, borderRadius: '6px', mr: 1, fontSize: '0.75rem' }}>
              Ctrl+Z
            </Box>
            Undo
            <br />
            <Box component="span" sx={{ fontFamily: 'monospace', bgcolor: 'grey.200', px: 1, py: 0.5, borderRadius: '6px', mr: 1, mt: 1, display: 'inline-block', fontSize: '0.75rem' }}>
              Ctrl+V
            </Box>
            Paste image
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, bgcolor: 'grey.50' }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          size="large"
          sx={{
            borderRadius: '10px',
            px: 4,
            py: 1,
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'none',
            boxShadow: 'none',
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
              boxShadow: '0 4px 12px rgba(62, 151, 255, 0.35)',
            },
            transition: 'all 0.15s ease',
          }}
        >
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
};

