import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', color: '#fff', backgroundColor: '#b91c1c', minHeight: '100vh', width: '100vw', boxSizing: 'border-box', overflowY: 'auto', zIndex: 999999, position: 'relative' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 16px 0' }}>Application Error</h2>
          <div style={{ backgroundColor: '#7f1d1d', padding: '16px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 8px 0', wordBreak: 'break-word' }}>
              {this.state.error?.name || 'Error'}
            </h3>
            <p style={{ fontSize: '16px', margin: 0, wordBreak: 'break-word', lineHeight: 1.5 }}>
              {this.state.error?.message}
            </p>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 12px 0' }}>Stack Trace:</h3>
            <pre style={{ fontSize: '13px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', backgroundColor: '#000', padding: '16px', borderRadius: '12px', overflowX: 'auto', margin: 0, lineHeight: 1.4 }}>
              {this.state.error?.stack || 'No stack trace available'}
            </pre>
          </div>
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 12px 0' }}>Component Stack:</h3>
            <pre style={{ fontSize: '13px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', backgroundColor: '#000', padding: '16px', borderRadius: '12px', overflowX: 'auto', margin: 0, lineHeight: 1.4 }}>
              {this.state.errorInfo?.componentStack || 'No component stack available'}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
