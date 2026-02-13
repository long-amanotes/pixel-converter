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
        px: 3,
        py: 2,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap',
        alignItems: 'center',
        position: 'relative',
        boxShadow: (theme) => theme.palette.mode === 'dark' 
          ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
          : '0 4px 20px rgba(0, 0, 0, 0.05)',
      }}
    >
      {onToggleSidebar && (
        <Tooltip title="Toggle sidebar" arrow>
          <IconButton 
            size="medium" 
            aria-label="Toggle sidebar" 
            onClick={onToggleSidebar}
            sx={{
              borderRadius: '10px',
              bgcolor: 'grey.100',
              color: 'grey.700',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: 'grey.200',
                color: 'grey.900',
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
            borderRadius: '10px',
            px: 3,
            py: 1.25,
            fontWeight: 600,
            fontSize: '0.875rem',
            textTransform: 'none',
            boxShadow: 'none',
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
              boxShadow: '0 4px 12px rgba(62, 151, 255, 0.35)',
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            transition: 'all 0.15s ease',
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
              borderRadius: '10px',
              bgcolor: undoStackSize > 0 ? 'grey.100' : 'transparent',
              color: 'grey.700',
              transition: 'all 0.15s ease',
              '&:hover:not(:disabled)': {
                bgcolor: 'grey.200',
                color: 'grey.900',
              },
              '&:disabled': {
                opacity: 0.4,
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
          step: 1,
          'aria-label': 'Pixel art size',
        }}
        sx={{ 
          width: 120,
          '& .MuiInputLabel-root': {
            fontWeight: 500,
            fontSize: '0.8125rem',
            color: 'grey.600',
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            bgcolor: 'grey.50',
            transition: 'all 0.15s ease',
            '& fieldset': {
              borderWidth: 1,
              borderColor: 'grey.200',
            },
            '&:hover': {
              bgcolor: 'grey.100',
              '& fieldset': {
                borderColor: 'grey.300',
              },
            },
            '&.Mui-focused': {
              bgcolor: 'background.paper',
              '& fieldset': {
                borderWidth: 1.5,
                borderColor: 'primary.main',
              },
            },
          },
          '& .MuiOutlinedInput-input': {
            fontWeight: 500,
            fontSize: '0.875rem',
          },
        }}
        size="small"
      />

      {/* Scale Mode Selector */}
      <FormControl 
        size="small" 
        sx={{ 
          minWidth: 170,
          '& .MuiInputLabel-root': {
            fontWeight: 500,
            fontSize: '0.8125rem',
            color: 'grey.600',
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            bgcolor: 'grey.50',
            transition: 'all 0.15s ease',
            '& fieldset': {
              borderWidth: 1,
              borderColor: 'grey.200',
            },
            '&:hover': {
              bgcolor: 'grey.100',
              '& fieldset': {
                borderColor: 'grey.300',
              },
            },
            '&.Mui-focused': {
              bgcolor: 'background.paper',
              '& fieldset': {
                borderWidth: 1.5,
                borderColor: 'primary.main',
              },
            },
          },
          '& .MuiSelect-select': {
            fontWeight: 500,
            fontSize: '0.8125rem',
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
          MenuProps={{
            PaperProps: {
              sx: {
                borderRadius: '12px',
                mt: 1,
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
                border: '1px solid',
                borderColor: 'divider',
                '& .MuiMenuItem-root': {
                  borderRadius: '8px',
                  mx: 1,
                  my: 0.25,
                  fontWeight: 500,
                  fontSize: '0.8125rem',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                  },
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'primary.dark',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                    },
                  },
                },
              },
            },
          }}
        >
          <MenuItem value="majority">Block Majority</MenuItem>
          <MenuItem value="nearest">Nearest Neighbor</MenuItem>
        </Select>
      </FormControl>

      {/* Edit Mode Selector */}
      <FormControl 
        size="small" 
        sx={{ 
          minWidth: 160,
          '& .MuiInputLabel-root': {
            fontWeight: 500,
            fontSize: '0.8125rem',
            color: 'grey.600',
          },
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            bgcolor: 'grey.50',
            transition: 'all 0.15s ease',
            '& fieldset': {
              borderWidth: 1,
              borderColor: 'grey.200',
            },
            '&:hover': {
              bgcolor: 'grey.100',
              '& fieldset': {
                borderColor: 'grey.300',
              },
            },
            '&.Mui-focused': {
              bgcolor: 'background.paper',
              '& fieldset': {
                borderWidth: 1.5,
                borderColor: 'primary.main',
              },
            },
          },
          '& .MuiSelect-select': {
            fontWeight: 500,
            fontSize: '0.8125rem',
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
          MenuProps={{
            PaperProps: {
              sx: {
                borderRadius: '12px',
                mt: 1,
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
                border: '1px solid',
                borderColor: 'divider',
                '& .MuiMenuItem-root': {
                  borderRadius: '8px',
                  mx: 1,
                  my: 0.25,
                  fontWeight: 500,
                  fontSize: '0.8125rem',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                  },
                  '&.Mui-selected': {
                    bgcolor: 'primary.light',
                    color: 'primary.dark',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                    },
                  },
                },
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
            borderRadius: '10px',
            bgcolor: 'grey.100',
            color: 'grey.700',
            transition: 'all 0.15s ease',
            '&:hover': {
              bgcolor: 'grey.200',
              color: 'grey.900',
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
              borderRadius: '10px',
              bgcolor: 'grey.100',
              color: 'grey.700',
              transition: 'all 0.15s ease',
              '&:hover': {
                bgcolor: 'grey.200',
                color: 'grey.900',
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
