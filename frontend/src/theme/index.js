import { createTheme, alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

// Premium Color Palette
const PRIMARY = {
  lighter: '#D1E9FC',
  light: '#76B0F1',
  main: '#2065D1', // Deep Professional Blue
  dark: '#103996',
  darker: '#061B64',
  contrastText: '#fff',
};

const SECONDARY = {
  lighter: '#D6E4FF',
  light: '#84A9FF',
  main: '#3366FF',
  dark: '#1939B7',
  darker: '#091A7A',
  contrastText: '#fff',
};

const SUCCESS = {
  lighter: '#E9FCD4',
  light: '#AAF27F',
  main: '#54D62C',
  dark: '#229A16',
  darker: '#08660D',
  contrastText: '#212B36',
};

// Gradient for powerful visual impact
const GRADIENTS = {
  primary: `linear-gradient(135deg, ${PRIMARY.light} 0%, ${PRIMARY.main} 100%)`,
  info: `linear-gradient(135deg, #1890FF 0%, #0050B3 100%)`,
  success: `linear-gradient(135deg, #54D62C 0%, #229A16 100%)`,
  warning: `linear-gradient(135deg, #FFC107 0%, #B78103 100%)`,
  error: `linear-gradient(135deg, #FF4842 0%, #B72136 100%)`,
};

const isDarkMode = localStorage.getItem('settings_darkMode') === 'true';

const theme = createTheme({
  palette: {
    mode: isDarkMode ? 'dark' : 'light',
    common: { black: '#000', white: '#fff' },
    primary: isDarkMode ? { ...PRIMARY, main: '#5693F5' } : PRIMARY, // Lighter blue for dark mode
    secondary: SECONDARY,
    success: SUCCESS,
    background: {
      default: isDarkMode ? '#161C24' : '#F9FAFB',
      paper: isDarkMode ? '#212B36' : '#FFFFFF',
      neutral: isDarkMode ? alpha('#919EAB', 0.12) : '#F4F6F8',
    },
    text: {
      primary: isDarkMode ? '#FFFFFF' : '#212B36',
      secondary: isDarkMode ? '#919EAB' : '#637381',
      disabled: '#919EAB',
    },
    divider: alpha('#919EAB', 0.2), 
    action: {
      // Keep action colors consistent or invert as needed
      active: '#637381',
      hover: alpha('#919EAB', 0.08),
      selected: alpha('#919EAB', 0.16),
      disabled: alpha('#919EAB', 0.8),
      disabledBackground: alpha('#919EAB', 0.24),
      focus: alpha('#919EAB', 0.24),
      hoverOpacity: 0.08,
      disabledOpacity: 0.48,
    },
  },
  shape: {
    borderRadius: 16, // Modern rounded corners
  },
  typography: {
    fontFamily: "'Public Sans', 'Roboto', 'Helvetica', 'Arial', sans-serif", // Modern font stack
    h1: { fontWeight: 700, fontSize: '2.5rem' },
    h2: { fontWeight: 700, fontSize: '2rem' },
    h3: { fontWeight: 700, fontSize: '1.75rem' },
    h4: { fontWeight: 700, fontSize: '1.5rem' },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, fontSize: '0.875rem' },
    body1: { lineHeight: 1.5, fontSize: '1rem' },
    body2: { lineHeight: 1.5, fontSize: '0.875rem' },
    button: { fontWeight: 700, textTransform: 'capitalize' }, // Remove uppercase from buttons
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
    // ... Fill mid shadows if needed, usually default is okay, but let's override a specific card shadow
    'none', // 3
    'none', // 4
    'none', // 5
    'none',
    'none',
    '0 8px 16px 0 rgba(145, 158, 171, 0.16)', // Custom Card Shadow (Index 8)
    '0 8px 16px 0 rgba(145, 158, 171, 0.16)', // duplicate for safety
    ...Array(15).fill('none'), // Fill rest
  ],
  customShadows: {
    z1: '0 1px 2px 0 rgba(145, 158, 171, 0.16)',
    z8: '0 8px 16px 0 rgba(145, 158, 171, 0.16)', // Soft premium shadow
    z12: '0 12px 24px -4px rgba(145, 158, 171, 0.16)',
    z16: '0 16px 32px -4px rgba(145, 158, 171, 0.16)',
    z20: '0 20px 40px -4px rgba(145, 158, 171, 0.16)',
    z24: '0 24px 48px 0 rgba(145, 158, 171, 0.16)',
    primary: `0 8px 16px 0 ${alpha(PRIMARY.main, 0.24)}`,
    info: `0 8px 16px 0 ${alpha('#1890FF', 0.24)}`,
    success: `0 8px 16px 0 ${alpha(SUCCESS.main, 0.24)}`,
    warning: `0 8px 16px 0 ${alpha('#FFC107', 0.24)}`,
    error: `0 8px 16px 0 ${alpha('#FF4842', 0.24)}`,
    card: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)', // Default premium card shadow
          borderRadius: 16,
          position: 'relative',
          zIndex: 0, // context stacking
        },
      },
    },
    MuiCardHeader: {
      defaultProps: {
        titleTypographyProps: { variant: 'h6' },
        subheaderTypographyProps: { variant: 'body2' },
      },
      styleOverrides: {
        root: {
          padding: '24px 24px 0',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none', // Flat buttons are more modern
          },
        },
        containedInherit: {
          color: '#fff',
          backgroundColor: '#212B36',
          '&:hover': {
            backgroundColor: '#454F5B',
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
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
            color: 'inherit',
          '&.Mui-disabled': {
            '& svg': { color: '#919EAB' },
          },
        },
        input: {
            '&::placeholder': {
              opacity: 1,
              color: isDarkMode ? alpha('#FFFFFF', 0.5) : alpha('#212B36', 0.5),
            },
          },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
            borderRadius: 12,
            backgroundColor: isDarkMode ? alpha('#FFFFFF', 0.05) : alpha('#919EAB', 0.08),
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha('#919EAB', 0.32),
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#94A3B8',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
             borderWidth: 2,
          },
          '&.Mui-disabled': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha('#919EAB', 0.16),
            },
          },
        },
      },
    },
    MuiTextField: {
        defaultProps: {
            fullWidth: true,
            variant: 'outlined',
        },
    },
  },
});

export default theme;
