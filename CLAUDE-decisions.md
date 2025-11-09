# Architectural Decisions and Rationale

## Overview

This document records significant architectural decisions made for the Peperete projection mapping application, along with the reasoning behind them.

## Decision Log

### AD-001: Feature-Based Modular Architecture

**Date**: Pre-migration (established during React migration)
**Status**: ✅ Accepted
**Context**: Need to support parallel development by multiple teams

**Decision**: Organize code into self-contained feature modules under `src/features/`

**Rationale**:
- Enables multiple developers to work on different features without merge conflicts
- Each feature module is self-contained with components, hooks, utils, and materials
- Barrel exports (`index.js`) provide clean public APIs
- Better separation of concerns than layer-based architecture

**Consequences**:
- **Positive**: Reduced merge conflicts, clearer boundaries, easier to understand
- **Positive**: Features can be developed, tested, and deployed independently
- **Neutral**: Slightly more boilerplate (index.js files)
- **Negative**: None identified

**Alignment with CLAUDE.MD**: ✅ Fully aligned - promotes modularity and clear boundaries

---

### AD-002: React Three Fiber for 3D Rendering

**Date**: Pre-migration (during React migration from vanilla JS)
**Status**: ✅ Accepted
**Context**: Need declarative 3D graphics that integrate with React

**Decision**: Use React Three Fiber (R3F) as the 3D rendering layer

**Rationale**:
- Declarative JSX-based 3D scene composition matches React philosophy
- Better integration with React's component lifecycle and hooks
- Excellent ecosystem (@react-three/drei for helpers)
- Easier to reason about than imperative Three.js code
- useFrame hook provides clean animation loop integration

**Consequences**:
- **Positive**: Cleaner, more maintainable 3D code
- **Positive**: Automatic cleanup of Three.js objects
- **Positive**: React patterns apply to 3D (hooks, composition, etc.)
- **Negative**: Learning curve for developers unfamiliar with R3F
- **Negative**: Abstraction layer over Three.js (but benefits outweigh costs)

**Alignment with CLAUDE.MD**: ✅ Declarative, composable approach aligns well

---

### AD-003: React Context API for State Management

**Date**: Pre-migration
**Status**: ✅ Accepted
**Context**: Need global state without adding heavy dependencies

**Decision**: Use React Context API for global state (AppContext, SurfaceContext, AudioContext)

**Rationale**:
- Sufficient for application's state management needs
- No need for Redux/MobX complexity
- Built-in to React, zero dependencies
- Clear provider hierarchy
- Easy to test and understand

**Consequences**:
- **Positive**: Simple, lightweight, maintainable
- **Positive**: No learning curve (standard React)
- **Neutral**: Manual optimization needed for performance (using useCallback, useMemo)
- **Negative**: Could have re-render issues at scale (not a problem for this app size)

**Alignment with CLAUDE.MD**: ✅ Simple, functional approach

**Note**: Context pattern needs TypeScript types and test coverage

---

### AD-004: localStorage for Persistence

**Date**: Pre-migration
**Status**: ✅ Accepted (needs improvement)
**Context**: Need to persist surface configurations across sessions

**Decision**: Use localStorage with custom `useStorage` hook

**Rationale**:
- Simple persistence mechanism for client-side app
- No backend required
- Synchronous API makes implementation straightforward
- Works offline

**Consequences**:
- **Positive**: Simple, works offline, no backend needed
- **Positive**: Custom hook abstracts implementation details
- **Negative**: No validation on deserialization (NEEDS FIXING)
- **Negative**: Limited to ~5-10MB storage
- **Negative**: String-based, requires serialization

**Alignment with CLAUDE.MD**: ⚠️ Pattern is good, but needs schema validation

**Required Improvement**: Add Zod schema validation when loading from localStorage

```typescript
// Target implementation
const useStorage = <T>(key: string, initial: T, schema: z.ZodType<T>) => {
  const stored = localStorage.getItem(key);
  const validated = stored ? schema.parse(JSON.parse(stored)) : initial;
  // ...
};
```

---

### AD-005: BroadcastChannel for Cross-Tab Sync

