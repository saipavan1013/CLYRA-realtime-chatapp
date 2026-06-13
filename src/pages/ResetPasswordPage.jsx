import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { getAuthErrorMessage } from '../auth/authErrors';
import { validatePassword } from '../auth/validation';
import AuthFormCard from '../components/AuthFormCard';
import Logo from '../components/Logo';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const oobCode = searchParams.get('oobCode');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Verify the reset code on component mount
  useEffect(() => {
    if (!oobCode) {
      setVerificationError('Invalid request. The password reset link is missing its action code.');
      setVerifying(false);
      return;
    }

    verifyPasswordResetCode(auth, oobCode)
      .then(() => {
        setVerifying(false);
      })
      .catch((err) => {
        setVerificationError(
          err.code === 'auth/invalid-action-code' || err.code === 'auth/expired-action-code'
            ? 'This password reset link is invalid, expired, or has already been used.'
            : 'Error verifying link. Please request a new password reset email.'
        );
        setVerifying(false);
      });
  }, [oobCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccessMessage('');
    const newErrors = {};

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccessMessage('Password changed successfully! Redirecting you to login...');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (err) {
      setSubmitError(getAuthErrorMessage(err.code) || err.message || 'Failed to reset password.');
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
        title="Reset Password"
        submitLabel="Update Password"
        submitLoadingLabel="Updating..."
        loading={loading || verifying}
        submitError={submitError || verificationError}
        onSubmit={handleSubmit}
        footerText="Need a new link?"
        footerLinkTo="/forgot-password"
        footerLinkLabel="Forgot Password"
      >
        {verifying && <div className="auth-loading text-center">Verifying code...</div>}

        {!verifying && !verificationError && (
          <>
            {successMessage && (
              <div className="auth-form__success" role="alert">
                {successMessage}
              </div>
            )}

            <AuthFormCard.Field
              id="reset-new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password"
              error={errors.password}
              autoComplete="new-password"
            />

            <AuthFormCard.Field
              id="reset-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              error={errors.confirmPassword}
              autoComplete="new-password"
            />
          </>
        )}
      </AuthFormCard>
    </div>
  );
}

export default ResetPasswordPage;
