/**
 * Color types panel component for managing color type classifications
 * 
 * Requirements:
 * - 7.1: Parse color types from existing color groups
 * - 7.2: Display color types with pixel counts and validation status
 * - 7.3: Show validation status
 */

import { Box, Typography, Paper, Button, Stack } from '@mui/material';
import { AutoFixHigh as ParseIcon } from '@mui/icons-material';
import { useStore } from '../../store';
import { useMemo } from 'react';

/**
 * Color types panel component
 * Displays color types with statistics and allows parsing from color groups
 */
export const ColorTypesPanel = () => {
  const colorTypes = useStore((state) => state.colorTypes);
  const activeColorTypeId = useStore((state) => state.activeColorTypeId);
  const setActiveColorType = useStore((state) => state.setActiveColorType);
  const parseColorTypes = useStore((state) => state.parseColorTypes);
  const clearSelection = useStore((state) => state.clearSelection);
  const pixels = useStore((state) => state.pixels);

  // Calculate pixel counts for each color type
  const colorTypeStats = useMemo(() => {
    const stats = new Map<number, number>();
    
    for (const pixel of pixels) {
      const count = stats.get(pixel.colorType) || 0;
      stats.set(pixel.colorType, count + 1);
    }
    
    return stats;
  }, [pixels]);

  // Calculate total assigned pixels and validation status
  const totalPixels = pixels.length;
  const assignedPixels = useMemo(() => {
    let sum = 0;
    for (const colorType of colorTypes) {
      sum += colorTypeStats.get(colorType.id) || 0;
    }
    return sum;
  }, [colorTypes, colorTypeStats]);

  const isValid = totalPixels === 0 || assignedPixels === totalPixels;

  const handleColorTypeClick = (id: number) => {
    // Clear selection on canvas when switching/toggling types
    clearSelection();
    
    // Toggle selection: if already active, deselect (set to 0)
    if (activeColorTypeId === id) {
      setActiveColorType(0);
    } else {
      setActiveColorType(id);
    }
  };

  const handleParse = () => {
    parseColorTypes();
  };

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
    >
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'text.primary',
          mb: 2,
        }}
      >
        Color Types
      </Typography>

      <Button
        variant="contained"
        startIcon={<ParseIcon />}
        onClick={handleParse}
        fullWidth
        size="small"
        sx={{ 
          mb: 2,
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
        Parse from Color Groups
      </Button>

      {/* Validation Status */}
      {totalPixels > 0 && colorTypes.length > 0 && (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: '10px',
            bgcolor: isValid ? 'success.light' : 'error.light',
            color: isValid ? 'success.dark' : 'error.dark',
            fontSize: '0.8125rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {isValid ? '✓ Type sum matches total' : `⚠ Mismatch ${assignedPixels} ≠ ${totalPixels}`}
        </Box>
      )}

      {colorTypes.length === 0 ? (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontSize: '13px',
            opacity: 0.6,
            mt: 1,
          }}
        >
          No color types defined. Click "Parse from Group Color" to create them.
        </Typography>
      ) : (
        <Stack spacing={0.5}>
          {colorTypes.map((colorType) => {
            const isActive = activeColorTypeId === colorType.id;
            const pixelCount = colorTypeStats.get(colorType.id) || 0;

            return (
              <Box
                key={colorType.id}
                onClick={() => handleColorTypeClick(colorType.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  bgcolor: isActive ? 'primary.light' : 'grey.50',
                  border: '1px solid',
                  borderColor: isActive ? 'primary.main' : 'grey.200',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.light' : 'grey.100',
                    borderColor: isActive ? 'primary.main' : 'grey.300',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: colorType.color,
                    border: '2px solid',
                    borderColor: 'background.paper',
                    borderRadius: '6px',
                    flexShrink: 0,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    flex: 1,
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'primary.dark' : 'text.primary',
                  }}
                >
                  Type {colorType.id}: {pixelCount}px
                </Typography>
              </Box>
            );
          })}
        </Stack>
      )}

      {activeColorTypeId > 0 && (
        <Typography 
          variant="caption" 
          color="primary" 
          sx={{ 
            mt: 1, 
            display: 'block',
            fontSize: '11px',
            fontStyle: 'italic',
          }}
        >
          Active: {colorTypes.find((ct) => ct.id === activeColorTypeId)?.name}
        </Typography>
      )}
    </Paper>
  );
};
