import { createTheme, ThemeProvider } from '@mui/material/styles';
import { RefineThemes } from '@refinedev/mui';
import React, { PropsWithChildren, createContext, useEffect, useMemo, useState } from 'react';

type ColorModeContextType = {
  mode: string;
  setMode: () => void;
};

export const ColorModeContext = createContext<ColorModeContextType>({} as ColorModeContextType);

export const ColorModeContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const colorModeFromLocalStorage = localStorage.getItem('colorMode');
  const [mode, setMode] = useState(colorModeFromLocalStorage || 'light');

  useEffect(() => {
    window.localStorage.setItem('colorMode', mode);
  }, [mode]);

  const setColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => {
    const baseTheme = mode === 'light' ? RefineThemes.Blue : RefineThemes.BlueDark;

    return createTheme(baseTheme, {
      shape: { borderRadius: 12 },
      typography: {
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
      },
      transitions: {
        duration: {
          shortest: 150,
          shorter: 200,
          short: 250,
          standard: 300,
          complex: 375,
          enteringScreen: 225,
          leavingScreen: 195,
        },
      },
      components: {
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              transition: 'background-color 0.3s ease, color 0.3s ease',
            },
          },
        },
        MuiButton: {
          defaultProps: { disableElevation: true },
        },
        MuiTextField: {
          defaultProps: { size: 'small' },
        },
        MuiFormControl: {
          defaultProps: { size: 'small' },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              transition: 'background-color 0.3s ease, color 0.3s ease',
            },
          },
        },
      },
    });
  }, [mode]);

  return (
    <ColorModeContext.Provider
      value={{
        setMode: setColorMode,
        mode,
      }}
    >
      <ThemeProvider
        theme={theme}
      >
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
