/**
 * Color groups panel - Metronic 9 inspired design
 */

import { Box, Typography, Stack, alpha, useTheme } from '@mui/material';
import { useStore } from '../../store';

export const ColorGroupsPanel = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const colorGroups = useStore((state) => state.colorGroups);
  const activeColorGroup = useStore((state) => state.activeColorGroup);
  const setActiveColorGroup = useStore((state) => state.setActiveColorGroup);

  const handleGroupClick = (index: number) => {
    if (activeColorGroup === index) {
      setActiveColorGroup(-1);
    } else {
      setActiveColorGroup(index);
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
          Color Groups
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
          {colorGroups.length}
        </Typography>
      </Box>

      {colorGroups.length === 0 ? (
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
            Load an image to see color groups
          </Typography>
        </Box>
      ) : (
        <Stack spacing={0.75}>
          {colorGroups.map((group) => {
            const isActive = activeColorGroup === group.index;
            const hexColor = `#${group.color.r.toString(16).padStart(2, '0')}${group.color.g.toString(16).padStart(2, '0')}${group.color.b.toString(16).padStart(2, '0')}`;

            return (
              <Box
                key={group.index}
                onClick={() => handleGroupClick(group.index)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  bgcolor: isActive 
                    ? (isDark ? alpha('#3E97FF', 0.15) : alpha('#3E97FF', 0.1))
                    : (isDark ? alpha('#FFFFFF', 0.03) : alpha('#000000', 0.02)),
                  border: '1px solid',
                  borderColor: isActive 
                    ? 'primary.main' 
                    : (isDark ? alpha('#FFFFFF', 0.06) : alpha('#000000', 0.04)),
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isActive 
                      ? (isDark ? alpha('#3E97FF', 0.2) : alpha('#3E97FF', 0.15))
                      : (isDark ? alpha('#FFFFFF', 0.05) : alpha('#000000', 0.04)),
                    borderColor: isActive 
                      ? 'primary.main' 
                      : (isDark ? alpha('#FFFFFF', 0.1) : alpha('#000000', 0.08)),
                  },
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: hexColor,
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
                      color: isActive ? 'primary.main' : 'text.primary',
                    }}
                  >
                    Color {group.index}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.6875rem',
                      color: 'text.secondary',
                    }}
                  >
                    {group.pixels.length} pixels
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}

      {activeColorGroup >= 0 && (
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            borderRadius: '8px',
            bgcolor: isDark ? alpha('#3E97FF', 0.1) : alpha('#3E97FF', 0.08),
            border: '1px solid',
            borderColor: alpha('#3E97FF', 0.2),
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'primary.main',
            }}
          >
            ✓ Filter active: Color {activeColorGroup}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
