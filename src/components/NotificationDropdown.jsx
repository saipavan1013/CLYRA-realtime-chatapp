import { formatMessageTime } from '../chat/utils';

function NotificationDropdown({ notifications, unseenCount, onNotifClick }) {
    return (
        <div className="notif-dropdown">
            <div className="notif-header">
                <h3>Notifications</h3>
                {unseenCount > 0 && <span className="notif-count-badge">{unseenCount} new</span>}
            </div>
            <div className="notif-divider" />
            <div className="notif-list">
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                        <button
                            key={notif.id}
                            className="notif-item"
                            onClick={() => onNotifClick(notif)}
                        >
                            <div className="notif-avatar">
                                {notif.senderAvatar ? (
                                    <img src={notif.senderAvatar} alt="avatar" />
                                ) : (
                                    <div className="notif-avatar-placeholder">
                                        {notif.senderName ? notif.senderName[0].toUpperCase() : '?'}
                                    </div>
                                )}
                            </div>
                            <div className="notif-content">
                                <div className="notif-row-top">
                                    <span className="notif-name">{notif.senderName}</span>
                                    <span className="notif-time">{formatMessageTime(notif.timestamp)}</span>
                                </div>
                                <p className="notif-preview">
                                    {notif.type === 'image' ? '📷 Photo' :
                                        notif.type === 'video' ? '🎥 Video' :
                                            notif.type === 'audio' ? '🎤 Audio' :
                                                notif.text}
                                </p>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="notif-empty">
                        <div className="empty-icon">🔔</div>
                        <p>No new notifications</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default NotificationDropdown;
