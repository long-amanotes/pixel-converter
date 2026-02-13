/**
 * Palette panel component for managing color palette
 * 
 * Requirements:
 * - 4.1: Initialize with a preset palette of 9 colors
 * - 4.2: Add new color picker to the palette
 */

import { memo, useState, useCallback } from 'react';
import { Box, Button, Typography, Paper, TextField, IconButton, Tooltip } from '@mui/material';
import { Add as AddIcon, ContentCopy as CopyIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useStore } from '../../store';

/**
 * Individual color item component - memoized for performance
 */
const ColorItem = memo(function ColorItem({
  color,
  index,
  onColorChange,
  onCopy,
  onDelete,
  isCopied,
  canDelete,
}: {
  color: string;
  index: number;
  onColorChange: (index: number, color: string) => void;
  onCopy: (index: number, color: string) => void;
  onDelete: (index: number) => void;
  isCopied: boolean;
  canDelete: boolean;
}) {
  const handleColorInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onColorChange(index, e.target.value);
    },
    [index, onColorChange]
  );

  const handleHexInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let hex = e.target.value.trim();
      if (!hex.startsWith('#')) {
        hex = '#' + hex;
      }
      if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
        onColorChange(index, hex.toUpperCase());
      }
    },
    [index, onColorChange]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
      role="listitem"
    >
      <input
        type="color"
        value={color}
        onChange={handleColorInput}
        aria-label={`Color ${index + 1}: ${color.toUpperCase()}`}
        style={{
          width: 40,
          height: 40,
          border: '1px solid #ddd',
          borderRadius: 6,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      />
      <TextField
        value={color.toUpperCase()}
        onChange={handleHexInput}
        size="small"
        placeholder="#FFFFFF"
        aria-label={`Hex value for color ${index + 1}`}
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
      <Tooltip title={isCopied ? 'Copied!' : 'Copy hex'}>
        <IconButton
          size="small"
          onClick={() => onCopy(index, color)}
          aria-label={`Copy color ${index + 1} hex value`}
          sx={{
            color: isCopied ? 'success.main' : 'action.active',
            transition: 'color 0.2s',
          }}
        >
          <CopyIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {canDelete && (
        <Tooltip title="Remove color">
          <IconButton
            size="small"
            onClick={() => onDelete(index)}
            aria-label={`Remove color ${index + 1}`}
            sx={{
              color: 'error.light',
              '&:hover': {
                color: 'error.main',
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
});

/**
 * Palette panel component
 * Displays color pickers for the palette and allows adding new colors
 */
export const PalettePanel = memo(function PalettePanel() {
  const palette = useStore((state) => state.palette);
  const addPaletteColor = useStore((state) => state.addPaletteColor);
  const updatePaletteColor = useStore((state) => state.updatePaletteColor);
  const removePaletteColor = useStore((state) => state.removePaletteColor);
  const regroup = useStore((state) => state.regroup);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleColorChange = useCallback(
    (index: number, color: string) => {
      updatePaletteColor(index, color);
      regroup();
    },
    [updatePaletteColor, regroup]
  );

  const handleCopyHex = useCallback((index: number, color: string) => {
    navigator.clipboard.writeText(color.toUpperCase());
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }, []);

  const handleDeleteColor = useCallback(
    (index: number) => {
      removePaletteColor(index);
      regroup();
    },
    [removePaletteColor, regroup]
  );

  const handleAddColor = useCallback(() => {
    addPaletteColor('#FFFFFF');
  }, [addPaletteColor]);

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2.5, 
        bgcolor: 'background.paper', 
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
      }}
      role="region"
      aria-label="Color palette"
    >
      <Typography 
        variant="h6" 
        component="h2"
        gutterBottom
        sx={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'text.primary',
          mb: 2,
        }}
      >
        Palette ({palette.length} colors)
      </Typography>
      
      <Box 
        sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}
        role="list"
        aria-label="Color list"
      >
        {palette.map((color, index) => (
          <ColorItem
            key={index}
            color={color}
            index={index}
            onColorChange={handleColorChange}
            onCopy={handleCopyHex}
            onDelete={handleDeleteColor}
            isCopied={copiedIndex === index}
            canDelete={palette.length > 1}
          />
        ))}
      </Box>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddColor}
        fullWidth
        size="small"
        aria-label="Add new color to palette"
        sx={{
          borderRadius: '10px',
          py: 1,
          fontWeight: 600,
          fontSize: '0.8125rem',
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
        Add Color
      </Button>
    </Paper>
  );
});
