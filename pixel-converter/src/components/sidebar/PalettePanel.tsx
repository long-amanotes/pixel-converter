/**
 * Palette panel - Metronic 9 inspired design
 */

import { memo, useState, useCallback } from 'react';
import { Box, Button, Typography, TextField, IconButton, Tooltip, alpha, useTheme } from '@mui/material';
import { Add as AddIcon, ContentCopy as CopyIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useStore } from '../../store';

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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
        gap: 1.5,
        p: 1.5,
        borderRadius: '10px',
        bgcolor: isDark ? alpha('#FFFFFF', 0.03) : alpha('#000000', 0.02),
        border: '1px solid',
        borderColor: isDark ? alpha('#FFFFFF', 0.06) : alpha('#000000', 0.04),
        transition: 'all 0.15s ease',
        '&:hover': {
          bgcolor: isDark ? alpha('#FFFFFF', 0.05) : alpha('#000000', 0.04),
          borderColor: isDark ? alpha('#FFFFFF', 0.1) : alpha('#000000', 0.08),
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: 36,
          height: 36,
          borderRadius: '8px',
          overflow: 'hidden',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <input
          type="color"
          value={color}
          onChange={handleColorInput}
          style={{
            width: '150%',
            height: '150%',
            border: 'none',
            cursor: 'pointer',
            position: 'absolute',
            top: '-25%',
            left: '-25%',
          }}
        />
      </Box>
      <TextField
        value={color.toUpperCase()}
        onChange={handleHexInput}
        size="small"
        sx={{
          flex: 1,
          '& .MuiInputBase-input': {
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            fontWeight: 600,
            py: 0.75,
            px: 1.5,
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: '6px',
            bgcolor: isDark ? alpha('#FFFFFF', 0.03) : '#FFFFFF',
          },
        }}
        inputProps={{ maxLength: 7, style: { textTransform: 'uppercase' } }}
      />
      <Tooltip title={isCopied ? 'Copied!' : 'Copy'} arrow>
        <IconButton
          size="small"
          onClick={() => onCopy(index, color)}
          sx={{
            width: 28,
            height: 28,
            borderRadius: '6px',
            color: isCopied ? 'success.main' : 'text.secondary',
            bgcolor: isDark ? alpha('#FFFFFF', 0.03) : alpha('#000000', 0.02),
            '&:hover': {
              bgcolor: isDark ? alpha('#FFFFFF', 0.08) : alpha('#000000', 0.06),
            },
          }}
        >
          <CopyIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
      {canDelete && (
        <Tooltip title="Remove" arrow>
          <IconButton
            size="small"
            onClick={() => onDelete(index)}
            sx={{
              width: 28,
              height: 28,
              borderRadius: '6px',
              color: 'error.main',
              bgcolor: isDark ? alpha('#F1416C', 0.1) : alpha('#F1416C', 0.08),
              '&:hover': {
                bgcolor: isDark ? alpha('#F1416C', 0.2) : alpha('#F1416C', 0.15),
              },
            }}
          >
            <DeleteIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
});

export const PalettePanel = memo(function PalettePanel() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
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
    <Box
      sx={{ 
        p: 2, 
        bgcolor: isDark ? '#1B1B29' : '#FFFFFF', 
        borderRadius: '10px',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography 
          variant="subtitle2"
          sx={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          Colors
        </Typography>
        <Typography 
          variant="caption"
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'text.secondary',
            bgcolor: isDark ? alpha('#FFFFFF', 0.05) : alpha('#000000', 0.04),
            px: 1,
            py: 0.25,
            borderRadius: '4px',
          }}
        >
          {palette.length}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
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
        startIcon={<AddIcon sx={{ fontSize: 16 }} />}
        onClick={handleAddColor}
        fullWidth
        size="small"
        sx={{
          borderRadius: '8px',
          py: 1,
          fontWeight: 600,
          fontSize: '0.8125rem',
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
        Add Color
      </Button>
    </Box>
  );
});
