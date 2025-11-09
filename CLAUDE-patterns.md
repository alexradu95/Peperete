# Code Patterns and Conventions

## Current State (JavaScript)

This document describes the **current** patterns in use in the Peperete codebase. These patterns will evolve as we migrate to TypeScript and adopt TDD practices per CLAUDE.MD.

### Migration Note
🚧 **In Transition**: This project is gradually adopting TypeScript + TDD patterns. New code should follow CLAUDE.MD standards. Existing patterns documented here for reference only.

## File Naming Conventions

### Current Pattern
- Components: `PascalCase.jsx` (e.g., `Surface.jsx`, `AppContext.jsx`)
- Utilities: `camelCase.js` (e.g., `constants.js`, `broadcastChannel.js`)
- Hooks: `useCamelCase.js` (e.g., `useKeyboard.js`, `useStorage.js`)
- Materials: `PascalCaseMaterial.jsx` (e.g., `NoiseMaterial.jsx`)

### Target Pattern (CLAUDE.MD)
- All TypeScript files: `kebab-case.ts` or `kebab-case.tsx`
- Test files: `*.test.ts` or `*.spec.ts`

## Module Structure

### Feature-Based Architecture ✅ (Aligned with CLAUDE.MD)

Current structure follows modular principles:

```
src/
  features/           # Self-contained feature modules
    scene/
      components/     # UI/3D components
      hooks/          # Business logic
      materials/      # Shader materials
      utils/          # Feature-specific utilities
      index.js        # Public API (barrel export)
    surface-manager/
    calibration/
    ui/
  shared/             # Shared utilities
    context/          # Global contexts
    hooks/            # Shared hooks
    utils/            # Shared utilities
```

**Alignment**: ✅ Feature-based modular architecture matches CLAUDE.MD principles

## Context Pattern (React Context API)

### Current Implementation

```javascript
// Pattern: Context + Provider + Hook
const SomeContext = createContext(null);

export function SomeProvider({ children }) {
  const [state, setState] = useState(initialValue);

  const value = {
    state,
    setState,
    // ... other values
  };

  return <SomeContext.Provider value={value}>{children}</SomeContext.Provider>;
}

export function useSome() {
  const context = useContext(SomeContext);
  if (!context) {
    throw new Error('useSome must be used within SomeProvider');
  }
  return context;
}
```

**Used in**:
- `AppContext.jsx` - App mode, fullscreen, notifications
- `AudioContext.jsx` - Audio analysis data
- `SurfaceContext.jsx` - Surface state management

**Alignment**: ⚠️ Pattern is good, but needs TypeScript types and tests

## State Management Patterns

### Immutable Updates ✅ (Aligned)

```javascript
// Good: Creating new objects
const updatedSurfaces = surfaces.map(s =>
  s.id === id ? { ...s, contentType: newType } : s
);

// Avoiding mutation
setState(prev => ({ ...prev, newField: value }));
```

**Alignment**: ✅ Uses immutable updates consistently

### Callback Pattern with useCallback

```javascript
const updateSurface = useCallback((id, updates) => {
  setSurfaces(prev =>
    prev.map(s => s.id === id ? { ...s, ...updates } : s)
  );
}, []);
```

**Alignment**: ✅ Uses React hooks properly

## Constants Pattern

### Current Implementation

```javascript
// shared/utils/constants.js
export const APP_MODES = {
  CALIBRATION: 'calibration',
  PLAYBACK: 'playback'
};

export const CONTENT_TYPES = {
  CHECKERBOARD: 'checkerboard',
  GRID: 'grid',
  // ...
};
```

**Alignment**: ⚠️ Good pattern, but needs:
1. TypeScript types: `type AppMode = typeof APP_MODES[keyof typeof APP_MODES]`
2. Zod schemas for runtime validation
3. Derive types from schemas

### Target Pattern (CLAUDE.MD)

```typescript
// Define schema first
const AppModeSchema = z.enum(['calibration', 'playback']);
type AppMode = z.infer<typeof AppModeSchema>;

// Use at runtime boundaries
const parseMode = (data: unknown): AppMode => {
  return AppModeSchema.parse(data);
};
```

## Component Patterns

### Function Components with Hooks ✅

```javascript
export function Surface({ surface }) {
  const meshRef = useRef();
  const { createTexture } = useContentManager();

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  return <mesh ref={meshRef}>...</mesh>;
}
```

