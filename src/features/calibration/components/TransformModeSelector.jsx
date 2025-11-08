import { TRANSFORM_MODES } from '../utils/SurfaceTransformations';
import styles from './TransformModeSelector.module.css';

/**
 * UI component for selecting transformation mode
 */
export function TransformModeSelector({ mode, onModeChange }) {
  const modes = [
    { value: TRANSFORM_MODES.CORNERS, label: 'Corners', icon: '⬡' },
    { value: TRANSFORM_MODES.MOVE, label: 'Move', icon: '✥' },
    { value: TRANSFORM_MODES.ROTATE, label: 'Rotate', icon: '↻' },
    { value: TRANSFORM_MODES.SCALE, label: 'Scale', icon: '⇲' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.label}>Transform Mode:</div>
      <div className={styles.buttonGroup}>
        {modes.map(({ value, label, icon }) => (
          <button
            key={value}
            className={`${styles.button} ${mode === value ? styles.active : ''}`}
            onClick={() => onModeChange(value)}
            title={label}
          >
            <span className={styles.icon}>{icon}</span>
            <span className={styles.text}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
