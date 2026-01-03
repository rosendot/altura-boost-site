/**
 * Audit logging for security-sensitive actions
 * Logs are stored in Supabase for persistence and analysis
 */

import { createClient } from '@/lib/supabase/server';

export interface AuditLogEntry {
  action: string;
  actor_id: string;
  actor_email?: string;
  resource_type: string;
  resource_id: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  status: 'success' | 'failure';
  error_message?: string;
}

/**
 * Log an audit event to the database
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = await createClient();

    // Log to console for immediate visibility
    console.log('[AUDIT]', {
      timestamp: new Date().toISOString(),
      ...entry,
    });

    // Store in database table 'audit_logs'
    const { error: insertError } = await supabase.from('audit_logs').insert({
      action: entry.action,
      actor_id: entry.actor_id,
      actor_email: entry.actor_email,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id,
      details: entry.details,
      ip_address: entry.ip_address,
      user_agent: entry.user_agent,
      status: entry.status,
      error_message: entry.error_message,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      // Generic logging only - debug locally if needed
      console.error('[AUDIT] Failed to insert audit log');
    }
  } catch (error) {
    // Never fail the main operation due to logging errors
    // Generic logging only - debug locally if needed
    console.error('[AUDIT] Audit logging error');
  }
}

/**
 * Log failed authentication attempt
 */
export async function logAuthFailure(
  userId: string | null,
  action: string,
  reason: string,
  request?: Request
): Promise<void> {
  await logAuditEvent({
    action: `auth_failure_${action}`,
    actor_id: userId || 'anonymous',
    resource_type: 'authentication',
    resource_id: 'system',
    status: 'failure',
    error_message: reason,
    ip_address: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
    user_agent: request?.headers.get('user-agent') || undefined,
  });
}

/**
 * Log successful admin action
 */
export async function logAdminAction(
  adminId: string,
  adminEmail: string,
  action: string,
  resourceType: string,
  resourceId: string,
  details?: Record<string, unknown>,
  request?: Request
): Promise<void> {
  await logAuditEvent({
    action,
    actor_id: adminId,
    actor_email: adminEmail,
    resource_type: resourceType,
    resource_id: resourceId,
    details,
    status: 'success',
    ip_address: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
    user_agent: request?.headers.get('user-agent') || undefined,
  });
}
