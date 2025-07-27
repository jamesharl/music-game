import { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import * as Tone from 'tone'
import { initializeAudio, ensureAudioContext } from '../utils/audioContext'
import RecordingControl from './RecordingControl'

const Guitar = ({ volume, onHome }) => {
  const [pressedFrets, setPressedFrets] = useState({})
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedChord, setSelectedChord] = useState(null)
  const [animatingStrings, setAnimatingStrings] = useState(new Set())
  const synthRef = useRef(null)

  // Guitar string tuning (from lowest to highest string)
  const stringTuning = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']
  const stringNames = ['E', 'A', 'D', 'G', 'B', 'E']

  // Chord definitions (fret positions for each string, -1 means don't play)
  const chords = {
    C: ['-1', '3', '2', '0', '1', '0'], // C major
    G: ['3', '2', '0', '0', '3', '3'],   // G major  
    D: ['-1', '-1', '0', '2', '3', '2'], // D major
    E: ['0', '2', '2', '1', '0', '0'],   // E major
    A: ['-1', '0', '2', '2', '2', '0']   // A major
  }

  useEffect(() => {
    const initAudio = async () => {
      try {
        await initializeAudio()
        
        synthRef.current = new Tone.PluckSynth({
          attackNoise: 1,
          dampening: 4000,
          resonance: 0.7
        }).toDestination()
        
        setIsLoaded(true)
      } catch (error) {
        console.error('Failed to initialize guitar audio:', error)
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

  // Calculate note from string and fret
  const getNoteFromFret = (stringIndex, fret) => {
    const baseNote = stringTuning[stringIndex]
    if (fret === 0) return baseNote
    
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const baseNoteMatch = baseNote.match(/([A-G]#?)(\d+)/)
    const baseNoteName = baseNoteMatch[1]
    const baseOctave = parseInt(baseNoteMatch[2])
    
    const baseNoteIndex = noteNames.indexOf(baseNoteName)
    const newNoteIndex = (baseNoteIndex + fret) % 12
    const newOctave = baseOctave + Math.floor((baseNoteIndex + fret) / 12)
    
    return noteNames[newNoteIndex] + newOctave
  }

  // Play a single note
  const playNote = useCallback(async (note, stringIndex) => {
    if (!isLoaded || !synthRef.current) return
    
    try {
      await ensureAudioContext()
      
      synthRef.current.triggerAttackRelease(note, '2n')
      
      // String animation
      setAnimatingStrings(prev => new Set([...prev, stringIndex]))
      setTimeout(() => {
        setAnimatingStrings(prev => {
          const newSet = new Set(prev)
          newSet.delete(stringIndex)
          return newSet
        })
      }, 300)
      
    } catch (error) {
      console.error('Error playing note:', error)
    }
  }, [isLoaded])

  // Handle fret selection
  const selectFret = (stringIndex, fret) => {
    setPressedFrets(prev => ({
      ...prev,
      [stringIndex]: fret
    }))
    setSelectedChord(null) // Clear chord selection when manually fretting
  }

  // Strum a string
  const strumString = (stringIndex) => {
    const fret = pressedFrets[stringIndex] || 0
    const note = getNoteFromFret(stringIndex, fret)
    playNote(note, stringIndex)
  }

  // Select and display a chord
  const selectChord = (chordName) => {
    setSelectedChord(chordName)
    const chord = chords[chordName]
    const newFrets = {}
    
    chord.forEach((fret, stringIndex) => {
      if (fret !== '-1') {
        newFrets[stringIndex] = parseInt(fret)
      }
    })
    
    setPressedFrets(newFrets)
  }

  // Strum all strings for a chord
  const strumChord = () => {
    if (!selectedChord) return
    
    const chord = chords[selectedChord]
    chord.forEach((fret, stringIndex) => {
      if (fret !== '-1') {
        setTimeout(() => {
          strumString(stringIndex)
        }, stringIndex * 50) // Slight delay between strings for realism
      }
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <button
          onClick={onHome}
          className="mb-4 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20"
        >
          ← Back to Instruments
        </button>
        <h1 className="text-4xl font-bold text-white mb-2">Guitar</h1>
        <p className="text-gray-300">Click frets to select notes, then click strings to strum</p>
        {!isLoaded && (
          <p className="text-yellow-300 mt-2">Loading audio...</p>
        )}
      </div>

      {/* Chord Selection */}
      <div className="mb-6">
        <h3 className="text-white text-lg mb-3 text-center">Chord Presets</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {Object.keys(chords).map((chordName) => (
            <button
              key={chordName}
              onClick={() => selectChord(chordName)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedChord === chordName
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'bg-white/20 hover:bg-white/30 text-white border border-white/20'
              } ${!isLoaded ? 'opacity-50' : ''}`}
              disabled={!isLoaded}
            >
              {chordName}
            </button>
          ))}
          {selectedChord && (
            <button
              onClick={strumChord}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 ml-4"
              disabled={!isLoaded}
            >
              Strum All
            </button>
          )}
        </div>
      </div>

      {/* Guitar Fretboard */}
      <div className="relative bg-amber-900 p-8 rounded-2xl shadow-2xl border-4 border-amber-800">
        {/* Fret markers */}
        <div className="absolute top-2 left-8 right-8 flex justify-between">
          {[3, 5, 7, 9, 12].map(fret => (
            <div key={fret} className="w-4 h-4 bg-white/30 rounded-full"></div>
          ))}
        </div>

        {/* Fretboard */}
        <div className="relative">
          {/* Frets */}
          <div className="grid grid-cols-13 gap-0 mb-4">
            {/* String labels */}
            <div className="flex flex-col gap-4">
              {stringNames.map((stringName, stringIndex) => (
                <div key={stringIndex} className="w-8 h-8 flex items-center justify-center text-white font-bold text-sm">
                  {stringName}
                </div>
              ))}
            </div>
            
            {/* Fret grid */}
            {Array.from({ length: 12 }, (_, fret) => (
              <div key={fret} className="flex flex-col gap-4">
                {stringNames.map((_, stringIndex) => (
                  <button
                    key={`${stringIndex}-${fret + 1}`}
                    onClick={() => selectFret(stringIndex, fret + 1)}
                    className={`w-8 h-8 border border-amber-700 rounded transition-all duration-150 ${
                      pressedFrets[stringIndex] === fret + 1
                        ? 'bg-yellow-400 border-yellow-500 shadow-lg'
                        : 'bg-amber-800 hover:bg-amber-700'
                    } ${!isLoaded ? 'opacity-50' : ''}`}
                    disabled={!isLoaded}
                  >
                    <span className="text-xs text-white/70">{fret + 1}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Strings */}
          <div className="flex flex-col gap-4 mt-8">
            {stringNames.map((stringName, stringIndex) => (
              <div key={stringIndex} className="flex items-center gap-2">
                <span className="text-white text-sm w-8">{stringName}</span>
                <button
                  onClick={() => strumString(stringIndex)}
                  className={`flex-1 h-2 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full transition-all duration-200 transform ${
                    animatingStrings.has(stringIndex)
                      ? 'animate-pulse scale-105 bg-gradient-to-r from-yellow-400 to-yellow-600'
                      : 'hover:scale-105 hover:from-gray-300 hover:to-gray-500'
                  } ${!isLoaded ? 'opacity-50' : ''}`}
                  disabled={!isLoaded}
                  style={{
                    height: `${Math.max(2, 4 - stringIndex * 0.5)}px`
                  }}
                />
                <span className="text-white/70 text-xs w-12">
                  {pressedFrets[stringIndex] ? 
                    getNoteFromFret(stringIndex, pressedFrets[stringIndex]) : 
                    stringTuning[stringIndex]
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-400">
        <p>6-string guitar • Standard tuning (E-A-D-G-B-E)</p>
        <p>Click frets to select notes, click strings to play</p>
      </div>

      {/* Recording Control */}
      <div className="mt-8 max-w-md mx-auto">
        <RecordingControl instrument="Guitar" />
      </div>
    </div>
  )
}

Guitar.propTypes = {
  volume: PropTypes.number.isRequired,
  onHome: PropTypes.func.isRequired
}

export default Guitar