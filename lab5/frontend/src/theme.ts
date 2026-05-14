import { createTheme } from '@mui/material';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#002d89' },
    secondary: { main: '#4f5c8b' },
    background: { default: '#fcf8f8', paper: '#ffffff' },
    text: { primary: '#1c1b1b', secondary: '#434654' },
    error: { main: '#ba1a1a' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 700, letterSpacing: '-0.01em' },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: 'none',
          boxShadow: '0px 12px 32px rgba(28, 27, 27, 0.04)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: 'none',
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          background: 'linear-gradient(90deg, #002d89, #0041bb)',
          color: '#ffffff',
        },
      },
    },
  },
});

