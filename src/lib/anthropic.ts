import Anthropic from '@anthropic-ai/sdk'

let _client: Anthropic | null = null

export function getAnthropicClient() {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

// Use Haiku for chatbot — fast and cost-effective for real-time chat
export const CHAT_MODEL = 'claude-haiku-4-5-20251001'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatOptions {
  messages: ChatMessage[]
  systemPrompt: string
  chatbotName: string
  orgName: string
  tone: 'formal' | 'casual' | 'neutral'
}

export async function generateChatReply(opts: ChatOptions): Promise<string> {
  const client = getAnthropicClient()

  const toneGuide = {
    formal: 'Du bruker en formell, profesjonell tone.',
    casual: 'Du bruker en vennlig, uformell tone.',
    neutral: 'Du bruker en nøytral og saklig tone.',
  }

  const systemPrompt = `Du er ${opts.chatbotName}, chatbot-assistent for ${opts.orgName}.
${toneGuide[opts.tone]}
Svar primært på norsk, men følg gjerne kundens språk om de skriver på engelsk.
Vær hjelpsom, presis og kortfattet.

${opts.systemPrompt ? `Informasjon om bedriften:\n${opts.systemPrompt}` : ''}`

  const response = await client.messages.create({
    model: CHAT_MODEL,
    max_tokens: 512,
    system: systemPrompt,
    messages: opts.messages,
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected AI response type')
  return block.text
}
