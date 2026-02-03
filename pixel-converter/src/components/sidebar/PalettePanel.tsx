/**
 * Palette panel component for managing color palette
 * 
 * Requirements:
 * - 4.1: Initialize with a preset palette of 9 colors
 * - 4.2: Add new color picker to the palette
 */

import { Box, Button, Typography, Paper } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useStore } from '../../store';

/**
 * Palette panel component
 * Displays color pickers for the palette and allows adding new colors
 */
export const PalettePanel = () => {
  const palette = useStore((state) => state.palette);
  const addPaletteColor = useStore((state) => state.addPaletteColor);
  const updatePaletteColor = useStore((state) => state.updatePaletteColor);
  const regroup = useStore((state) => state.regroup);

  const handleColorChange = (index: number, color: string) => {
    updatePaletteColor(index, color);
    // Automatically regroup pixels when palette color changes (Requirement 4.3)
    regroup();
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
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
        {palette.map((color, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
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
                margin: 4,
              }}
              title={`Color ${index + 1}: ${color.toUpperCase()}`}
            />
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
