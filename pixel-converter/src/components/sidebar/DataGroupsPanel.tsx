/**
 * Data groups panel - Metronic 9 inspired design
 */

import { Box, Typography, Button, Stack, TextField, alpha, useTheme } from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useStore } from '../../store';
import { useToast } from '../../contexts/toast';
import { useState, useMemo } from 'react';

export const DataGroupsPanel = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { notify } = useToast();
  
  const dataGroups = useStore((state) => state.dataGroups);
  const activeDataGroupId = useStore((state) => state.activeDataGroupId);
  const addDataGroup = useStore((state) => state.addDataGroup);
  const deleteDataGroup = useStore((state) => state.deleteDataGroup);
  const clearDataGroup = useStore((state) => state.clearDataGroup);
  const updateDataGroupName = useStore((state) => state.updateDataGroupName);
  const setActiveDataGroup = useStore((state) => state.setActiveDataGroup);
  const setEditMode = useStore((state) => state.setEditMode);
  const clearSelection = useStore((state) => state.clearSelection);
  const pixels = useStore((state) => state.pixels);

  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const groupPixelCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const pixel of pixels) {
      const count = counts.get(pixel.group) || 0;
      counts.set(pixel.group, count + 1);
    }
    return counts;
  }, [pixels]);

  const handleAddGroup = () => {
    addDataGroup();
    notify({ message: 'Data group added', severity: 'success' });
  };

  const handleDeleteGroup = () => {
    if (activeDataGroupId === 0) {
      notify({ message: 'Cannot delete "None" group', severity: 'warning' });
      return;
    }
    deleteDataGroup();
    notify({ message: 'Data group deleted', severity: 'success' });
  };

  const handleClearGroup = () => {
    if (activeDataGroupId === 0) {
      notify({ message: 'Cannot clear "None" group', severity: 'warning' });
      return;
    }
    clearDataGroup();
    notify({ message: 'Data group cleared', severity: 'success' });
  };

  const handleGroupClick = (id: number) => {
    clearSelection();
    if (activeDataGroupId === id) {
      setActiveDataGroup(0);
      return;
    }
    setActiveDataGroup(id);
    setEditMode('group');
  };

  const handleStartEdit = (id: number, currentName: string) => {
    if (id === 0) return;
    setEditingGroupId(id);
    setEditingName(currentName);
  };

  const handleSaveEdit = () => {
    if (editingGroupId !== null && editingName.trim()) {
      updateDataGroupName(editingGroupId, editingName.trim());
    }
    setEditingGroupId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingGroupId(null);
    setEditingName('');
  };

  const buttonStyles = {
    borderRadius: '6px',
    py: 0.75,
    fontWeight: 600,
    fontSize: '0.6875rem',
    textTransform: 'none' as const,
    transition: 'all 0.15s ease',
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
          Data Groups
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
          {dataGroups.length}
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 14 }} />}
          onClick={handleAddGroup}
          size="small"
          fullWidth
          sx={{
            ...buttonStyles,
            boxShadow: 'none',
            background: 'linear-gradient(135deg, #50CD89 0%, #3DBF77 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #3DBF77 0%, #2DAF67 100%)',
              boxShadow: '0 4px 12px rgba(80, 205, 137, 0.35)',
            },
          }}
        >
          Add
        </Button>
        <Button
          variant="outlined"
          startIcon={<DeleteIcon sx={{ fontSize: 14 }} />}
          onClick={handleDeleteGroup}
          size="small"
          fullWidth
          disabled={activeDataGroupId === 0}
          sx={{
            ...buttonStyles,
            borderWidth: 1.5,
            borderColor: isDark ? alpha('#FFFFFF', 0.15) : alpha('#000000', 0.12),
            color: 'text.secondary',
            '&:hover': {
              borderWidth: 1.5,
              borderColor: 'error.main',
              color: 'error.main',
              bgcolor: alpha('#F1416C', 0.08),
            },
            '&:disabled': {
              borderColor: isDark ? alpha('#FFFFFF', 0.08) : alpha('#000000', 0.06),
            },
          }}
        >
          Delete
        </Button>
        <Button
          variant="outlined"
          startIcon={<ClearIcon sx={{ fontSize: 14 }} />}
          onClick={handleClearGroup}
          size="small"
          fullWidth
          disabled={activeDataGroupId === 0}
          sx={{
            ...buttonStyles,
            borderWidth: 1.5,
            borderColor: isDark ? alpha('#FFFFFF', 0.15) : alpha('#000000', 0.12),
            color: 'text.secondary',
            '&:hover': {
              borderWidth: 1.5,
              borderColor: 'warning.main',
              color: 'warning.main',
              bgcolor: alpha('#FFC700', 0.08),
            },
            '&:disabled': {
              borderColor: isDark ? alpha('#FFFFFF', 0.08) : alpha('#000000', 0.06),
            },
          }}
        >
          Clear
        </Button>
      </Stack>

      <Stack spacing={0.75}>
        {dataGroups.map((group) => {
          const isActive = activeDataGroupId === group.id;
          const pixelCount = groupPixelCounts.get(group.id) || 0;
          const isEditing = editingGroupId === group.id;

          return (
            <Box
              key={group.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: '8px',
                bgcolor: isActive 
                  ? (isDark ? alpha('#50CD89', 0.15) : alpha('#50CD89', 0.1))
                  : (isDark ? alpha('#FFFFFF', 0.03) : alpha('#000000', 0.02)),
                border: '1px solid',
                borderColor: isActive 
                  ? '#50CD89' 
                  : (isDark ? alpha('#FFFFFF', 0.06) : alpha('#000000', 0.04)),
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: isActive 
                    ? (isDark ? alpha('#50CD89', 0.2) : alpha('#50CD89', 0.15))
                    : (isDark ? alpha('#FFFFFF', 0.05) : alpha('#000000', 0.04)),
                },
              }}
            >
              <Box
                onClick={() => !isEditing && handleGroupClick(group.id)}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  cursor: isEditing ? 'default' : 'pointer',
                }}
              >
                {isEditing ? (
                  <TextField
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={handleSaveEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      else if (e.key === 'Escape') handleCancelEdit();
                    }}
                    size="small"
                    fullWidth
                    autoFocus
                    sx={{ 
                      '& .MuiInputBase-input': { 
                        py: 0.5,
                        fontSize: '0.8125rem',
                      } 
                    }}
                  />
                ) : (
                  <Typography
                    variant="body2"
                    onDoubleClick={() => handleStartEdit(group.id, group.name)}
                    sx={{
                      cursor: group.id === 0 ? 'pointer' : 'text',
                      fontSize: '0.8125rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#50CD89' : 'text.primary',
                    }}
                  >
                    {group.name}
                  </Typography>
                )}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  bgcolor: isActive 
                    ? '#50CD89' 
                    : (isDark ? alpha('#FFFFFF', 0.1) : alpha('#000000', 0.06)),
                  color: isActive ? '#FFFFFF' : 'text.secondary',
                  px: 1.25,
                  py: 0.5,
                  borderRadius: '20px',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  minWidth: '36px',
                  textAlign: 'center',
                }}
              >
                {pixelCount}
              </Typography>
            </Box>
          );
        })}
      </Stack>

      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ 
          mt: 2, 
          display: 'block',
          fontSize: '0.6875rem',
          opacity: 0.7,
        }}
      >
        Double-click to rename (except "None")
      </Typography>
    </Box>
  );
};
