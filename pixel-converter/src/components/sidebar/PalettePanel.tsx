/**
 * Palette panel component for managing color palette
 * 
 * Requirements:
 * - 4.1: Initialize with a preset palette of 9 colors
 * - 4.2: Add new color picker to the palette
 */

import { Box, Button, Typography, Paper, TextField, IconButton, Tooltip } from '@mui/material';
import { Add as AddIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import { useStore } from '../../store';
import { useState } from 'react';

/**
 * Palette panel component
 * Displays color pickers for the palette and allows adding new colors
 */
export const PalettePanel = () => {
  const palette = useStore((state) => state.palette);
  const addPaletteColor = useStore((state) => state.addPaletteColor);
  const updatePaletteColor = useStore((state) => state.updatePaletteColor);
  const regroup = useStore((state) => state.regroup);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleColorChange = (index: number, color: string) => {
    updatePaletteColor(index, color);
    // Automatically regroup pixels when palette color changes (Requirement 4.3)
    regroup();
  };

  const handleHexInput = (index: number, value: string) => {
    // Allow typing without # prefix
    let hex = value.trim();
    if (!hex.startsWith('#')) {
      hex = '#' + hex;
    }
    
    // Validate hex color format
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      handleColorChange(index, hex.toUpperCase());
    }
  };

  const handleCopyHex = (index: number, color: string) => {
    navigator.clipboard.writeText(color.toUpperCase());
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleAddColor = () => {
    // Add a default white color
    addPaletteColor('#FFFFFF');
  };

  return (
    <Paper elevation={0} sx={{ p: 2, bgcolor: 'transparent', boxShadow: 'none' }}>
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#333',
          mb: 1.5,
          pb: 1,
          borderBottom: '2px solid #e0e0e0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        Palette
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        {palette.map((color, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <input
              type="color"
              value={color}
              onChange={(e) => handleColorChange(index, e.target.value)}
              style={{
                width: 40,
                height: 40,
                border: '1px solid #ddd',
                borderRadius: 6,
                cursor: 'pointer',
                flexShrink: 0,
              }}
              title={`Color ${index + 1}: ${color.toUpperCase()}`}
            />
            <TextField
              value={color.toUpperCase()}
              onChange={(e) => handleHexInput(index, e.target.value)}
              size="small"
              placeholder="#FFFFFF"
              sx={{
                flex: 1,
                '& .MuiInputBase-input': {
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  padding: '8px 10px',
                },
              }}
              inputProps={{
                maxLength: 7,
                style: { textTransform: 'uppercase' },
              }}
            />
            <Tooltip title={copiedIndex === index ? 'Copied!' : 'Copy hex'}>
              <IconButton
                size="small"
                onClick={() => handleCopyHex(index, color)}
                sx={{
                  color: copiedIndex === index ? 'success.main' : 'action.active',
                  transition: 'color 0.2s',
                }}
              >
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
      </Box>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddColor}
        fullWidth
        size="small"
        sx={{
          boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(33, 150, 243, 0.4)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
            boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)',
          },
          transition: 'all 0.2s',
        }}
      >
        Add Color
      </Button>
    </Paper>
  );
};
