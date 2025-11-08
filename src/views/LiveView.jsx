import React from 'react';
import { Scene } from '../features/scene';
import { Notification } from '../features/ui';
import './LiveView.css';

/**
 * Live View Component
 * Full-screen output view for projection mapping
 * Shows only the 3D scene without any controls
 */
export function LiveView() {
  return (
    <div className="live-view">
      <div className="canvas-container">
        <Scene />
      </div>
      <Notification />
    </div>
  );
}
