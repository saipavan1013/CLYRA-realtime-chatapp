/** Firebase Auth error codes mapped to user-friendly messages */
const AUTH_ERROR_MESSAGES = {
  'auth/invalid-email': 'Invalid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Check your connection.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled.',
};

export function getAuthErrorMessage(code) {
  return AUTH_ERROR_MESSAGES[code] || 'An error occurred. Please try again.';
}
