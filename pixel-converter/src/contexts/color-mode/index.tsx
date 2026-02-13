import { createTheme, ThemeProvider } from '@mui/material/styles';
import React, { PropsWithChildren, createContext, useEffect, useMemo, useState } from 'react';

type ColorModeContextType = {
  mode: string;
  setMode: () => void;
};

export const ColorModeContext = createContext<ColorModeContextType>({} as ColorModeContextType);

// Metronic 9-inspired color palette - Modern, clean, professional
const metronicColors = {
  light: {
    primary: {
      main: '#3E97FF',
      light: '#69B3FF',
      dark: '#2884EF',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7239EA',
      light: '#9B6BF2',
      dark: '#5014D0',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#50CD89',
      light: '#7DDBA3',
      dark: '#3DBF77',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#FFC700',
      light: '#FFD633',
      dark: '#E6B300',
      contrastText: '#1F2937',
    },
    error: {
      main: '#F1416C',
      light: '#F4698A',
      dark: '#D9214E',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#7239EA',
      light: '#9B6BF2',
      dark: '#5014D0',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F8FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#181C32',
      secondary: '#7E8299',
    },
    divider: '#E4E6EF',
    grey: {
      50: '#F9F9F9',
      100: '#F5F8FA',
      200: '#EFF2F5',
      300: '#E4E6EF',
      400: '#B5B5C3',
      500: '#A1A5B7',
      600: '#7E8299',
      700: '#5E6278',
      800: '#3F4254',
      900: '#181C32',
    },
  },
  dark: {
    primary: {
      main: '#3E97FF',
      light: '#69B3FF',
      dark: '#2884EF',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7239EA',
      light: '#9B6BF2',
      dark: '#5014D0',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#50CD89',
      light: '#7DDBA3',
      dark: '#3DBF77',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#FFC700',
      light: '#FFD633',
      dark: '#E6B300',
      contrastText: '#1F2937',
    },
    error: {
      main: '#F1416C',
      light: '#F4698A',
      dark: '#D9214E',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#7239EA',
      light: '#9B6BF2',
      dark: '#5014D0',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#1E1E2D',
      paper: '#1B1B29',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#9899AC',
    },
    divider: '#2B2B40',
    grey: {
      50: '#2B2B40',
      100: '#323248',
      200: '#3F4254',
      300: '#474761',
      400: '#565674',
      500: '#6D6D80',
      600: '#9899AC',
      700: '#B5B5C3',
      800: '#CDCDD4',
      900: '#FFFFFF',
    },
  },
};

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
    const colors = mode === 'light' ? metronicColors.light : metronicColors.dark;

    return createTheme({
      palette: {
        mode: mode as 'light' | 'dark',
        ...colors,
      },
      shape: { borderRadius: 8 },
      typography: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        h1: { fontWeight: 700, letterSpacing: '-0.02em' },
        h2: { fontWeight: 700, letterSpacing: '-0.02em' },
        h3: { fontWeight: 600, letterSpacing: '-0.01em' },
        h4: { fontWeight: 600, letterSpacing: '-0.01em' },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        subtitle1: { fontWeight: 500 },
        subtitle2: { fontWeight: 500 },
        body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
        body2: { fontSize: '0.875rem', lineHeight: 1.5 },
        button: { fontWeight: 600, textTransform: 'none' as const },
      },
      shadows: [
        'none',
        '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      ],
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
        easing: {
          easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
          easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
          easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
          sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
        },
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': {
                width: '6px',
                height: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                borderRadius: '3px',
              },
            },
          },
        },
        MuiPaper: {
          defaultProps: {
            elevation: 0,
          },
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              border: `1px solid ${colors.divider}`,
              transition: 'all 0.2s ease-in-out',
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              border: `1px solid ${colors.divider}`,
              boxShadow: mode === 'dark' 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            },
          },
        },
        MuiButton: {
          defaultProps: { 
            disableElevation: true,
          },
          styleOverrides: {
            root: {
              borderRadius: 8,
              fontWeight: 600,
              padding: '8px 16px',
              transition: 'all 0.2s ease-in-out',
            },
            contained: {
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              },
            },
            outlined: {
              borderWidth: '1.5px',
              '&:hover': {
                borderWidth: '1.5px',
                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              },
            },
          },
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            },
          },
        },
        MuiTextField: {
          defaultProps: { size: 'small' },
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: 8,
                transition: 'all 0.2s ease-in-out',
                '& fieldset': {
                  borderColor: colors.divider,
                  borderWidth: '1.5px',
                },
                '&:hover fieldset': {
                  borderColor: colors.primary.main,
                },
                '&.Mui-focused fieldset': {
                  borderWidth: '2px',
                },
              },
            },
          },
        },
        MuiSelect: {
          styleOverrides: {
            root: {
              borderRadius: 8,
            },
          },
        },
        MuiFormControl: {
          defaultProps: { size: 'small' },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 6,
              fontWeight: 500,
            },
          },
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              backgroundColor: mode === 'dark' ? '#1E293B' : '#1F2937',
              color: '#F9FAFB',
              fontSize: '0.8125rem',
              fontWeight: 500,
              padding: '8px 12px',
              borderRadius: 6,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            },
            arrow: {
              color: mode === 'dark' ? '#1E293B' : '#1F2937',
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: 16,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            },
          },
        },
        MuiTabs: {
          styleOverrides: {
            indicator: {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          },
        },
        MuiTab: {
          styleOverrides: {
            root: {
              fontWeight: 600,
              textTransform: 'none',
              minHeight: 44,
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              boxShadow: 'none',
              borderBottom: `1px solid ${colors.divider}`,
            },
          },
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              borderRight: `1px solid ${colors.divider}`,
            },
          },
        },
        MuiDivider: {
          styleOverrides: {
            root: {
              borderColor: colors.divider,
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: {
              borderRadius: 6,
              margin: '2px 8px',
              padding: '8px 12px',
              transition: 'all 0.15s ease-in-out',
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              },
              '&.Mui-selected': {
                backgroundColor: mode === 'dark' ? 'rgba(27, 132, 255, 0.15)' : 'rgba(27, 132, 255, 0.1)',
                '&:hover': {
                  backgroundColor: mode === 'dark' ? 'rgba(27, 132, 255, 0.2)' : 'rgba(27, 132, 255, 0.15)',
                },
              },
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
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
