import * as Tone from 'tone'

class RecordingService {
  constructor() {
    this.mediaRecorder = null
    this.recordingChunks = []
    this.isRecording = false
    this.recordingStartTime = null
    this.maxRecordingDuration = 5 * 60 * 1000 // 5 minutes in milliseconds
    this.onDataAvailable = null
    this.onRecordingStop = null
    this.onRecordingStart = null
    this.onTimeUpdate = null
    this.timeUpdateInterval = null
  }

  async initialize() {
    try {
      // Create a MediaStreamDestination from Tone.js context
      const dest = Tone.context.createMediaStreamDestination()
      
      // Connect Tone.js destination to our recording destination
      Tone.getDestination().connect(dest)
      
      // Create MediaRecorder with the stream
      this.mediaRecorder = new MediaRecorder(dest.stream, {
        mimeType: this.getSupportedMimeType()
      })
      
      // Set up event handlers
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordingChunks.push(event.data)
        }
      }
      
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordingChunks, { 
          type: this.mediaRecorder.mimeType 
        })
        
        if (this.onRecordingStop) {
          this.onRecordingStop(blob)
        }
        
        this.cleanup()
      }
      
      this.mediaRecorder.onstart = () => {
        this.recordingStartTime = Date.now()
        this.isRecording = true
        
        if (this.onRecordingStart) {
          this.onRecordingStart()
        }
        
        // Start time update interval
        this.timeUpdateInterval = setInterval(() => {
          if (this.isRecording && this.onTimeUpdate) {
            const elapsed = Date.now() - this.recordingStartTime
            this.onTimeUpdate(elapsed)
            
            // Auto-stop at max duration
            if (elapsed >= this.maxRecordingDuration) {
              this.stopRecording()
            }
          }
        }, 100) // Update every 100ms
      }
      
      return true
    } catch (error) {
      console.error('Failed to initialize recording service:', error)
      throw error
    }
  }

  getSupportedMimeType() {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus'
    ]
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }
    
    return '' // Let browser choose default
  }

  startRecording() {
    if (!this.mediaRecorder) {
      throw new Error('Recording service not initialized')
    }
    
    if (this.isRecording) {
      throw new Error('Recording already in progress')
    }
    
    this.recordingChunks = []
    this.mediaRecorder.start(1000) // Collect data every second
  }

  stopRecording() {
    if (!this.isRecording || !this.mediaRecorder) {
      return
    }
    
    this.mediaRecorder.stop()
  }

  cleanup() {
    this.isRecording = false
    this.recordingStartTime = null
    this.recordingChunks = []
    
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval)
      this.timeUpdateInterval = null
    }
  }

  getRecordingDuration() {
    if (!this.isRecording || !this.recordingStartTime) {
      return 0
    }
    
    return Date.now() - this.recordingStartTime
  }

  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  setOnRecordingStart(callback) {
    this.onRecordingStart = callback
  }

  setOnRecordingStop(callback) {
    this.onRecordingStop = callback
  }

  setOnTimeUpdate(callback) {
    this.onTimeUpdate = callback
  }

  isSupported() {
    return typeof MediaRecorder !== 'undefined' && 
           typeof MediaRecorder.isTypeSupported === 'function'
  }
}

// Export singleton instance
export const recordingService = new RecordingService()
export default recordingService