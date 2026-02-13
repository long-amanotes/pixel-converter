/**
 * Export/Import panel - Metronic 9 inspired design
 */

import { Box, Typography, Button, Stack, TextField, alpha, useTheme } from '@mui/material';
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

export const ExportImportPanel = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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
    const data = exportJSON(pixels, palette, size);
    setJsonOutput(JSON.stringify(data, null, 2));
    downloadJSON(data);
    notify({ message: 'JSON exported successfully', severity: 'success' });
  };

  const handleExportPNG = () => {
    if (pixels.length === 0) {
      notify({ message: 'No pixels to export. Load an image first.', severity: 'error' });
      return;
    }
    try {
      exportPNG(pixels, size);
      notify({ message: 'PNG exported successfully', severity: 'success' });
    } catch (error) {
      notify({ message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`, severity: 'error' });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await readJSONFile(file);
      const imported = importJSON(data);
      
      setPixels(imported.pixels);
      setPalette(imported.palette);
      setSize(imported.size);
      setColorTypes(imported.colorTypes);
      
      setTimeout(() => regroup(), 0);
      
      notify({
        message: `Imported ${imported.pixels.length} pixels, ${imported.palette.length} colors`,
        severity: 'success',
        autoHideDurationMs: 5000,
      });
      setJsonOutput('');
    } catch (error) {
      if (error instanceof ImportValidationError) {
        notify({ message: `Import failed: ${error.message}`, severity: 'error', autoHideDurationMs: 6000 });
      } else {
        notify({ message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`, severity: 'error', autoHideDurationMs: 6000 });
      }
    }
    event.target.value = '';
  };

  const handleClearStorage = () => {
    if (!window.confirm('Clear all saved data? This cannot be undone.')) return;
    try {
      clearStorage();
      setHasSavedData(false);
      notify({ message: 'Saved data cleared', severity: 'success' });
    } catch (error) {
      notify({ message: `Failed to clear: ${error instanceof Error ? error.message : 'Unknown error'}`, severity: 'error' });
    }
  };

  const buttonStyles = {
    borderRadius: '8px',
    py: 1.25,
    fontWeight: 600,
    fontSize: '0.8125rem',
    textTransform: 'none' as const,
    boxShadow: 'none',
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
      <Typography 
        variant="subtitle2"
        sx={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'text.primary',
          mb: 2,
        }}
      >
        Export / Import
      </Typography>

      <Stack spacing={1.5} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon sx={{ fontSize: 18 }} />}
          onClick={handleExportJSON}
          fullWidth
          disabled={pixels.length === 0}
          sx={{
            ...buttonStyles,
            background: 'linear-gradient(135deg, #3E97FF 0%, #2884EF 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #2884EF 0%, #1B6FD9 100%)',
              boxShadow: '0 4px 12px rgba(62, 151, 255, 0.35)',
            },
            '&:disabled': {
              background: isDark ? alpha('#FFFFFF', 0.1) : alpha('#000000', 0.08),
            },
          }}
        >
          Export JSON
        </Button>
        <Button
          variant="contained"
          startIcon={<ImageIcon sx={{ fontSize: 18 }} />}
          onClick={handleExportPNG}
          fullWidth
          disabled={pixels.length === 0}
          sx={{
            ...buttonStyles,
            background: 'linear-gradient(135deg, #50CD89 0%, #3DBF77 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #3DBF77 0%, #2DAF67 100%)',
              boxShadow: '0 4px 12px rgba(80, 205, 137, 0.35)',
            },
            '&:disabled': {
              background: isDark ? alpha('#FFFFFF', 0.1) : alpha('#000000', 0.08),
            },
          }}
        >
          Export PNG
        </Button>
      </Stack>

      <Button
        variant="outlined"
        startIcon={<UploadIcon sx={{ fontSize: 18 }} />}
        onClick={handleImportClick}
        fullWidth
        sx={{ 
          ...buttonStyles,
          mb: 1.5,
          borderWidth: 1.5,
          borderColor: isDark ? alpha('#FFFFFF', 0.15) : alpha('#000000', 0.12),
          color: 'text.primary',
          '&:hover': {
            borderWidth: 1.5,
            borderColor: 'primary.main',
            bgcolor: isDark ? alpha('#3E97FF', 0.1) : alpha('#3E97FF', 0.06),
          },
        }}
      >
        Import JSON
      </Button>

      {hasSavedData && (
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteForeverIcon sx={{ fontSize: 18 }} />}
          onClick={handleClearStorage}
          fullWidth
          sx={{ 
            ...buttonStyles,
            mb: 2,
            borderWidth: 1.5,
            borderColor: alpha('#F1416C', 0.3),
            color: 'error.main',
            '&:hover': {
              borderWidth: 1.5,
              borderColor: 'error.main',
              bgcolor: alpha('#F1416C', 0.1),
            },
          }}
        >
          Clear Saved Data
        </Button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {jsonOutput && (
        <Box>
          <Typography 
            variant="caption" 
            sx={{ 
              fontSize: '0.75rem', 
              fontWeight: 600, 
              color: 'text.secondary',
              mb: 1,
              display: 'block',
            }}
          >
            JSON Output
          </Typography>
          <TextField
            multiline
            rows={8}
            value={jsonOutput}
            fullWidth
            size="small"
            InputProps={{
              readOnly: true,
              sx: {
                fontFamily: 'monospace',
                fontSize: '0.6875rem',
                bgcolor: isDark ? alpha('#FFFFFF', 0.03) : alpha('#000000', 0.02),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};
