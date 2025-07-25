const VolumeControl = ({ volume, onVolumeChange }) => {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-white/10">
        <div className="flex items-center space-x-3">
          <span className="text-white text-sm">🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-white text-xs min-w-[3ch]">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  )
}

export default VolumeControl