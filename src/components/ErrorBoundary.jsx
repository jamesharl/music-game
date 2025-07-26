import React from 'react'
import PropTypes from 'prop-types'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center px-4">
          <div className="bg-red-50 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-lg">
            <h2 className="text-2xl font-bold mb-3">Oops! Something went wrong</h2>
            <p className="mb-3">
              {this.state.error && this.state.error.toString()}
            </p>
            {this.state.error?.message?.includes('audio') && (
              <p className="mb-3 text-sm">
                This might be an audio initialization issue. Please ensure your browser supports Web Audio API 
                and that you&apos;ve allowed audio permissions.
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
}

export default ErrorBoundary