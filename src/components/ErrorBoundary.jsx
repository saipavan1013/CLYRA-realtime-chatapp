import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[React Error Boundary Caught]', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const containerStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#0b0f19',
        color: '#f3f4f6',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '20px',
        boxSizing: 'border-box',
      };

      const cardStyle = {
        maxWidth: '500px',
        width: '100%',
        backgroundColor: '#111827',
        border: '1px solid #1f2937',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        textAlign: 'center',
      };

      const iconStyle = {
        fontSize: '3rem',
        marginBottom: '16px',
      };

      const titleStyle = {
        fontSize: '1.5rem',
        fontWeight: '800',
        color: '#ffffff',
        margin: '0 0 12px 0',
        letterSpacing: '-0.025em',
      };

      const descStyle = {
        fontSize: '0.9rem',
        lineHeight: '1.6',
        color: '#9ca3af',
        margin: '0 0 24px 0',
      };

      const errorTextStyle = {
        backgroundColor: '#ef444412',
        border: '1px solid #ef444433',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '0.85rem',
        fontFamily: 'monospace',
        color: '#f87171',
        margin: '0 0 24px 0',
        wordBreak: 'break-word',
        textAlign: 'left',
      };

      const buttonStyle = {
        padding: '10px 20px',
        borderRadius: '8px',
        border: 'none',
        background: 'var(--accent, #3b82f6)',
        color: '#ffffff',
        fontWeight: '600',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'opacity 0.2s',
      };

      return (
        <div style={containerStyle}>
          <div style={cardStyle}>
            <div style={iconStyle}>🪐</div>
            <h1 style={titleStyle}>Application Crash Caught</h1>
            <p style={descStyle}>
              Oops! A critical error occurred in the user interface. We've captured the technical details below.
            </p>
            <div style={errorTextStyle}>
              {this.state.error ? this.state.error.toString() : 'Unknown runtime crash'}
            </div>
            <button style={buttonStyle} onClick={this.handleReload}>
              🔄 Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
