import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ProfileDropdown({ user, onLogout }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        setIsOpen(false);
        navigate(path);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
    };

    const name = user?.displayName || user?.username || user?.email || 'User';

    return (
        <div className="profile-dropdown-container" ref={dropdownRef}>
            <button
                className="navbar__avatar-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <div className="navbar__avatar">
                    {user?.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt={name}
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                        />
                    ) : (
                        getInitials(name)
                    )}
                </div>
            </button>

            {isOpen && (
                <div className="profile-dropdown-menu">
                    <div className="dropdown-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="navbar__avatar" style={{ width: '40px', height: '40px', fontSize: '0.9rem' }}>
                                {user?.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={name}
                                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    getInitials(name)
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <span className="dropdown-name">{user?.displayName || user?.username || 'User'}</span>
                                <span className="dropdown-email" title={user?.email}>{user?.email}</span>
                            </div>
                        </div>
                    </div>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item" onClick={() => handleNavigation('/profile')}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>
                        View Profile
                    </button>
                    <button className="dropdown-item" onClick={() => handleNavigation('/settings')}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /></svg>
                        Settings
                    </button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item logout" onClick={onLogout}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" /></svg>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProfileDropdown;
