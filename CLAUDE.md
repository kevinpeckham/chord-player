# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Instructions

- **Never include "Generated with Claude Code" or "Co-Authored-By" statements in commit messages**
- **Always use Svelte 5 runes API** ($state, $props, $derived, $effect) - no legacy stores
- **Component structure is flattened** - components are directly in `/src/lib/components/` (no atoms/molecules/organisms subdirectories)

## Project Overview

Chord Player is an interactive web application that visualizes and plays musical chords using the Circle of Fifths. It's built with SvelteKit, TypeScript, and uses the Web Audio API for sound generation.

**Package Manager**: Bun 1.x
**Framework**: Svelte 5 with runes API, SvelteKit 2.x
**Language**: TypeScript 5.x
**Styling**: UnoCSS with Wind preset (Tailwind-compatible)
**Code Quality**: 
  - Biome for formatting and linting (`bun run format` and `bun run lint`)
  - svelte-check for type checking
  - cspell for spell checking
**Testing**: Bun test runner (`bun test`)
**Deployment**: Vercel

## Key Commands

### Development
- `bun dev` - Start development server (Vite)
- `bun build` - Build for production
- `bun preview` - Preview production build

### Code Quality
- `bun run format` - Format code with Biome
- `bun run lint` - Lint code with Biome
- `bun check` - Type-check with svelte-check
- `bun check:watch` - Type-check in watch mode

### Testing
- `bun test` - Run tests with Bun test runner
- `bun test:watch` - Run tests in watch mode

## Architecture

### Component Structure
Components are organized in a flat structure:
- `/src/lib/components/` - All UI components (ButtonLink, CircleOfFifths, PreFooter, Footer)

### Data Flow
1. **Static Data**: Musical data stored in JSON files under `/src/lib/data/`
   - `circle-of-fifths-data.json` - Circle positions and chord relationships
   - `notes.json` - Note-to-frequency mappings
   - `chords.json` - Chord-to-note mappings

2. **State Management**: Uses Svelte 5 runes
   - Reactive state objects with `$state()`
   - Props passing with `$props()`
   - Computed values with `$derived()`
   - No legacy stores - all state is managed with runes

3. **Audio Generation**: Uses Web Audio API with oscillator types (sine, triangle, square, sawtooth)

### Path Aliases
Configured shortcuts in `svelte.config.js`:
- `$lib` → `src/lib`
- `$assets` → `src/lib/assets`
- `$components` → `src/lib/components`
- `$data` → `src/lib/data`
- `$settings` → `src/lib/settings`
- `$stores` → `src/lib/stores`
- `$tools` → `src/lib/components/tools`
- `$types` → `src/lib/types`
- `$utils` → `src/lib/utils`

### Styling
- UnoCSS with Wind preset (Tailwind-compatible utilities)
- Custom color scheme (primary: #142239, accent: #ebf92f)
- Svelte extractor for optimal CSS generation
- Imports styles via `uno.css` in layout

## Recent Modernization (2025)

The project has undergone significant modernization:
- **Svelte 4 → 5**: Migrated to runes API, removing all legacy stores
- **Pug → Native Svelte**: Converted all templates to native Svelte syntax
- **Component Reorganization**: Flattened atomic design hierarchy for simplicity
- **Build Tools**: Replaced ESLint/Prettier with Biome, PostCSS/Tailwind with UnoCSS
- **Package Manager**: Migrated from pnpm to Bun
- **Testing**: Switched from Vitest/Playwright to Bun's native test runner
- **Dependencies**: Updated all packages to latest versions (SvelteKit 2.x, Vite 6.x, etc.)