import { useState, useCallback, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { CloseOutlined } from '@ant-design/icons';
import { useThrottle } from '../hooks/useThrottle';
import { useChatSettingsContext } from '../context/ChatSettingsContext';

const TYPING_THROTTLE_MS = 500;
const GIPHY_API_KEY = 'dc6zaTOxFJmzC'; // Public beta key

function MessageInput({
  onSend,
  onTyping,
  onUpload,
  placeholder = 'Type a message...',
  disabled,
  replyingTo,
  onCancelReply
}) {
  const { settings } = useChatSettingsContext();
  const enterIsSend = settings?.enterIsSend ?? true;
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [gifSearch, setGifSearch] = useState('');
  const [gifs, setGifs] = useState([]);

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const emojiRef = useRef(null);
  const gifRef = useRef(null);

  const throttledTyping = useThrottle(
    onTyping ? () => onTyping() : () => { },
    TYPING_THROTTLE_MS
  );

  // Close popups on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) setShowEmojiPicker(false);
      if (gifRef.current && !gifRef.current.contains(event.target)) setShowGifPicker(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    setText(e.target.value);
    if (onTyping && e.target.value.trim()) {
      throttledTyping();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (enterIsSend && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      // If enterIsSend is off, or Shift+Enter: allow natural newline in textarea
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled || isUploading) return;
    onSend({
      text: trimmed,
      type: 'text',
      replyTo: replyingTo ? {
        messageId: replyingTo.id,
        senderId: replyingTo.senderId,
        text: replyingTo.text
      } : null
    });
    setText('');
    setShowEmojiPicker(false);
    if (onCancelReply) onCancelReply();
  };

  const handleEmojiClick = (emojiData) => {
    setText(prev => prev + emojiData.emoji);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || disabled) return;

    setIsUploading(true);
    try {
      const isImage = file.type.startsWith('image/');
      const type = isImage ? 'image' : 'document';
      const pathPrefix = isImage ? 'images' : 'documents';

      const { url, name } = await onUpload(file, pathPrefix);
      onSend({
        type,
        fileUrl: url,
        fileName: name,
        text: isImage ? '' : `Shared document: ${name}`
      });
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const [gifLoading, setGifLoading] = useState(false);
  const [gifError, setGifError] = useState(false);

  const fetchGifs = async (query) => {
    setGifLoading(true);
    setGifError(false);
    const url = query
      ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=12&rating=g`
      : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=12&rating=g`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('GIPHY API error');
      const data = await res.json();
      setGifs(data.data || []);
      if ((data.data || []).length === 0) {
        console.log('No GIFs found for query:', query);
      }
    } catch (err) {
      console.error('GIF fetch failed:', err);
      setGifError(true);
    } finally {
      setGifLoading(false);
    }
  };

  useEffect(() => {
    if (showGifPicker) {
      const timeoutId = setTimeout(() => {
        fetchGifs(gifSearch);
      }, gifSearch ? 500 : 0); // Debounce search
      return () => clearTimeout(timeoutId);
    }
  }, [showGifPicker, gifSearch]);

  const handleGifSelect = (gif) => {
    onSend({
      type: 'gif',
      fileUrl: gif.images.fixed_height.url,
      text: ''
    });
    setShowGifPicker(false);
    setGifSearch('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mpeg' });
        const file = new File([audioBlob], `voice_message_${Date.now()}.mp3`, { type: 'audio/mpeg' });

        setIsUploading(true);
        try {
          const { url } = await onUpload(file, 'audio');
          onSend({
            type: 'audio',
            fileUrl: url,
            duration: recordTime,
            text: ''
          });
        } catch (err) {
          console.error('Audio upload failed:', err);
        } finally {
          setIsUploading(false);
          setRecordTime(0);
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  return (
    <div className="message-input-container">
      {replyingTo && (
        // <div className="reply-preview">
        <div className={`reply-preview ${replyingTo.senderId === replyingTo.currentUserId ? 'sent' : 'received'}`}>
          <div className="reply-preview__line"></div>
          <div className="reply-preview__content">
            <span className="reply-preview__name">{replyingTo.senderName || 'User'}</span>
            <p className="reply-preview__text">
              {replyingTo.text.length > 80 ? `${replyingTo.text.substring(0, 80)}...` : replyingTo.text}
            </p>
          </div>
          <button className="reply-preview__close" onClick={onCancelReply} title="Cancel Reply">
            <CloseOutlined style={{ fontSize: '16px' }} />
          </button>
        </div>
      )}
      {showEmojiPicker && (
        <div className="emoji-picker-popup" ref={emojiRef}>
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      {showGifPicker && (
        <div className="gif-picker-popup" ref={gifRef}>
          <div className="gif-search">
            <input
              type="text"
              placeholder="Search GIFs..."
              value={gifSearch}
              onChange={(e) => setGifSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="gif-grid">
            {gifLoading && <div className="gif-status">Loading GIFs...</div>}
            {gifError && <div className="gif-status error">Failed to load GIFs.</div>}
            {!gifLoading && !gifError && gifs.length === 0 && (
              <div className="gif-status">No GIFs found.</div>
            )}
            {!gifLoading && !gifError && gifs.map(gif => (
              <img
                key={gif.id}
                src={gif.images.preview_gif.url}
                alt="gif"
                onClick={() => handleGifSelect(gif)}
              />
            ))}
          </div>
        </div>
      )}

      <form className="message-input-form" onSubmit={handleSubmit}>
        <div className="input-actions-left">
          <button
            type="button"
            className={`action-btn ${showEmojiPicker ? 'active' : ''}`}
            onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false); }}
            title="Emojis"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm3.5-9c.828 0 1.5-.672 1.5-1.5S16.328 8 15.5 8 14 8.672 14 9.5s.672 1.5 1.5 1.5zm-7 0c.828 0 1.5-.672 1.5-1.5S9.328 8 8.5 8 7 8.672 7 9.5s.672 1.5 1.5 1.5zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" /></svg>
          </button>
          <button
            type="button"
            className={`action-btn ${showGifPicker ? 'active' : ''}`}
            onClick={() => { setShowGifPicker(!showGifPicker); setShowEmojiPicker(false); }}
            title="GIFs"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M11.5 9H13v6h-1.5V9zM9 9H6c-.6 0-1 .4-1 1v4c0 .6.4 1 1 1h3c.6 0 1-.4 1-1v-2H8.5v1.5h-2v-3H10V10c0-.6-.4-1-1-1zm10 1.5V9h-4.5v6H16v-2h2v-1.5h-2v-1h3z" /></svg>
          </button>
          <button
            type="button"
            className="action-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Upload File"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4s-4 1.79-4 4v12.5c0 3.31 2.69 6 6 6s6-2.69 6-6V6h-1.5z" /></svg>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          {!isRecording && (
            <button
              type="button"
              className={`action-btn mic-btn ${isRecording ? 'recording' : ''}`}
              onClick={startRecording}
              disabled={disabled || isUploading}
              title="Voice Message"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" /><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" /></svg>
            </button>
          )}
        </div>

        {isRecording ? (
          <div className="recording-indicator">
            <span className="dot"></span>
            <span className="timer">Recording {recordTime}s</span>
            <button type="button" className="stop-btn" onClick={stopRecording}>Stop</button>
          </div>
        ) : (
          <input
            type="text"
            className="message-input__field"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={isUploading ? 'Uploading...' : placeholder}
            disabled={disabled || isUploading}
            autoComplete="off"
          />
        )}

        <div className="input-actions-right">
          <button
            type="submit"
            disabled={(!text.trim() && !isRecording) || disabled || isUploading}
            className="message-input__btn"
          >
            {isUploading ? '...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MessageInput;
