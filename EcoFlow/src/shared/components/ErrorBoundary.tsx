import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary captured an error', error, errorInfo)
  }

  override render() {
    if (this.state.hasError) {
      return (
        <section className="page-card">
          <h2>Algo falló</h2>
          <p className="subtle">Intenta recargar la sección o revisar la ruta actual.</p>
        </section>
      )
    }

    return this.props.children
  }
}