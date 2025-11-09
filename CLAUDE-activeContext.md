# Active Context - Project Adaptation to CLAUDE.MD Standards

## Session Information
- **Date**: 2025-11-09
- **Branch**: claude/read-claud-011CUx7LTXamvJxby87HUBwH
- **Goal**: Adapt the Peperete projection mapping project to follow CLAUDE.MD development philosophy

## Current Session State

### Objectives
1. ✅ Create memory bank system (CLAUDE-* files) to track project context
2. ✅ Document current project state and architecture
3. ✅ Identify gaps between current implementation and CLAUDE.MD standards
4. ✅ Execute Phase 1: TypeScript + Testing + Schema Infrastructure

### Progress - Phase 1 COMPLETED ✅
- ✅ Read and analyzed CLAUDE.MD development philosophy
- ✅ Analyzed current project structure
- ✅ Created all CLAUDE-* memory bank files
- ✅ Installed TypeScript and type definitions
- ✅ Created tsconfig.json with ALL strict mode flags enabled
- ✅ Installed Vitest + React Testing Library
- ✅ Created vitest.config.ts with proper configuration
- ✅ Created test setup file with mocks
- ✅ Installed Zod for schema validation
- ✅ Created first Zod schemas (Surface, AppState, ContentType)
- ✅ Demonstrated TDD pattern with surface-factory utility (7 tests passing)
- ✅ Updated package.json with test scripts

### Progress - Phase 2 COMPLETED ✅
- ✅ Wrote 11 comprehensive tests for schema-validated useStorage (TDD RED)
- ✅ Implemented useStorage.ts with full Zod schema validation (TDD GREEN)
- ✅ Converted useStorage from JavaScript to TypeScript with strict typing
- ✅ Added graceful error handling for invalid localStorage data
- ✅ Fixed localStorage mock in test setup to actually store/retrieve data
- ✅ All 11 useStorage tests passing + 7 surface-factory tests = 18 total tests ✅
- ✅ Updated SurfaceContext to use new schema-validated useStorage API
- ✅ Exported schemas from shared/index.js for easy access

### Progress - Phase 3 COMPLETED ✅
- ✅ Wrote 17 behavior tests for getDefaultCorners utility
  - Corner count behavior (default, clamping, validation)
  - Corner positioning (centering, radius calculation, distribution)
  - Different viewport dimensions (square, portrait, ultra-wide)
  - Corner structure validation
- ✅ Wrote 19 behavior tests for BroadcastManager utility
  - Subscription/unsubscription mechanics
  - Message handling and routing
  - Broadcasting with timestamps
  - Multiple subscribers support
  - Cleanup behavior
- ✅ All 54 tests passing (7 + 11 + 17 + 19)

### Progress - Phase 4 COMPLETED ✅
- ✅ Converted constants.js to constants.ts with proper type exports
- ✅ Converted broadcastChannel.js to broadcast-channel.ts with typed messages
- ✅ Fixed all TypeScript strict mode errors across codebase
  - Fixed global → globalThis for Node.js compatibility
  - Added composite: true to tsconfig.node.json
  - Fixed z.record() to include both key and value schemas
  - Refactored window type guards to avoid narrowing issues
  - Updated test files with bracket notation for index signatures
  - Added proper null checks and optional chaining
- ✅ All 54 tests passing after TypeScript migration
- ✅ TypeScript strict mode compilation successful (zero errors)
- ✅ Committed and pushed to branch

### Progress - Phase 5 COMPLETED ✅
- ✅ Wrote 19 comprehensive behavior tests for useKeyboard hook (TDD RED)
  - Event listener registration and cleanup
  - Keyboard handler invocation for various keys
  - Input element handling (INPUT/TEXTAREA exclusion)
  - Enabled state toggling
  - Special keys (Escape, arrows, function keys)
- ✅ Converted useKeyboard.js to useKeyboard.ts (TDD GREEN)
  - Removed JSDoc comments (self-documenting code)
  - Added proper TypeScript types (KeyboardHandler, KeyboardHandlers)
  - Typed event handlers and HTMLElement targets
  - Strict null checking and type safety
- ✅ All 73 tests passing (54 previous + 19 new)
- ✅ TypeScript strict mode compilation successful (zero errors)
- ✅ Committed and pushed to branch

### Progress - Phase 6 COMPLETED ✅
- ✅ Wrote 24 comprehensive behavior tests for AppContext (TDD RED)
  - Provider and hook setup validation
  - Initial state verification (mode, fullscreen, notification, sidebar)
  - Mode management (setMode, toggleMode)
  - Fullscreen management (requestFullscreen, exitFullscreen)
  - Notification management with timers
  - Sidebar visibility toggling
  - BroadcastChannel integration (cross-tab synchronization)
  - Context value structure and function stability
- ✅ Converted AppContext.jsx to AppContext.tsx (TDD GREEN)
  - Removed JSDoc comments (self-documenting code)
  - Added proper types (AppContextValue, AppProviderProps)
  - Exported AppContextValue type for consumers
  - Fixed broadcast listener payload typing
- ✅ Converted shared/index.js to TypeScript
  - Selectively export constants to avoid type conflicts
  - Export all types from schemas
- ✅ All 97 tests passing (73 previous + 24 new)
- ✅ TypeScript strict mode compilation successful (zero errors)
- ✅ Committed and pushed to branch