**Date**: Recent addition
**Status**: ✅ Accepted
**Context**: Need to sync state between edit view and live view

**Decision**: Use BroadcastChannel API for cross-tab communication

**Rationale**:
- Native browser API, no dependencies
- Low latency, efficient
- Decoupled communication between tabs
- Perfect for edit/live view synchronization

**Consequences**:
- **Positive**: Real-time sync between edit and live views
- **Positive**: Native API, zero dependencies
- **Negative**: Not supported in older browsers (acceptable for modern projection mapping use case)

**Alignment with CLAUDE.MD**: ✅ Simple, functional solution

---

### AD-006: Perspective Transformation via Shader

**Date**: Pre-migration
**Status**: ⚠️ Accepted (reconsider approach)
**Context**: Need to warp surfaces to match physical projection surfaces

**Decision**: Apply perspective transformation by modifying vertex positions directly

**Implementation**: `TransformCalculator.applyTransformToGeometry()`

**Rationale**:
- Direct vertex manipulation is straightforward
- Works with any geometry type
- Real-time recalculation on corner drag

**Consequences**:
- **Positive**: Works reliably for quads and polygons
- **Neutral**: Requires geometry subdivision for smooth warping
- **Negative**: Mutates geometry directly (not immutable)
- **Negative**: Recalculates on every corner change and window resize

**Alignment with CLAUDE.MD**: ⚠️ Mutation pattern conflicts with immutability principle

**Future Consideration**: Explore shader-based transformation for better performance

---

### AD-007: Material System via Switch Statement

**Date**: Pre-migration
**Status**: ⚠️ Accepted (refactor when adding tests)
**Context**: Need to map content types to Three.js materials

**Decision**: Use large switch statement in `Surface.jsx` (lines 65-207)

**Rationale**:
- Simple, easy to understand
- Centralized material creation logic
- Easy to add new content types

**Consequences**:
- **Positive**: Simple, centralized, easy to extend
- **Negative**: Large switch statement (200+ lines)
- **Negative**: Not easily testable in isolation

**Alignment with CLAUDE.MD**: ⚠️ Works but not ideal

**Future Improvement**: Refactor to strategy pattern when adding tests

```typescript
// Target pattern
type MaterialFactory = (props: MaterialProps) => MaterialResult;

const materialStrategies: Record<ContentType, MaterialFactory> = {
  [CONTENT_TYPES.CHECKERBOARD]: createCheckerboardMaterial,
  [CONTENT_TYPES.NOISE]: createNoiseMaterial,
  // ... extract each case to a factory function
};
```

---

### AD-008: Vite as Build Tool

**Date**: Project inception
**Status**: ✅ Accepted
**Context**: Need fast development server and optimized builds

**Decision**: Use Vite for development and production builds

**Rationale**:
- Extremely fast HMR during development
- Native ESM support
- Optimized production builds
- Simple configuration
- Great React support

**Consequences**:
- **Positive**: Instant dev server startup, fast HMR
- **Positive**: Simple config compared to Webpack
- **Positive**: Great developer experience
- **Negative**: None identified

**Alignment with CLAUDE.MD**: ✅ Modern, efficient tooling

---

### AD-009: No TypeScript (Current State)

**Date**: Project inception
**Status**: 🔴 To be reversed
**Context**: Initial rapid prototyping phase

**Decision**: Start with JavaScript for faster prototyping

**Rationale** (at the time):
- Faster initial development
- Lower barrier to entry
- Simpler setup

**Consequences**:
- **Positive**: Faster initial development (debatable)
- **Negative**: No type safety
- **Negative**: More runtime errors
- **Negative**: Harder to refactor
- **Negative**: No autocomplete benefits

**Alignment with CLAUDE.MD**: 🔴 **CRITICAL GAP** - TypeScript strict mode is required

**Action Required**: Migrate to TypeScript with strict mode enabled

**Migration Plan**:
1. Add TypeScript configuration (tsconfig.json with strict mode)
2. Install TypeScript and type definitions
3. Rename files incrementally (.js → .ts, .jsx → .tsx)
4. Add type annotations
5. Fix all type errors
6. Enable strict mode flags one by one

