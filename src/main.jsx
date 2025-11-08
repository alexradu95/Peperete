import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import materials to trigger auto-registration
import './features/materials';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
