/**
 * Secure error handling utilities
 * PHILOSOPHY: Minimal generic logging - debug issues locally by reproducing them
 * Server logs can be compromised, so we log ONLY generic messages
 */

/**
 * Get generic error message for client
 * Returns safe, generic error messages that don't expose internal details
 */
export function getGenericErrorMessage(errorType: string): string {
  const genericMessages: Record<string, string> = {
    database: 'A database error occurred',
    authentication: 'Authentication failed',
    authorization: 'Access denied',
    validation: 'Invalid input',
    notFound: 'Resource not found',
    rateLimit: 'Too many requests',
    internal: 'Internal server error',
  };

  return genericMessages[errorType] || 'An error occurred';
}

/**
 * Log error securely to console
 * Logs ONLY generic message - no IDs, timestamps, or context
 */
export function logSecureError(message: string): void {
  console.error(`[SECURE] ${message}`);
}

/**
 * Common secure error patterns for API endpoints
 */
export const SecureErrorPatterns = {
  /**
   * Database operation failed
   */
  databaseError: () => {
    logSecureError('Database operation failed');
    return {
      message: getGenericErrorMessage('database'),
      status: 500,
    };
  },

  /**
   * Authentication failed
   */
  authError: () => {
    logSecureError('Authentication failed');
    return {
      message: getGenericErrorMessage('authentication'),
      status: 401,
    };
  },

  /**
   * Authorization failed
   */
  authzError: () => {
    logSecureError('Authorization failed');
    return {
      message: getGenericErrorMessage('authorization'),
      status: 403,
    };
  },

  /**
   * Unexpected error
   */
  unexpectedError: () => {
    logSecureError('Unexpected error occurred');
    return {
      message: getGenericErrorMessage('internal'),
      status: 500,
    };
  },
};

/**
 * Guidelines for secure error handling:
 *
 * PHILOSOPHY: Minimal Generic Logging
 * - Server logs can be compromised
 * - Debug issues locally by reproducing them
 * - Use audit_logs database table for investigation (RLS-protected)
 *
 * DO:
 * - Return generic error messages to clients
 * - Log ONLY generic operation types (e.g., "Database operation failed")
 * - Use audit_logs table for detailed tracking (admin-only access)
 *
 * DON'T LOG:
 * - Database error messages or objects
 * - Stack traces
 * - UUIDs, resource IDs, or user IDs
 * - Timestamps
 * - IP addresses or user agents
 * - Email addresses
 * - Endpoint paths
 * - API keys, tokens, or secrets
 * - File paths or system information
 * - ANY contextual information
 *
 * EXAMPLES:
 * ✅ console.error('[SECURE] Database operation failed');
 * ✅ console.error('[SECURE] User update operation failed');
 * ❌ console.error('[SECURE] Failed:', { userId, timestamp });
 */