---

### AD-010: No Testing Infrastructure (Current State)

**Date**: Project inception
**Status**: 🔴 **CRITICAL** - Violates CLAUDE.MD
**Context**: Initial rapid prototyping without tests

**Decision**: (Implicit) No tests, no TDD

**Consequences**:
- **Negative**: No safety net for refactoring
- **Negative**: No confidence in changes
- **Negative**: No documentation of expected behavior
- **Negative**: Violates fundamental TDD principle

**Alignment with CLAUDE.MD**: 🔴 **CRITICAL VIOLATION** - TDD is non-negotiable

**Action Required**: Immediately set up test infrastructure

**Implementation Plan**:
1. Install Vitest (better Vite integration than Jest)
2. Install @testing-library/react and @testing-library/user-event
3. Configure Vitest (vitest.config.ts)
4. Create test setup file
5. Start writing tests for new features (TDD)
6. Add tests for existing features incrementally

---

### AD-011: lil-gui for Calibration Controls

**Date**: Pre-migration
**Status**: ✅ Accepted
**Context**: Need fine-grained controls for corner adjustment

**Decision**: Use lil-gui for calibration controls

**Rationale**:
- Lightweight, fast
- Easy to integrate with R3F
- Good for fine-tuning numeric values
- Standard tool in creative coding

**Consequences**:
- **Positive**: Quick setup, good UX for calibration
- **Positive**: Minimal code required
- **Negative**: UI doesn't match React component structure (uses imperative API)

**Alignment with CLAUDE.MD**: ✅ Pragmatic choice for use case

---

## Decisions Required

### DR-001: Testing Framework Choice

**Context**: Need to set up testing infrastructure

**Options**:
1. **Vitest** (recommended)
   - Better Vite integration
   - Faster than Jest
   - Compatible API with Jest
   - Native ESM support

2. **Jest**
   - More mature, larger ecosystem
   - Requires additional config for Vite

**Recommendation**: Vitest - better integration with existing Vite setup

---

### DR-002: Schema Validation Library

**Context**: Need runtime validation per CLAUDE.MD

**Options**:
1. **Zod** (recommended)
   - Type-safe, TypeScript-first
   - Excellent DX
   - Standard Schema compliant
   - Great error messages

2. **Yup**
   - More mature
   - Larger bundle size
   - Not Standard Schema compliant

**Recommendation**: Zod - aligns with CLAUDE.MD requirements

---

### DR-003: Migration Strategy

**Context**: Large gap between current state and CLAUDE.MD standards

**Options**:
1. **Big Bang Rewrite**
   - Rewrite entire codebase to standards
   - High risk, long pause in feature development

2. **Gradual Migration** (recommended)
   - New code follows CLAUDE.MD strictly
   - Existing code migrated incrementally
   - Maintains working state throughout

**Recommendation**: Gradual migration
- Less risky
- Maintains momentum
- Learn and adapt as we go

**Implementation**:
- All new features: TypeScript + TDD required
- When touching existing code: add tests + migrate to TypeScript
- Set milestone: "Full TS + Test coverage by [date]"

---

## Summary

### Decisions Aligned with CLAUDE.MD ✅
- AD-001: Feature-based modular architecture
- AD-002: React Three Fiber
- AD-003: React Context API
- AD-005: BroadcastChannel for sync
- AD-008: Vite build tool
- AD-011: lil-gui for calibration

### Decisions Needing Improvement ⚠️
- AD-004: localStorage (add schema validation)
- AD-006: Perspective transformation (consider immutable approach)
- AD-007: Material switch statement (refactor to strategy pattern)

### Critical Gaps 🔴
- AD-009: No TypeScript (MUST add)
- AD-010: No tests (CRITICAL - TDD is non-negotiable)

### Next Steps
1. Implement DR-001: Set up Vitest
2. Implement DR-002: Add Zod for schemas
3. Implement DR-003: Start gradual migration
4. Create tsconfig.json with strict mode
5. Write first TDD feature to establish pattern
