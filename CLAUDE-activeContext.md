# Active Context - Project Adaptation to CLAUDE.MD Standards

## Session Information
- **Date**: 2025-11-09
- **Branch**: claude/read-claud-011CUx7LTXamvJxby87HUBwH
- **Goal**: Adapt the Peperete projection mapping project to follow CLAUDE.MD development philosophy

## Current Session State

### Objectives
1. Create memory bank system (CLAUDE-* files) to track project context
2. Document current project state and architecture
3. Identify gaps between current implementation and CLAUDE.MD standards
4. Create a roadmap for gradual adaptation to TDD and TypeScript

### Progress
- ✅ Read and analyzed CLAUDE.MD development philosophy
- ✅ Analyzed current project structure
- ✅ Identified that project is JavaScript-based with no TypeScript
- ✅ Confirmed no test infrastructure exists
- 🔄 Creating memory bank files to document current state

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

## Critical Gaps vs CLAUDE.MD Standards

### 1. No TypeScript
**Current**: Pure JavaScript project
**Required**: TypeScript strict mode with all strict flags enabled
**Impact**: HIGH - No type safety, potential runtime errors

### 2. No Tests
**Current**: Zero test files, no test framework configured
**Required**: TDD with Jest/Vitest + React Testing Library, 100% behavior coverage
**Impact**: CRITICAL - TDD is non-negotiable per CLAUDE.MD

### 3. No Schema Validation
**Current**: No runtime validation of data structures
**Required**: Zod schemas for all data types, schema-first development
**Impact**: MEDIUM - No validation at runtime boundaries

### 4. Comments in Code
**Current**: JSDoc comments in several files
**Required**: Self-documenting code with clear naming
**Impact**: LOW - Style issue, not functional

### 5. Mixed Patterns
**Current**: Mix of positional parameters and options objects
**Required**: Prefer options objects consistently
**Impact**: LOW - Code organization

## Next Steps

### Immediate (This Session)
1. ✅ Create all CLAUDE-* memory bank files
2. Document current patterns and decisions
3. Create migration plan for TypeScript adoption
4. Create testing strategy document

### Short-term (Next Sessions)
1. Set up Vitest testing framework
2. Configure TypeScript with strict mode
3. Begin TDD conversion starting with new features
4. Add Zod schemas for data validation

### Long-term (Ongoing)
1. Gradually migrate existing JavaScript to TypeScript
2. Add behavior-driven tests for existing features
3. Refactor to eliminate comments
4. Standardize on options objects pattern
5. Achieve 100% test coverage based on business behavior

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
Setting up the memory bank system to document project knowledge and patterns, establishing baseline for future TDD development.

## Questions/Blockers
None currently.

## Resources
- Main philosophy: CLAUDE.MD in project root
- Project spec: projection-mapping-spec.md
- Transform features: TRANSFORM_FEATURES.md
