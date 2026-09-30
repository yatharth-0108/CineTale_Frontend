export const validateEmail = (v) => (!v ? 'Email is required.' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address.');
export const validateUsername = (v) => (!v ? 'Username is required.' : /^[a-z0-9_]{3,20}$/i.test(v) ? '' : '3–20 characters: letters, numbers and underscores only.');
export const validatePassword = (v) => (!v ? 'Password is required.' : v.length < 8 ? 'Use at least 8 characters.' : !/[a-z]/i.test(v) || !/\d/.test(v) ? 'Include at least one letter and one number.' : '');
export const validateName = (v) => (v.trim().length < 2 ? 'Enter your full name.' : '');
export function passwordStrength(v) {
  let s = 0;
  if (v.length >= 8) s++; if (v.length >= 12) s++;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++; if (/\d/.test(v)) s++; if (/[^a-z0-9]/i.test(v)) s++;
  return Math.min(4, Math.max(v ? 1 : 0, s - (v.length < 8 ? 1 : 0)));
}
