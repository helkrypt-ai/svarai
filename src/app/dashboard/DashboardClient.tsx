'use client'

import { useState, useRef } from 'react'
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

type Tab = 'oversikt' | 'samtaler' | 'kunnskapsbase' | 'innstillinger'

export default function DashboardClient({ user, org, conversations, stats, appUrl }: Props) {
  const [tab, setTab] = useState<Tab>('oversikt')
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [copied, setCopied] = useState(false)
  const [kbContent, setKbContent] = useState('')
  const [kbSaving, setKbSaving] = useState(false)
  const [kbSaved, setKbSaved] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileRead = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      setKbContent(prev => prev ? prev + '\n\n---\n\n' + text : text)
    }
    reader.readAsText(file, 'utf-8')
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileRead(file)
  }

  const handleKbSave = async () => {
    setKbSaving(true)
    await supabase
      .from('chatbot_configs')
      .update({ system_prompt: kbContent })
      .eq('org_id', org.id)
    setKbSaving(false)
    setKbSaved(true)
    setTimeout(() => setKbSaved(false), 2500)
  }

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'oversikt', label: 'Oversikt', icon: '🏠' },
    { id: 'samtaler', label: `Samtaler (${conversations.length})`, icon: '💬' },
    { id: 'kunnskapsbase', label: 'Kunnskapsbase', icon: '📚' },
    { id: 'innstillinger', label: 'Innstillinger', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-blue-600">SvarAI</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-700 font-medium text-sm">{org.name}</span>
          {!org.plan_id && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Gratis</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {!org.plan_id && (
            <Link href="/pricing" className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 font-medium">
              Oppgrader
            </Link>
          )}
          <button onClick={handleSignOut} className="text-sm text-gray-500 hover:text-gray-700">Logg ut</button>
        </div>
      </header>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-0 max-w-4xl">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">

        {/* ─── Oversikt ─── */}
        {tab === 'oversikt' && (
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
            {/* Welcome */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Hei, {user.email.split('@')[0]} 👋
              </h2>
              <p className="text-gray-600 text-sm">
                {stats.total === 0
                  ? 'Ingen samtaler ennå. Installer widgeten på nettsiden din for å komme i gang.'
                  : `${stats.total} samtale${stats.total !== 1 ? 'r' : ''} totalt — ${stats.thisWeek} denne uken.`}
              </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Totale samtaler', value: stats.total, icon: '💬', color: 'text-gray-900' },
                { label: 'Denne uken', value: stats.thisWeek, icon: '📈', color: 'text-blue-600' },
                { label: 'Svartid', value: '< 2 s', icon: '⚡', color: 'text-green-600' },
                { label: 'Tilgjengelighet', value: '24/7', icon: '🟢', color: 'text-green-600' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Widget install */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-1">Installer chatboten</h3>
              <p className="text-sm text-gray-600 mb-4">
                Lim inn denne koden rett før <code className="bg-gray-100 px-1 rounded text-xs">&lt;/body&gt;</code> på nettsiden din.
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

            {/* Recent conversations */}
            {conversations.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Siste samtaler</h3>
                  <button onClick={() => setTab('samtaler')} className="text-sm text-blue-600 hover:underline">Se alle →</button>
                </div>
                <div className="space-y-2">
                  {conversations.slice(0, 4).map(conv => {
                    const lastMsg = conv.messages[conv.messages.length - 1]
                    return (
                      <button
                        key={conv.id}
                        onClick={() => { setTab('samtaler'); setSelected(conv) }}
                        className="w-full text-left flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                          {conv.visitor_session_id.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-gray-900">Besøkende #{conv.visitor_session_id.slice(0, 6)}</div>
                          <div className="text-xs text-gray-500 truncate">{lastMsg?.content.slice(0, 70) ?? '—'}</div>
                        </div>
                        <div className="text-xs text-gray-400 shrink-0 ml-auto">{formatDate(conv.updated_at)}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-1">Kunnskapsbase</h3>
                <p className="text-sm text-gray-600 mb-3">Legg til mer informasjon om bedriften for bedre svar.</p>
                <button onClick={() => setTab('kunnskapsbase')} className="text-sm text-blue-600 font-medium hover:underline">
                  Rediger kunnskapsbase →
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-1">Chatbot-innstillinger</h3>
                <p className="text-sm text-gray-600 mb-3">Tilpass navn, tone og velkomstmelding.</p>
                <Link href="/settings" className="text-sm text-blue-600 font-medium hover:underline">
                  Gå til innstillinger →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ─── Samtaler ─── */}
        {tab === 'samtaler' && (
          <div className="flex flex-1 h-[calc(100vh-120px)]">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-gray-100">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
                  {conversations.length} samtale{conversations.length !== 1 ? 'r' : ''}
                </h2>
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
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selected?.id === conv.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''}`}
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                            {conv.visitor_session_id.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs font-medium text-gray-900 truncate">#{conv.visitor_session_id.slice(0, 6)}</span>
                        </div>
                        <div className="text-xs text-gray-500 truncate pl-8">
                          {lastMsg ? lastMsg.content.slice(0, 55) : '—'}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 pl-8">{formatDate(conv.updated_at)}</div>
                      </button>
                    )
                  })
                )}
              </div>
            </aside>

            {/* Chat view */}
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
                <div className="flex items-center justify-center h-full text-center text-gray-400">
                  <div>
                    <div className="text-5xl mb-4">💬</div>
                    <p className="text-sm">Velg en samtale fra listen til venstre</p>
                  </div>
                </div>
              )}
            </main>
          </div>
        )}

        {/* ─── Kunnskapsbase ─── */}
        {tab === 'kunnskapsbase' && (
          <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Kunnskapsbase</h2>
              <p className="text-gray-600 text-sm">
                Her legger du inn informasjonen chatboten bruker for å svare kundene dine.
                Jo mer og bedre info, jo bedre svar.
              </p>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <h3 className="font-semibold text-blue-800 text-sm mb-2">Tips til hva du bør inkludere</h3>
              <ul className="grid sm:grid-cols-2 gap-1 text-sm text-blue-700">
                {[
                  'Åpningstider og kontaktinfo',
                  'Produkter og tjenester med priser',
                  'Vanlige spørsmål (FAQ)',
                  'Leverings- og betalingsbetingelser',
                  'Returpolicy',
                  'Bedriftens beliggenhet',
                ].map(tip => (
                  <li key={tip} className="flex items-start gap-1.5">
                    <span className="text-blue-400 shrink-0 mt-0.5">✓</span>{tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* File upload */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Last opp tekstfil</h3>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                  dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-4xl mb-3">📄</div>
                <p className="font-medium text-gray-700 text-sm mb-1">Dra og slipp en .txt-fil her</p>
                <p className="text-xs text-gray-400">eller klikk for å velge fil</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.csv"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileRead(f) }}
              />
            </div>

            {/* Text editor */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Rediger innhold</h3>
                <span className="text-xs text-gray-400">{kbContent.length} tegn</span>
              </div>
              <textarea
                value={kbContent}
                onChange={e => setKbContent(e.target.value)}
                rows={16}
                placeholder={`Eks.\nBedrift: Hansen Rørlegger AS\nÅpningstider: Man–Fre 08–17\nKontakt: post@hansen-roer.no | 22 33 44 55\nPriser: 950 kr/time eks. mva\n\nVi tilbyr:\n- Rørleggerarbeid Oslo og omegn\n- Gratis befaring\n- Nødreparasjoner 24/7`}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm resize-none font-mono"
              />
              <button
                onClick={handleKbSave}
                disabled={kbSaving || !kbContent.trim()}
                className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {kbSaved ? '✅ Lagret!' : kbSaving ? 'Lagrer...' : 'Lagre kunnskapsbase'}
              </button>
            </div>
          </div>
        )}

        {/* ─── Innstillinger (link to /settings) ─── */}
        {tab === 'innstillinger' && (
          <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Innstillinger</h2>
              <p className="text-gray-600 text-sm">Administrer bedriftsinfo, chatbot-konfigurasjon og konto.</p>
            </div>
            <div className="grid gap-4">
              {[
                { label: 'Chatbot-konfigurasjon', desc: 'Navn, tone, velkomstmelding', href: '/settings', icon: '🤖' },
                { label: 'Bedriftsinfo', desc: 'Bedriftsnavn og bransje', href: '/settings', icon: '🏢' },
                { label: 'Abonnement', desc: 'Oppgrader eller administrer plan', href: '/pricing', icon: '💳' },
                { label: 'GDPR / Datasletting', desc: 'Slett konto og all data', href: '/settings', icon: '🔒' },
              ].map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 hover:border-blue-200 hover:shadow-sm transition-all group"
                >
                  <div className="text-3xl">{item.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-sm">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                  <div className="text-gray-400 group-hover:text-blue-600 transition-colors">→</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
