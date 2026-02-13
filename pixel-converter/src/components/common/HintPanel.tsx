/**
 * HintPanel - Metronic 9 inspired help dialog
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
  alpha,
  useTheme,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export type HintPanelProps = {
  open: boolean;
  onClose: () => void;
};

export const HintPanel: React.FC<HintPanelProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const sectionStyle = {
    p: 2,
    borderRadius: '10px',
    bgcolor: isDark ? alpha('#FFFFFF', 0.03) : alpha('#000000', 0.02),
    border: '1px solid',
    borderColor: isDark ? alpha('#FFFFFF', 0.06) : alpha('#000000', 0.04),
  };

  const kbdStyle = {
    fontFamily: 'monospace',
    fontSize: '0.6875rem',
    fontWeight: 600,
    bgcolor: isDark ? alpha('#FFFFFF', 0.1) : alpha('#000000', 0.06),
    color: 'text.primary',
    px: 1,
    py: 0.5,
    borderRadius: '4px',
    border: '1px solid',
    borderColor: isDark ? alpha('#FFFFFF', 0.1) : alpha('#000000', 0.08),
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: isDark ? '#1B1B29' : '#FFFFFF',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: isDark ? alpha('#FFFFFF', 0.02) : alpha('#000000', 0.01),
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2,
          px: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: isDark ? alpha('#3E97FF', 0.15) : alpha('#3E97FF', 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.125rem',
            }}
          >
            💡
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            Help & Shortcuts
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            bgcolor: isDark ? alpha('#FFFFFF', 0.05) : alpha('#000000', 0.04),
            '&:hover': {
              bgcolor: isDark ? alpha('#FFFFFF', 0.1) : alpha('#000000', 0.08),
            },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ py: 3, px: 3 }}>
        {/* Getting Started */}
        <Box
          sx={{
            p: 2,
            borderRadius: '10px',
            background: isDark 
              ? 'linear-gradient(135deg, rgba(62, 151, 255, 0.15) 0%, rgba(114, 57, 234, 0.15) 100%)'
              : 'linear-gradient(135deg, rgba(62, 151, 255, 0.1) 0%, rgba(114, 57, 234, 0.1) 100%)',
            border: '1px solid',
            borderColor: isDark ? alpha('#3E97FF', 0.3) : alpha('#3E97FF', 0.2),
            mb: 2.5,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} color="primary.main" sx={{ mb: 0.5, fontSize: '0.8125rem' }}>
            🚀 Getting started
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
            Upload an image, drag & drop, or paste from clipboard to begin editing.
          </Typography>
        </Box>

        {/* Modes */}
        <Box sx={{ ...sectionStyle, mb: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 1, fontSize: '0.8125rem' }}>
            🎨 Edit Modes
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {[
              { label: 'Group', color: '#50CD89' },
              { label: 'Type', color: '#7239EA' },
              { label: 'Paint', color: '#3E97FF' },
              { label: 'Erase', color: '#F1416C' },
            ].map((mode) => (
              <Box
                key={mode.label}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '6px',
                  bgcolor: alpha(mode.color, isDark ? 0.2 : 0.12),
                  color: mode.color,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {mode.label}
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ ...sectionStyle, mb: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 0.5, fontSize: '0.8125rem' }}>
            📦 Group Data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
            Drag a rectangle to assign pixels to a data group.
          </Typography>
        </Box>

        <Box sx={{ ...sectionStyle, mb: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 0.5, fontSize: '0.8125rem' }}>
            🎯 Color Type
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
            Drag a rectangle to assign pixels to a color type.
          </Typography>
        </Box>

        <Box sx={{ ...sectionStyle, mb: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 0.5, fontSize: '0.8125rem' }}>
            ✏️ Paint / Erase
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
            Select pixels, then apply a color or remove them.
          </Typography>
        </Box>

        {/* Shortcuts */}
        <Box sx={{ ...sectionStyle }}>
          <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ mb: 1.5, fontSize: '0.8125rem' }}>
            ⌨️ Keyboard Shortcuts
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box component="span" sx={kbdStyle}>Ctrl+Z</Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>Undo</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box component="span" sx={kbdStyle}>Ctrl+V</Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>Paste image</Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, bgcolor: isDark ? alpha('#FFFFFF', 0.02) : alpha('#000000', 0.01), borderTop: '1px solid', borderColor: 'divider' }}>
        <Button 
          onClick={onClose} 
          variant="contained"
          sx={{
            borderRadius: '8px',
            px: 4,
            py: 1,
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'none',
            boxShadow: 'none',
            background: 'linear-gradient(135deg, #3E97FF 0%, #2884EF 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #2884EF 0%, #1B6FD9 100%)',
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

