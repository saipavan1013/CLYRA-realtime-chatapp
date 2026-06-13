import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { getAuthErrorMessage } from '../auth/authErrors';
import { validateEmail } from '../auth/validation';
import AuthFormCard from '../components/AuthFormCard';
import Logo from '../components/Logo';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccessMessage('');
    setEmailError('');

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError('Email is required');
      return;
    } else if (!validateEmail(trimmedEmail)) {
      setEmailError('Enter a valid email');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      setSuccessMessage('We sent a password reset link to your email. Please check your inbox.');
      setEmail('');
    } catch (err) {
      setSubmitError(getAuthErrorMessage(err.code) || err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-branding">
        <Logo size={180} />
      </div>
      <AuthFormCard
        title="Forgot Password"
        submitLabel="Send Reset Link"
        submitLoadingLabel="Sending..."
        loading={loading}
        submitError={submitError}
        onSubmit={handleSubmit}
        footerText="Remembered your password?"
        footerLinkTo="/login"
        footerLinkLabel="Back to Login"
      >
        {successMessage && (
          <div className="auth-form__success" role="alert">
            {successMessage}
          </div>
        )}
        <AuthFormCard.Field
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          error={emailError}
          autoComplete="email"
        />
      </AuthFormCard>
    </div>
  );
}

export default ForgotPasswordPage;
