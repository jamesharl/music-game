import { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import * as Tone from 'tone'
import { initializeAudio, ensureAudioContext } from '../utils/audioContext'
import RecordingControl from './RecordingControl'

const Xylophone = ({ volume, onHome }) => {
  const [struckBars, setStruckBars] = useState(new Set())
  const [isLoaded, setIsLoaded] = useState(false)
  const synthRef = useRef(null)

  useEffect(() => {
    const initAudio = async () => {
      try {
        await initializeAudio()
        
        synthRef.current = new Tone.Synth({
          oscillator: {
            type: 'sine'
          },
          envelope: {
            attack: 0.01,
            decay: 0.3,
            sustain: 0.1,
            release: 1.2
          }
        }).toDestination()
        
        setIsLoaded(true)
      } catch (error) {
        console.error('Failed to initialize xylophone audio:', error)
        throw error
      }
    }

    initAudio()
    
    return () => {
      if (synthRef.current) {
        synthRef.current.dispose()
      }
    }
  }, [])

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.value = Tone.gainToDb(volume)
    }
  }, [volume])

  const bars = [
    { note: 'C4', color: 'bg-red-500', name: 'C' },
    { note: 'D4', color: 'bg-orange-500', name: 'D' },
    { note: 'E4', color: 'bg-yellow-500', name: 'E' },
    { note: 'F4', color: 'bg-green-500', name: 'F' },
    { note: 'G4', color: 'bg-blue-500', name: 'G' },
    { note: 'A4', color: 'bg-indigo-500', name: 'A' },
    { note: 'B4', color: 'bg-purple-500', name: 'B' },
    { note: 'C5', color: 'bg-pink-500', name: 'C' }
  ]

  const playNote = useCallback(async (note, index) => {
    if (!isLoaded || !synthRef.current) return
    
    try {
      await ensureAudioContext()
      
      synthRef.current.triggerAttackRelease(note, '4n')
      setStruckBars(prev => new Set([...prev, index]))
      
      const timeoutId = setTimeout(() => {
        setStruckBars(prev => {
          const newBars = new Set(prev)
          newBars.delete(index)
          return newBars
        })
      }, 300)
      
      // Store timeout ID for cleanup
      return () => clearTimeout(timeoutId)
    } catch (error) {
      console.error('Error playing note:', error)
    }
  }, [isLoaded])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <button
          onClick={onHome}
          className="mb-4 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20"
        >
          ← Back to Instruments
        </button>
        <h1 className="text-4xl font-bold text-white mb-2">Xylophone</h1>
        <p className="text-gray-300">Click the colorful bars to create music</p>
        {!isLoaded && (
          <p className="text-yellow-300 mt-2">Loading audio...</p>
        )}
      </div>

      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-12 rounded-2xl shadow-2xl">
        <div className="flex items-end justify-center space-x-2">
          {bars.map((bar, index) => {
            const height = 200 - (index * 15)
            const isStruck = struckBars.has(index)
            
            return (
              <div key={bar.note} className="flex flex-col items-center">
                <button
                  className={`${bar.color} rounded-lg shadow-lg transition-all duration-200 transform relative overflow-hidden ${
                    isStruck 
                      ? 'scale-110 brightness-125 shadow-2xl' 
                      : 'hover:scale-105 hover:brightness-110 hover:shadow-xl'
                  } ${!isLoaded ? 'opacity-50' : ''}`}
                  style={{ 
                    width: '40px', 
                    height: `${height}px`,
                    marginBottom: `${index * 3}px`
                  }}
                  onMouseDown={() => playNote(bar.note, index)}
                  disabled={!isLoaded}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  
                  {isStruck && (
                    <div className="absolute inset-0 bg-white/40 animate-pulse" />
                  )}
                  
                  <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white text-xs font-bold drop-shadow-lg">
                    {bar.name}
                  </span>
                </button>
                
                <div className="mt-2 w-10 h-2 bg-gray-600 rounded-full" />
              </div>
            )
          })}
        </div>
        
        <div className="mt-8 flex justify-center">
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 h-4 w-80 rounded-full shadow-lg relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full" />
            <div className="absolute -left-2 -right-2 top-1/2 transform -translate-y-1/2 h-6 bg-gradient-to-r from-yellow-700 to-yellow-900 rounded-full shadow-inner" />
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-400">
        <p>8 colorful bars • Each bar plays a different note</p>
      </div>

      {/* Recording Control */}
      <div className="mt-8 max-w-md mx-auto">
        <RecordingControl instrument="Xylophone" />
      </div>
    </div>
  )
}

Xylophone.propTypes = {
  volume: PropTypes.number.isRequired,
  onHome: PropTypes.func.isRequired
}

export default Xylophone