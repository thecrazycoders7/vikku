import { Component } from 'react'

const CHUNK_ERROR_RE = /Failed to fetch dynamically imported module|Loading chunk .* failed|error loading dynamically imported module/i

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, reloading: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info)
    // A new deploy replaced this tab's JS chunk hashes - reload once to pick
    // up the current build instead of showing a scary error for a non-issue.
    if (CHUNK_ERROR_RE.test(error?.message || '') && !sessionStorage.getItem('vikku-chunk-reload')) {
      sessionStorage.setItem('vikku-chunk-reload', '1')
      this.setState({ reloading: true })
      window.location.reload()
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.assign('/')
  }

  render() {
    if (this.state.reloading) return null

    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
          <h1 className="font-display font-bold text-2xl mb-2">Something went wrong</h1>
          <p className="text-white/60 text-sm max-w-md mb-3">
            An unexpected error occurred. Please try reloading the page.
          </p>
          {this.state.error && (
            <p className="text-red-400/70 text-xs font-mono max-w-lg mb-6 px-4 py-2 bg-red-500/10 rounded-lg border border-red-500/20">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.handleReload}
            className="btn-primary px-5 py-2.5 text-xs rounded-lg"
          >
            Back to Home
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
