'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface Conversation {
  id: string
  visitor_session_id: string
  created_at: string
  updated_at: string
  messages: Array<{ role: string; content: string; created_at: string }>
}

interface Props {
  user: { id: string; email: string }
  org: { id: string; name: string; plan_id: string | null }
  conversations: Conversation[]
  stats: { total: number; thisWeek: number }
  appUrl: string
}

export default function DashboardClient({ user, org, conversations, stats, appUrl }: Props) {
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const snippetCode = `<script src="${appUrl}/widget.js" data-org="${org.id}" defer></script>`

  const handleCopy = () => {
    navigator.clipboard.writeText(snippetCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('no-NO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-blue-600">SvarAI</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-700 font-medium text-sm">{org.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/settings" className="text-sm text-gray-600 hover:text-gray-900">Innstillinger</Link>
          {!org.plan_id && (
            <Link href="/pricing" className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
              Oppgrader
            </Link>
          )}
          <button onClick={handleSignOut} className="text-sm text-gray-500 hover:text-gray-700">Logg ut</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          {/* Stats */}
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm mb-3">Statistikk</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-xs text-gray-500 mt-0.5">Totalt</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.thisWeek}</div>
                <div className="text-xs text-gray-500 mt-0.5">Denne uken</div>
              </div>
            </div>
          </div>

          {/* Conversations list */}
          <div className="p-3 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mb-2">Samtaler</h2>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                <div className="text-3xl mb-2">💬</div>
                Ingen samtaler ennå.<br />Installer widgeten for å komme i gang.
              </div>
            ) : (
              conversations.map(conv => {
                const lastMsg = conv.messages[conv.messages.length - 1]
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelected(conv)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selected?.id === conv.id ? 'bg-blue-50' : ''}`}
                  >
                    <div className="text-xs font-medium text-gray-900 mb-0.5 truncate">
                      Besøkende #{conv.visitor_session_id.slice(0, 6)}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {lastMsg ? lastMsg.content.slice(0, 60) : '—'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{formatDate(conv.updated_at)}</div>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-6">
          {selected ? (
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">
                  Samtale — Besøkende #{selected.visitor_session_id.slice(0, 6)}
                </h2>
                <span className="text-xs text-gray-400">{formatDate(selected.created_at)}</span>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                {selected.messages.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">Ingen meldinger i denne samtalen.</p>
                ) : (
                  selected.messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Welcome */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Hei, {user.email.split('@')[0]} 👋
                </h2>
                <p className="text-gray-600 text-sm">
                  {stats.total === 0
                    ? 'Ingen samtaler ennå. Installer widgeten på nettsiden din for å komme i gang.'
                    : `${stats.total} samtale${stats.total !== 1 ? 'r' : ''} totalt. Velg en fra listen til venstre.`}
                </p>
              </div>

              {/* Widget install */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-1">Installer chatboten</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Lim inn denne koden rett før <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code> på nettsiden din.
                </p>
                <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-green-400 break-all">
                  {snippetCode}
                </div>
                <button
                  onClick={handleCopy}
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  {copied ? '✅ Kopiert!' : 'Kopier kode'}
                </button>
              </div>

              {/* Settings CTA */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-1">Konfigurer chatboten</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Tilpass navn, tone og hva chatboten vet om bedriften din.
                </p>
                <Link href="/settings" className="inline-block text-sm text-blue-600 font-medium hover:underline">
                  Gå til innstillinger →
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
