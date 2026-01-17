import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#A8D179', // Green from the top of the image
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#F19CA7', // Pink from the bottom of the image
      contrastText: '#ffffff',
    },
    background: {
      default: '#FEFEE2', // Cream from the middle of the image
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#F19CA7',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#A8D179', // Ensure AppBar uses the primary green
          color: '#ffffff',
          boxShadow: 'none', // Flat design matches the clean 2D look
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '20px', // Softer, rounder buttons
          textTransform: 'none', // More friendly text
          fontWeight: 'bold',
        },
      },
    },
  },
});

export default theme;
