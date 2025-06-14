# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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