# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-01-14

### Added
- Server-side data loading for chord data via `+page.server.ts` and `+layout.server.ts`
- Modular type system with dedicated type files:
  - `Chord.ts` for chord and chord datum interfaces
  - `Link.ts` for navigation link types
  - `Note.ts` for note type definitions
  - `Oscillator.ts` for oscillator state types
- LinkButton component replacing ButtonLink
- Server-side chord data processing with `chordsData.server.ts`

### Changed
- Data architecture refactored from client-side stores to server-side data loading
- Component naming: ButtonLink renamed to LinkButton
- Type organization: Split monolithic `types.ts` into individual type modules
- CircleOfFifths component updated to use server-loaded chord data
- Error page updated for improved error handling
- Layout structure migrated from client-side to server-side

### Removed
- Client-side chord store (`chordsStore.ts`)
- Monolithic types file (`types.ts`)
- PreFooter component (unused)
- ButtonLink component (replaced by LinkButton)
- Client-side layout file (`+layout.ts`)

## [0.1.1] - 2025-01-13

### Changed
- Migrated from Svelte 4 to Svelte 5 with runes API
- Converted all components from Pug to native Svelte syntax
- Replaced pnpm with Bun as package manager
- Replaced ESLint/Prettier with Biome for formatting and linting
- Replaced Tailwind CSS/PostCSS with UnoCSS
- Upgraded all dependencies to latest versions (SvelteKit 2.x, Vite 6.x)
- Flattened component structure (removed atomic design hierarchy)
- Switched from Vitest/Playwright to Bun's native test runner

### Added
- CLAUDE.md for AI assistant guidance
- Biome configuration for code quality
- Vercel deployment configuration with security headers
- cspell configuration for spell checking

### Removed
- Pug templating and dependencies
- ESLint, Prettier and their configuration files
- Playwright testing framework
- PostCSS and Tailwind CSS
- Nested component directory structure (atoms/molecules/organisms)

## [0.0.2] - 2023-08-21

### Added
- Oscillator voice selection (sine, triangle, square, sawtooth)
- Visual feedback for active chord
- Circle of Fifths SVG visualization

### Changed
- Updated default voice to sine wave
- Improved audio fade out to prevent clicks

## [0.0.1] - 2023-08-20

### Added
- Initial release
- Basic Circle of Fifths implementation
- Web Audio API integration for chord playback
- Major and minor chord support
- Responsive design with Tailwind CSS