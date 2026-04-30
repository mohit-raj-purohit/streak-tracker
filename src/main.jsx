import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { StreakProvider } from './context/StreakContext';
import './styles/global.css';

// Show errors visibly on screen for debugging
function showError(err) {
  var el = document.getElementById('debug-text');
  if (el) {
    el.style.display = 'block';
    el.style.color = '#ff453a';
    el.style.whiteSpace = 'pre-wrap';
    el.style.fontSize = '12px';
    el.textContent = 'JS Error: ' + (err.message || err) + '\n' + (err.stack || '');
  }
  console.error(err);
}

try {
  var root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    React.createElement(React.StrictMode, null,
      React.createElement(ThemeProvider, null,
        React.createElement(StreakProvider, null,
          React.createElement(App, null)
        )
      )
    )
  );
} catch (err) {
  showError(err);
}

// Also catch async errors
window.addEventListener('error', function(e) { showError(e.error || e.message); });
window.addEventListener('unhandledrejection', function(e) { showError(e.reason || e); });

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').catch(function() {});
  });
}
