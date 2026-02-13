/**
 * ToolbarComponent - Metronic 9 inspired toolbar
 */

import React, { useRef } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Button,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  Chip,
} from '@mui/material';
import { 
  MenuOpen, 
  Undo, 
  CloudUpload as UploadIcon,
  GridOn as GridIcon,
  Brush as BrushIcon,
  AutoFixHigh as MagicIcon,
} from '@mui/icons-material';
import { useStore } from '../../store';
import type { EditMode, ScaleMode } from '../../types';
import { ZoomControls } from './ZoomControls';
import { PaintModeControls } from './PaintModeControls';
import { EraseModeControls } from './EraseModeControls';

const MIN_SIZE = 8;
const MAX_SIZE = 256;

export type ToolbarComponentProps = {
  onFileInputChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleSidebar?: (() => void) | undefined;
  onOpenHelp?: () => void;
};

const editModeConfig: Record<EditMode, { label: string; color: string; icon: React.ReactNode }> = {
  group: { label: 'Group', color: '#50CD89', icon: <GridIcon sx={{ fontSize: 16 }} /> },
  colorType: { label: 'Type', color: '#7239EA', icon: <MagicIcon sx={{ fontSize: 16 }} /> },
  paint: { label: 'Paint', color: '#3E97FF', icon: <BrushIcon sx={{ fontSize: 16 }} /> },
  erase: { label: 'Erase', color: '#F1416C', icon: null },
};

