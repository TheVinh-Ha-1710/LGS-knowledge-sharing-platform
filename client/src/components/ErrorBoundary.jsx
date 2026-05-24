import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-page" style={{ textAlign: 'center', paddingTop: 80 }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⚠</div>
          <h2 style={{
            fontSize: 18,
            fontWeight: 500,
            color: 'var(--text)',
            marginBottom: 8
          }}>
            Something went wrong
          </h2>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--text-3)',
            marginBottom: 24
          }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            className="btn btn-ghost"
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
          >
            Reload page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary