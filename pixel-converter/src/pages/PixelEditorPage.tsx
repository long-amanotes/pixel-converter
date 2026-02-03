/**
 * PixelEditorPage - Main page for the Pixel Art Converter
 * Composes Canvas, Toolbar, and Sidebar components in a flex layout
 *
 * Requirements:
 * - 11.1: Separate concerns into distinct React components
 * - 12.1: Display a collapsible instructions hint panel
 */

import { useMemo, useState } from 'react';
import { Box, Drawer, useMediaQuery, useTheme, CircularProgress, Typography } from '@mui/material';
import {
  Category as CategoryIcon,
  DataObject as DataObjectIcon,
  Palette as PaletteIcon,
  Share as ShareIcon,
} from '@mui/icons-material';

import { CanvasComponent } from '../components/canvas';
import { HintPanel } from '../components/common';
import { TabbedSidebar } from '../components/sidebar';
import { ColorGroupsPanel } from '../components/sidebar/ColorGroupsPanel';
import { ColorTypesPanel } from '../components/sidebar/ColorTypesPanel';
import { DataGroupsPanel } from '../components/sidebar/DataGroupsPanel';
import { ExportImportPanel } from '../components/sidebar/ExportImportPanel';
import { PalettePanel } from '../components/sidebar/PalettePanel';
import { ToolbarComponent } from '../components/toolbar';
import { useToast } from '../contexts/toast';
import { useImageLoader, useStorageRestore } from '../hooks';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

/**
 * Main pixel editor page component
 * Provides the complete pixel art editing interface
 */
export const PixelEditorPage = () => {
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down('md'));

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const { notify } = useToast();

  // Restore saved state from localStorage
  const { isRestoring, hasSavedData } = useStorageRestore();

  // Initialize image loading capabilities (file upload, drag-drop, paste)
  const { handleFileInput, handleDragOver, handleDrop } = useImageLoader({
    onLoadError: (error) => {
      notify({ message: error.message, severity: 'error', autoHideDurationMs: 5000 });
    },
    onLoadSuccess: () => {
      notify({ message: 'Image loaded successfully', severity: 'success' });
    },
  });

  // Initialize keyboard shortcuts (Ctrl+Z for undo, Ctrl+V handled by useImageLoader)
  useKeyboardShortcuts({
    onUndoEmpty: () => {
      notify({ message: 'Nothing to undo', severity: 'info' });
    },
  });

  const sidebar = useMemo(
    () => (
      <TabbedSidebar
        title="Controls"
        tabs={[
          {
            id: 'palette',
            label: 'Palette',
            icon: <PaletteIcon fontSize="small" />,
            content: <PalettePanel />,
          },
          {
            id: 'groups',
            label: 'Groups',
            icon: <CategoryIcon fontSize="small" />,
            content: <ColorGroupsPanel />,
          },
          {
            id: 'types',
            label: 'Types',
            icon: <CategoryIcon fontSize="small" />,
            content: <ColorTypesPanel />,
          },
          {
            id: 'data',
            label: 'Data',
            icon: <DataObjectIcon fontSize="small" />,
            content: <DataGroupsPanel />,
          },
          {
            id: 'export',
            label: 'Export',
            icon: <ShareIcon fontSize="small" />,
            content: <ExportImportPanel />,
          },
        ]}
      />
    ),
    []
  );

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {isRestoring ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Restoring your work...
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ flexShrink: 0 }}>
            {isNarrow ? (
              <ToolbarComponent
                onFileInputChange={handleFileInput}
                onOpenHelp={() => setIsHelpOpen(true)}
                onToggleSidebar={() => {
                  setIsSidebarOpen((v) => !v);
                }}
              />
            ) : (
              <ToolbarComponent
                onFileInputChange={handleFileInput}
                onOpenHelp={() => setIsHelpOpen(true)}
              />
            )}
          </Box>

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

            {isNarrow ? (
              <Drawer
                anchor="right"
                open={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                PaperProps={{ sx: { width: 400, maxWidth: '100vw' } }}
              >
                <Box sx={{ height: '100%', p: 2 }}>{sidebar}</Box>
              </Drawer>
            ) : (
              <Box sx={{ flexShrink: 0 }}>{sidebar}</Box>
            )}
          </Box>

          <HintPanel open={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
        </>
      )}
    </Box>
  );
};

