# Music Game

An interactive web-based music game where players can select and play virtual instruments using their mouse.

## Features

### Welcome Screen
- Beautiful instrument selection cards with visual previews
- Smooth transitions to instrument view
- Responsive design for desktop and tablet

### Instruments

#### 🎹 Piano
- Full 3-octave keyboard (C3 to B5)
- Mouse hover and click interactions
- Visual feedback for pressed keys
- Support for playing multiple keys simultaneously
- Realistic piano sounds using Tone.js

#### 🎵 Xylophone
- 8 colorful bars with different notes (C4 to C5)
- Strike animations when bars are played
- Bright, bell-like xylophone sounds
- Visual feedback with scaling and brightness effects

#### 🥁 Drum Kit
- Complete drum set with:
  - Kick drum
  - Snare drum
  - Hi-hat cymbal
  - Crash cymbal
  - Tom-toms (2 different sizes)
- Realistic drum sounds synthesized in real-time
- Visual feedback for drum hits

### Technical Features
- **Low-latency audio** using Tone.js (< 50ms)
- **Responsive design** for desktop and tablet
- **Smooth animations** and transitions
- **Volume control** with real-time adjustment
- **Intuitive navigation** between instruments
- **Visual feedback** for all interactions

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Audio Library**: Tone.js
- **Language**: JavaScript (JSX)

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

## Usage

1. Open the application in your browser
2. Click on any instrument card from the welcome screen
3. Use your mouse to interact with the selected instrument:
   - **Piano**: Click on keys to play notes
   - **Xylophone**: Click on colored bars to strike them
   - **Drum Kit**: Click on different drums and cymbals
4. Adjust volume using the control in the top-right corner
5. Click "Back to Instruments" to return to the selection screen

## Development

- **Linting**: `npm run lint`
- **Hot reload**: Enabled by default in development mode
- **ESLint**: Configured for React and modern JavaScript

## Browser Compatibility

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

*Note: Web Audio API support is required for audio functionality.*

## License

This project is open source and available under the MIT License.