'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface ChatbotConfig {
  chatbot_name: string
  welcome_message: string
  system_prompt: string
  tone: string
}

interface Props {
  user: { id: string; email: string }
  org: { id: string; name: string; industry: string }
  config: ChatbotConfig | null
  role: string
}

export default function SettingsClient({ user, org, config, role }: Props) {
  // Org fields
  const [orgName, setOrgName] = useState(org.name)
  const [industry, setIndustry] = useState(org.industry)

  // Chatbot config fields
  const [chatbotName, setChatbotName] = useState(config?.chatbot_name ?? '')
  const [welcomeMessage, setWelcomeMessage] = useState(config?.welcome_message ?? 'Hei! Hvordan kan jeg hjelpe deg?')
  const [systemPrompt, setSystemPrompt] = useState(config?.system_prompt ?? '')
  const [tone, setTone] = useState(config?.tone ?? 'neutral')

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    await supabase
      .from('organizations')
      .update({ name: orgName, industry })
      .eq('id', org.id)

    if (config) {
      await supabase
        .from('chatbot_configs')
        .update({ chatbot_name: chatbotName, welcome_message: welcomeMessage, system_prompt: systemPrompt, tone })
        .eq('org_id', org.id)
    } else {
      await supabase
        .from('chatbot_configs')
        .insert({ org_id: org.id, chatbot_name: chatbotName, welcome_message: welcomeMessage, system_prompt: systemPrompt, tone })
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleDelete = async () => {
    const res = await fetch('/api/gdpr/delete-data', { method: 'DELETE' })
    if (res.ok) {
      await supabase.auth.signOut()
      router.push('/')
    }
  }

  const isAdmin = role === 'owner' || role === 'admin'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
          ← <span className="font-bold text-blue-600">SvarAI</span>
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Innstillinger</h1>
        <div className="w-20" />
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Organization */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Bedriftsinfo</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedriftsnavn</label>
                <input
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  disabled={!isAdmin}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bransje</label>
                <input
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  disabled={!isAdmin}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Chatbot config */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Chatbot-konfigurasjon</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chatbot-navn</label>
                <input
                  value={chatbotName}
                  onChange={e => setChatbotName(e.target.value)}
                  placeholder="Assistent"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Velkomstmelding</label>
                <input
                  value={welcomeMessage}
                  onChange={e => setWelcomeMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { val: 'formal', label: 'Formell' },
                    { val: 'neutral', label: 'Nøytral' },
                    { val: 'casual', label: 'Uformell' },
                  ] as const).map(t => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => setTone(t.val)}
                      className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                        tone === t.val ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kunnskap om bedriften
                  <span className="ml-1 text-xs text-gray-400">(hva chatboten vet)</span>
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  rows={8}
                  placeholder="Beskriv bedriften, produkter, priser, åpningstider, kontaktinfo..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm resize-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saved ? '✅ Lagret!' : saving ? 'Lagrer...' : 'Lagre innstillinger'}
          </button>
        </form>

        {/* Account */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Konto</h2>
          <p className="text-sm text-gray-600 mb-3">Innlogget som <strong>{user.email}</strong></p>
          <Link href="/pricing" className="text-sm text-blue-600 hover:underline font-medium">
            Administrer abonnement →
          </Link>
        </div>

        {/* GDPR */}
        <div className="bg-white rounded-2xl border border-red-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-2">Datasletting (GDPR)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Du kan slette all data vi har lagret om deg og bedriften din. Dette er permanent og kan ikke angres.
          </p>
          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Slett konto og all data
            </button>
          ) : (
            <div className="bg-red-50 p-4 rounded-xl">
              <p className="text-sm font-semibold text-red-800 mb-3">Er du sikker? Alle samtaler og data slettes permanent.</p>
              <div className="flex gap-3">
                <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">Ja, slett alt</button>
                <button onClick={() => setDeleteConfirm(false)} className="text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-100">Avbryt</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
