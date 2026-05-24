import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatMessageTime } from './utils';
import { reactToMessage, unreactFromMessage } from './useChatMessages';

function Message({
  id, text, timestamp, isSent, seen, delivered, edited, deleted, senderId,
  type = 'text', fileUrl, fileName, duration,
  onEdit, onDelete, currentUserId,
  selectionMode, isSelected, onSelect, enterSelectionMode,
  replyTo, reactions, onReply, onScrollToMessage, chatId
}) {
  const [showReactions, setShowReactions] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showExpandedEmojis, setShowExpandedEmojis] = useState(false);
  const contextMenuRef = useRef(null);
  const bubbleRef = useRef(null);
  const pickerRef = useRef(null);

  const isMine = senderId === currentUserId;
  const standardEmojis = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

  const expandedEmojiList = [
    // Smileys
    '😀', '😁', '😅', '🤣', '😊', '😇', '🥰', '😍', '🤩', '😘',
    '😋', '🤪', '😎', '🤓', '🧐', '😏', '😒', '😞', '😔', '😟',
    '😕', '🙁', '😣', '😖', '😫', '😩', '🥺', '😤', '😠', '😡',
    '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👻', '👽', '🤖',
    // Hand gestures
    '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
    '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👍', '👎',
    '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
    '💪', '🦾', '🫶', '🫰', '🫵', '🫳', '🫴', '✍️', '🤳', '💅',
    '🦶', '🦵', '👂', '👃', '🧠', '👀', '👁️', '👅', '👄', '🫦',
    // People
    '🙋', '🙋‍♂️', '🤦', '🤦‍♂️', '🤷', '🤷‍♂️', '🙅', '🙆', '💁', '🙇',
    // Hearts
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️',
    // Animals
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐸', '🐵',
    // Food
    '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒',
    // Symbols and Objects
    '⭐', '🌟', '✨', '⚡', '🔥', '💫', '🎉', '🎊', '🎈', '🎁',
    '💯', '💢', '💥', '💦', '💤', '🏆', '🥇', '🎯', '🎮', '🎲',
  ]

  const handleReact = (emoji) => {
    if (reactions?.[currentUserId] === emoji) {
      unreactFromMessage(chatId, id, currentUserId);
    } else {
      reactToMessage(chatId, id, currentUserId, emoji);
    }
    setShowReactions(false);
    setShowContextMenu(false);
    setShowExpandedEmojis(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setShowContextMenu(false);
        setShowDeleteConfirm(false);
        setShowExpandedEmojis(false);
      }
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowReactions(false);
        setShowExpandedEmojis(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleOverflow = () => {
      const activeEl = pickerRef.current || contextMenuRef.current;
      if (!activeEl) return;

      const rect = activeEl.getBoundingClientRect();
      const padding = 10;

      if (rect.right > window.innerWidth) {
        activeEl.style.left = "auto";
        activeEl.style.right = `${padding}px`;
      } else if (rect.left < 0) {
        activeEl.style.left = `${padding}px`;
        activeEl.style.right = "auto";
      }
    };

    if (showReactions || showContextMenu) {
      // Small timeout to ensure DOM is updated and expansion animations started
      const timer = setTimeout(handleOverflow, 0);
      return () => clearTimeout(timer);
    }
  }, [showReactions, showContextMenu, showExpandedEmojis]);

  const handleEdit = (e) => {
    e?.stopPropagation();
    if (deleted || type !== 'text') return;
    setIsEditing(true);
    setShowContextMenu(false);
  };

  const handleDeleteClick = (e) => {
    e?.stopPropagation();
    // If it's already deleted (placeholder), we only allow "Delete for me"
    // which is handled by calling handleDelete(e, 'me') directly or showing simplified menu
    if (isMine && !deleted) {
      setShowDeleteConfirm(true);
    } else {
      handleDelete(e, 'me');
    }
  };

  const handleDelete = (e, mode = 'everyone') => {
    e?.stopPropagation();
    onDelete(id, mode);
    setShowContextMenu(false);
    setShowDeleteConfirm(false);
  };

  const handleAnimationEnd = (e) => {
    // No-op for delete - restored previous behavior
  };

  const handleContextMenu = (e) => {
    if (selectionMode) return;
    e.preventDefault();
    e.stopPropagation();

    if (!bubbleRef.current) return;

    const rect = bubbleRef.current.getBoundingClientRect();
    const menuWidth = 320; // Ensure we account for expanded width (320px)
    const menuHeight = 220;
    const safeMargin = 20;

    // --- Horizontal: anchor menu edge to bubble edge ---
    let x;
    if (isMine) {
      // Sent: menu right edge = bubble right edge
      x = rect.right - menuWidth;
    } else {
      // Received: menu left edge = bubble left edge
      x = rect.left;
    }

    // Clamp so menu stays fully on screen
    if (x + menuWidth > window.innerWidth - safeMargin) {
      x = window.innerWidth - menuWidth - safeMargin;
    }
    if (x < safeMargin) {
      x = safeMargin;
    }

    // --- Vertical: appear below the bubble ---
    let y = rect.bottom + 6;

    // If not enough room below, flip above
    if (y + menuHeight > window.innerHeight - safeMargin) {
      y = rect.top - menuHeight - 6;
    }
    // Safety: never go above viewport
    if (y < safeMargin) {
      y = safeMargin;
    }

    setContextMenuPos({ x, y });
    setShowContextMenu(true);
    setShowReactions(false);
  };

  const handleShowReactions = (e) => {
    e.stopPropagation();

    if (!showReactions && bubbleRef.current) {
      const rect = bubbleRef.current.getBoundingClientRect();
      const pickerWidth = 328; // Safer width for expanded state
      const pickerHeight = 50;

      // Center relative to bubble
      let x = rect.left + (rect.width / 2) - (pickerWidth / 2);
      // Position above bubble
      let y = rect.top - pickerHeight - 8;

      // Boundary checks
      const padding = 20;
      if (x < padding) x = padding;
      if (x + pickerWidth > window.innerWidth - padding) {
        x = window.innerWidth - pickerWidth - padding;
      }

      // If no room above, flip below bubble
      if (y < padding) {
        y = rect.bottom + 8;
      }

      setContextMenuPos({ x, y });
    }

    setShowReactions(!showReactions);
    setShowContextMenu(false);
  };

  const handleClick = (e) => {
    if (selectionMode) {
      e.stopPropagation();
      onSelect(id);
    } else if (showContextMenu || showReactions) {
      setShowContextMenu(false);
      setShowReactions(false);
    }
  };

  const handleSaveEdit = (e) => {
    e?.preventDefault();
    if (editText.trim() && editText !== text) {
      onEdit(id, editText);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = (e) => {
    e?.stopPropagation();
    setIsEditing(false);
    setEditText(text);
  };

  const renderContent = () => {
    if (deleted) {
      return (
        <div className="message-text deleted-text">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="deleted-icon-small">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          This message was deleted
        </div>
      );
    }

    switch (type) {
      case 'image':
        return (
          <div className="message-image-container" onClick={() => setShowImageModal(true)}>
            <img src={fileUrl} alt="Shared" className="message-image" loading="lazy" />
          </div>
        );
      case 'gif':
        return (
          <div className="message-gif-container">
            <img src={fileUrl} alt="GIF" className="message-gif" />
          </div>
        );
      case 'document':
        return (
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="message-doc-card">
            <div className="doc-icon">📄</div>
            <div className="doc-info">
              <span className="doc-name">{fileName || 'Document'}</span>
              <span className="doc-action">Click to view</span>
            </div>
            <div className="doc-download">⬇️</div>
          </a>
        );
      case 'audio':
        return (
          <div className="message-audio-container">
            <audio controls className="message-audio">
              <source src={fileUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            {duration && <span className="audio-duration">{duration}s</span>}
          </div>
        );
      default:
        if (isEditing) {
          return (
            <div className="edit-container" onClick={e => e.stopPropagation()}>
              <textarea
                autoFocus
                className="edit-input"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') handleCancelEdit(e);
                  if (e.key === 'Enter' && !e.shiftKey) handleSaveEdit(e);
                }}
                rows={1}
                style={{ height: 'auto' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
              />
              <div className="edit-actions">
                <button type="button" onClick={handleCancelEdit} className="edit-btn cancel" title="Cancel">✕</button>
                <button type="button" onClick={handleSaveEdit} className="edit-btn save" title="Save">✓</button>
              </div>
            </div>
          );
        }
        return <p className="message-text">{text}</p>;
    }
  };

  const wrapperClasses = `message-wrapper ${isMine ? 'sent' : 'received'} ${selectionMode ? 'selection-mode' : ''} ${isSelected ? 'selected' : ''}`;
  const bubbleClasses = `message-bubble ${isMine ? 'sent-bubble' : 'received-bubble'} ${deleted ? 'deleted-message' : ''} type-${type} ${isEditing ? 'editing' : ''}`;

  const reactionsData = reactions ? Object.entries(
    Object.values(reactions).reduce((acc, emoji) => {
      acc[emoji] = (acc[emoji] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]) : [];

  return (
    <div
      id={`msg-${id}`}
      className={wrapperClasses}
      onClick={handleClick}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (!selectionMode) {
          enterSelectionMode();
          onSelect(id);
        }
      }}
    >
      {selectionMode && (
        <div className="message-checkbox">
          <div className={`checkbox-ui ${isSelected ? 'checked' : ''}`}>
            {isSelected && <span>✓</span>}
          </div>
        </div>
      )}

      <div className="message-container-main">
        {!selectionMode && !deleted && !isEditing && !showContextMenu && (
          <div className="msg-hover-actions">
            <button className="hover-btn" onClick={handleShowReactions} title="React">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
            </button>
          </div>
        )}

        <div
          ref={bubbleRef}
          className={bubbleClasses}
          onAnimationEnd={handleAnimationEnd}
          onContextMenu={handleContextMenu}
        >
          {replyTo && !deleted && (
            <div
              className="reply-quote"
              onClick={(e) => {
                e.stopPropagation();
                onScrollToMessage(replyTo.messageId);
              }}
            >
              <div className="reply-quote__line"></div>
              <div className="reply-quote__content">
                <span className="reply-quote__name">{replyTo.senderId === currentUserId ? 'You' : (replyTo.senderName || 'User')}</span>
                <p className="reply-quote__text">{replyTo.text}</p>
              </div>
            </div>
          )}

          <div className="bubble-content">
            {renderContent()}

            <div className="message-meta">
              <time className="message-time">
                {formatMessageTime(timestamp)}
                {edited && type === 'text' && <span className="edited-label"> (edited)</span>}
              </time>
              {isMine && (
                <span className={`status-icon ${seen ? 'seen' : delivered ? 'delivered' : 'sent'}`}>
                  {seen || delivered ? '✓✓' : '✓'}
                </span>
              )}
            </div>
          </div>
        </div>

        {reactionsData.length > 0 && (
          <div
            className="msg-reaction-badge"
            onClick={(e) => {
              e.stopPropagation();
              const [firstEmoji] = reactionsData[0];
              handleReact(firstEmoji);
            }}
          >
            {reactionsData.slice(0, 2).map(([emoji]) => (
              <span key={emoji} className="badge-emoji">{emoji}</span>
            ))}
            {reactionsData.reduce((sum, [, count]) => sum + count, 0) > 1 && (
              <span className="badge-count">
                {reactionsData.reduce((sum, [, count]) => sum + count, 0)}
              </span>
            )}
          </div>
        )}

        {showReactions && createPortal(
          <div
            ref={pickerRef}
            className={`reaction-picker-overlay portal-picker ${isMine ? 'sent' : 'received'} ${showExpandedEmojis ? 'expanded' : ''}`}
            role="dialog"
            aria-label="Reaction picker"
            style={{
              position: 'absolute',
              left: `${contextMenuPos.x}px`,
              top: `${contextMenuPos.y}px`,
              zIndex: 10001
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="quick-emoji-row">
              {standardEmojis.map(emoji => (
                <button
                  key={emoji}
                  className={`picker-emoji-btn ${reactions?.[currentUserId] === emoji ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleReact(emoji); }}
                >
                  {emoji}
                </button>
              ))}
              <button className="picker-plus-btn" onClick={(e) => { e.stopPropagation(); setShowExpandedEmojis(!showExpandedEmojis); }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
            {showExpandedEmojis && (
              <div className="expanded-emoji-grid">
                {expandedEmojiList.map(emoji => (
                  <button
                    key={emoji}
                    className={`grid-emoji-btn ${reactions?.[currentUserId] === emoji ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleReact(emoji); setShowExpandedEmojis(false); }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>,
          document.body
        )}

        {showContextMenu && createPortal(
          <div
            ref={contextMenuRef}
            className={`msg-context-menu portal-menu ${showExpandedEmojis ? 'expanded' : ''}`}
            style={{
              position: 'absolute',
              left: `${contextMenuPos.x}px`,
              top: `${contextMenuPos.y}px`,
              zIndex: 10000
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className={`context-emoji-bar ${showExpandedEmojis ? 'expanded' : ''}`}>
              {standardEmojis.map(emoji => (
                <button
                  key={emoji}
                  className={`picker-emoji-btn ${reactions?.[currentUserId] === emoji ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleReact(emoji); }}
                >
                  {emoji}
                </button>
              ))}
              <button className="picker-plus-btn" onClick={(e) => { e.stopPropagation(); setShowExpandedEmojis(!showExpandedEmojis); }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
            {showExpandedEmojis && (
              <div className="expanded-emoji-grid">
                {expandedEmojiList.map(emoji => (
                  <button
                    key={emoji}
                    className={`grid-emoji-btn ${reactions?.[currentUserId] === emoji ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleReact(emoji); setShowExpandedEmojis(false); }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <div className="menu-divider"></div>

            <div className="context-menu-options">
              {!showDeleteConfirm ? (
                <>
                  {!deleted && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); onReply(); setShowContextMenu(false); }}
                        className="menu-item"
                      >
                        <div className="menu-icon reply-icon">
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 17 4 12 9 7"></polyline>
                            <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
                          </svg>
                        </div>
                        Reply
                      </button>
                      {isMine && type === 'text' && (
                        <button onClick={handleEdit} className="menu-item">
                          <div className="menu-icon edit-icon">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </div>
                          Edit
                        </button>
                      )}
                    </>
                  )}

                  <button onClick={handleDeleteClick} className="menu-item delete">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="menu-icon delete-icon">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete
                  </button>
                </>
              ) : (
                <>
                  {isMine && !deleted && (
                    <button onClick={(e) => handleDelete(e, 'everyone')} className="menu-item delete">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="menu-icon delete-icon">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      Delete for everyone
                    </button>
                  )}
                  <button onClick={(e) => handleDelete(e, 'me')} className="menu-item delete">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="menu-icon delete-icon">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                    Delete for me
                  </button>
                  <div className="menu-divider"></div>
                  <button onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }} className="menu-item">
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>,
          document.body
        )}

        {showImageModal && (
          <div className="image-modal-overlay" onClick={() => setShowImageModal(false)}>
            <div className="image-modal-content" onClick={e => e.stopPropagation()}>
              <img src={fileUrl} alt="Full Resolution" className="full-image" />
              <button className="modal-close" onClick={() => setShowImageModal(false)}>✕</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Message;
