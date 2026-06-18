import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** When this changes (e.g. route path), a caught error is cleared. */
  resetKey?: string
}

interface State {
  error: Error | null
}

/**
 * Catches render/runtime errors in the routed page so a single broken page
 * shows a recoverable error card instead of blanking the whole admin app.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    // Surface it for debugging
    console.error('[admin] page error:', error)
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
          <p className="text-lg font-semibold text-foreground">Something went wrong on this page</p>
          <p className="max-w-md text-sm text-muted-foreground">{this.state.error.message}</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-2 rounded-md border border-[#1e2a4a] bg-[#0D1836] px-4 py-2 text-sm text-foreground hover:bg-white/[0.04]"
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
