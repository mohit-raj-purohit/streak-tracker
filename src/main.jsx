import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { StreakProvider } from './context/StreakContext';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <StreakProvider>
        <App />
      </StreakProvider>
    </ThemeProvider>
  </React.StrictMode>
);

// Service worker is registered automatically by vite-plugin-pwa
