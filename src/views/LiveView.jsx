import React from 'react';
import { Scene } from '../features/scene';
import { Notification } from '../features/ui';

/**
 * Live View Component
 * Full-screen output view for projection mapping
 * Shows only the 3D scene without any controls
 */
export function LiveView() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative">
      <div className="w-full h-full">
        <Scene />
      </div>
      <Notification />
    </div>
  );
}
