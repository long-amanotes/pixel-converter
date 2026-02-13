/**
 * Export/Import panel component for saving and loading pixel art
 * 
 * Requirements:
 * - 9.1: Export JSON with palette, dimensions, and pixel data
 * - 9.3: Export PNG at native resolution
 * - 10.1: Import JSON with file input
 */

import { Box, Typography, Paper, Button, Stack, TextField } from '@mui/material';
import {
  Download as DownloadIcon,
  Image as ImageIcon,
  Upload as UploadIcon,
  DeleteForever as DeleteForeverIcon,
} from '@mui/icons-material';
import { useStore } from '../../store';
import { exportJSON, exportPNG, downloadJSON } from '../../utils/exportUtils';
import { readJSONFile, importJSON, ImportValidationError } from '../../utils/importUtils';
import { clearStorage, hasStoredData } from '../../utils/storageUtils';
import { useToast } from '../../contexts/toast';
import { useState, useRef } from 'react';

/**
 * Export/Import panel component
 * Provides controls for exporting to JSON/PNG and importing from JSON
 */
export const ExportImportPanel = () => {
  const { notify } = useToast();
  const pixels = useStore((state) => state.pixels);
  const palette = useStore((state) => state.palette);
  const size = useStore((state) => state.size);
  const setPixels = useStore((state) => state.setPixels);
  const setPalette = useStore((state) => state.setPalette);
  const setSize = useStore((state) => state.setSize);
  const setColorTypes = useStore((state) => state.setColorTypes);
  const regroup = useStore((state) => state.regroup);

  const [jsonOutput, setJsonOutput] = useState('');
  const [hasSavedData, setHasSavedData] = useState(hasStoredData());

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    // Generate JSON data
    const data = exportJSON(pixels, palette, size);
    
    // Display in textarea
    setJsonOutput(JSON.stringify(data, null, 2));
    
    // Download file
    downloadJSON(data);
    
    notify({
      message: 'JSON exported successfully',
      severity: 'success',
    });
  };

  const handleExportPNG = () => {
    if (pixels.length === 0) {
      notify({
        message: 'No pixels to export. Load an image first.',
        severity: 'error',
      });
      return;
    }

    try {
      exportPNG(pixels, size);
      notify({
        message: 'PNG exported successfully',
        severity: 'success',
      });
    } catch (error) {
      notify({
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Read and parse JSON file
      const data = await readJSONFile(file);
      
      // Import and validate data
      // Requirement 10.3: Display error message if JSON format is invalid
      const imported = importJSON(data);
      
      // Update store with imported data
      setPixels(imported.pixels);
      setPalette(imported.palette);
      setSize(imported.size);
      setColorTypes(imported.colorTypes);
      
      // Regroup pixels based on imported palette
      // This will update colorGroups
      setTimeout(() => {
        regroup();
      }, 0);
      
      // Display success message with summary
      // Requirement 10.4: Display summary of imported data
      notify({
        message: `Import successful! Loaded ${imported.pixels.length} pixels, ${imported.palette.length} colors, ${imported.dataGroups.length} data groups, ${imported.colorTypes.length} color types.`,
        severity: 'success',
        autoHideDurationMs: 5000,
      });
      
      // Clear JSON output
      setJsonOutput('');
    } catch (error) {
      // Requirement 10.3: Display error message and reject import if JSON format is invalid
      if (error instanceof ImportValidationError) {
        notify({
          message: `Import failed: ${error.message}`,
          severity: 'error',
          autoHideDurationMs: 6000,
        });
      } else {
        notify({
          message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'error',
          autoHideDurationMs: 6000,
        });
      }
    }

    // Reset file input
    event.target.value = '';
  };

  const handleClearStorage = () => {
    if (!window.confirm('Are you sure you want to clear all saved data? This cannot be undone.')) {
      return;
    }

    try {
      clearStorage();
      setHasSavedData(false);
      
      notify({
        message: 'Saved data cleared successfully',
        severity: 'success',
      });
    } catch (error) {
      notify({
        message: `Failed to clear data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
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
        Export / Import
      </Typography>

      {/* Export Buttons */}
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExportJSON}
          fullWidth
          size="small"
          disabled={pixels.length === 0}
          sx={{
            borderRadius: '10px',
            py: 1,
            fontWeight: 600,
            fontSize: '0.8125rem',
            textTransform: 'none',
            boxShadow: 'none',
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
              boxShadow: '0 4px 12px rgba(62, 151, 255, 0.35)',
            },
            transition: 'all 0.15s ease',
          }}
        >
          Export JSON
        </Button>
        <Button
          variant="contained"
          startIcon={<ImageIcon />}
          onClick={handleExportPNG}
          fullWidth
          size="small"
          disabled={pixels.length === 0}
          sx={{
            borderRadius: '10px',
            py: 1,
            fontWeight: 600,
            fontSize: '0.8125rem',
            textTransform: 'none',
            boxShadow: 'none',
            bgcolor: 'success.main',
            '&:hover': {
              bgcolor: 'success.dark',
              boxShadow: '0 4px 12px rgba(80, 205, 137, 0.35)',
            },
            transition: 'all 0.15s ease',
          }}
        >
          Export PNG
        </Button>
      </Stack>

      {/* Import Button */}
      <Button
        variant="outlined"
        startIcon={<UploadIcon />}
        onClick={handleImportClick}
        fullWidth
        size="small"
        sx={{ 
          mb: 1,
          borderRadius: '10px',
          py: 1,
          fontWeight: 600,
          fontSize: '0.8125rem',
          textTransform: 'none',
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
          },
          transition: 'all 0.15s ease',
        }}
      >
        Import JSON
      </Button>

      {/* Clear Storage Button */}
      {hasSavedData && (
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteForeverIcon />}
          onClick={handleClearStorage}
          fullWidth
          size="small"
          sx={{ 
            mb: 2,
            borderRadius: '10px',
            py: 1,
            fontWeight: 600,
            fontSize: '0.8125rem',
            textTransform: 'none',
            borderWidth: 1.5,
            '&:hover': {
              borderWidth: 1.5,
            },
            transition: 'all 0.15s ease',
          }}
        >
          Clear Saved Data
        </Button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* JSON Output Textarea */}
      {jsonOutput && (
        <Box>
          <Typography variant="body2" gutterBottom sx={{ fontSize: '13px', fontWeight: 500 }}>
            JSON Output:
          </Typography>
          <TextField
            multiline
            rows={10}
            value={jsonOutput}
            fullWidth
            size="small"
            InputProps={{
              readOnly: true,
              sx: {
                fontFamily: '"Courier New", monospace',
                fontSize: '12px',
                bgcolor: '#fafafa',
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '6px',
              },
            }}
          />
        </Box>
      )}
    </Paper>
  );
};
