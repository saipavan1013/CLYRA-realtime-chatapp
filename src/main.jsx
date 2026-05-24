import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import FirebaseConfigError from './components/FirebaseConfigError';
import './index.css';
import './App.css';
import './chat/chat-styles.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

if (window.__firebaseConfigError) {
  root.render(
    <React.StrictMode>
      <FirebaseConfigError errorMessage={window.__firebaseConfigError} />
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