export const ToolbarComponent: React.FC<ToolbarComponentProps> = ({
  onFileInputChange,
  onToggleSidebar,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const size = useStore((state) => state.size);
  const scaleMode = useStore((state) => state.scaleMode);
  const editMode = useStore((state) => state.editMode);
  const setSize = useStore((state) => state.setSize);
  const setScaleMode = useStore((state) => state.setScaleMode);
  const setEditMode = useStore((state) => state.setEditMode);
  const undo = useStore((state) => state.undo);
  const undoStackSize = useStore((state) => state.undoStack.length);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sizeInputValue, setSizeInputValue] = React.useState(size.toString());
  const [sizeError, setSizeError] = React.useState(false);

  React.useEffect(() => {
    setSizeInputValue(size.toString());
    setSizeError(false);
  }, [size]);

  const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setSizeInputValue(inputValue);
    
    const value = parseInt(inputValue, 10);
    if (isNaN(value) || value < MIN_SIZE) {
      setSizeError(true);
      return;
    }

    if (value > MAX_SIZE) {
      setSizeError(true);
      setSize(MAX_SIZE);
      return;
    }

    setSizeError(false);
    setSize(value);
  };

  const handleScaleModeChange = (event: SelectChangeEvent<ScaleMode>) => {
    setScaleMode(event.target.value as ScaleMode);
  };

  const handleEditModeChange = (event: SelectChangeEvent<EditMode>) => {
    setEditMode(event.target.value as EditMode);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const currentModeConfig = editModeConfig[editMode];

  const inputStyles = {
    '& .MuiInputLabel-root': {
      fontWeight: 500,
      fontSize: '0.75rem',
      color: 'text.secondary',
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      bgcolor: isDark ? alpha('#FFFFFF', 0.03) : alpha('#000000', 0.02),
      transition: 'all 0.15s ease',
      '& fieldset': {
        borderWidth: 1,
        borderColor: isDark ? alpha('#FFFFFF', 0.1) : alpha('#000000', 0.08),
      },
      '&:hover': {
        bgcolor: isDark ? alpha('#FFFFFF', 0.05) : alpha('#000000', 0.04),
        '& fieldset': {
          borderColor: isDark ? alpha('#FFFFFF', 0.15) : alpha('#000000', 0.12),
        },
      },
      '&.Mui-focused': {
        bgcolor: isDark ? alpha('#FFFFFF', 0.05) : '#FFFFFF',
        '& fieldset': {
          borderWidth: 1.5,
          borderColor: 'primary.main',
        },
      },
    },
    '& .MuiOutlinedInput-input, & .MuiSelect-select': {
      fontWeight: 500,
      fontSize: '0.8125rem',
    },
  };

  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        bgcolor: isDark ? '#1B1B29' : '#FFFFFF',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        gap: 1.5,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      {onToggleSidebar && (
        <Tooltip title="Toggle sidebar" arrow>
          <IconButton 
            size="small" 
            onClick={onToggleSidebar}
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              bgcolor: isDark ? alpha('#FFFFFF', 0.05) : 'grey.100',
              color: 'text.secondary',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: isDark ? alpha('#FFFFFF', 0.1) : 'grey.200',
                color: 'text.primary',
              },
            }}
          >
            <MenuOpen sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}

      {/* Upload Button */}
      <Box>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileInputChange ?? (() => {})}
          style={{ display: 'none' }}
        />
        <Button
          variant="contained"
          startIcon={<UploadIcon sx={{ fontSize: 18 }} />}
          onClick={handleUploadClick}
          size="small"
          sx={{
            height: 36,
            borderRadius: '8px',
            px: 2.5,
            fontWeight: 600,
            fontSize: '0.8125rem',
            textTransform: 'none',
            boxShadow: 'none',
            background: 'linear-gradient(135deg, #3E97FF 0%, #2884EF 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #2884EF 0%, #1B6FD9 100%)',
              boxShadow: '0 4px 12px rgba(62, 151, 255, 0.4)',
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            transition: 'all 0.15s ease',
          }}
        >
          Upload
        </Button>
      </Box>

      {/* Undo */}
      <Tooltip title={undoStackSize === 0 ? 'Nothing to undo' : `Undo (${undoStackSize})`} arrow>
        <span>
          <IconButton
            size="small"
            onClick={() => undo()}
            disabled={undoStackSize === 0}
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              bgcolor: undoStackSize > 0 
                ? (isDark ? alpha('#FFFFFF', 0.05) : 'grey.100')
                : 'transparent',
              color: undoStackSize > 0 ? 'text.secondary' : 'text.disabled',
              transition: 'all 0.15s ease',
              '&:hover:not(:disabled)': {
                bgcolor: isDark ? alpha('#FFFFFF', 0.1) : 'grey.200',
                color: 'text.primary',
              },
            }}
          >
            <Undo sx={{ fontSize: 18 }} />
          </IconButton>
        </span>
      </Tooltip>

      {/* Divider */}
      <Box sx={{ width: 1, height: 24, bgcolor: 'divider', mx: 0.5 }} />

      {/* Size Input */}
      <TextField
        label="Size"
        type="number"
        value={sizeInputValue}
        onChange={handleSizeChange}
        error={sizeError}
        inputProps={{ step: 1, min: MIN_SIZE, max: MAX_SIZE }}
        sx={{ width: 90, ...inputStyles }}
        size="small"
      />

      {/* Scale Mode */}
      <FormControl size="small" sx={{ minWidth: 140, ...inputStyles }}>
        <InputLabel>Scale</InputLabel>
        <Select
          value={scaleMode}
          label="Scale"
          onChange={handleScaleModeChange}
          MenuProps={{
            PaperProps: {
              sx: {
                borderRadius: '10px',
                mt: 0.5,
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                border: '1px solid',
                borderColor: 'divider',
              },
            },
          }}
        >
          <MenuItem value="majority">Block Majority</MenuItem>
          <MenuItem value="nearest">Nearest Neighbor</MenuItem>
        </Select>
      </FormControl>

      {/* Edit Mode with visual indicator */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FormControl size="small" sx={{ minWidth: 130, ...inputStyles }}>
          <InputLabel>Mode</InputLabel>
          <Select
            value={editMode}
            label="Mode"
            onChange={handleEditModeChange}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: '10px',
                  mt: 0.5,
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                  border: '1px solid',
                  borderColor: 'divider',
                },
              },
            }}
          >
            <MenuItem value="group">Group Data</MenuItem>
            <MenuItem value="colorType">Color Type</MenuItem>
            <MenuItem value="paint">Paint</MenuItem>
            <MenuItem value="erase">Erase</MenuItem>
          </Select>
        </FormControl>
        <Chip
          icon={currentModeConfig.icon as React.ReactElement}
          label={currentModeConfig.label}
          size="small"
          sx={{
            height: 28,
            fontSize: '0.75rem',
            fontWeight: 600,
            bgcolor: alpha(currentModeConfig.color, isDark ? 0.2 : 0.12),
            color: currentModeConfig.color,
            border: `1px solid ${alpha(currentModeConfig.color, 0.3)}`,
            '& .MuiChip-icon': {
              color: 'inherit',
            },
          }}
        />
      </Box>

      {/* Zoom Controls */}
      <ZoomControls />

      {/* Mode-specific controls */}
      {editMode === 'paint' && <PaintModeControls />}
      {editMode === 'erase' && <EraseModeControls />}
    </Box>
  );
};
