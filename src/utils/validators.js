/**
 * Flin — Reusable Validation Utilities (Checkpoint 4)
 * Each validator returns: { valid: boolean, error: string }
 */

/**
 * Validates that a value is not empty / blank.
 * @param {string} value
 * @param {string} fieldLabel — human-readable field name for the error message
 */
export function validateRequired(value, fieldLabel = 'Bu sahə') {
  const trimmed = typeof value === 'string' ? value.trim() : String(value ?? '');
  if (!trimmed) {
    return { valid: false, error: `${fieldLabel} tələb olunur.` };
  }
  return { valid: true, error: '' };
}

/**
 * Validates email address format using RFC-like regex.
 */
export function validateEmail(value) {
  const trimmed = (value || '').trim();
  if (!trimmed) return { valid: true, error: '' }; // optional by default — use validateRequired first
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Düzgün email formatı daxil edin (məs: user@flin.io).' };
  }
  return { valid: true, error: '' };
}

/**
 * Validates minimum character length.
 * @param {string} value
 * @param {number} min
 * @param {string} fieldLabel
 */
export function validateMinLength(value, min, fieldLabel = 'Bu sahə') {
  const trimmed = (value || '').trim();
  if (trimmed.length < min) {
    return { valid: false, error: `${fieldLabel} ən azı ${min} simvoldan ibarət olmalıdır.` };
  }
  return { valid: true, error: '' };
}

/**
 * Validates maximum character length.
 * @param {string} value
 * @param {number} max
 * @param {string} fieldLabel
 */
export function validateMaxLength(value, max, fieldLabel = 'Bu sahə') {
  const str = value || '';
  if (str.length > max) {
    return { valid: false, error: `${fieldLabel} maksimum ${max} simvol ola bilər.` };
  }
  return { valid: true, error: '' };
}

/**
 * Validates URL format (http/https).
 * Field is considered valid if empty (optional field).
 */
export function validateUrl(value) {
  const trimmed = (value || '').trim();
  if (!trimmed) return { valid: true, error: '' };
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return { valid: false, error: 'URL http:// və ya https:// ilə başlamalıdır.' };
    }
    return { valid: true, error: '' };
  } catch {
    return { valid: false, error: 'Düzgün URL formatı daxil edin (məs: https://flin.io).' };
  }
}

/**
 * Validates that value contains no harmful special characters.
 * Allows letters (including Azerbaijani/Cyrillic), numbers, spaces, common punctuation.
 */
export function validateNoHtml(value) {
  const trimmed = (value || '').trim();
  if (/<[^>]+>/.test(trimmed)) {
    return { valid: false, error: 'HTML teqləri icazə verilmir.' };
  }
  return { valid: true, error: '' };
}

/**
 * Validates a date string is not in the past.
 * Accepts ISO date string (yyyy-mm-dd).
 */
export function validateFutureDate(value) {
  if (!value) return { valid: true, error: '' };
  const selected = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selected < today) {
    return { valid: false, error: 'Son tarix keçmiş ola bilməz.' };
  }
  return { valid: true, error: '' };
}

/**
 * Runs a chain of validators and returns the first error found.
 * Validators are functions that return { valid, error }.
 * @param {any} value — the field value
 * @param {Array<Function>} chain — array of (value) => { valid, error } functions
 */
export function runValidators(value, chain) {
  for (const validator of chain) {
    const result = validator(value);
    if (!result.valid) return result;
  }
  return { valid: true, error: '' };
}
