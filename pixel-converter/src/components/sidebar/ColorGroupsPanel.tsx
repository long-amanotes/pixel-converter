/**
 * Color groups panel component for displaying and selecting color groups
 * 
 * Requirements:
 * - 4.5: Display color groups with pixel counts
 * - 4.6: Handle group selection for filtering
 */

import { Box, Typography, Paper, Stack } from '@mui/material';
import { useStore } from '../../store';

/**
 * Color groups panel component
 * Displays color groups with pixel counts and allows selection for filtering
 */
export const ColorGroupsPanel = () => {
  const colorGroups = useStore((state) => state.colorGroups);
  const activeColorGroup = useStore((state) => state.activeColorGroup);
  const setActiveColorGroup = useStore((state) => state.setActiveColorGroup);

  const handleGroupClick = (index: number) => {
    // Toggle selection: if already active, deselect (set to -1)
    if (activeColorGroup === index) {
      setActiveColorGroup(-1);
    } else {
      setActiveColorGroup(index);
    }
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
        Group Color
      </Typography>

      {colorGroups.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '13px' }}>
          No color groups available. Load an image to see color groups.
        </Typography>
      ) : (
        <Stack spacing={0.5}>
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
                  gap: 1,
                  p: 1.25,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  bgcolor: isActive ? '#e3f2fd' : '#f9f9f9',
                  border: '2px solid',
                  borderColor: isActive ? '#2196F3' : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: isActive ? '#e3f2fd' : '#f0f0f0',
                    borderColor: isActive ? '#2196F3' : '#ddd',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    bgcolor: hexColor,
                    border: '1px solid #ddd',
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
                  }}
                >
                  Color {group.index}: {group.pixels.length}px
                </Typography>
              </Box>
            );
          })}
        </Stack>
      )}

      {activeColorGroup >= 0 && (
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
          Filter active: Only Color {activeColorGroup} pixels will be affected
        </Typography>
      )}
    </Paper>
  );
};
