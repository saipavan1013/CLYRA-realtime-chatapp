function Button({ type = 'button', children, disabled, variant = 'primary', className = '', ...props }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`btn btn--${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
