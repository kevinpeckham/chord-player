# Proposed Features

## Scoped Roadmap (July 2026)

Eight features, scoped and sequenced. Two pieces of shared infrastructure
determine the order: a **transport** (BPM + lookahead beat scheduler) that the
metronome, drum machine, and song playback all need, and a **progression/song
data format** (sequence of `{chordId, mode, seventh, beats}` entries plus line
breaks) shared by the tracker, scratch pad, demos, and learn mode. Wedge
**highlighting** (needed by demos and learn mode) is the trigger for the
planned Instrument componentization (NotesRing/ChordsRing).

### Phase A — quick wins (no dependencies)

**A1. Reverb** — effort: S
- Web Audio `ConvolverNode` in the master chain with a synthesized impulse
  response (exponentially decaying noise buffer — no audio assets needed)
- Dry/wet mix slider in settings; master chain becomes
  `chordGain → masterGain → [dry + convolver] → destination`
- Instant sound-quality win: the raw oscillator voices are dry and harsh
- Tests: extend the FakeAudioContext stub with `createConvolver`/buffers

**A2. Progression pad** (merges "chords played display/tracker" + "scratch
pad") — effort: S–M
- Every chord played is appended to a progression store (id, display name,
  seventh); shown as a strip/pad below the instrument
- Controls: line break, delete last, clear/reset
- Persisted to localStorage (SSR-guarded)
- This IS the tracker with reset; the scratch pad is the same feature with
  persistence and line breaks, so build once
- Forward-compatible: entries use the shared song format, so later a jotted
  progression can be auto-played (Phase C) or practiced (learn mode)

### Audio effects backlog (post-Phase-A additions)

Both follow the master-chain pattern established by the reverb (parallel or
insert node + a settings slider), so each is a small standalone ship:

**Distortion** — effort: S
- `WaveShaperNode` with a soft-clipping curve (e.g. tanh-based), amount
  control in settings; insert before the master gain
- Pairs naturally with the sawtooth/square voices

**Delay** — effort: S
- `DelayNode` + feedback gain loop in parallel with the dry signal
  (like the reverb send); time + feedback controls in settings
- Later: sync delay time to the transport's BPM once Phase B lands

### MIDI (M1–M3 shipped in v0.9.0; M4 deferred)

- ✅ M1: pad entries record MIDI note numbers (exact conversion from the
  equal-tempered frequencies at jot time; storage schema v2)
- ✅ M2: pad playback through the app synth (reserved pointer ID, cannot
  re-jot itself; uniform 120 BPM steps until the transport lands)
- ✅ M3: .mid export — hand-rolled SMF format-0 writer, zero dependencies;
  each chord one quarter note, line breaks become rests
- ⏳ M4: live Web MIDI out to devices/DAWs — bigger scope (port selection,
  permissions, scheduling) and no Safari support; aligns with the older
  "MIDI Controller/Slave Mode" items below

### Phase B — rhythm infrastructure

**B1. Metronome / click** — effort: S–M
- Builds the **transport**: BPM setting, play/stop, and a lookahead scheduler
  (the standard ~25ms `setInterval` scheduling beats ~100ms ahead on the
  AudioContext clock — required for drift-free timing)
- Click = short oscillator blip, accented downbeat, time signature 4/4 first
- Toolbar toggle + BPM control; transport lives in a new store

**B2. Simple drum machine** — effort: M–L (depends on B1)
- Synthesized kit, no samples: kick (sine pitch-drop), snare (noise burst +
  tone), hi-hat (filtered noise)
- 16-step × 3-voice pattern grid UI + a few preset patterns
- Driven by the transport's scheduler; pattern store persisted to localStorage

### Phase C — song engine + instrument highlighting

**C0. Instrument componentization + highlight state** — effort: M
(prerequisite for C1/C2; retires the standing fallow suppression)
- Split the SVG template into NotesRing/ChordsRing; wedges accept a
  `highlighted` state keyed by chord id
- Programmatic playback API already exists (`startChord` with a reserved
  pointer id)

**C1. Auto-play demos** — effort: M (depends on B1 + C0)
- Song format: shared with the progression pad; demo songs ship as JSON
- Playback engine walks the song on the transport; wedges light as they play
- ⚠ Song choice: use public-domain/original progressions (12-bar blues,
  50s progression, Pachelbel) — named contemporary songs raise rights issues
- User-jotted progressions from the pad become auto-playable for free

**C2. Wait-for-me playing (learn mode)** — effort: M (depends on C1)
- Same songs, same highlighting; instead of auto-advance, the engine
  highlights the next expected chord and listens to Instrument play events,
  advancing on match (with a "close enough" grace for seventh/voicing)
- Progress display + restart; the incremental work over C1 is the matcher

### Phase D — real voiced instruments (largest, most open-ended)

**D1. Plucked-string synth voice (Karplus–Strong)** — effort: M
- Physical-modeling pluck (noise burst into a filtered feedback delay) gives
  a convincing guitar/harp-like voice with zero audio assets
- Ships as a fifth entry in the existing voice selector; good test of whether
  synthesis quality satisfies before investing in samples

**D2. Sampled instruments (true guitar/piano)** — effort: L–XL
- Requires a multisample set per instrument (licensing/sourcing decision),
  sample loading + caching strategy (megabytes of assets), pitch-shifting
  between sampled notes, and per-voicing polyphony management
- Decision needed before scoping further: source/licensing of sample sets
  (e.g. open ones like VS Chamber Orchestra/Salamander piano) and how many
  instruments

### Suggested order
A1 → A2 → B1 → B2 → C0 → C1 → C2 → D1 → (decide) D2

## Your Proposed Features

### 1. Settings Menu
- Add a settings panel/modal
- Store user preferences (localStorage)
- Include all configurable options in one place

### 2. Single Note Mode
- Toggle between chord mode and single note mode
- Play individual notes instead of full chords
- Useful for ear training and music theory learning

### 3. Extended Chord Support
- **7th Chords**: maj7, min7, dom7, m7b5 (half-diminished), dim7
- **Sus Chords**: sus2, sus4
- **6th Chords**: maj6, min6
- **9th Chords**: add9, maj9, min9, dom9
- **11th & 13th Chords**: maj11, min11, dom13
- **Altered Chords**: aug (augmented), dim (diminished)
- **Power Chords**: root + fifth only (no third)
- Chord type selector menu
- Visual indicators for chord complexity
- Smart voicing to avoid muddy sounds

### 4. Touch-Sensitive Playback
- Play chord only while pressed/touched
- Support for mouse down/up and touch start/end events
- More realistic instrument-like interaction

### 5. Sustain Settings
- Adjustable sustain duration
- Slider control for sustain length
- Option for infinite sustain

### 6. Natural Decay (ADSR Envelope)
- Attack, Decay, Sustain, Release controls
- Volume fade out after release
- More realistic sound synthesis

### 7. Arpeggiator
- Play chord notes in sequence instead of simultaneously
- Adjustable speed/tempo
- Different patterns (up, down, up-down, random)
- Sync with metronome/BPM setting

### 8. MIDI Controller Mode
- Send MIDI notes to DAWs and other software
- Web MIDI API integration
- Velocity sensitivity from click/touch pressure
- MIDI channel selection
- CC (Control Change) messages for parameters

### 9. MIDI Slave Mode
- Receive MIDI input to trigger chords
- Visual feedback for incoming MIDI notes
- MIDI learn for chord mapping
- Sync with external MIDI clock
- Respond to program changes

### 10. Octave Control
- Shift all chords up or down by octaves
- Octave selector buttons (+/- or numbered)
- Visual indicator showing current octave
- Keyboard shortcuts for quick octave changes
- Range from C1 to C7 (or appropriate musical range)

### 11. Volume Control
- Master volume slider
- Visual volume indicator
- Mute/unmute toggle
- Keyboard shortcuts for volume control
- Save volume preference in settings

### 12. Device Muted Indicator
- Detect when device audio is muted
- Show warning banner when muted
- Provide clear instructions to unmute
- OS-specific unmute tips (iOS, Android, Desktop)
- Auto-hide when audio is enabled

### 13. Chord Inversions
- Toggle between root position and inversions
- Support 1st, 2nd, and 3rd inversions
- Visual indicator showing current inversion
- Different inversion modes (automatic voice leading, manual selection)
- Smooth voice leading between chords

### 14. Circle Rotation / Key Setting
- Rotate circle to place any key at 12 o'clock position
- Set the song key/tonal center
- Visual rotation animation when changing keys
- Key selector dropdown or click-to-rotate interface
- Keyboard shortcuts for key changes (arrow keys or number keys)
- Highlight chords in the selected key (diatonic chords)

### 15. Enharmonic Chord Names
- Automatically rename chords based on selected key
- Show F# instead of Gb in sharp keys
- Show Bb instead of A# in flat keys
- Proper enharmonic spelling for all chords
- Toggle option for preferred accidentals (sharps vs flats)
- Context-aware naming for better music theory accuracy

### 16. Staff Notation Display
- Toggle between chord names and staff notation
- Show chord notes on a mini musical staff
- Treble and bass clef options
- Display notes with proper accidentals
- Compact staff segments that fit within chord circles
- Optional: show both chord name and staff together

### 17. Bass Note Voicing
- Add root note in lower octave (1-2 octaves below)
- Toggle bass note on/off
- Adjustable bass octave offset
- Bass note volume control (relative to chord)
- Different bass note styles (sustained, staccato, rhythmic)
- Option for fifth in bass for power chord effect

## Additional Feature Ideas

### Audio & Sound
- **Reverb Effect** - Add spatial depth to sounds
- **Metronome** - Built-in tempo keeper for practice
- **Recording** - Record and playback chord progressions
- **MIDI Export** - Export played progressions as MIDI files

### Visual & UI
- **Dark/Light Theme** - Theme toggle in settings
- **Keyboard Shortcuts** - Play chords with keyboard
- **Chord Progression Display** - Show recent played chords
- **Animation Settings** - Control visual feedback speed/style
- **Fullscreen Mode** - Immersive practice experience
- **Responsive Chord Size** - Adjust circle size with pinch/zoom

### Music Theory & Learning
- **Chord Progression Suggestions** - Highlight common progressions
- **Scale Highlighting** - Show chords in selected key
- **Relative Minor/Major Toggle** - Quick switch between relatives
- **Chord Information Panel** - Display notes, intervals, theory info
- **Practice Mode** - Chord recognition exercises
- **Progression Builder** - Create and save chord progressions

### Advanced Features
- **Multi-touch Support** - Play multiple chords simultaneously
- **Velocity Sensitivity** - Louder/softer based on click/touch force
- **Custom Tuning** - A440 adjustment
- **Strumming Pattern** - Rhythmic chord playback options
- **Chord Quality Selector** - Quick switch between major/minor/dim/aug
- **Slash Chords** - Support for inversions like C/E, Am/C
- **Borrowed Chords** - Highlight modal interchange options

### Collaboration & Sharing
- **Share Progression URLs** - Share specific chord progressions
- **Export Audio** - Save recordings as audio files
- **Session Mode** - Multiple users play together
- **Chord Chart Export** - Generate PDF chord charts

### Accessibility
- **Screen Reader Support** - Proper ARIA labels
- **High Contrast Mode** - Better visibility
- **Larger Touch Targets** - Accessibility option
- **Sound Descriptions** - Describe chords audibly

## Implementation Priority

### Phase 1 (Core Improvements)
1. Settings Menu (foundation for other features)
2. Volume Control
3. Device Muted Indicator
4. Touch-Sensitive Playback
5. Natural Decay (ADSR)
6. Octave Control
7. Bass Note Voicing

### Phase 2 (Enhanced Playability)
1. Single Note Mode
2. Extended Chord Support
3. Sustain Settings
4. Dark/Light Theme
5. Arpeggiator
6. Chord Inversions
7. Circle Rotation / Key Setting
8. Enharmonic Chord Names

### Phase 3 (Advanced Features)
1. Keyboard Shortcuts
2. Chord Progression Display
3. Recording/Playback
4. Reverb Effect
5. MIDI Controller Mode
6. MIDI Slave Mode

### Phase 4 (Learning Tools)
1. Scale Highlighting
2. Practice Mode
3. Chord Information Panel
4. Progression Builder
5. Staff Notation Display