function TypingIndicator({ name = 'Someone' }) {
  return (
    <div className="typing-indicator" aria-live="polite">
      <div className="typing-indicator__bubble">
        <span className="typing-indicator__dot" />
        <span className="typing-indicator__dot" />
        <span className="typing-indicator__dot" />
      </div>
      <span className="typing-indicator__label">typing...</span>
    </div>
  );
}

export default TypingIndicator;
