# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Instructions

- **Never include "Generated with Claude Code" or "Co-Authored-By" statements in commit messages**
- **Always use Svelte 5 runes API** ($state, $props, $derived, $effect) - no legacy stores
- **Component structure is flattened** - components are directly in `/src/lib/components/` (no atoms/molecules/organisms subdirectories)
- **Always format and lint before committing** - Run `bun run format` and `bun run lint` before any commit
- **Default branch is `main`** - The primary branch is `main` (not `master`)
- **When bumping versions**, always:
  1. Update version in `package.json`
  2. Update version in the UI (`src/routes/+page.svelte`)
  3. Update `CHANGELOG.md` with changes
  4. Update documentation as needed
  5. Create a version bump commit

## Project Overview

Fifths (chord-player) is an interactive web application that visualizes and plays musical chords using the Circle of Fifths. It's built with SvelteKit, TypeScript, and uses the Web Audio API for sound generation.

**Branding Strategy**: 
- Product name: "Fifths" (used in UI and marketing)
- Technical name: "chord-player" (used in package.json, GitHub repo, and infrastructure)
- This hybrid approach balances brand uniqueness with SEO discoverability

**Documentation**: All documentation and planning files should be placed in the `/docs` folder

**Current Version**: 0.3.0
**Feature Roadmap**: See docs/FEATURES.md for planned enhancements

**Frequency Generation**: 
- Extended frequencies (octaves 1-7) are generated at build time using scripts/generateFrequencies.ts
- Enhanced chord voicings (standard, spread, rich, bass) are available via scripts/generateChords.ts
- Mathematical precision is maintained at 2 decimal places for all frequencies

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

## Project Structure

- `/docs` - Documentation and planning files
  - `FEATURES.md` - Feature roadmap and planned enhancements
  - `audio-context-analysis.md` - Technical analysis of audio architecture
- `/src` - Source code
- `README.md` - Project readme (stays in root)
- `CLAUDE.md` - This file (AI assistant guidance)
- `CHANGELOG.md` - Version history

## Architecture

### Component Structure
Components are organized in a flat structure:
- `/src/lib/components/` - All UI components (Instrument, SettingsPanel, VolumeControl, LinkButton, Footer)
  - `Instrument.svelte` - Main circle of fifths instrument (formerly CircleOfFifths)
  - `SettingsPanel.svelte` - Oscillator voice selection panel
  - `VolumeControl.svelte` - Master volume control with reactive state

### Data Flow
1. **Server-Side Data Loading**: 
   - Chord data is pre-processed on the server via `chordsData.server.ts`
   - Loaded through `+page.server.ts` and `+layout.server.ts`
   - Improves initial load performance

2. **Static Data**: Musical data stored in JSON files under `/src/lib/data/`
   - `circle-of-fifths-data.json` - Circle positions and chord relationships
   - `notes.json` - Note-to-frequency mappings
   - `chords.json` - Chord-to-note mappings

3. **State Management**: Uses Svelte 5 runes and state stores
   - Reactive state objects with `$state()`
   - Props passing with `$props()`
   - Computed values with `$derived()`
   - State stores in `/src/lib/stores/`:
     - `settings.svelte.ts` - Audio settings (oscillator voice selection)
     - `performance.svelte.ts` - Performance state (active chord display)
     - `audio.svelte.ts` - Audio engine with singleton AudioContext, reactive state, and volume control

4. **Audio Generation**: Uses Web Audio API with oscillator types (sine, triangle, square, sawtooth)

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

## Version Management

### Semantic Versioning
The project follows [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (e.g., 0.2.0)
- **MAJOR**: Breaking changes
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes, backwards compatible

### Files to Update When Versioning
1. **package.json** - `version` field
2. **src/routes/+page.svelte** - Version display in UI (bottom right)
3. **CHANGELOG.md** - Document all changes with date
4. **README.md** - Update if there are user-facing changes
5. **CLAUDE.md** - Update current version reference

### Changelog Format
Follow [Keep a Changelog](https://keepachangelog.com/) format:
- Group changes under: Added, Changed, Fixed, Deprecated, Removed, Security
- Include date in YYYY-MM-DD format
- List changes in bullet points

## GitHub Workflow

### Branch Protection
- Main branch is protected with CI checks
- GitHub Actions runs quality checks on PRs
- See `.github/branch-protection-rules.md` for configuration

### CI/CD
- **GitHub Actions**: `.github/workflows/ci.yml` runs on PRs and pushes to main
- **Quality Checks**: format, lint, type check, build, test
- **Deployment**: Automatic via Vercel on main branch updates
- **Live URL**: https://www.fifths.app (custom domain)

### Working with PRs
- Use GitHub CLI: `gh pr create`, `gh pr merge`
- Set `GH_TOKEN` environment variable for CLI authentication
- PRs can be merged once CI checks pass

### GitHub CLI Authentication Method
- The GH_TOKEN is stored in `.env.development.local`
- Use inline token for gh commands: `GH_TOKEN="token_value" gh pr create ...`
- This method works reliably without needing `gh auth login`
- Example: `GH_TOKEN="github_pat_..." gh pr view 8`
- For merging with admin privileges: `GH_TOKEN="token_value" gh pr merge 8 --merge --admin`