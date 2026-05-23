import { useRef, useEffect, useState } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import { useChatSettingsContext } from '../context/ChatSettingsContext';

function ChatWindow({ messages, loading, isTyping, typingName, onEdit, onDelete, onBulkDelete, currentUserId, onReply, chatId }) {
  const scrollRef = useRef(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const { settings } = useChatSettingsContext();
  const wallpaper = settings?.wallpaper;
  const wallpaperStyle = wallpaper
    ? wallpaper.startsWith('linear-gradient') || wallpaper.startsWith('radial-gradient')
      ? { background: wallpaper }
      : { backgroundImage: `url(${wallpaper})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  // Auto-scroll to bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isNearBottom) return;

    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  }, [messages, isTyping, isNearBottom]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const threshold = 100;
    const isBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    setIsNearBottom(isBottom);
  };

  const scrollToMessage = (messageId) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('highlight-flash');
      setTimeout(() => el.classList.remove('highlight-flash'), 2000);
    }
  };

  const toggleSelectionMode = (active) => {
    setSelectionMode(active);
    if (!active) setSelectedMessages([]);
  };

  const handleSelect = (messageId) => {
    setSelectedMessages(prev =>
      prev.includes(messageId)
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleBulkDeleteAction = (mode) => {
    if (selectedMessages.length === 0) return;
    onBulkDelete(selectedMessages, mode);
    toggleSelectionMode(false);
  };

  const canDeleteForEveryone = selectedMessages.every(id => {
    const msg = messages.find(m => m.id === id);
    return msg && msg.senderId === currentUserId;
  });

  const isAllSelected = messages.length > 0 && selectedMessages.length === messages.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(messages.map(m => m.id));
    }
  };

  return (
    <div className="chat-window" ref={scrollRef} onScroll={handleScroll} style={wallpaperStyle}>
      {selectionMode && (
        <div className="selection-bar">
          <div className="selection-bar__content">
            <button className="selection-bar__close" onClick={() => toggleSelectionMode(false)}>✕</button>
            <span className="selection-bar__count">{selectedMessages.length} Selected</span>

            <button
              className="selection-bar__select-all"
              onClick={handleToggleSelectAll}
            >
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </button>

            <div className="selection-bar__actions">
              {canDeleteForEveryone && (
                <button
                  className="selection-bar__btn selection-bar__btn--everyone"
                  onClick={() => handleBulkDeleteAction('everyone')}
                >
                  🌎 Delete for everyone
                </button>
              )}
              <button
                className="selection-bar__btn selection-bar__btn--me"
                onClick={() => handleBulkDeleteAction('me')}
              >
                🗑️ Delete for me
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="chat-window__empty">Loading messages...</p>
      ) : messages.length === 0 ? (
        <p className="chat-window__empty">No messages yet</p>
      ) : (
        <div className={`chat-window__list ${selectionMode ? 'chat-window__list--selecting' : ''}`}>
          {messages.map((msg) => {
            const sender = msg.isSent ? 'You' : (msg.senderName || 'User');
            return (
              <Message
                key={msg.id}
                id={msg.id}
                text={msg.text}
                timestamp={msg.timestamp}
                isSent={msg.isSent}
                seen={msg.seen}
                delivered={msg.delivered}
                edited={msg.edited}
                deleted={msg.deleted}
                senderId={msg.senderId}
                replyTo={msg.replyTo}
                reactions={msg.reactions}
                onEdit={onEdit}
                onDelete={onDelete}
                currentUserId={currentUserId}
                selectionMode={selectionMode}
                isSelected={selectedMessages.includes(msg.id)}
                onSelect={handleSelect}
                enterSelectionMode={() => toggleSelectionMode(true)}
                onReply={() => onReply({ id: msg.id, text: msg.text, senderId: msg.senderId, senderName: sender })}
                onScrollToMessage={scrollToMessage}
                chatId={chatId}
              />
            );
          })}
          {isTyping && <TypingIndicator name={typingName} />}
        </div>
      )}
    </div>
  );
}

export default ChatWindow;
