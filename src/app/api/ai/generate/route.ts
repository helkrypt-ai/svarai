import { NextResponse } from 'next/server'
// Deprecated: use /api/chat for chatbot responses.
export async function POST() {
  return NextResponse.json({ error: 'Use /api/chat' }, { status: 410 })
}
