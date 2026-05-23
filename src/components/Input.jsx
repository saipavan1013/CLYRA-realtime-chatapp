function Input({ type = 'text', value, onChange, placeholder, error, disabled, ...props }) {
  return (
    <div className="input-wrapper">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`input ${error ? 'input--error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={props.id ? `${props.id}-error` : undefined} className="input__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default Input;
