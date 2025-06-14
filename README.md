# Chord Player

An interactive web application that visualizes and plays musical chords using the Circle of Fifths. Built with SvelteKit 2, TypeScript, and the Web Audio API.

## Features

- **Interactive Circle of Fifths** - Click any chord to hear it played
- **Multiple Voice Types** - Choose between sine, triangle, square, and sawtooth wave oscillators
- **Visual Feedback** - See which chord is currently playing
- **Responsive Design** - Works on desktop and mobile devices
- **Server-Side Rendering** - Fast initial load with pre-rendered chord data

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
```

## Architecture

The application uses server-side data loading to pre-process chord frequencies and deliver them to the client, improving initial load performance. The Circle of Fifths visualization is built with SVG, and chord playback uses the Web Audio API with configurable oscillator types.

## Credits
This project was inspired by designs by Quinn Raymond for his physical product Q-RAY <https://qrayinstruments.com/products/q-ray-chord-player> which is a MIDI controller for musicians to play chords on. Initial work on this project grew out of my interest in Quinn's design and the Q-RAY product. The Circle of Fifths visualization was inspired by the SVG Circle of Fifths library <https://github.com/epiccoleman/react-circle-of-fifths/>.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Version

Current version: 0.2.0

See [CHANGELOG.md](CHANGELOG.md) for version history.