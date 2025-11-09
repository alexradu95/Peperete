# Troubleshooting Guide

## Common Issues and Solutions

### Development Environment

#### Issue: Vite dev server won't start

**Symptoms**:
- `npm run dev` fails
- Port 3000 already in use

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in vite.config.js
server: {
  port: 3001
}
```

---

#### Issue: Hot reload not working

**Symptoms**:
- Changes don't reflect in browser
- Have to manually refresh

**Solution**:
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

**Alternative**: Check if file is being watched
```bash
# Increase file watcher limit (Linux/Mac)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

#### Issue: Build warnings about chunk size

**Symptoms**:
```
(!) Some chunks are larger than 500 KiB after minification
```

**Solution** (optional optimization):
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei']
        }
      }
    }
  }
};
```

---

### React Three Fiber Issues

#### Issue: "Canvas is not defined" or R3F hooks error

**Symptoms**:
```
Error: useThree can only be used within <Canvas />
Error: useFrame can only be used within <Canvas />
```

**Cause**: R3F hooks used outside Canvas component

**Solution**: Ensure component is rendered inside `<Canvas>`:
```jsx
// ❌ Wrong
export default function App() {
  useFrame(() => {}); // ERROR!
  return <Canvas>...</Canvas>;
}

// ✅ Correct
function SceneContent() {
  useFrame(() => {}); // OK - inside Canvas
  return <mesh>...</mesh>;
}

export default function App() {
  return (
    <Canvas>
      <SceneContent />
    </Canvas>
  );
}
```

---

#### Issue: Shader material not updating

**Symptoms**:
- Changed shader code but no visual change
- Uniforms not updating

**Solutions**:

1. **Clear cache and restart dev server**:
```bash
rm -rf node_modules/.vite
npm run dev
```

2. **Check material ref and uniforms**:
```jsx
const materialRef = useRef();

useFrame((state, delta) => {
  if (materialRef.current?.uniforms) {
    materialRef.current.uniforms.time.value += delta;
  }
});
```

3. **Verify extend() call**:
```jsx
import { extend } from '@react-three/fiber';

extend({ MyShaderMaterial });
// Now can use <myShaderMaterial />
```

---

#### Issue: Geometry transformation not applying

**Symptoms**:
- Corner points move but surface doesn't transform
- Transformation only works after window resize

**Cause**: Missing dependency in useEffect or geometry not being updated

**Solution**: Check useEffect dependencies in Surface.jsx:
```jsx
useEffect(() => {
  if (meshRef.current && surface.corners) {
    TransformCalculator.applyTransformToGeometry(
      geometry,
      surface.corners,
      surface.geometryType
    );
  }
}, [surface.corners, geometry, surface.geometryType, size.width, size.height]);
//   ^^^^^ Ensure all dependencies are listed
```

---

### State Management Issues

#### Issue: State updates not persisting to localStorage

**Symptoms**:
- Changes lost on page refresh
- localStorage shows old data

**Cause**: useStorage hook not triggering save

**Solution**: Verify useStorage implementation:
```jsx
// shared/hooks/useStorage.js
useEffect(() => {
  localStorage.setItem(key, JSON.stringify(value));
}, [key, value]); // Ensure dependencies are correct
```

**Debug**:
```javascript
// Check localStorage in browser console
localStorage.getItem('projection_mapping_surfaces');
```

---

#### Issue: Context "must be used within Provider" error

**Symptoms**:
```
Error: useApp must be used within AppProvider
Error: useSurfaces must be used within SurfaceProvider
```

**Cause**: Component trying to use context hook outside provider

**Solution**: Check provider hierarchy in App.jsx:
```jsx
<AppProvider>
  <SurfaceProvider>
    {/* Your components here can use useApp and useSurfaces */}
  </SurfaceProvider>
</AppProvider>
```

---

#### Issue: BroadcastChannel sync not working between tabs

**Symptoms**:
- Changes in edit view don't appear in live view
- Cross-tab communication broken

**Debug**:
```javascript
// Check if messages are being sent
broadcastManager.subscribe(MessageTypes.MODE_CHANGED, (data) => {
  console.log('Received mode change:', data);
});
```

**Solutions**:
1. Ensure both tabs are on same origin (http://localhost:3000)
2. Check browser support (Safari doesn't support BroadcastChannel)
3. Verify broadcastChannel.js is initialized

---

### Performance Issues

#### Issue: Lag when dragging corners

**Symptoms**:
- Corner dragging is choppy
- High CPU usage during drag

**Cause**: Expensive recalculations on every mouse move

**Solution**: Already optimized with useMemo and useEffect, but can throttle:
```jsx
import { useThrottle } from './hooks/useThrottle';

