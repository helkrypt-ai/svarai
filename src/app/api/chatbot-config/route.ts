import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get('org')
  if (!orgId) {
    return NextResponse.json({ error: 'Missing org' }, { status: 400, headers: corsHeaders })
  }

  try {
    const admin = getAdminClient()
    const { data } = await admin
      .from('chatbot_configs')
      .select('chatbot_name, welcome_message')
      .eq('org_id', orgId)
      .single()

    return NextResponse.json(
      {
        chatbotName: data?.chatbot_name ?? 'Assistent',
        welcomeMessage: data?.welcome_message ?? 'Hei! Hvordan kan jeg hjelpe deg?',
      },
      { headers: corsHeaders }
    )
  } catch (err) {
    console.error('chatbot-config error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
  }
}
