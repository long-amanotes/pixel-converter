/**
 * ToolbarComponent - Main toolbar for the Pixel Converter application
 * Provides controls for size, scale mode, and edit mode selection
 * 
 * Validates: Requirements 2.1, 2.7, 2.8, 5.1, 5.2, 5.3, 5.4
 */

import React, { useContext, useRef } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  SelectChangeEvent,
  Button,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  HelpOutline, 
  MenuOpen, 
  Undo, 
  Upload as UploadIcon,
  DarkModeOutlined,
  LightModeOutlined,
} from '@mui/icons-material';
import { useStore } from '../../store';
import { ColorModeContext } from '../../contexts/color-mode';
import type { EditMode, ScaleMode } from '../../types';
import { ZoomControls } from './ZoomControls';
import { PaintModeControls } from './PaintModeControls';
import { EraseModeControls } from './EraseModeControls';

/**
 * Minimum allowed pixel art size
 */
const MIN_SIZE = 8;

/**
 * Maximum allowed pixel art size
 */
const MAX_SIZE = 256;

/**
 * ToolbarComponent provides the main controls for the pixel art converter
 * including size input, scale mode selector, edit mode selector, and file upload
 */
export type ToolbarComponentProps = {
  onFileInputChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleSidebar?: () => void;
  onOpenHelp?: () => void;
};

