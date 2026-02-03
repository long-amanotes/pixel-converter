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
  const isSystemPreferenceDark = window?.matchMedia('(prefers-color-scheme: dark)').matches;

  const systemPreference = isSystemPreferenceDark ? 'dark' : 'light';
  const [mode, setMode] = useState(colorModeFromLocalStorage || systemPreference);

  useEffect(() => {
    window.localStorage.setItem('colorMode', mode);
  }, [mode]);

  const setColorMode = () => {
    if (mode === 'light') {
      setMode('dark');
    } else {
      setMode('light');
    }
  };

  const theme = useMemo(() => {
    const baseTheme = mode === 'light' ? RefineThemes.Blue : RefineThemes.BlueDark;

    return createTheme(baseTheme, {
      shape: { borderRadius: 12 },
      typography: {
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
      },
      components: {
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
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
