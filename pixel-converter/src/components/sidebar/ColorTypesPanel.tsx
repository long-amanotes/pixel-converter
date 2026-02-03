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
    <Paper elevation={0} sx={{ p: 2, bgcolor: 'transparent', boxShadow: 'none' }}>
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{
          fontSize: '14px',
          fontWeight: 600,
          color: 'text.primary',
          mb: 1.5,
          pb: 1,
          borderBottom: '2px solid',
          borderColor: 'divider',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        Group Color Type & Statistics
      </Typography>

      <Button
        variant="contained"
        startIcon={<ParseIcon />}
        onClick={handleParse}
        fullWidth
        size="small"
        sx={{ 
          mb: 2,
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
        Parse from Group Color
      </Button>

      {/* Validation Status */}
      {totalPixels > 0 && colorTypes.length > 0 && (
        <Box
          sx={{
            mb: 2,
            p: 1,
            borderRadius: '6px',
            bgcolor: isValid ? 'success.light' : 'error.light',
            color: isValid ? 'success.dark' : 'error.dark',
            fontSize: '13px',
            fontWeight: 500,
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
                  gap: 1,
                  p: 1.25,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  bgcolor: isActive ? 'action.selected' : 'background.paper',
                  border: '2px solid',
                  borderColor: isActive ? 'primary.main' : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: isActive ? 'action.selected' : 'action.hover',
                    borderColor: isActive ? 'primary.main' : 'divider',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    bgcolor: colorType.color,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '4px',
                    flexShrink: 0,
                  }}
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    flex: 1,
                    fontSize: '13px',
                    fontWeight: isActive ? 500 : 400,
                    color: 'text.primary',
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
