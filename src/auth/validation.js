/** Regex for basic email format validation */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Minimum password length for auth */
export const MIN_PASSWORD_LENGTH = 6;

export function validateEmail(email) {
  return EMAIL_REGEX.test(email);
}

export function validatePassword(password) {
  return password.length >= MIN_PASSWORD_LENGTH;
}
