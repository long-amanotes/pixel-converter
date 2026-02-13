/**
 * PixelEditorPage - Main page for the Pixel Art Converter
 * Metronic 9 inspired UI/UX design
 */

import { useMemo, useState, Suspense, lazy } from 'react';
import { Box, Drawer, useMediaQuery, useTheme, CircularProgress, Typography, alpha } from '@mui/material';
import {
  Category as CategoryIcon,
  DataObject as DataObjectIcon,
  Palette as PaletteIcon,
  FileDownload as ExportIcon,
  ColorLens as ColorLensIcon,
} from '@mui/icons-material';

import { CanvasComponent } from '../components/canvas';
import { HintPanel } from '../components/common';
import { TabbedSidebar } from '../components/sidebar';
import { ToolbarComponent } from '../components/toolbar';
import { HeaderComponent } from '../components/header';
import { useToast } from '../contexts/toast';
import { useImageLoader, useStorageRestore } from '../hooks';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

// Lazy load sidebar panels
const ColorGroupsPanel = lazy(() => 
  import('../components/sidebar/ColorGroupsPanel').then(m => ({ default: m.ColorGroupsPanel }))
);
const ColorTypesPanel = lazy(() => 
  import('../components/sidebar/ColorTypesPanel').then(m => ({ default: m.ColorTypesPanel }))
);
const DataGroupsPanel = lazy(() => 
  import('../components/sidebar/DataGroupsPanel').then(m => ({ default: m.DataGroupsPanel }))
);
const ExportImportPanel = lazy(() => 
  import('../components/sidebar/ExportImportPanel').then(m => ({ default: m.ExportImportPanel }))
);
const PalettePanel = lazy(() => 
  import('../components/sidebar/PalettePanel').then(m => ({ default: m.PalettePanel }))
);

const PanelFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
    <CircularProgress size={20} thickness={4} />
  </Box>
);

export const PixelEditorPage = () => {
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const { notify } = useToast();
  const { isRestoring } = useStorageRestore();

  const { handleFileInput, handleDragOver, handleDrop } = useImageLoader({
    onLoadError: (error) => {
      notify({ message: error.message, severity: 'error', autoHideDurationMs: 5000 });
    },
    onLoadSuccess: () => {
      notify({ message: 'Image loaded successfully', severity: 'success' });
    },
  });

  useKeyboardShortcuts({
    onUndoEmpty: () => {
      notify({ message: 'Nothing to undo', severity: 'info' });
    },
  });

  const sidebar = useMemo(
    () => (
      <TabbedSidebar
        title="Workspace"
        tabs={[
          {
            id: 'palette',
            label: 'Palette',
            icon: <PaletteIcon sx={{ fontSize: 18 }} />,
            content: (
              <Suspense fallback={<PanelFallback />}>
                <PalettePanel />
              </Suspense>
            ),
          },
          {
            id: 'groups',
            label: 'Groups',
            icon: <ColorLensIcon sx={{ fontSize: 18 }} />,
            content: (
              <Suspense fallback={<PanelFallback />}>
                <ColorGroupsPanel />
              </Suspense>
            ),
          },
          {
            id: 'types',
            label: 'Types',
            icon: <CategoryIcon sx={{ fontSize: 18 }} />,
            content: (
              <Suspense fallback={<PanelFallback />}>
                <ColorTypesPanel />
              </Suspense>
            ),
          },
          {
            id: 'data',
            label: 'Data',
            icon: <DataObjectIcon sx={{ fontSize: 18 }} />,
            content: (
              <Suspense fallback={<PanelFallback />}>
                <DataGroupsPanel />
              </Suspense>
            ),
          },
          {
            id: 'export',
            label: 'Export',
            icon: <ExportIcon sx={{ fontSize: 18 }} />,
            content: (
              <Suspense fallback={<PanelFallback />}>
                <ExportImportPanel />
              </Suspense>
            ),
          },
        ]}
      />
    ),
    []
  );

  // Loading state
  if (isRestoring) {
    return (
      <Box
        sx={{
          width: '100vw',
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          bgcolor: isDark ? '#1B1B29' : '#F5F8FA',
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '16px',
            bgcolor: isDark ? alpha('#3E97FF', 0.15) : alpha('#3E97FF', 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress size={28} thickness={4} />
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              mb: 0.5,
            }}
          >
            Loading workspace
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Restoring your previous session...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: isDark ? '#151521' : '#F5F8FA',
      }}
    >
      {/* Header */}
      <HeaderComponent onOpenHelp={() => setIsHelpOpen(true)} />

      {/* Toolbar */}
      <Box sx={{ flexShrink: 0 }}>
        <ToolbarComponent
          onFileInputChange={handleFileInput}
          onOpenHelp={() => setIsHelpOpen(true)}
          onToggleSidebar={isNarrow ? () => setIsSidebarOpen((v) => !v) : undefined}
        />
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          gap: 2,
          p: 2,
          minHeight: 0,
        }}
      >
        {/* Canvas Area */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <CanvasComponent onDragOver={handleDragOver} onDrop={handleDrop} />
        </Box>

        {/* Sidebar */}
        {isNarrow ? (
          <Drawer
            anchor="right"
            open={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            PaperProps={{ 
              sx: { 
                width: 380, 
                maxWidth: '90vw',
                bgcolor: isDark ? '#1B1B29' : '#FFFFFF',
                borderLeft: '1px solid',
                borderColor: 'divider',
              } 
            }}
          >
            <Box sx={{ height: '100%', p: 2 }}>{sidebar}</Box>
          </Drawer>
        ) : (
          <Box sx={{ flexShrink: 0, width: 360 }}>{sidebar}</Box>
        )}
      </Box>

      <HintPanel open={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </Box>
  );
};

