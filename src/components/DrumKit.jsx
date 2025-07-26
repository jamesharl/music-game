import { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import * as Tone from 'tone'
import { initializeAudio, ensureAudioContext } from '../utils/audioContext'
import RecordingControl from './RecordingControl'

const DrumKit = ({ volume, onHome }) => {
  const [hitDrums, setHitDrums] = useState(new Set())
  const [isLoaded, setIsLoaded] = useState(false)
  const drumsRef = useRef({})

  useEffect(() => {
    const initAudio = async () => {
      try {
        await initializeAudio()
      
      drumsRef.current = {
        kick: new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 10,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
        }).toDestination(),
        
        snare: new Tone.NoiseSynth({
          noise: { type: 'white' },
          envelope: { attack: 0.005, decay: 0.1, sustain: 0.0 }
        }).toDestination(),
        
        hihat: new Tone.MetalSynth({
          frequency: 200,
          envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
          harmonicity: 5.1,
          modulationIndex: 32,
          resonance: 4000,
          octaves: 1.5
        }).toDestination(),
        
        crash: new Tone.MetalSynth({
          frequency: 300,
          envelope: { attack: 0.001, decay: 1, release: 3 },
          harmonicity: 5.1,
          modulationIndex: 64,
          resonance: 4000,
          octaves: 1.5
        }).toDestination(),
        
        tom1: new Tone.MembraneSynth({
          pitchDecay: 0.008,
          octaves: 2,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.5, sustain: 0.01, release: 1 }
        }).toDestination(),
        
        tom2: new Tone.MembraneSynth({
          pitchDecay: 0.008,
          octaves: 2,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.5, sustain: 0.01, release: 1 }
        }).toDestination()
      }
      
      setIsLoaded(true)
      } catch (error) {
        console.error('Failed to initialize drum kit audio:', error)
        throw error
      }
    }

    initAudio()
    
    return () => {
      Object.values(drumsRef.current).forEach(drum => {
        if (drum && drum.dispose) {
          drum.dispose()
        }
      })
    }
  }, [])

  useEffect(() => {
    Object.values(drumsRef.current).forEach(drum => {
      if (drum && drum.volume) {
        drum.volume.value = Tone.gainToDb(volume)
      }
    })
  }, [volume])

  const playDrum = useCallback(async (drumType) => {
    if (!isLoaded || !drumsRef.current[drumType]) return
    
    try {
      await ensureAudioContext()
      
      const drum = drumsRef.current[drumType]
      
      if (drumType === 'kick') {
        drum.triggerAttackRelease('C1', '8n')
      } else if (drumType === 'snare') {
        drum.triggerAttackRelease('4n')
      } else if (drumType === 'hihat') {
        drum.triggerAttackRelease('C4', '32n')
      } else if (drumType === 'crash') {
        drum.triggerAttackRelease('C4', '4n')
      } else if (drumType === 'tom1') {
        drum.triggerAttackRelease('G2', '8n')
      } else if (drumType === 'tom2') {
        drum.triggerAttackRelease('C2', '8n')
      }
      
      setHitDrums(prev => new Set([...prev, drumType]))
      
      const timeoutId = setTimeout(() => {
        setHitDrums(prev => {
          const newDrums = new Set(prev)
          newDrums.delete(drumType)
          return newDrums
        })
      }, 200)
      
      // Store timeout ID for cleanup
      return () => clearTimeout(timeoutId)
    } catch (error) {
      console.error('Error playing drum:', error)
    }
  }, [isLoaded])

  const drums = [
    {
      id: 'crash',
      name: 'Crash',
      position: 'top-4 right-8',
      size: 'w-24 h-24',
      color: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      shadow: 'shadow-yellow-500/50'
    },
    {
      id: 'tom1',
      name: 'Tom 1',
      position: 'top-12 left-1/3',
      size: 'w-16 h-12',
      color: 'bg-gradient-to-br from-red-500 to-red-700',
      shadow: 'shadow-red-500/50'
    },
    {
      id: 'tom2',
      name: 'Tom 2',
      position: 'top-12 right-1/3',
      size: 'w-20 h-14',
      color: 'bg-gradient-to-br from-red-600 to-red-800',
      shadow: 'shadow-red-600/50'
    },
    {
      id: 'hihat',
      name: 'Hi-Hat',
      position: 'top-4 left-8',
      size: 'w-20 h-20',
      color: 'bg-gradient-to-br from-gray-400 to-gray-600',
      shadow: 'shadow-gray-500/50'
    },
    {
      id: 'snare',
      name: 'Snare',
      position: 'bottom-20 left-1/2 transform -translate-x-1/2',
      size: 'w-20 h-8',
      color: 'bg-gradient-to-br from-gray-300 to-gray-500',
      shadow: 'shadow-gray-400/50'
    },
    {
      id: 'kick',
      name: 'Kick',
      position: 'bottom-4 left-1/2 transform -translate-x-1/2',
      size: 'w-32 h-32',
      color: 'bg-gradient-to-br from-gray-800 to-black',
      shadow: 'shadow-gray-800/50'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <button
          onClick={onHome}
          className="mb-4 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20"
        >
          ← Back to Instruments
        </button>
        <h1 className="text-4xl font-bold text-white mb-2">Drum Kit</h1>
        <p className="text-gray-300">Click the drums to create rhythmic beats</p>
        {!isLoaded && (
          <p className="text-yellow-300 mt-2">Loading audio...</p>
        )}
      </div>

      <div className="relative w-96 h-96 bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl p-8">
        {drums.map((drum) => {
          const isHit = hitDrums.has(drum.id)
          
          return (
            <button
              key={drum.id}
              className={`absolute ${drum.position} ${drum.size} ${drum.color} rounded-full transition-all duration-150 transform ${
                isHit 
                  ? 'scale-110 brightness-125 shadow-2xl' 
                  : 'hover:scale-105 hover:brightness-110 hover:shadow-xl'
              } ${drum.shadow} ${!isLoaded ? 'opacity-50' : ''} border-2 border-white/20`}
              onMouseDown={() => playDrum(drum.id)}
              disabled={!isLoaded}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-full" />
              
              {isHit && (
                <div className="absolute inset-0 bg-white/40 rounded-full animate-ping" />
              )}
              
              <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold drop-shadow-lg">
                {drum.name}
              </span>
            </button>
          )
        })}
        
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-2">
            <div className="w-2 h-8 bg-gray-600 rounded" />
            <div className="w-2 h-8 bg-gray-600 rounded" />
            <div className="w-2 h-8 bg-gray-600 rounded" />
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-400">
        <p>Complete drum kit • Kick, Snare, Hi-Hat, Crash, and Toms</p>
      </div>

      {/* Recording Control */}
      <div className="mt-8 max-w-md mx-auto">
        <RecordingControl instrument="Drum Kit" />
      </div>
    </div>
  )
}

DrumKit.propTypes = {
  volume: PropTypes.number.isRequired,
  onHome: PropTypes.func.isRequired
}

export default DrumKit