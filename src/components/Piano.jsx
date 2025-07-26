import { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import * as Tone from 'tone'
import { initializeAudio, ensureAudioContext } from '../utils/audioContext'

const Piano = ({ volume, onHome }) => {
  const [pressedKeys, setPressedKeys] = useState(new Set())
  const [isLoaded, setIsLoaded] = useState(false)
  const synthRef = useRef(null)

  useEffect(() => {
    const initAudio = async () => {
      try {
        await initializeAudio()
        
        synthRef.current = new Tone.Synth({
          oscillator: {
            type: 'triangle'
          },
          envelope: {
            attack: 0.1,
            decay: 0.2,
            sustain: 0.5,
            release: 0.8
          }
        }).toDestination()
        
        setIsLoaded(true)
      } catch (error) {
        console.error('Failed to initialize piano audio:', error)
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

  const notes = [
    // Octave 3
    { note: 'C3', type: 'white', position: 0 },
    { note: 'C#3', type: 'black', position: 0.5 },
    { note: 'D3', type: 'white', position: 1 },
    { note: 'D#3', type: 'black', position: 1.5 },
    { note: 'E3', type: 'white', position: 2 },
    { note: 'F3', type: 'white', position: 3 },
    { note: 'F#3', type: 'black', position: 3.5 },
    { note: 'G3', type: 'white', position: 4 },
    { note: 'G#3', type: 'black', position: 4.5 },
    { note: 'A3', type: 'white', position: 5 },
    { note: 'A#3', type: 'black', position: 5.5 },
    { note: 'B3', type: 'white', position: 6 },
    
    // Octave 4
    { note: 'C4', type: 'white', position: 7 },
    { note: 'C#4', type: 'black', position: 7.5 },
    { note: 'D4', type: 'white', position: 8 },
    { note: 'D#4', type: 'black', position: 8.5 },
    { note: 'E4', type: 'white', position: 9 },
    { note: 'F4', type: 'white', position: 10 },
    { note: 'F#4', type: 'black', position: 10.5 },
    { note: 'G4', type: 'white', position: 11 },
    { note: 'G#4', type: 'black', position: 11.5 },
    { note: 'A4', type: 'white', position: 12 },
    { note: 'A#4', type: 'black', position: 12.5 },
    { note: 'B4', type: 'white', position: 13 },
    
    // Octave 5
    { note: 'C5', type: 'white', position: 14 },
    { note: 'C#5', type: 'black', position: 14.5 },
    { note: 'D5', type: 'white', position: 15 },
    { note: 'D#5', type: 'black', position: 15.5 },
    { note: 'E5', type: 'white', position: 16 },
    { note: 'F5', type: 'white', position: 17 },
    { note: 'F#5', type: 'black', position: 17.5 },
    { note: 'G5', type: 'white', position: 18 },
    { note: 'G#5', type: 'black', position: 18.5 },
    { note: 'A5', type: 'white', position: 19 },
    { note: 'A#5', type: 'black', position: 19.5 },
    { note: 'B5', type: 'white', position: 20 }
  ]

  const playNote = useCallback(async (note) => {
    if (!isLoaded || !synthRef.current) return
    
    try {
      await ensureAudioContext()
      
      synthRef.current.triggerAttackRelease(note, '8n')
      setPressedKeys(prev => new Set([...prev, note]))
      
      const timeoutId = setTimeout(() => {
        setPressedKeys(prev => {
          const newKeys = new Set(prev)
          newKeys.delete(note)
          return newKeys
        })
      }, 150)
      
      // Store timeout ID for cleanup
      return () => clearTimeout(timeoutId)
    } catch (error) {
      console.error('Error playing note:', error)
    }
  }, [isLoaded])

  const whiteKeys = notes.filter(n => n.type === 'white')
  const blackKeys = notes.filter(n => n.type === 'black')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <button
          onClick={onHome}
          className="mb-4 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20"
        >
          ← Back to Instruments
        </button>
        <h1 className="text-4xl font-bold text-white mb-2">Piano</h1>
        <p className="text-gray-300">Click the keys to play notes</p>
        {!isLoaded && (
          <p className="text-yellow-300 mt-2">Loading audio...</p>
        )}
      </div>

      <div className="relative bg-gray-800 p-8 rounded-2xl shadow-2xl">
        <div className="relative flex">
          {whiteKeys.map((key) => (
            <button
              key={key.note}
              className={`w-12 h-48 bg-white border-2 border-gray-300 rounded-b-lg shadow-lg transition-all duration-75 transform ${
                pressedKeys.has(key.note) 
                  ? 'bg-gray-200 scale-95 shadow-inner' 
                  : 'hover:bg-gray-100 hover:shadow-xl'
              } ${!isLoaded ? 'opacity-50' : ''}`}
              onMouseDown={() => playNote(key.note)}
              disabled={!isLoaded}
            >
              <span className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-gray-600 text-xs font-semibold">
                {key.note}
              </span>
            </button>
          ))}
        </div>
        
        <div className="absolute top-8 left-8 flex">
          {blackKeys.map((key) => (
            <button
              key={key.note}
              className={`absolute w-8 h-32 bg-gray-900 rounded-b-lg shadow-lg transition-all duration-75 transform ${
                pressedKeys.has(key.note) 
                  ? 'bg-gray-700 scale-95 shadow-inner' 
                  : 'hover:bg-gray-800 hover:shadow-xl'
              } ${!isLoaded ? 'opacity-50' : ''}`}
              style={{ left: `${key.position * 48 - 16}px` }}
              onMouseDown={() => playNote(key.note)}
              disabled={!isLoaded}
            >
              <span className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xs font-semibold">
                {key.note}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center text-gray-400">
        <p>3 full octaves • Click and hold for sustained notes</p>
      </div>
    </div>
  )
}

Piano.propTypes = {
  volume: PropTypes.number.isRequired,
  onHome: PropTypes.func.isRequired
}

export default Piano