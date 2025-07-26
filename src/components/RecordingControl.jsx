import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import recordingService from '../utils/recordingService'
import storageService from '../utils/storageService'

const RecordingControl = ({ instrument = 'Unknown' }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [recordings, setRecordings] = useState([])
  const [playingRecording, setPlayingRecording] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState(null)
  const [showRecordings, setShowRecordings] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    const initializeServices = async () => {
      try {
        if (!recordingService.isSupported()) {
          throw new Error('Recording is not supported in this browser')
        }
        
        if (!storageService.isSupported()) {
          throw new Error('Storage is not supported in this browser')
        }
        
        await recordingService.initialize()
        await storageService.initialize()
        
        // Set up recording service callbacks
        recordingService.setOnRecordingStart(() => {
          setIsRecording(true)
          setError(null)
        })
        
        recordingService.setOnRecordingStop(async (blob) => {
          setIsRecording(false)
          setRecordingDuration(0)
          
          try {
            const duration = recordingService.getRecordingDuration()
            const recording = await storageService.saveRecording(blob, {
              instrument,
              duration
            })
            
            // Refresh recordings list
            await loadRecordings()
          } catch (error) {
            console.error('Failed to save recording:', error)
            setError('Failed to save recording')
          }
        })
        
        recordingService.setOnTimeUpdate((elapsed) => {
          setRecordingDuration(elapsed)
        })
        
        await loadRecordings()
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize recording services:', error)
        setError(error.message)
      }
    }
    
    initializeServices()
  }, [instrument])

  const loadRecordings = async () => {
    try {
      const allRecordings = await storageService.getRecordingsByInstrument(instrument)
      setRecordings(allRecordings)
    } catch (error) {
      console.error('Failed to load recordings:', error)
      setError('Failed to load recordings')
    }
  }

  const startRecording = async () => {
    try {
      await recordingService.startRecording()
    } catch (error) {
      console.error('Failed to start recording:', error)
      setError('Failed to start recording')
    }
  }

  const stopRecording = () => {
    recordingService.stopRecording()
  }

  const playRecording = async (recording) => {
    try {
      if (playingRecording === recording.id) {
        // Stop current playback
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
        }
        setPlayingRecording(null)
        return
      }
      
      // Stop any currently playing recording
      if (audioRef.current) {
        audioRef.current.pause()
      }
      
      const audioUrl = URL.createObjectURL(recording.data)
      audioRef.current = new Audio(audioUrl)
      
      audioRef.current.onended = () => {
        setPlayingRecording(null)
        URL.revokeObjectURL(audioUrl)
      }
      
      audioRef.current.onerror = () => {
        setError('Failed to play recording')
        setPlayingRecording(null)
        URL.revokeObjectURL(audioUrl)
      }
      
      await audioRef.current.play()
      setPlayingRecording(recording.id)
    } catch (error) {
      console.error('Failed to play recording:', error)
      setError('Failed to play recording')
    }
  }

  const downloadRecording = (recording) => {
    try {
      const url = URL.createObjectURL(recording.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `${recording.name}.webm`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download recording:', error)
      setError('Failed to download recording')
    }
  }

  const deleteRecording = async (recording) => {
    try {
      await storageService.deleteRecording(recording.id)
      await loadRecordings()
      
      if (playingRecording === recording.id) {
        setPlayingRecording(null)
        if (audioRef.current) {
          audioRef.current.pause()
        }
      }
    } catch (error) {
      console.error('Failed to delete recording:', error)
      setError('Failed to delete recording')
    }
  }

  const formatDuration = (milliseconds) => {
    return recordingService.formatDuration(milliseconds)
  }

  if (!isInitialized && !error) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
        <p className="text-center">Loading recording features...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-4 text-white border border-red-500/30">
        <p className="text-center text-red-200">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white">
      {/* Recording Controls */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-16 h-16 rounded-full border-4 transition-all duration-200 flex items-center justify-center ${
            isRecording
              ? 'bg-red-500 border-red-400 animate-pulse'
              : 'bg-red-600 border-red-500 hover:bg-red-500'
          }`}
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          {isRecording ? (
            <div className="w-6 h-6 bg-white rounded-sm"></div>
          ) : (
            <div className="w-6 h-6 bg-white rounded-full"></div>
          )}
        </button>
        
        {isRecording && (
          <div className="text-center">
            <div className="text-2xl font-mono font-bold">
              {formatDuration(recordingDuration)}
            </div>
            <div className="text-sm text-gray-300">
              Max: {formatDuration(5 * 60 * 1000)}
            </div>
          </div>
        )}
      </div>

      {/* Recordings List Toggle */}
      <div className="text-center mb-4">
        <button
          onClick={() => setShowRecordings(!showRecordings)}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all duration-200"
        >
          {showRecordings ? 'Hide' : 'Show'} Recordings ({recordings.length})
        </button>
      </div>

      {/* Recordings List */}
      {showRecordings && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {recordings.length === 0 ? (
            <p className="text-center text-gray-300 py-4">No recordings yet</p>
          ) : (
            recordings.map((recording) => (
              <div key={recording.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{recording.name}</h4>
                    <p className="text-xs text-gray-300">
                      {formatDuration(recording.duration)} • {storageService.formatFileSize(recording.size)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(recording.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => playRecording(recording)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                        playingRecording === recording.id
                          ? 'bg-green-500 hover:bg-green-400'
                          : 'bg-blue-500 hover:bg-blue-400'
                      }`}
                      title={playingRecording === recording.id ? 'Stop' : 'Play'}
                    >
                      {playingRecording === recording.id ? (
                        <div className="w-3 h-3 bg-white rounded-sm"></div>
                      ) : (
                        <div className="w-0 h-0 border-l-[6px] border-l-white border-y-[4px] border-y-transparent ml-0.5"></div>
                      )}
                    </button>
                    
                    <button
                      onClick={() => downloadRecording(recording)}
                      className="w-8 h-8 rounded-full bg-purple-500 hover:bg-purple-400 flex items-center justify-center transition-all duration-200"
                      title="Download"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => deleteRecording(recording)}
                      className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center transition-all duration-200"
                      title="Delete"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

RecordingControl.propTypes = {
  instrument: PropTypes.string
}

export default RecordingControl