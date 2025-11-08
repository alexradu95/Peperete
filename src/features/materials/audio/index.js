/**
 * Audio-Reactive Materials
 *
 * Shader materials that respond to audio input
 */

// Import all audio materials - this triggers their self-registration
import './AudioWavesMaterial.jsx';
import './AudioPulseMaterial.jsx';
import './AudioSpectrumMaterial.jsx';
import './AudioBarsMaterial.jsx';

// Re-export for direct use if needed
export { default as AudioWavesMaterial } from './AudioWavesMaterial.jsx';
export { default as AudioPulseMaterial } from './AudioPulseMaterial.jsx';
export { default as AudioSpectrumMaterial } from './AudioSpectrumMaterial.jsx';
export { default as AudioBarsMaterial } from './AudioBarsMaterial.jsx';
