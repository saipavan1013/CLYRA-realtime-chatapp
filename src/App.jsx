import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { ChatSettingsProvider } from './context/ChatSettingsContext';
import ToastContainer from './components/ToastContainer';
import BouncingDots from './components/BouncingDots';
import { useAuth } from './auth/AuthContext';

// Route-based code splitting using React.lazy()
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const ChatsPage = lazy(() => import('./pages/ChatsPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Centered loading screen using standard brand bouncing dots
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)'
  }}>
    <BouncingDots />
  </div>
);

function App() {
  const { loading } = useAuth();

  return (
    <ThemeProvider>
      <ChatSettingsProvider>
        <NotificationProvider>
          <ToastContainer />
          {loading ? (
            <LoadingFallback />
          ) : (
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings/account"
                  element={
                    <ProtectedRoute>
                      <AccountPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings/chats"
                  element={
                    <ProtectedRoute>
                      <ChatsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings/help"
                  element={
                    <ProtectedRoute>
                      <HelpPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings/about"
                  element={
                    <ProtectedRoute>
                      <AboutPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navigate to="/chat" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          )}
        </NotificationProvider>
      </ChatSettingsProvider>
    </ThemeProvider>
  );
}

export default App;


