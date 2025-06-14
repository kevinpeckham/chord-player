# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Instructions

- **Never include "Generated with Claude Code" or "Co-Authored-By" statements in commit messages**

## Project Overview

Chord Player is an interactive web application that visualizes and plays musical chords using the Circle of Fifths. It's built with SvelteKit, TypeScript, and uses the Web Audio API for sound generation.

**Package Manager**: Bun (no longer uses pnpm)
**Code Quality**: TypeScript with svelte-check only (ESLint and Prettier have been removed)
**Testing**: Vitest only (Playwright has been removed)
**Framework**: Svelte 5 with runes API ($state, $derived, $effect)
**Templating**: Native Svelte syntax (Pug has been removed)

## Key Commands

### Development
- `bun dev` - Start development server
- `bun build` - Build for production
- `bun preview` - Preview production build

### Code Quality
- `bun check` - Type-check with svelte-check
- `bun check:watch` - Type-check in watch mode

### Testing
- `bun test` - Run Vitest unit tests

## Architecture

### Component Structure
The project follows atomic design principles:
- `/src/lib/components/atoms/` - Basic UI components (ButtonLink, CircleOfFifths, PreFooter)
- `/src/lib/components/molecules/` - Composite components
- `/src/lib/components/organisms/` - Complex components (Footer)

### Data Flow
1. **Static Data**: Musical data stored in JSON files under `/src/lib/data/`
   - `circle-of-fifths-data.json` - Circle positions and chord relationships
   - `notes.json` - Note-to-frequency mappings
   - `chords.json` - Chord-to-note mappings

2. **State Management**: Svelte stores in `/src/lib/stores/`
   - `chordsStore.ts` - Combines chord data with frequencies for audio playback

3. **Audio Generation**: Uses Web Audio API with oscillator types (sine, triangle, square, sawtooth)

### Path Aliases
Configured shortcuts in `svelte.config.js`:
- `$lib` → `src/lib`
- `$atoms` → `src/lib/components/atoms`
- `$components` → `src/lib/components`
- `$stores` → `src/lib/stores`
- `$types` → `src/lib/types`
- `$utils` → `src/lib/utils`
- `$data` → `src/lib/data`

### Styling
- UnoCSS with Wind preset (Tailwind-compatible utilities)
- Custom color scheme (primary: #142239, accent: #ebf92f)
- Svelte extractor for optimal CSS generation