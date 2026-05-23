import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../context/ThemeContext';

function SettingsPage() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <button className="page-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                </button>
                <h1 className="page-title">Settings</h1>
            </header>

            <div className="settings-content">
                {/* Profile User Card */}
                <div className="settings-group">
                    <button className="settings-item" onClick={() => navigate('/profile')}>
                        <div className="settings-icon">
                            {user?.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt="Profile"
                                    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    background: 'var(--bg-tertiary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    color: 'var(--text-secondary)'
                                }}>
                                    {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
                                </div>
                            )}
                        </div>
                        <div className="settings-info">
                            <span className="settings-label">{user?.displayName || 'User'}</span>
                            <span className="settings-sublabel">{user?.email}</span>
                        </div>
                    </button>
                </div>

                {/* App Settings */}
                <div className="settings-group">
                    <button className="settings-item" onClick={() => navigate('/settings/account')}>
                        <div className="settings-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                            </svg>
                        </div>
                        <div className="settings-info">
                            <span className="settings-label">Account</span>
                            <span className="settings-sublabel">Security notifications, change number</span>
                        </div>
                    </button>

                    <button className="settings-item" onClick={() => navigate('/settings/chats')}>
                        <div className="settings-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                            </svg>
                        </div>
                        <div className="settings-info">
                            <span className="settings-label">Chats</span>
                            <span className="settings-sublabel">Theme, wallpapers, chat history</span>
                        </div>
                    </button>

                    <button className="settings-item" onClick={() => navigate('/settings/help')}>
                        <div className="settings-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                            </svg>
                        </div>
                        <div className="settings-info">
                            <span className="settings-label">Help</span>
                            <span className="settings-sublabel">Help center, contact us, privacy policy</span>
                        </div>
                    </button>

                    <button className="settings-item" onClick={() => navigate('/settings/about')}>
                        <div className="settings-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                            </svg>
                        </div>
                        <div className="settings-info">
                            <span className="settings-label">About CLYRA</span>
                            <span className="settings-sublabel">Mission, values, and app info</span>
                        </div>
                    </button>
                </div>

                {/* Logout */}
                <div className="settings-group">
                    <button className="settings-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
                        <div className="settings-icon" style={{ color: '#ef4444' }}>
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                            </svg>
                        </div>
                        <div className="settings-info">
                            <span className="settings-label">Logout</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;
