import { useState } from 'react'
import WelcomeScreen from './components/WelcomeScreen'
import Piano from './components/Piano'
import Xylophone from './components/Xylophone'
import DrumKit from './components/DrumKit'
import VolumeControl from './components/VolumeControl'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const [currentView, setCurrentView] = useState('welcome')
  const [volume, setVolume] = useState(0.7)

  const selectInstrument = (instrument) => {
    setCurrentView(instrument)
  }

  const goHome = () => {
    setCurrentView('welcome')
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'piano':
        return (
          <ErrorBoundary>
            <Piano volume={volume} onHome={goHome} />
          </ErrorBoundary>
        )
      case 'xylophone':
        return (
          <ErrorBoundary>
            <Xylophone volume={volume} onHome={goHome} />
          </ErrorBoundary>
        )
      case 'drumkit':
        return (
          <ErrorBoundary>
            <DrumKit volume={volume} onHome={goHome} />
          </ErrorBoundary>
        )
      default:
        return <WelcomeScreen onSelectInstrument={selectInstrument} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900">
      <VolumeControl volume={volume} onVolumeChange={setVolume} />
      {renderCurrentView()}
    </div>
  )
}

export default App