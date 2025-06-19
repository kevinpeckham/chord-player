# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.5] - 2025-01-22

### Fixed
- Critical mobile bug where first chord would play indefinitely in chord mode
- Improved touch event handling by switching to pointer events API
- Enhanced stopChord function to properly clean up all active oscillators
- Removed CSS transition delays for instant visual feedback on touch
- Added failsafe mechanisms including 5-second timeout and global pointer up listeners

### Changed
- Replaced mouse/touch events with unified pointer events for better cross-device compatibility
- Made audio cleanup more robust with try-catch error handling
- Simplified touch tracking logic for more reliable performance

## [0.3.4] - 2025-01-22

### Added
- Key center position setting - choose between top (12 o'clock) or bottom (6 o'clock) orientation
- Visual indicator dot showing the current key center position
- Enharmonic chord labeling based on selected key - shows correct sharp/flat notation per music theory
- Improved mobile ergonomics with bottom position as default for one-handed use

### Changed
- Default key center position is now bottom (6 o'clock) for better mobile accessibility
- Chord labels dynamically adjust to show appropriate enharmonics (e.g., F# in key of G, Gb in key of F)
- Hamburger menu icon updated for better visual clarity

### Fixed
- Corrected SVG positioning calculations for both top and bottom orientations

## [0.3.3] - 2025-01-22

### Added
- Touch-responsive chord and note playback - sounds play for the duration of key press
- Continuous audio playback with startChord() and stopChord() methods in audio store
- Full touch event support (touchstart, touchend, touchcancel) for mobile devices
- Mouse leave event handling to stop playback when cursor exits chord/note

### Changed
- Chords and notes now play continuously while pressed instead of fixed 1.5 second duration
- Improved audio responsiveness with faster attack (10ms) and release (50ms) times
- Added touch-none CSS class to prevent touch scrolling interference during playback

## [0.3.2] - 2025-01-21

### Added
- Responsive mobile UI with hamburger menu for settings panel
- HamburgerButton component for mobile navigation
- Touch-friendly mobile layout adjustments
- Mobile-optimized settings panel that slides in from the left
- Footer branding update with Fifths logo

### Changed
- Settings panel now hides on mobile and is accessible via hamburger menu
- Improved responsive breakpoints for better mobile experience
- Enhanced UnoCSS configuration with additional utility classes
- Updated footer link styling for better visual hierarchy
- App meta tags updated with theme color matching primary brand color

### Fixed
- Mobile layout issues with settings panel overlapping content
- Touch interaction improvements for mobile devices

## [0.3.1] - 2025-01-21

### Added
- playChordByNotes wrapper function for playing chords using note names instead of frequencies
- Root Bass voicing option combining bass root note with first inversion (e.g., C3, E4, G4, C5)
- Individual Notes mode for playing single chromatic notes instead of chords
- Key Center selector to rotate the circle and place any note/chord at 12 o'clock position
- Octave selector for individual notes mode (octaves 1-7)

### Changed
- Oscillator type selection changed from radio buttons to dropdown for consistency
- Circle of Fifths visualization now supports both chord mode and individual notes mode
- Default key center is C (appears at 12 o'clock position)

## [0.3.0] - 2025-01-21

### Added
- Professional audio engine with singleton AudioContext pattern
- Master volume control with real-time adjustment
- Reactive audio state management using Svelte 5 runes
- Documentation folder structure (/docs) for better organization
- Audio context analysis documentation
- Proper audio resource cleanup and memory management
- Extended frequency generation for octaves 1-7 (119 total notes)
- Rich chord voicings: standard, spread, rich, and bass-enhanced
- Chord voicing selector component with 4 voicing options
- In-memory frequency and chord generation for serverless deployment
- Chrome DevTools Vite plugin for enhanced debugging
- Comprehensive JSDoc documentation for all utility functions

### Changed
- Refactored components: CircleOfFifths renamed to Instrument
- Extracted oscillator controls into SettingsPanel component
- Implemented Svelte 5 state stores for settings and performance
- Updated branding from "Chord Player" to "Fifths"
- Moved documentation files to organized /docs folder
- Audio context now reused instead of recreated for each chord
- Frequency generation moved from build-time to runtime (serverless-friendly)
- Renamed utils.ts to circleGeometry.ts for clarity
- Improved function naming: shiftOctave → transposeNoteByOctaves/shiftFrequencyByOctaves

### Fixed
- Browser AudioContext limit exhaustion issue
- Memory leaks from uncleaned audio nodes
- Svelte module compilation errors with $effect and $derived usage

### Removed
- Unused utility functions (calculateFrequency, analyzeFrequencyPrecision, shiftFrequencyByOctaves)
- Build-time file generation scripts (now computed in-memory)

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