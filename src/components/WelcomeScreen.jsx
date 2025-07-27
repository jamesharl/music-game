import { useState } from 'react'
import PropTypes from 'prop-types'

const WelcomeScreen = ({ onSelectInstrument }) => {
  const [hoveredCard, setHoveredCard] = useState(null)

  const instruments = [
    {
      id: 'piano',
      name: 'Piano',
      description: 'Play beautiful melodies on a virtual piano keyboard',
      icon: '🎹',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      id: 'xylophone',
      name: 'Xylophone',
      description: 'Strike colorful bars to create magical sounds',
      icon: '🎵',
      gradient: 'from-green-500 to-teal-600'
    },
    {
      id: 'drumkit',
      name: 'Drum Kit',
      description: 'Create rhythmic beats with a complete drum set',
      icon: '🥁',
      gradient: 'from-red-500 to-orange-600'
    },
    {
      id: 'guitar',
      name: 'Guitar',
      description: 'Strum chords and play melodies on a 6-string guitar',
      icon: '🎸',
      gradient: 'from-amber-500 to-orange-600'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-white mb-4 tracking-wide">
          Music Game
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Choose your instrument and start making music! Click on any instrument below to begin playing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl w-full">
        {instruments.map((instrument) => (
          <div
            key={instrument.id}
            className={`relative group cursor-pointer transform transition-all duration-300 ${
              hoveredCard === instrument.id ? 'scale-105' : 'hover:scale-105'
            }`}
            onMouseEnter={() => setHoveredCard(instrument.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => onSelectInstrument(instrument.id)}
          >
            <div className={`bg-gradient-to-br ${instrument.gradient} rounded-2xl p-8 shadow-2xl border border-white/10 backdrop-blur-sm`}>
              <div className="text-center">
                <div className="text-6xl mb-4">{instrument.icon}</div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  {instrument.name}
                </h2>
                <p className="text-gray-100 text-sm leading-relaxed">
                  {instrument.description}
                </p>
              </div>
              
              <div className="mt-6 flex justify-center">
                <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20">
                  Play Now
                </button>
              </div>
            </div>
            
            <div className={`absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-gray-400">
          Use your mouse to interact with each instrument
        </p>
      </div>
    </div>
  )
}

WelcomeScreen.propTypes = {
  onSelectInstrument: PropTypes.func.isRequired
}

export default WelcomeScreen