export const ToolbarComponent: React.FC<ToolbarComponentProps> = ({
  onFileInputChange,
  onToggleSidebar,
  onOpenHelp,
}) => {
  const { mode, setMode } = useContext(ColorModeContext);
  const size = useStore((state) => state.size);
  const scaleMode = useStore((state) => state.scaleMode);
  const editMode = useStore((state) => state.editMode);
  const setSize = useStore((state) => state.setSize);
  const setScaleMode = useStore((state) => state.setScaleMode);
  const setEditMode = useStore((state) => state.setEditMode);
  const undo = useStore((state) => state.undo);
  const undoStackSize = useStore((state) => state.undoStack.length);

  // File input ref for programmatic triggering
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Track if size input is invalid for visual feedback
  const [sizeInputValue, setSizeInputValue] = React.useState(size.toString());
  const [sizeError, setSizeError] = React.useState(false);

  // Update local input value when store size changes
  React.useEffect(() => {
    setSizeInputValue(size.toString());
    setSizeError(false);
  }, [size]);

  /**
   * Handle size input change
   * Validates and clamps the size to the valid range [8-256]
   */
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

  /**
   * Handle scale mode selection change
   */
  const handleScaleModeChange = (event: SelectChangeEvent<ScaleMode>) => {
    setScaleMode(event.target.value as ScaleMode);
  };

  /**
   * Handle edit mode selection change
   */
  const handleEditModeChange = (event: SelectChangeEvent<EditMode>) => {
    setEditMode(event.target.value as EditMode);
  };

  /**
   * Handle file upload button click
   * Opens the file input dialog
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        bgcolor: 'background.paper',
        borderBottom: '2px solid',
        borderColor: 'divider',
        borderRadius: 0,
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap',
        alignItems: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #2196F3 0%, #9C27B0 50%, #2196F3 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s linear infinite',
        },
        '@keyframes shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      }}
    >
      {onToggleSidebar && (
        <Tooltip title="Toggle sidebar" arrow>
          <IconButton 
            size="medium" 
            aria-label="Toggle sidebar" 
            onClick={onToggleSidebar}
            sx={{
              borderRadius: 2,
              bgcolor: 'action.hover',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                transform: 'scale(1.05)',
              },
            }}
          >
            <MenuOpen fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {/* File Upload Control */}
      <Box>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileInputChange ?? (() => {})}
          style={{ display: 'none' }}
          aria-label="Upload image file"
        />
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={handleUploadClick}
          size="medium"
          sx={{
            borderRadius: 2,
            px: 2.5,
            py: 1,
            fontWeight: 600,
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.25)',
            background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
              transform: 'translateY(-2px)',
              background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
            },
            '&:active': {
              transform: 'translateY(0)',
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.25)',
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Upload Image
        </Button>
      </Box>

      <Tooltip title={undoStackSize === 0 ? 'Nothing to undo' : 'Undo (Ctrl+Z)'} arrow>
        <span>
          <IconButton
            size="medium"
            aria-label="Undo"
            onClick={() => undo()}
            disabled={undoStackSize === 0}
            sx={{
              borderRadius: 2,
              bgcolor: undoStackSize > 0 ? 'action.hover' : 'transparent',
              transition: 'all 0.3s ease',
              '&:hover:not(:disabled)': {
                bgcolor: 'warning.main',
                color: 'warning.contrastText',
                transform: 'rotate(-15deg) scale(1.05)',
              },
              '&:disabled': {
                opacity: 0.3,
              },
            }}
          >
            <Undo fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: 'divider', opacity: 0.6 }} />

      {/* Size Input */}
      <TextField
        label="Size"
        type="number"
        value={sizeInputValue}
        onChange={handleSizeChange}
        error={sizeError}
        inputProps={{
          min: MIN_SIZE,
          step: 1,
        }}
        sx={{ 
          width: 130,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(33, 150, 243, 0.15)',
            },
            '&.Mui-focused': {
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.25)',
            },
          },
        }}
        size="small"
        helperText={sizeError ? `Must be ${MIN_SIZE}-${MAX_SIZE}` : `${MIN_SIZE}-${MAX_SIZE} pixels`}
      />

      {/* Scale Mode Selector */}
      <FormControl 
        size="small" 
        sx={{ 
          minWidth: 190,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(33, 150, 243, 0.15)',
            },
            '&.Mui-focused': {
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.25)',
            },
          },
        }}
      >
        <InputLabel id="scale-mode-label">Scale Mode</InputLabel>
        <Select
          labelId="scale-mode-label"
          id="scale-mode-select"
          value={scaleMode}
          label="Scale Mode"
          onChange={handleScaleModeChange}
        >
          <MenuItem value="majority">Block Majority</MenuItem>
          <MenuItem value="nearest">Nearest Neighbor</MenuItem>
        </Select>
      </FormControl>

      {/* Edit Mode Selector */}
      <FormControl 
        size="small" 
        sx={{ 
          minWidth: 190,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(33, 150, 243, 0.15)',
            },
            '&.Mui-focused': {
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.25)',
            },
          },
        }}
      >
        <InputLabel id="edit-mode-label">Edit Mode</InputLabel>
        <Select
          labelId="edit-mode-label"
          id="edit-mode-select"
          value={editMode}
          label="Edit Mode"
          onChange={handleEditModeChange}
        >
          <MenuItem value="group">Group Data</MenuItem>
          <MenuItem value="colorType">Color Type</MenuItem>
          <MenuItem value="paint">Paint</MenuItem>
          <MenuItem value="erase">Erase</MenuItem>
        </Select>
      </FormControl>

      {/* Zoom Controls */}
      <ZoomControls />

      {/* Edit Mode Specific Controls */}
      {editMode === 'paint' && <PaintModeControls />}
      {editMode === 'erase' && <EraseModeControls />}

      <Box sx={{ flex: 1 }} />

      <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`} arrow>
        <IconButton
          size="medium"
          aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
          onClick={setMode}
          sx={{
            borderRadius: 2,
            bgcolor: 'action.hover',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              bgcolor: mode === 'dark' ? 'warning.main' : 'primary.main',
              color: mode === 'dark' ? 'warning.contrastText' : 'primary.contrastText',
              transform: 'rotate(180deg) scale(1.1)',
            },
          }}
        >
          {mode === 'dark' ? (
            <LightModeOutlined fontSize="small" />
          ) : (
            <DarkModeOutlined fontSize="small" />
          )}
        </IconButton>
      </Tooltip>

      {onOpenHelp && (
        <Tooltip title="Help & shortcuts" arrow>
          <IconButton 
            size="medium" 
            aria-label="Help" 
            onClick={onOpenHelp}
            sx={{
              borderRadius: 2,
              bgcolor: 'action.hover',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'info.main',
                color: 'info.contrastText',
                transform: 'scale(1.1) rotate(15deg)',
              },
            }}
          >
            <HelpOutline fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Paper>
  );
};
