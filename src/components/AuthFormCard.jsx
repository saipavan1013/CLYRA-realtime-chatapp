import { Link } from 'react-router-dom';
import Input from './Input';
import Button from './Button';

/**
 * Reusable auth page card with form layout.
 * Renders title, error banner, form fields, submit button, and footer link.
 */
function AuthFormCard({
  title,
  submitLabel,
  submitLoadingLabel,
  loading,
  submitError,
  onSubmit,
  footerText,
  footerLinkTo,
  footerLinkLabel,
  children,
}) {
  return (
    <div className="auth-card">
      <h1 className="auth-card__title">{title}</h1>
      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {submitError && (
          <div className="auth-form__error" role="alert">
            {submitError}
          </div>
        )}
        {children}
        <Button type="submit" disabled={loading} className="auth-form__submit">
          {loading ? submitLoadingLabel : submitLabel}
        </Button>
      </form>
      <p className="auth-card__footer">
        {footerText} <Link to={footerLinkTo}>{footerLinkLabel}</Link>
      </p>
    </div>
  );
}

/**
 * Renders a single auth form field (email, password, or confirm password).
 */
function AuthFormField({ id, type, value, onChange, placeholder, error, autoComplete }) {
  return (
    <div className="auth-form__field">
      <Input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        error={error}
        autoComplete={autoComplete}
      />
    </div>
  );
}

AuthFormCard.Field = AuthFormField;

export default AuthFormCard;
