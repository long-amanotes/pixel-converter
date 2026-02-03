/**
 * Data groups panel component for managing data groups
 * 
 * Requirements:
 * - 6.1: Initialize with default "None" data group (id: 0)
 * - 6.2: Add new group with auto-incremented ID
 * - 6.3: Delete active group and reassign pixels to "None"
 * - 6.4: Clear active group (reassign pixels to "None")
 * - 6.5: Update group name
 * - 6.6: Group selection
 */

import { Box, Typography, Paper, Button, Stack, TextField } from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useStore } from '../../store';
import { useToast } from '../../contexts/toast';
import { useState, useMemo } from 'react';

/**
 * Data groups panel component
 * Displays data groups with controls for add/delete/clear and editable names
 */
export const DataGroupsPanel = () => {
  const { notify } = useToast();
  const dataGroups = useStore((state) => state.dataGroups);
  const activeDataGroupId = useStore((state) => state.activeDataGroupId);
  const addDataGroup = useStore((state) => state.addDataGroup);
  const deleteDataGroup = useStore((state) => state.deleteDataGroup);
  const clearDataGroup = useStore((state) => state.clearDataGroup);
  const updateDataGroupName = useStore((state) => state.updateDataGroupName);
  const setActiveDataGroup = useStore((state) => state.setActiveDataGroup);
  const setEditMode = useStore((state) => state.setEditMode);
  const pixels = useStore((state) => state.pixels);

  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  // Calculate pixel counts for each data group
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
    notify({
      message: 'Data group added',
      severity: 'success',
    });
  };

  const handleDeleteGroup = () => {
    if (activeDataGroupId === 0) {
      notify({
        message: 'Cannot delete the "None" group',
        severity: 'warning',
      });
      return;
    }
    deleteDataGroup();
    notify({
      message: 'Data group deleted',
      severity: 'success',
    });
  };

  const handleClearGroup = () => {
    if (activeDataGroupId === 0) {
      notify({
        message: 'Cannot clear the "None" group',
        severity: 'warning',
      });
      return;
    }
    clearDataGroup();
    notify({
      message: 'Data group cleared',
      severity: 'success',
    });
  };

  const handleGroupClick = (id: number) => {
    setActiveDataGroup(id);
    // Automatically switch to "Group Data" edit mode (Requirement 6.6)
    setEditMode('group');
  };

  const handleStartEdit = (id: number, currentName: string) => {
    if (id === 0) return; // Cannot edit "None" group name
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
        Group Data
      </Typography>

      {/* Action Buttons */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddGroup}
          size="small"
          fullWidth
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
          Add
        </Button>
        <Button
          variant="outlined"
          startIcon={<DeleteIcon />}
          onClick={handleDeleteGroup}
          size="small"
          fullWidth
          disabled={activeDataGroupId === 0}
          sx={{
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            transition: 'all 0.2s',
          }}
        >
          Delete
        </Button>
        <Button
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={handleClearGroup}
          size="small"
          fullWidth
          disabled={activeDataGroupId === 0}
          sx={{
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            transition: 'all 0.2s',
          }}
        >
          Clear
        </Button>
      </Stack>

      {/* Data Groups List */}
      <Stack spacing={0.5}>
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
                gap: 1,
                p: 1.25,
                borderRadius: '6px',
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
                      if (e.key === 'Enter') {
                        handleSaveEdit();
                      } else if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                    size="small"
                    fullWidth
                    autoFocus
                    sx={{ 
                      '& .MuiInputBase-input': { 
                        py: 0.5,
                        fontSize: '13px',
                      } 
                    }}
                  />
                ) : (
                  <Typography
                    variant="body2"
                    fontWeight={isActive ? 500 : 400}
                    onDoubleClick={() => handleStartEdit(group.id, group.name)}
                    sx={{
                      cursor: group.id === 0 ? 'pointer' : 'text',
                      fontSize: '13px',
                    }}
                  >
                    {group.name}
                  </Typography>
                )}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  bgcolor: isActive ? 'primary.main' : '#e0e0e0',
                  color: isActive ? 'white' : 'text.secondary',
                  px: 1,
                  py: 0.5,
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 500,
                  minWidth: '32px',
                  textAlign: 'center',
                }}
              >
                {pixelCount}
              </Typography>
            </Box>
          );
        })}
      </Stack>

      {activeDataGroupId > 0 && (
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
          Active: {dataGroups.find((g) => g.id === activeDataGroupId)?.name}
        </Typography>
      )}

      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ 
          mt: 1, 
          display: 'block',
          fontSize: '11px',
        }}
      >
        Double-click a group name to edit (except "None")
      </Typography>
    </Paper>
  );
};
