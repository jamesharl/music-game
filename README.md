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

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (v7.0.0 or higher) - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)

To verify your installations:
```bash
node --version  # Should output v16.0.0 or higher
npm --version   # Should output 7.0.0 or higher
git --version   # Should output git version
```

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/jamesharl/music-game.git
cd music-game
```

### 2. Install dependencies
```bash
npm install
```

**Note**: This will install all required packages including React, Vite, Tailwind CSS, and Tone.js.

### 3. Start the development server
```bash
npm run dev
```

The game will be available at `http://localhost:5173` (or another port if 5173 is in use).

### 4. Build for production (optional)
```bash
npm run build
```

### 5. Preview production build (optional)
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

## Troubleshooting

### Common Issues and Solutions

#### 1. **Permission errors during npm install**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm

# Or use a different npm directory
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

#### 2. **Port already in use**
If you see "Port 5173 is already in use", either:
- Stop the process using that port
- Or let Vite choose another port automatically (it will prompt you)

#### 3. **Audio not working**
- Ensure your browser supports Web Audio API
- Check that your system audio is not muted
- Try refreshing the page
- Some browsers require user interaction before playing audio

#### 4. **Dependencies installation fails**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

#### 5. **Blank page or errors in console**
- Ensure you're using a supported browser (see Browser Compatibility)
- Check the browser console for specific error messages
- Try running in incognito/private mode to rule out extensions

## System Requirements

### Minimum Requirements
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 20.04+
- **RAM**: 4GB
- **Disk Space**: 200MB free space
- **Internet**: Required for initial setup only

### Recommended Requirements
- **RAM**: 8GB
- **Modern browser** with hardware acceleration enabled
- **Audio**: Working speakers or headphones

## Browser Compatibility

| Browser | Minimum Version | Notes |
|---------|----------------|--------|
| Chrome | 88+ | Recommended for best performance |
| Firefox | 85+ | Full support |
| Safari | 14+ | Full support |
| Edge | 88+ | Full support |
| Opera | 74+ | Full support |

*Note: Web Audio API support is required. Mobile browsers may have limited functionality.*

## License

This project is open source and available under the MIT License.