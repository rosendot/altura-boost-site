/**
 * Input validation utilities for API endpoints
 */

/**
 * Validate UUID format
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize string input (prevent XSS)
 * Removes HTML tags and encodes special characters
 */
export function sanitizeString(input: string): string {
  if (!input) return '';

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Encode special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return sanitized.trim();
}

/**
 * Validate string length
 */
export function isValidLength(
  input: string,
  min: number = 0,
  max: number = Number.MAX_SAFE_INTEGER
): boolean {
  const length = input.trim().length;
  return length >= min && length <= max;
}

/**
 * Validate that input is within allowed values
 */
export function isInAllowedValues<T>(input: T, allowedValues: T[]): boolean {
  return allowedValues.includes(input);
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Validate object has required fields
 */
export function hasRequiredFields<T extends object>(
  obj: T,
  requiredFields: (keyof T)[]
): boolean {
  return requiredFields.every(field => field in obj && obj[field] !== undefined && obj[field] !== null);
}

/**
 * Validate and sanitize admin notes
 */
export function validateAdminNotes(notes: string | null | undefined): string | null {
  if (!notes || notes.trim() === '') return null;

  const sanitized = sanitizeString(notes);

  // Max length 2000 characters
  if (!isValidLength(sanitized, 0, 2000)) {
    throw new Error('Admin notes must be less than 2000 characters');
  }

  return sanitized;
}
