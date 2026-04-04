import { NextRequest, NextResponse } from 'next/server'
import { generateChatReply, type ChatMessage } from '@/lib/anthropic'
import { getAdminClient } from '@/lib/supabase-admin'

// Allow cross-origin requests from embedded widget iframes
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(request: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  try {
    const body = await request.json() as {
      orgId: string
      conversationId?: string
      visitorSessionId: string
      messages: ChatMessage[]
    }

    const { orgId, visitorSessionId, messages } = body
    if (!orgId || !visitorSessionId || !messages?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: corsHeaders })
    }

    const admin = getAdminClient()

    // Load org + chatbot config
    const { data: org } = await admin
      .from('organizations')
      .select('id, name, plan_id')
      .eq('id', orgId)
      .single()

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404, headers: corsHeaders })
    }

    const { data: config } = await admin
      .from('chatbot_configs')
      .select('chatbot_name, welcome_message, system_prompt, tone')
      .eq('org_id', orgId)
      .single()

    // Generate AI reply
    const reply = await generateChatReply({
      messages,
      systemPrompt: config?.system_prompt ?? '',
      chatbotName: config?.chatbot_name ?? 'Assistent',
      orgName: org.name,
      tone: (config?.tone as 'formal' | 'casual' | 'neutral') ?? 'neutral',
    })

    // Persist conversation + messages (fire-and-forget, don't block response)
    persistMessages(admin, orgId, body.conversationId ?? null, visitorSessionId, messages, reply).catch(console.error)

    return NextResponse.json({ reply }, { headers: corsHeaders })
  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders })
  }
}

async function persistMessages(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  orgId: string,
  existingConversationId: string | null,
  visitorSessionId: string,
  messages: ChatMessage[],
  reply: string
) {
  let conversationId: string | null = null

  // Validate that the provided conversationId belongs to this org before reusing it
  if (existingConversationId) {
    const { data: existing } = await admin
      .from('conversations')
      .select('id')
      .eq('id', existingConversationId)
      .eq('org_id', orgId)
      .single()
    if (existing) conversationId = existingConversationId
  }

  if (!conversationId) {
    const { data: conv } = await admin
      .from('conversations')
      .insert({ org_id: orgId, visitor_session_id: visitorSessionId })
      .select('id')
      .single()
    conversationId = conv?.id
  }

  if (!conversationId) return

  // Save only the last user message + the new assistant reply
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
  const toInsert = []
  if (lastUserMessage) {
    toInsert.push({ conversation_id: conversationId, org_id: orgId, role: 'user', content: lastUserMessage.content })
  }
  toInsert.push({ conversation_id: conversationId, org_id: orgId, role: 'assistant', content: reply })

  await admin.from('messages').insert(toInsert)

  // Update conversation updated_at
  await admin.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId)
}