## Project Overview

### What This Project Is
A modular projection mapping application built with React Three Fiber for creating and calibrating multiple projection surfaces with various visual content types (shaders, images, patterns).

### Technology Stack
- React 19.2.0
- React Three Fiber (R3F) 9.4.0
- Three.js 0.160.0
- @react-three/drei 10.7.6
- Vite 5.0.0
- React Router DOM 7.9.5
- lil-gui (calibration controls)

### Current Architecture
Feature-based modular architecture with:
- `src/features/` - Self-contained feature modules (scene, surface-manager, calibration, ui)
- `src/shared/` - Shared utilities, hooks, and context
- `src/views/` - Route-level view components (EditView, LiveView)

## Phase 1 Infrastructure - NOW COMPLETE ✅

### 1. TypeScript ✅
**Was**: Pure JavaScript project
**Now**: TypeScript configured with ALL strict mode flags enabled
**Status**: Infrastructure ready - new code can be written in TypeScript

### 2. Testing ✅
**Was**: Zero test files, no test framework
**Now**: Vitest + React Testing Library fully configured
**Status**: TDD pattern demonstrated with surface-factory (7 passing tests)

### 3. Schema Validation ✅
**Was**: No runtime validation
**Now**: Zod installed with comprehensive schemas for Surface, AppState, ContentType
**Status**: Schemas ready for use at runtime boundaries

## Remaining Gaps (To Be Addressed Gradually)

### 4. Existing Code Migration
**Current**: All existing code is still JavaScript
**Required**: Gradual migration to TypeScript
**Approach**: New code in TS, existing code migrated when touched

### 5. Test Coverage
**Current**: Only surface-factory has tests (one utility)
**Required**: 100% behavior coverage for all features
**Approach**: Add tests incrementally, TDD for all new features

### 6. Comments in Code
**Current**: JSDoc comments in several files
**Required**: Self-documenting code with clear naming
**Impact**: LOW - Address during refactoring

### 7. Schema Validation Integration
**Current**: Schemas created but not yet integrated
**Required**: Use schemas at all runtime boundaries (localStorage, props, etc.)
**Approach**: Integrate as we touch related code

## Next Steps - Phase 2 and Beyond

### Phase 2: Integrate Schemas into Existing Code
1. Update useStorage hook to use Zod schema validation
2. Validate localStorage data on load (surfaces, app state)
3. Add error handling for invalid data
4. Write tests for useStorage with schema validation

### Phase 3: Add Tests for Existing Features
1. Write behavior tests for SurfaceContext
2. Write behavior tests for AppContext
3. Write tests for key utilities (TransformCalculator, etc.)
4. Add component tests for critical UI components

### Phase 4: Gradual TypeScript Migration
1. Convert shared/utils files to TypeScript
2. Convert schemas and types files
3. Convert hooks to TypeScript
4. Convert components incrementally

### Ongoing Practices (Established)
- ✅ ALL new code MUST be TypeScript
- ✅ ALL new code MUST be TDD (write test first)
- ✅ ALL new types MUST be derived from Zod schemas
- ✅ Follow functional programming patterns (immutability, pure functions)
- ✅ Prefer options objects over positional parameters
- ✅ No comments - self-documenting code only

## Important Decisions

### Migration Strategy: Gradual, Not Big Bang
- Will NOT rewrite entire codebase at once
- New code MUST follow CLAUDE.MD standards (TypeScript + TDD)
- Existing code migrated incrementally as features are touched
- Maintain working state throughout migration

### Testing Approach
- Start with new features using TDD
- Add behavior tests for existing features gradually
- Focus on public APIs, not implementation details
- Use React Testing Library for component tests

### TypeScript Migration
- Add TypeScript alongside JavaScript (Vite supports both)
- Configure tsconfig.json with strict mode
- Convert files incrementally, starting with utilities
- Types derived from Zod schemas

## Current Focus
**Phase 6 COMPLETE!** AppContext migrated to TypeScript with comprehensive behavior tests. Shared module fully TypeScript.

### What Was Accomplished
1. **Memory Bank System**: All CLAUDE-* files created and committed
2. **TypeScript Infrastructure**: Full strict mode configuration ready
3. **Testing Infrastructure**: Vitest + RTL configured with comprehensive mocks
4. **Schema System**: Zod schemas for core data types
5. **TDD Pattern Established**: Multiple utilities, hooks, and contexts written with TDD
6. **Schema Integration**: useStorage hook with Zod validation (Phase 2)
7. **Behavior Test Coverage**: 97 comprehensive tests across utilities, hooks, and contexts (Phase 3-6)
8. **TypeScript Migration**: Shared module fully migrated (Phase 4-6)
   - Utilities: constants, broadcast-channel, surface-factory
   - Hooks: useStorage, useKeyboard
   - Contexts: AppContext
   - Exports: shared/index.ts with proper type exports
9. **All Tests Passing**: 97/97 tests green ✅
10. **TypeScript Strict Mode**: Zero compilation errors ✅

### Ready For
- Continue TypeScript migration (SurfaceContext, AudioContext)
- Writing new features using TDD
- Full type safety across codebase
- Expanding test coverage to remaining features

## Questions/Blockers
None currently.

## Resources
- Main philosophy: CLAUDE.MD in project root
- Project spec: projection-mapping-spec.md
- Transform features: TRANSFORM_FEATURES.md
