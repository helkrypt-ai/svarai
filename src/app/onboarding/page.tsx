'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const INDUSTRIES = [
  'Handel og detaljhandel',
  'Bygg og anlegg',
  'IT og teknologi',
  'Regnskap og finans',
  'Helse og omsorg',
  'Eiendom',
  'Restaurant og reiseliv',
  'Konsulentvirksomhet',
  'Transport og logistikk',
  'Annet',
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  // Step 1
  const [orgName, setOrgName] = useState('')
  const [industry, setIndustry] = useState('')
  // Step 2
  const [chatbotName, setChatbotName] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState('Hei! Hvordan kan jeg hjelpe deg?')
  // Step 3
  const [systemPrompt, setSystemPrompt] = useState('')
  const [tone, setTone] = useState<'formal' | 'casual' | 'neutral'>('neutral')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const handleComplete = async () => {
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Create organization
    const { data: org, error: orgErr } = await supabase
      .from('organizations')
      .insert({ name: orgName, industry })
      .select()
      .single()

    if (orgErr || !org) {
      setError('Kunne ikke opprette organisasjonen. Prøv igjen.')
      setLoading(false)
      return
    }

    // Add user as owner
    const { error: memberErr } = await supabase
      .from('organization_members')
      .insert({ org_id: org.id, user_id: user.id, role: 'owner' })

    if (memberErr) {
      setError('Kunne ikke knytte bruker til organisasjon.')
      setLoading(false)
      return
    }

    // Create chatbot config
    await supabase.from('chatbot_configs').insert({
      org_id: org.id,
      chatbot_name: chatbotName || `${orgName} Assistent`,
      welcome_message: welcomeMessage,
      system_prompt: systemPrompt,
      tone,
    })

    router.push('/dashboard')
  }

  const steps = [
    { label: 'Bedrift' },
    { label: 'Chatbot' },
    { label: 'Kunnskap' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 ${i + 1 === step ? 'text-blue-600' : i + 1 < step ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i + 1 < step ? 'bg-green-600 text-white' :
                  i + 1 === step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className={`w-8 h-0.5 ${i + 1 < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Om bedriften din</h2>
              <p className="text-gray-500 text-sm mb-6">Grunnleggende info om selskapet.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedriftsnavn *</label>
                  <input
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    placeholder="Eks. Hansen Rørlegger AS"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bransje *</label>
                  <select
                    value={industry}
                    onChange={e => setIndustry(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Velg bransje...</option>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Din chatbot</h2>
              <p className="text-gray-500 text-sm mb-6">Navn og hilsen som vises til besøkende.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chatbot-navn</label>
                  <input
                    value={chatbotName}
                    onChange={e => setChatbotName(e.target.value)}
                    placeholder={`${orgName || 'Bedrift'} Assistent`}
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
                      { val: 'formal', label: 'Formell', desc: 'Profesjonell' },
                      { val: 'neutral', label: 'Nøytral', desc: 'Balansert' },
                      { val: 'casual', label: 'Uformell', desc: 'Vennlig' },
                    ] as const).map(t => (
                      <button
                        key={t.val}
                        type="button"
                        onClick={() => setTone(t.val)}
                        className={`p-3 rounded-xl border-2 text-left transition-colors ${
                          tone === t.val ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-semibold text-sm text-gray-900">{t.label}</div>
                        <div className="text-xs text-gray-500">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Hva vet chatboten?</h2>
              <p className="text-gray-500 text-sm mb-6">
                Beskriv bedriften din — produkter, åpningstider, priser, kontaktinfo.
                Jo mer info, jo bedre svar.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Informasjon om bedriften</label>
                <textarea
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  rows={10}
                  placeholder={`Eks.\n${orgName || 'Bedriften'} tilbyr rørleggertjenester i Oslo-området.\nÅpningstider: Man–Fre 08–17.\nKontakt: post@bedrift.no | 22 33 44 55\nPriser: Timeprisen er 950 kr eks. mva.\nVi tilbyr gratis befaring.`}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">Kan oppdateres når som helst i innstillingene.</p>
              </div>
            </>
          )}

          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mt-4">{error}</p>}

          <div className="flex justify-between mt-8">
            {step > 1
              ? <button onClick={() => setStep(s => s - 1)} className="px-5 py-2.5 text-gray-600 font-medium hover:text-gray-900">← Tilbake</button>
              : <div />}

            {step < 3
              ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  disabled={step === 1 && (!orgName.trim() || !industry)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40"
                >
                  Neste →
                </button>
              )
              : (
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40"
                >
                  {loading ? 'Setter opp...' : 'Gå til dashboard →'}
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
