import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { ChatList, ChatWindow, MessageInput, useGlobalDelivery } from '../chat';
import { useChatMessages } from '../chat/useChatMessages';
import { useTypingIndicator } from '../chat/useTypingIndicator';
import { useUsers } from '../hooks/useUsers';
import { usePresence } from '../chat/usePresence';
import BouncingDots from '../components/BouncingDots';
import Navbar from '../components/Navbar';
import { useNotifications } from '../context/NotificationContext';

function ChatPage() {
  const { user, logout } = useAuth();
  useGlobalDelivery(user?.uid);
  const { users, loading: usersLoading } = useUsers(user?.uid);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  // Move helper functions to ChatPage for profile display or use utils
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  const getRandomColor = (id) => {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50'];
    const index = id ? id.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const filteredUsers = users.filter(u => {
    const searchLower = searchTerm.toLowerCase();
    const usernameMatch = u.username?.toLowerCase().includes(searchLower);
    const displayMatch = u.displayName?.toLowerCase().includes(searchLower);
    const emailMatch = u.email?.toLowerCase().includes(searchLower);
    return usernameMatch || displayMatch || emailMatch;
  });

  // Calculate conversation ID directly from user IDs
  const conversationId = selectedUserId && user?.uid
    ? [user.uid, selectedUserId].sort().join("_")
    : null;

  const selectedUser = users.find(u => u.uid === selectedUserId);

  const { messages, sendMessage, editMessage, deleteMessage, bulkDeleteMessages, uploadFile, loading } = useChatMessages(
    conversationId,
    user?.uid
  );

  const { isOtherTyping, reportTyping } = useTypingIndicator(
    conversationId,
    user?.uid,
    selectedUserId
  );

  usePresence(user?.uid);

  // Sync active chat with NotificationContext
  const { setActiveChatId } = useNotifications();
  useEffect(() => {
    setActiveChatId(conversationId);
    return () => setActiveChatId(null);
  }, [conversationId, setActiveChatId]);

  return (
    <div className="chat-container">
      <Navbar user={user} onLogout={logout} onSearch={setSearchTerm} onSelectUser={setSelectedUserId} />
      <main className="app">
        <aside className="sidebar">
          <nav className="sidebar__list" aria-label="User list">
            <ChatList
              users={filteredUsers}
              selectedUserId={selectedUserId}
              onSelectUser={setSelectedUserId}
              currentUserId={user?.uid}
            />
          </nav>
        </aside>
        <section className="main" aria-label="Chat messages">
          <header className="main__header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                className="chat-list__avatar"
                style={{
                  width: '40px', height: '40px', fontSize: '0.9rem',
                  backgroundColor: selectedUser?.photoURL ? 'transparent' : getRandomColor(selectedUserId)
                }}
              >
                {selectedUser?.photoURL ? (
                  <img
                    src={selectedUser.photoURL}
                    alt={selectedUser.username || selectedUser.displayName}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  getInitials(selectedUser?.username || selectedUser?.displayName || selectedUser?.email)
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h1 className="main__title" style={{ marginBottom: '2px' }}>
                  {selectedUser?.username || selectedUser?.displayName || selectedUser?.email || 'Select a user to chat'}
                </h1>
                {selectedUser && (
                  <div className="main__status-container">
                    {isOtherTyping ? (
                      <div className="main__status main__status--typing">
                        <span>typing</span>
                        <BouncingDots />
                      </div>
                    ) : (
                      <span
                        className={`main__status ${selectedUser.isOnline ? 'main__status--online' : 'main__status--offline'}`}
                        aria-label={selectedUser.isOnline ? 'Online' : 'Offline'}
                      >
                        {selectedUser.isOnline ? 'Online' : 'Offline'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </header>
          <div className="main__messages">
            <ChatWindow
              messages={messages}
              loading={loading}
              isTyping={isOtherTyping}
              typingName={selectedUser?.username || selectedUser?.displayName || selectedUser?.email}
              onEdit={editMessage}
              onDelete={deleteMessage}
              onBulkDelete={bulkDeleteMessages}
              currentUserId={user?.uid}
              onReply={setReplyingTo}
              chatId={conversationId}
            />
          </div>
          <footer className="main__input">
            <MessageInput
              onSend={sendMessage}
              onTyping={reportTyping}
              onUpload={uploadFile}
              disabled={!selectedUserId || loading}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
            />
          </footer>
        </section>
      </main>
    </div>
  );
}

export default ChatPage;
