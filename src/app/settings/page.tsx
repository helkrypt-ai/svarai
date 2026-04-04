import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
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
  const org = membership.organizations as any as { id: string; name: string; industry: string }

  const { data: config } = await supabase
    .from('chatbot_configs')
    .select('chatbot_name, welcome_message, system_prompt, tone')
    .eq('org_id', org.id)
    .single()

  return (
    <SettingsClient
      user={{ id: user.id, email: user.email! }}
      org={org}
      config={config}
      role={membership.role}
    />
  )
}
