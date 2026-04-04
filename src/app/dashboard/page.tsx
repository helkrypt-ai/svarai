import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('organization_members')
    .select('org_id, role, organizations(*)')
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/onboarding')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const org = membership.organizations as any as { id: string; name: string; plan_id: string | null }

  // Fetch recent conversations with messages
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, visitor_session_id, created_at, updated_at, messages(role, content, created_at)')
    .eq('org_id', org.id)
    .order('updated_at', { ascending: false })
    .limit(50)

  const total = conversations?.length ?? 0
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const thisWeek = conversations?.filter(c => c.created_at > oneWeekAgo).length ?? 0

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://svarai.vercel.app'

  return (
    <DashboardClient
      user={{ id: user.id, email: user.email! }}
      org={org}
      conversations={conversations ?? []}
      stats={{ total, thisWeek }}
      appUrl={appUrl}
    />
  )
}
