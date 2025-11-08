import { useMemo } from 'react';
import * as THREE from 'three';
import { CONTENT_TYPES, GRID_SIZE } from '../../../shared/utils/constants';

/**
 * Custom hook for creating materials based on content type
 */
export function useContentManager() {
  const createCheckerboardTexture = useMemo(() => {
    return () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      const squareSize = 64;
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          ctx.fillStyle = (x + y) % 2 === 0 ? '#ffffff' : '#000000';
          ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
        }
      }

      return new THREE.CanvasTexture(canvas);
    };
  }, []);

  const createGridTexture = useMemo(() => {
    return () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#222222';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid lines
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2;

      const cellWidth = canvas.width / GRID_SIZE;
      const cellHeight = canvas.height / GRID_SIZE;

      // Draw grid
      for (let i = 0; i <= GRID_SIZE; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(i * cellWidth, 0);
        ctx.lineTo(i * cellWidth, canvas.height);
        ctx.stroke();

        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i * cellHeight);
        ctx.lineTo(canvas.width, i * cellHeight);
        ctx.stroke();
      }

      // Add numbers
      ctx.fillStyle = '#00ffff';
      ctx.font = 'bold 40px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let num = 1;
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const cx = x * cellWidth + cellWidth / 2;
          const cy = y * cellHeight + cellHeight / 2;
          ctx.fillText(num.toString(), cx, cy);
          num++;
        }
      }

      // Add corner markers
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 60px monospace';
      ctx.fillText('TL', 80, 80);
      ctx.fillText('TR', canvas.width - 80, 80);
      ctx.fillText('BL', 80, canvas.height - 80);
      ctx.fillText('BR', canvas.width - 80, canvas.height - 80);

      return new THREE.CanvasTexture(canvas);
    };
  }, []);

  return {
    createCheckerboardTexture,
    createGridTexture
  };
}

/**
 * Get color value for solid color materials
 */
export function getColorValue(contentType) {
  switch (contentType) {
    case CONTENT_TYPES.WHITE:
      return 0xffffff;
    case CONTENT_TYPES.RED:
      return 0xff0000;
    case CONTENT_TYPES.GREEN:
      return 0x00ff00;
    case CONTENT_TYPES.BLUE:
      return 0x0000ff;
    default:
      return 0xffffff;
  }
}
