import { getAdminClient } from './supabase-admin'

export type AuditAction =
  | 'email_received'
  | 'ai_response_generated'
  | 'response_approved'
  | 'response_rejected'
  | 'response_sent'
  | 'user_created'
  | 'user_deleted'
  | 'data_export'
  | 'data_deletion'
  | 'subscription_created'
  | 'subscription_cancelled'

export async function logAudit({
  orgId,
  userId,
  action,
  entityType,
  entityId,
  metadata,
}: {
  orgId: string
  userId?: string
  action: AuditAction
  entityType: string
  entityId: string
  metadata?: Record<string, unknown>
}) {
  const supabase = getAdminClient()
  await supabase.from('audit_log').insert({
    org_id: orgId,
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata: metadata ?? {},
  })
}