**Alignment**: ✅ Modern React patterns

### Props Pattern

Current: Positional object destructuring

```javascript
export function Surface({ surface }) { ... }
export function CornerPoint({ position, onDrag, index }) { ... }
```

**Alignment**: ✅ Already uses destructured props objects

### Comments in Code ⚠️

```javascript
/**
 * Surface Component
 * Renders a single projection surface with perspective transformation
 */
export function Surface({ surface }) { ... }
```

**Gap**: CLAUDE.MD prefers self-documenting code over comments
**Action**: Remove JSDoc comments, use clear naming instead

## Custom Hooks Pattern

### Current Implementation ✅

```javascript
// Pattern: use + CamelCase + return object or value
export function useKeyboard(shortcuts) {
  useEffect(() => {
    const handleKeyPress = (event) => { ... };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [shortcuts]);
}

export function useStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
```

**Alignment**: ✅ Good hook patterns, needs TypeScript generics

## Switch Statement Pattern

### Current Pattern ⚠️

Large switch statements for content type mapping:

```javascript
switch (surface.contentType) {
  case CONTENT_TYPES.CHECKERBOARD:
    return { type: 'meshBasicMaterial', props: { ... } };
  case CONTENT_TYPES.GRID:
    return { type: 'meshBasicMaterial', props: { ... } };
  // ... 15+ more cases
  default:
    return { type: 'meshBasicMaterial', props: { ... } };
}
```

**Location**: `Surface.jsx:65-207`

**Gap**: Could be refactored to lookup table or strategy pattern
**Note**: Acceptable for now, refactor when adding tests

### Target Pattern (Future)

```typescript
// Strategy pattern with lookup
const materialStrategies: Record<ContentType, MaterialStrategy> = {
  [CONTENT_TYPES.CHECKERBOARD]: createCheckerboardMaterial,
  [CONTENT_TYPES.GRID]: createGridMaterial,
  // ...
};

const strategy = materialStrategies[contentType] ?? defaultMaterial;
return strategy(props);
```

## Error Handling

### Current Pattern ⚠️

```javascript
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
```

**Alignment**: ✅ Uses exceptions for programming errors (good)
**Gap**: No Result type pattern for expected errors yet

### Target Pattern (CLAUDE.MD)

```typescript
// For expected errors, use Result type
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

const loadImage = (url: string): Result<Texture, LoadError> => {
  // Implementation
};
```

## Shader Material Pattern

### Current Implementation ✅

```javascript
// Pattern: shaderMaterial from drei
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

const SomeShaderMaterial = shaderMaterial(
  { time: 0 },
  vertexShader,
  fragmentShader
);

extend({ SomeShaderMaterial });

export default SomeShaderMaterial;
```

**Alignment**: ✅ Follows R3F best practices

## Barrel Exports Pattern ✅

### Current Implementation

```javascript
// features/scene/index.js
export { Scene } from './components/Scene';
export { Surface } from './components/Surface';
// Only export public API
```

**Alignment**: ✅ Clean public API pattern matches CLAUDE.MD

## Data Persistence Pattern

### Current Implementation

```javascript
// Using custom useStorage hook
const [surfaces, setSurfaces] = useStorage(STORAGE_KEYS.SURFACES, []);
```

**Alignment**: ⚠️ Good pattern, but localStorage data should be validated
**Gap**: No Zod schema validation on deserialization

### Target Pattern (CLAUDE.MD)

```typescript
const SurfaceArraySchema = z.array(SurfaceSchema);

const [surfaces, setSurfaces] = useStorage(
  STORAGE_KEYS.SURFACES,
  [],
  SurfaceArraySchema // Validate on load
);
```

## Summary of Patterns

### ✅ Aligned with CLAUDE.MD
- Feature-based modular architecture
- Immutable state updates
- Custom hooks pattern
- Barrel exports
- Component composition
- React Context API usage

### ⚠️ Needs Improvement
- No TypeScript types
- No tests (TDD required)
- JSDoc comments (should be self-documenting)
- No schema validation
- No Result types for error handling
- Large switch statements (could use strategy pattern)

### 🚧 Migration Path
1. Add TypeScript configuration
2. Add Vitest + React Testing Library
3. Create Zod schemas for all data types
4. Start writing new features with TDD
5. Gradually migrate existing code
6. Remove comments, improve naming
7. Add schema validation at boundaries
