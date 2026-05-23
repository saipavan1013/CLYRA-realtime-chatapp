import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

function NotificationBell({ onSelectUser }) {
    const { unseenCount, notifications, markNotificationAsRead } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef(null);

    // Close notifications when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleBellClick = () => {
        setShowNotifications(!showNotifications);
    };

    const handleNotifItemClick = (notif) => {
        // Mark as read in Firestore
        markNotificationAsRead(notif.chatId);

        // Close dropdown
        setShowNotifications(false);

        // Select the user in the main chat area
        if (onSelectUser) {
            onSelectUser(notif.senderId);
        }
    };

    return (
        <div className="notification-wrapper" ref={notifRef}>
            <button
                className={`navbar__action-btn notifications-btn ${showNotifications ? 'active' : ''}`}
                title="Notifications"
                onClick={handleBellClick}
            >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                </svg>
                {unseenCount > 0 && <span className="notif-badge">{unseenCount}</span>}
            </button>

            {showNotifications && (
                <NotificationDropdown
                    notifications={notifications}
                    unseenCount={unseenCount}
                    onNotifClick={handleNotifItemClick}
                />
            )}
        </div>
    );
}

export default NotificationBell;
