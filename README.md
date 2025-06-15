# Fifths - Interactive Circle of Fifths Chord Player

An interactive web application that visualizes and plays musical chords using the Circle of Fifths. Built with SvelteKit 2, TypeScript, and the Web Audio API.

**Live Demo**: [Visit Fifths](https://www.fifths.app)

## Features

- **Interactive Circle of Fifths** - Click any chord to hear it played
- **Multiple Voice Types** - Choose between sine, triangle, square, and sawtooth wave oscillators
- **Rich Chord Voicings** - Select from standard, spread, rich, bass-enhanced, or root bass voicings
- **Extended Frequency Range** - Supports 7 octaves (C1 to C7) for fuller sound
- **Volume Control** - Adjustable master volume with real-time feedback
- **Visual Feedback** - See which chord is currently playing
- **Responsive Design** - Works on desktop and mobile devices
- **Server-Side Rendering** - Fast initial load with pre-rendered chord data
- **Optimized for Serverless** - In-memory data generation, no filesystem writes

## Tech Stack

- **Framework**: SvelteKit 2.x with Svelte 5 (runes API)
- **Language**: TypeScript 5.x
- **Styling**: UnoCSS with Wind preset (Tailwind-compatible)
- **Package Manager**: Bun 1.x
- **Code Quality**: Biome (formatting & linting), svelte-check (type checking)
- **Deployment**: Vercel

## Development

### Prerequisites

- Node.js 22.x or higher
- Bun 1.x or higher

### Installation

```bash
bun install
```

### Commands

```bash
# Development server
bun dev

# Build for production
bun build

# Preview production build
bun preview

# Format code
bun run format

# Lint code
bun run lint

# Type checking
bun check

# Run tests
bun test
```

## Project Structure

```
src/
├── lib/
│   ├── components/     # UI components
│   ├── data/          # Static data (JSON) and server data processing
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions
├── routes/            # SvelteKit routes
└── app.html          # HTML template

.github/
├── workflows/         # GitHub Actions CI/CD
└── branch-protection-rules.md

docs/
├── CHANGELOG.md      # Version history
├── FEATURES.md       # Feature roadmap
└── CLAUDE.md         # AI assistant instructions
```

## Architecture

The application uses server-side data loading to pre-process chord frequencies and deliver them to the client, improving initial load performance. The Circle of Fifths visualization is built with SVG, and chord playback uses the Web Audio API with configurable oscillator types.

## Development Status

Current version: 0.3.0

- 📋 [Feature Roadmap](FEATURES.md) - Planned enhancements and new features
- 📝 [Changelog](CHANGELOG.md) - Version history and recent updates
- 🤖 [AI Assistant Guide](CLAUDE.md) - Instructions for Claude Code

## Contributing

This project uses GitHub Actions for CI/CD. All pull requests must pass quality checks (format, lint, type check, build, test) before merging.

## Credits
This project was inspired by designs by Quinn Raymond for his physical product Q-RAY <https://qrayinstruments.com/products/q-ray-chord-player> which is a MIDI controller for musicians to play chords on. Initial work on this project grew out of my interest in Quinn's design and the Q-RAY product. The Circle of Fifths visualization was inspired by the SVG Circle of Fifths library <https://github.com/epiccoleman/react-circle-of-fifths/>.

## License

MIT License - see [LICENSE](LICENSE) file for details