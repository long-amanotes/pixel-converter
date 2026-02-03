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
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
          borderBottom: '2px solid',
          borderColor: 'divider',
          fontWeight: 700,
          fontSize: '1.25rem',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          },
        }}
      >
        💡 Help & Shortcuts
      </DialogTitle>
      <DialogContent dividers sx={{ py: 3 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'primary.50',
            border: '1px solid',
            borderColor: 'primary.200',
            mb: 3,
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={{ mb: 1 }}>
            🚀 Getting started
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload an image, or drag and drop it onto the canvas. You can also paste from clipboard.
          </Typography>
        </Box>

        <Box sx={{ mt: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
            🎨 Modes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Group Data • Color Type • Paint • Erase
          </Typography>
        </Box>

        <Box sx={{ mt: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
            📦 Group Data
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Drag a rectangle to assign pixels to a data group.
          </Typography>
        </Box>

        <Box sx={{ mt: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
            🎯 Color Type
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Drag a rectangle to assign pixels to a color type.
          </Typography>
        </Box>

        <Box sx={{ mt: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
            ✏️ Paint / Erase
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select pixels, then apply a color (Paint) or remove them (Erase).
          </Typography>
        </Box>

        <Box 
          sx={{ 
            mt: 2.5,
            p: 2,
            borderRadius: 2,
            bgcolor: 'grey.100',
            border: '1px solid',
            borderColor: 'grey.300',
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
            ⌨️ Shortcuts
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div">
            <Box component="span" sx={{ fontFamily: 'monospace', bgcolor: 'grey.200', px: 1, py: 0.5, borderRadius: 1, mr: 1 }}>
              Ctrl+Z
            </Box>
            Undo
            <br />
            <Box component="span" sx={{ fontFamily: 'monospace', bgcolor: 'grey.200', px: 1, py: 0.5, borderRadius: 1, mr: 1, mt: 1, display: 'inline-block' }}>
              Ctrl+V
            </Box>
            Paste image
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, bgcolor: 'background.default' }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          size="large"
          sx={{
            borderRadius: 2,
            px: 4,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.25)',
            background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
              transform: 'translateY(-2px)',
              background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
};

