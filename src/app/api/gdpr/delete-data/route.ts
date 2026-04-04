import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/supabase-admin'

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = getAdminClient()

    // Get all org memberships
    const { data: memberships } = await admin
      .from('organization_members')
      .select('org_id, role')
      .eq('user_id', user.id)

    // For orgs where user is the sole owner, delete the entire org
    for (const m of memberships ?? []) {
      if (m.role === 'owner') {
        const { count } = await admin
          .from('organization_members')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', m.org_id)

        if (count === 1) {
          // Sole owner — delete org (cascades to threads, responses, audit_log, etc.)
          await admin.from('organizations').delete().eq('id', m.org_id)
        } else {
          // Other members exist — just remove this user
          await admin.from('organization_members').delete()
            .eq('org_id', m.org_id).eq('user_id', user.id)
        }
      } else {
        await admin.from('organization_members').delete()
          .eq('org_id', m.org_id).eq('user_id', user.id)
      }
    }

    // Delete auth user (Supabase will cascade via FK)
    await admin.auth.admin.deleteUser(user.id)

    return NextResponse.json({ deleted: true })
  } catch (err) {
    console.error('GDPR delete error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
