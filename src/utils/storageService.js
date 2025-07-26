const DB_NAME = 'MusicGameRecordings'
const DB_VERSION = 1
const STORE_NAME = 'recordings'

class StorageService {
  constructor() {
    this.db = null
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      
      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'))
      }
      
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        
        // Create recordings store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { 
            keyPath: 'id', 
            autoIncrement: true 
          })
          
          // Create indexes
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('name', 'name', { unique: false })
          store.createIndex('instrument', 'instrument', { unique: false })
        }
      }
    })
  }

  async saveRecording(blob, metadata = {}) {
    if (!this.db) {
      throw new Error('Storage service not initialized')
    }
    
    const recording = {
      name: metadata.name || `Recording ${new Date().toLocaleString()}`,
      instrument: metadata.instrument || 'Unknown',
      timestamp: Date.now(),
      duration: metadata.duration || 0,
      mimeType: blob.type,
      size: blob.size,
      data: blob
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.add(recording)
      
      request.onsuccess = () => {
        resolve({
          id: request.result,
          ...recording
        })
      }
      
      request.onerror = () => {
        reject(new Error('Failed to save recording'))
      }
    })
  }

  async getRecording(id) {
    if (!this.db) {
      throw new Error('Storage service not initialized')
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(id)
      
      request.onsuccess = () => {
        resolve(request.result)
      }
      
      request.onerror = () => {
        reject(new Error('Failed to get recording'))
      }
    })
  }

  async getAllRecordings() {
    if (!this.db) {
      throw new Error('Storage service not initialized')
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('timestamp')
      const request = index.getAll()
      
      request.onsuccess = () => {
        // Sort by timestamp descending (newest first)
        const recordings = request.result.sort((a, b) => b.timestamp - a.timestamp)
        resolve(recordings)
      }
      
      request.onerror = () => {
        reject(new Error('Failed to get recordings'))
      }
    })
  }

  async deleteRecording(id) {
    if (!this.db) {
      throw new Error('Storage service not initialized')
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(id)
      
      request.onsuccess = () => {
        resolve()
      }
      
      request.onerror = () => {
        reject(new Error('Failed to delete recording'))
      }
    })
  }

  async getRecordingsByInstrument(instrument) {
    if (!this.db) {
      throw new Error('Storage service not initialized')
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const index = store.index('instrument')
      const request = index.getAll(instrument)
      
      request.onsuccess = () => {
        // Sort by timestamp descending (newest first)
        const recordings = request.result.sort((a, b) => b.timestamp - a.timestamp)
        resolve(recordings)
      }
      
      request.onerror = () => {
        reject(new Error('Failed to get recordings by instrument'))
      }
    })
  }

  async updateRecordingName(id, newName) {
    if (!this.db) {
      throw new Error('Storage service not initialized')
    }
    
    const recording = await this.getRecording(id)
    if (!recording) {
      throw new Error('Recording not found')
    }
    
    recording.name = newName
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put(recording)
      
      request.onsuccess = () => {
        resolve(recording)
      }
      
      request.onerror = () => {
        reject(new Error('Failed to update recording name'))
      }
    })
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  isSupported() {
    return typeof indexedDB !== 'undefined'
  }
}

// Export singleton instance
export const storageService = new StorageService()
export default storageService