const throttledCorners = useThrottle(surface.corners, 16); // 60fps
```

---

#### Issue: Too many re-renders

**Symptoms**:
- Console warning: "Maximum update depth exceeded"
- Slow UI performance

**Cause**: Missing useCallback or infinite update loop

**Solution**: Wrap functions in useCallback:
```jsx
const updateSurface = useCallback((id, updates) => {
  setSurfaces(prev => prev.map(s =>
    s.id === id ? { ...s, ...updates } : s
  ));
}, []); // Add dependencies if needed
```

---

### Testing Issues (Future)

#### Issue: Tests fail with "Cannot find module 'three'"

**Cause**: Three.js requires canvas/WebGL mocking in tests

**Solution**: Add test setup file:
```javascript
// vitest.setup.ts
vi.mock('three', () => ({
  // Mock Three.js objects
}));
```

---

#### Issue: React Testing Library can't find R3F components

**Cause**: R3F components render to WebGL, not DOM

**Solution**: Test behavior through interactions, not R3F internals:
```jsx
// Test the React wrapper, not the 3D scene
test('surface becomes visible when toggled', () => {
  render(<SurfacePanel />);
  const toggleButton = screen.getByRole('button', { name: /toggle/i });
  fireEvent.click(toggleButton);
  // Assert on state/behavior, not Canvas internals
});
```

---

### Browser Compatibility

#### Issue: Application doesn't work in Safari

**Known Issues**:
- BroadcastChannel not supported in Safari
- Some WebGL features may be limited

**Solutions**:
1. Use polyfill for BroadcastChannel
2. Detect Safari and show fallback message
3. Use feature detection:
```javascript
if ('BroadcastChannel' in window) {
  // Use BroadcastChannel
} else {
  // Fallback to localStorage events
}
```

---

### Build Issues

#### Issue: Production build fails

**Symptoms**:
```
npm run build
[Error] ...
```

**Solutions**:

1. **Check for unused imports**:
```bash
# Remove unused imports
npm install -g eslint
eslint --fix src/
```

2. **Clear node_modules and reinstall**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

3. **Check for circular dependencies**:
```bash
npx madge --circular src/
```

---

### Migration Issues (TypeScript/TDD)

#### Issue: TypeScript strict mode shows many errors

**Expected**: When migrating to TypeScript, many type errors will appear

**Solution** (gradual migration):
1. Start with `strict: false` in tsconfig.json
2. Fix one file at a time
3. Enable strict flags incrementally:
```json
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": true,     // Enable first
    "strictNullChecks": false, // Enable second
    // ... enable one by one
  }
}
```

---

#### Issue: Vitest tests failing with "Cannot use import statement"

**Cause**: Vitest configuration missing for ESM

**Solution**:
```typescript
// vitest.config.ts
export default {
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts'
  }
};
```

---

## Debug Checklist

When something breaks:

1. ✅ Check browser console for errors
2. ✅ Check React DevTools for component state
3. ✅ Check localStorage values
4. ✅ Verify provider hierarchy (Context)
5. ✅ Check useEffect dependencies
6. ✅ Clear Vite cache (`rm -rf node_modules/.vite`)
7. ✅ Check if issue reproduces in fresh browser tab
8. ✅ Try hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

## Getting Help

If stuck:
1. Check this troubleshooting guide
2. Search GitHub issues
3. Check React Three Fiber docs: https://docs.pmnd.rs/react-three-fiber
4. Check Three.js docs: https://threejs.org/docs/
5. Create a minimal reproduction

## Known Limitations

### Current Implementation
- No TypeScript (migration planned)
- No tests (TDD setup required)
- No schema validation on localStorage (add Zod)
- Large switch statement for materials (refactor planned)

### Browser Support
- Requires modern browser with WebGL support
- BroadcastChannel not supported in Safari (needs polyfill)
- Fullscreen API varies by browser

### Performance
- Maximum ~10-20 surfaces before performance degradation
- Complex shaders may impact frame rate
- High subdivision count (>50) can cause lag
