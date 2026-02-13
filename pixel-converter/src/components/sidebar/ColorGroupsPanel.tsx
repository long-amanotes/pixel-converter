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
        Color Groups
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
                    bgcolor: hexColor,
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
