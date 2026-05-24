import React from 'react';

export function FirebaseConfigError({ errorMessage }) {
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
    maxWidth: '560px',
    width: '100%',
    backgroundColor: '#111827',
    border: '1px solid #1f2937',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
  };

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#3b82f61a',
    color: '#3b82f6',
    border: '1px solid #3b82f633',
    marginBottom: '16px',
  };

  const titleStyle = {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 12px 0',
    letterSpacing: '-0.025em',
  };

  const descStyle = {
    fontSize: '0.95rem',
    lineHeight: '1.6',
    color: '#9ca3af',
    margin: '0 0 24px 0',
  };

  const errorContainerStyle = {
    backgroundColor: '#ef444412',
    border: '1px solid #ef444433',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
  };

  const errorHeaderStyle = {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#f87171',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '6px',
  };

  const errorTextStyle = {
    fontSize: '0.9rem',
    fontFamily: 'monospace',
    color: '#f87171',
    margin: 0,
    wordBreak: 'break-word',
  };

  const stepsContainerStyle = {
    borderTop: '1px solid #1f2937',
    paddingTop: '24px',
  };

  const stepTitleStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '12px',
  };

  const codeBlockStyle = {
    backgroundColor: '#030712',
    border: '1px solid #1f2937',
    borderRadius: '8px',
    padding: '16px',
    fontSize: '0.85rem',
    fontFamily: 'monospace',
    color: '#60a5fa',
    overflowX: 'auto',
    margin: '0 0 16px 0',
    lineHeight: '1.5',
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={badgeStyle}>
          ⚠️ FIREBASE CONFIGURATION ERROR
        </div>
        <h1 style={titleStyle}>Database Setup Required</h1>
        <p style={descStyle}>
          CLYRA could not connect to Firebase because the configuration variables are missing or incorrect. Follow the steps below to fix the installation.
        </p>

        <div style={errorContainerStyle}>
          <div style={errorHeaderStyle}>Error Details</div>
          <p style={errorTextStyle}>{errorMessage || 'Missing configuration variables'}</p>
        </div>

        <div style={stepsContainerStyle}>
          <h2 style={stepTitleStyle}>How to fix this issue:</h2>
          <p style={{ ...descStyle, fontSize: '0.88rem', marginBottom: '12px' }}>
            1. Create a file named <strong>.env</strong> in your project root directory if it does not exist.
          </p>
          <p style={{ ...descStyle, fontSize: '0.88rem', marginBottom: '12px' }}>
            2. Open the file and insert your Firebase Project keys in the following format:
          </p>
          <pre style={codeBlockStyle}>
{`VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id`}
          </pre>
          <p style={{ ...descStyle, fontSize: '0.88rem', margin: 0 }}>
            3. Save the file and restart your Vite local dev server to load the new credentials.
          </p>
        </div>
      </div>
    </div>
  );
}

export default FirebaseConfigError;
