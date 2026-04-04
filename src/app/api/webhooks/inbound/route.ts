import { NextResponse } from 'next/server'
// Removed: email inbound webhook is not part of the chatbot SaaS MVP.
export async function POST() {
  return NextResponse.json({ error: 'Not implemented' }, { status: 410 })
}
