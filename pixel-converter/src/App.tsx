/**
 * Main App component with Refine setup
 * Configures MUI ThemeProvider with RefineThemes.Blue and routing
 * 
 * Requirements:
 * - 1.1: Initialize as Vite-based React TypeScript project with Refine framework
 * - 1.2: Integrate @refinedev/mui for Material UI components
 * - 11.5: Integrate with Refine's theming and layout system
 */

import { Refine } from '@refinedev/core';
import { DevtoolsPanel, DevtoolsProvider } from '@refinedev/devtools';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';

import { RefineSnackbarProvider, useNotificationProvider } from '@refinedev/mui';

import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import routerProvider, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from '@refinedev/react-router';
import { BrowserRouter, Route, Routes } from 'react-router';
import { ColorModeContextProvider } from './contexts/color-mode';
import { ToastProvider } from './contexts/toast';
import { dataProvider } from './providers/data';
import { PixelEditorPage } from './pages/PixelEditorPage';
import { ErrorBoundary } from './components/common';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <RefineKbarProvider>
          <ColorModeContextProvider>
            <CssBaseline />
            <GlobalStyles styles={{ html: { WebkitFontSmoothing: 'auto' } }} />
            <ToastProvider>
              <RefineSnackbarProvider>
                <DevtoolsProvider>
                  <Refine
                    notificationProvider={useNotificationProvider}
                    routerProvider={routerProvider}
                    dataProvider={dataProvider}
                    options={{
                      syncWithLocation: true,
                      warnWhenUnsavedChanges: false, // Disable for pixel editor
                      projectId: 'RpaMLk-J9JpOz-kIr2y3',
                    }}
                  >
                    <Routes>
                      <Route index element={<PixelEditorPage />} />
                    </Routes>
                    <RefineKbar />
                    <UnsavedChangesNotifier />
                    <DocumentTitleHandler />
                  </Refine>
                  <DevtoolsPanel />
                </DevtoolsProvider>
              </RefineSnackbarProvider>
            </ToastProvider>
          </ColorModeContextProvider>
        </RefineKbarProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
