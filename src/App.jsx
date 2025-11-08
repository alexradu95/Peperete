import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './shared/context/AppContext';
import { SurfaceProvider } from './features/surface-manager';
import { LiveView, EditView } from './views';
import './App.css';

/**
 * Main Application Component
 * Sets up routing and provides contexts
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <SurfaceProvider>
          <Routes>
            {/* Edit view - full editor interface */}
            <Route path="/edit" element={<EditView />} />

            {/* Live view - full-screen output only */}
            <Route path="/live" element={<LiveView />} />

            {/* Default route redirects to edit */}
            <Route path="/" element={<Navigate to="/edit" replace />} />
          </Routes>
        </SurfaceProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
