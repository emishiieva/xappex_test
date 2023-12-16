import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material';
import {orange, red} from '@mui/material/colors';

const root = ReactDOM.createRoot(document.getElementById('root'));

const theme = createTheme({
  palette: {
    primary: {
      main: "#CCC"
    },
    secondary: {
      main: orange[500]
    },
    myCustomColor: {
      main: red[400],
      superDark: red[800],
      superLight: red[100]
    }
  },
  typography: {
    myVariant: {
      fontSize: "6rem",
      color: orange[400]
    }
  }
});

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
