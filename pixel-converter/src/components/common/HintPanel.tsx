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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Help & Shortcuts</DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" fontWeight={800}>
          Getting started
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Upload an image, or drag and drop it onto the canvas. You can also paste from clipboard.
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" fontWeight={800}>
            Modes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Group Data • Color Type • Paint • Erase
          </Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" fontWeight={800}>
            Group Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Drag a rectangle to assign pixels to a data group.
          </Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" fontWeight={800}>
            Color Type
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Drag a rectangle to assign pixels to a color type.
          </Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" fontWeight={800}>
            Paint / Erase
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Select pixels, then apply a color (Paint) or remove them (Erase).
          </Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" fontWeight={800}>
            Shortcuts
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Ctrl+Z (undo) • Ctrl+V (paste image)
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

