import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import ProfileDropdown from './ProfileDropdown';
import NotificationBell from './NotificationBell';
import Logo from './Logo';

function Navbar({ user, onLogout, onSearch, onSelectUser }) {
    const { theme, toggleTheme } = useTheme();
    const [searchValue, setSearchValue] = useState('');

    // Debounced search
    useEffect(() => {
        const handler = setTimeout(() => {
            if (onSearch) onSearch(searchValue);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchValue, onSearch]);

    return (
        <nav className="navbar">
            {/* Left Section */}
            <div className="navbar__left">
                <div className="navbar__logo">
                    <Logo size={64} className="navbar__logo-icon" />
                </div>
            </div>

            {/* Center Section - Search */}
            <div className="navbar__center">
                <div className="navbar__search-wrapper">
                    <svg className="navbar__search-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z" />
                    </svg>
                    <input
                        type="text"
                        className="navbar__search-input"
                        placeholder="Search users or messages..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="navbar__right">
                <button
                    className="navbar__action-btn theme-toggle"
                    onClick={toggleTheme}
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {theme === 'light' ? (
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" /></svg>
                    ) : (
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 0 0-1.41 0 .996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.01a.996.996 0 0 0 0-1.41.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" /></svg>
                    )}
                </button>

                <NotificationBell onSelectUser={onSelectUser} />

                <ProfileDropdown user={user} onLogout={onLogout} />
            </div>
        </nav>
    );
}

export default Navbar;
