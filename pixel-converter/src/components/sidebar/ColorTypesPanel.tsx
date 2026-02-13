/**
 * Color types panel - Metronic 9 inspired design
 */

import { Box, Typography, Button, Stack, alpha, useTheme } from '@mui/material';
import { AutoFixHigh as ParseIcon } from '@mui/icons-material';
import { useStore } from '../../store';
import { useMemo } from 'react';

export const ColorTypesPanel = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const colorTypes = useStore((state) => state.colorTypes);
  const activeColorTypeId = useStore((state) => state.activeColorTypeId);
  const setActiveColorType = useStore((state) => state.setActiveColorType);
  const parseColorTypes = useStore((state) => state.parseColorTypes);
  const clearSelection = useStore((state) => state.clearSelection);
  const pixels = useStore((state) => state.pixels);

  const colorTypeStats = useMemo(() => {
    const stats = new Map<number, number>();
    for (const pixel of pixels) {
      const count = stats.get(pixel.colorType) || 0;
      stats.set(pixel.colorType, count + 1);
    }
    return stats;
  }, [pixels]);

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
    clearSelection();
    if (activeColorTypeId === id) {
      setActiveColorType(0);
    } else {
      setActiveColorType(id);
    }
  };

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
          Color Types
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
          {colorTypes.length}
        </Typography>
      </Box>

      <Button
        variant="contained"
        startIcon={<ParseIcon sx={{ fontSize: 16 }} />}
        onClick={parseColorTypes}
        fullWidth
        size="small"
        sx={{ 
          mb: 2,
          borderRadius: '8px',
          py: 1,
          fontWeight: 600,
          fontSize: '0.8125rem',
          textTransform: 'none',
          boxShadow: 'none',
          background: 'linear-gradient(135deg, #7239EA 0%, #5014D0 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5014D0 0%, #4010B0 100%)',
            boxShadow: '0 4px 12px rgba(114, 57, 234, 0.35)',
          },
          transition: 'all 0.15s ease',
        }}
      >
        Parse from Groups
      </Button>

      {totalPixels > 0 && colorTypes.length > 0 && (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: '8px',
            bgcolor: isValid 
              ? (isDark ? alpha('#50CD89', 0.15) : alpha('#50CD89', 0.1))
              : (isDark ? alpha('#F1416C', 0.15) : alpha('#F1416C', 0.1)),
            border: '1px solid',
            borderColor: isValid ? alpha('#50CD89', 0.3) : alpha('#F1416C', 0.3),
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: isValid ? '#50CD89' : '#F1416C',
            }}
          >
            {isValid ? '✓ Type sum matches total' : `⚠ Mismatch: ${assignedPixels} ≠ ${totalPixels}`}
          </Typography>
        </Box>
      )}

      {colorTypes.length === 0 ? (
        <Box
          sx={{
            p: 3,
            textAlign: 'center',
            borderRadius: '8px',
            bgcolor: isDark ? alpha('#FFFFFF', 0.02) : alpha('#000000', 0.02),
            border: '1px dashed',
            borderColor: isDark ? alpha('#FFFFFF', 0.1) : alpha('#000000', 0.08),
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
            Click "Parse from Groups" to create types
          </Typography>
        </Box>
      ) : (
        <Stack spacing={0.75}>
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
                  borderRadius: '8px',
                  cursor: 'pointer',
                  bgcolor: isActive 
                    ? (isDark ? alpha('#7239EA', 0.15) : alpha('#7239EA', 0.1))
                    : (isDark ? alpha('#FFFFFF', 0.03) : alpha('#000000', 0.02)),
                  border: '1px solid',
                  borderColor: isActive 
                    ? '#7239EA' 
                    : (isDark ? alpha('#FFFFFF', 0.06) : alpha('#000000', 0.04)),
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isActive 
                      ? (isDark ? alpha('#7239EA', 0.2) : alpha('#7239EA', 0.15))
                      : (isDark ? alpha('#FFFFFF', 0.05) : alpha('#000000', 0.04)),
                  },
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: colorType.color,
                    borderRadius: '6px',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    border: '2px solid',
                    borderColor: isDark ? alpha('#FFFFFF', 0.1) : alpha('#FFFFFF', 0.8),
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: '0.8125rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#7239EA' : 'text.primary',
                    }}
                  >
                    Type {colorType.id}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.6875rem',
                      color: 'text.secondary',
                    }}
                  >
                    {pixelCount} pixels
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}

      {activeColorTypeId > 0 && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: '8px',
            bgcolor: isDark ? alpha('#7239EA', 0.1) : alpha('#7239EA', 0.08),
            border: '1px solid',
            borderColor: alpha('#7239EA', 0.2),
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              fontSize: '0.75rem',
              fontWeight: 500,
              color: '#7239EA',
            }}
          >
            ✓ Active: {colorTypes.find((ct) => ct.id === activeColorTypeId)?.name}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
