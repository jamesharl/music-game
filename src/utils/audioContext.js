import * as Tone from 'tone'

let isInitialized = false
let initializationPromise = null

export const initializeAudio = async () => {
  // If already initialized, return immediately
  if (isInitialized) {
    return true
  }

  // If initialization is in progress, wait for it
  if (initializationPromise) {
    return initializationPromise
  }

  // Start initialization
  initializationPromise = (async () => {
    try {
      if (Tone.context.state !== 'running') {
        await Tone.start()
      }
      isInitialized = true
      return true
    } catch (error) {
      console.error('Failed to initialize audio context:', error)
      throw error
    } finally {
      initializationPromise = null
    }
  })()

  return initializationPromise
}

export const ensureAudioContext = async () => {
  if (Tone.context.state !== 'running') {
    return initializeAudio()
  }
  return true
}