import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
    console.error("Dashboard error:", error);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{
          padding: "32px",
          textAlign: "center",
          fontFamily: "ui-monospace, monospace",
          color: "#f7f3df",
          background: "#101922",
          minHeight: "100vh"
        }}>
          <h2 style={{ color: "#ff5a68" }}>Dashboard Error</h2>
          <p style={{ color: "#8a9098" }}>Something went wrong. Please refresh the page.</p>
          <pre style={{ color: "#9c6cff", fontSize: "12px", marginTop: "16px" }}>
            {this.state.error?.message ?? "Unknown error"}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}