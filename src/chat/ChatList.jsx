import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { formatMessageTime } from './utils';

function ChatList({ users, selectedUserId, onSelectUser, currentUserId }) {
  const [profileUser, setProfileUser] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileUser(null);
      }
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') setProfileUser(null);
    };

    if (profileUser) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
      window.addEventListener('resize', () => setProfileUser(null));
      window.addEventListener('scroll', () => setProfileUser(null), true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
      window.removeEventListener('resize', () => setProfileUser(null));
      window.removeEventListener('scroll', () => setProfileUser(null), true);
    };
  }, [profileUser]);

  const handleDoubleClick = (event, user) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopupPosition({
      top: rect.top + rect.height / 2,
      left: rect.left + 80 // Position it on the username area
    });
    setProfileUser(user);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  const getRandomColor = (id) => {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50'];
    const index = id ? id.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  return (
    <ul className="sidebar__list" role="list">
      {users.map((user) => {
        const isOnline = user.isOnline;
        const name = user.username || user.displayName || user.email || 'User';
        const initials = getInitials(name);
        const active = selectedUserId === user.uid;

        return (
          <li key={user.uid}>
            <button
              type="button"
              className={`chat-list__item ${active ? 'chat-list__item--active' : ''}`}
              onClick={() => {
                onSelectUser(user.uid);
                setProfileUser(null);
              }}
              onDoubleClick={(e) => handleDoubleClick(e, user)}
            >
              <div className="chat-list__avatar-container">
                <div
                  className="chat-list__avatar"
                  style={{ backgroundColor: user.photoURL ? 'transparent' : getRandomColor(user.uid) }}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={name}
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    initials
                  )}
                </div>
                {isOnline && <div className="chat-list__status chat-list__status--online" />}
              </div>

              <div className="chat-list__info">
                <div className="chat-list__row">
                  <span className="chat-list__name">{name}</span>
                </div>
              </div>
            </button>
          </li>
        );
      })}

      {profileUser && createPortal(
        <div
          className="mini-profile-popup"
          ref={profileRef}
          style={{
            top: `${popupPosition.top}px`,
            left: `${popupPosition.left}px`,
            position: 'fixed'
          }}
        >
          <div className="mini-profile-popup__header">
            <div
              className="mini-profile-popup__avatar"
              style={{ backgroundColor: profileUser.photoURL ? 'transparent' : getRandomColor(profileUser.uid) }}
            >
              {profileUser.photoURL ? (
                <img
                  src={profileUser.photoURL}
                  alt={profileUser.username || profileUser.displayName}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                getInitials(profileUser.username || profileUser.displayName || profileUser.email)
              )}
            </div>
            <div className="mini-profile-popup__info">
              <span className="mini-profile-popup__name">
                {profileUser.username || profileUser.displayName || profileUser.email || 'User'}
              </span>
              <span className="mini-profile-popup__email">{profileUser.email}</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ul>
  );
}

export default ChatList;



