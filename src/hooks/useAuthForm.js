import { useState, useCallback } from 'react';
import { validateEmail, validatePassword } from '../auth/validation';

const DEFAULT_ERRORS = {
  email: 'Email is required',
  emailInvalid: 'Enter a valid email',
  password: 'Password is required',
  passwordShort: 'Password must be at least 6 characters',
  confirmPassword: 'Passwords do not match',
};

/**
 * Shared auth form state and validation.
 * @param {Object} options
 * @param {boolean} [options.requireConfirm] - Whether to validate password confirmation
 */
export function useAuthForm(options = {}) {
  const { requireConfirm = false } = options;

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = useCallback(() => {
    const newErrors = {};

    // Validate username if it's being used (e.g. registration)
    // For login, if it's optional vs email, we might skip, but user asked for "Username" field on Login too.
    // We'll enforce it if it's present or if this is registration.
    // However, best to just validate it if it's not empty, or if explicit 'requireUsername' is passed.
    // For now, let's assume if the field exists in the UI (which it does), we validate it if it's pertinent.
    // Actually, `RegisterPage` needs it required. `LoginPage` might not effectively use it for auth yet if using email.
    // To keep it simple: Validate if it's registration (requireConfirm usually implies registration here).
    if (requireConfirm && !username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!email.trim()) {
      newErrors.email = requireConfirm ? DEFAULT_ERRORS.email : 'Username or Email is required';
    } else if (requireConfirm && !validateEmail(email)) {
      newErrors.email = DEFAULT_ERRORS.emailInvalid;
    }

    if (!password) {
      newErrors.password = DEFAULT_ERRORS.password;
    } else if (!validatePassword(password)) {
      newErrors.password = DEFAULT_ERRORS.passwordShort;
    }

    if (requireConfirm && password !== confirmPassword) {
      newErrors.confirmPassword = DEFAULT_ERRORS.confirmPassword;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password, confirmPassword, requireConfirm, username]);

  const clearSubmitError = useCallback(() => setSubmitError(''), []);

  return {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    errors,
    loading,
    setLoading,
    submitError,
    setSubmitError,
    validate,
    clearSubmitError,
  };
}
