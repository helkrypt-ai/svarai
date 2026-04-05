'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

/* ─── Simulated demo chat ─── */
const DEMO_SCRIPT = [
  { role: 'assistant' as const, text: 'Hei! Jeg er Hansen Rørlegger sin AI-assistent. Hvordan kan jeg hjelpe deg?' },
  { role: 'user' as const, text: 'Hva koster en time hos dere?' },
  { role: 'assistant' as const, text: 'Vi tar 950 kr per time eks. mva. for vanlig rørleggerarbeid. Utrykning kveld/helg koster 1 350 kr/t. Befaring er alltid gratis — ønsker du å booke?' },
  { role: 'user' as const, text: 'Ja, kan jeg få time fredag?' },
  { role: 'assistant' as const, text: 'Absolutt! Fredag har vi ledige tider kl. 09:00 og 13:00. Ring 22 33 44 55 eller send e-post til post@hansen-roer.no, så fikser vi en tid.' },
]

function DemoChat() {
  const [shown, setShown] = useState<typeof DEMO_SCRIPT>([])
  const [typing, setTyping] = useState(false)
  const [demoInput, setDemoInput] = useState('')
  const [phase, setPhase] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (phase >= DEMO_SCRIPT.length) return
    const msg = DEMO_SCRIPT[phase]
    if (msg.role === 'assistant') {
      setTyping(true)
      const t = setTimeout(() => {
        setTyping(false)
        setShown(prev => [...prev, msg])
        setPhase(p => p + 1)
      }, 1200 + msg.text.length * 12)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => {
        setDemoInput(msg.text)
        const t2 = setTimeout(() => {
          setDemoInput('')
          setShown(prev => [...prev, msg])
          setPhase(p => p + 1)
        }, 900)
        return () => clearTimeout(t2)
      }, 600)
      return () => clearTimeout(t)
    }
  }, [phase])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [shown, typing])

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-2xl shadow-blue-200/60 border border-gray-100">
      {/* Chat header */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-blue-600 shrink-0">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold">H</div>
        <div>
          <div className="text-white text-sm font-semibold leading-tight">Hansen Assistent</div>
          <div className="flex items-center gap-1 text-blue-100 text-xs"><span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />Tilgjengelig nå</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50/50">
        {shown.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-gray-100 bg-white shrink-0">
        <div className="flex gap-2 items-center">
          <div className="flex-1 text-sm px-4 py-2.5 rounded-full border border-gray-200 bg-gray-50 text-gray-500 truncate min-h-[40px] flex items-center">
            {demoInput || <span className="text-gray-400">Skriv en melding...</span>}
          </div>
          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center shrink-0 opacity-50">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-4 h-4">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">Drevet av <span className="font-medium">SvarAI</span></p>
      </div>
    </div>
  )
}

/* ─── Testimonials ─── */
const TESTIMONIALS = [
  {
    quote: 'SvarAI svarer på 80% av kundehenvendelsene våre automatisk. Vi sparer minst 10 timer i uken.',
    name: 'Kari Johansen',
    role: 'Daglig leder, Johansen Elektro AS',
    initials: 'KJ',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    quote: 'Chatboten er alltid tilgjengelig, også natt og helg. Kundene elsker det — vi får færre ubesvarte henvendelser.',
    name: 'Anders Bakke',
    role: 'Eier, Bakke Rørleggertjenester',
    initials: 'AB',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    quote: 'Satt opp på 15 minutter. Ingen koding, bare lim inn en kodelinje. Imponerende enkelt.',
    name: 'Lene Strand',
    role: 'Markedssjef, Strand Eiendom',
    initials: 'LS',
    color: 'bg-green-100 text-green-700',
  },
]

export default function Home() {
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true) }, { threshold: 0.3 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-2xl font-bold text-blue-600">SvarAI</span>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Priser</Link>
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Logg inn</Link>
          <Link href="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
            Kom i gang gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-0">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              AI-drevet kundeservice 24/7
            </div>
            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
              Legg en AI-chatbot på nettsiden din —{' '}
              <span className="text-blue-600">på 5 minutter</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              SvarAI gir norske SMBer en smart chatbot som svarer kundehenvendelser automatisk,
              hele døgnet. Enkel oppsett, ingen koding nødvendig.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup" className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 text-center">
                Start gratis prøveperiode
              </Link>
              <Link href="/pricing" className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-colors border-2 border-blue-200 text-center">
                Se priser
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">14 dager gratis · Ingen kredittkort nødvendig</p>

            {/* Trust logos */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Brukt av norske bedrifter i</p>
              <div className="flex flex-wrap gap-4 items-center">
                {['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Tromsø'].map(city => (
                  <span key={city} className="text-sm font-medium text-gray-500">{city}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — live demo */}
          <div className="h-[420px] lg:h-[480px]">
            <DemoChat />
          </div>
        </div>
      </section>

      {/* Social proof stats */}
      <section ref={statsRef} className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: statsVisible ? '2 400+' : '—', label: 'Bedrifter som bruker SvarAI' },
            { value: statsVisible ? '98 %' : '—', label: 'Kundetilfredshet' },
            { value: statsVisible ? '< 2 sek' : '—', label: 'Gjennomsnittlig svartid' },
            { value: statsVisible ? '24/7' : '—', label: 'Tilgjengelig alltid' },
          ].map((s, i) => (
            <div key={i} className="text-center p-6 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="text-3xl font-bold text-blue-600 mb-1 transition-all duration-700">{s.value}</div>
              <div className="text-sm text-gray-600">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Slik fungerer det</h2>
          <p className="text-center text-gray-600 mb-16 max-w-xl mx-auto">
            Fra registrering til live chatbot på nettsiden din — alt på under 10 minutter.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Registrer deg og velg plan',
                desc: 'Opprett en konto, velg abonnement og sett opp bedriftsprofilen din.',
                icon: '🏢',
              },
              {
                step: '2',
                title: 'Konfigurer chatboten',
                desc: 'Gi chatboten et navn, skriv inn hva den vet om bedriften din, og velg tone.',
                icon: '🤖',
              },
              {
                step: '3',
                title: 'Lim inn kode-snippet',
                desc: 'Kopier én kodelinje og lim den inn på nettsiden din. Chatboten er live.',
                icon: '⚡',
              },
            ].map(s => (
              <div key={s.step} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative">
                <div className="absolute -top-4 left-6 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md shadow-blue-200">
                  {s.step}
                </div>
                <div className="text-3xl mb-4 mt-2">{s.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Alt du trenger i én løsning</h2>
          <p className="text-center text-gray-600 mb-16 max-w-xl mx-auto">Profesjonell AI-kundeservice uten kompleksitet eller kostnader ved ansettelse.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🤖', title: 'Claude AI', desc: 'Drevet av Anthropics Claude — en av verdens beste AI-modeller for norsk tekst.' },
              { icon: '⚡', title: 'Lynrask', desc: 'Svar innen sekunder, hele døgnet. Ingen ventetid for kundene dine.' },
              { icon: '🏢', title: 'Multi-tenant SaaS', desc: 'Hver bedrift har sitt eget isolerte miljø, sin egen bot og sine egne data.' },
              { icon: '🔒', title: 'GDPR-compliant', desc: 'All data lagres i EU (Supabase EU West). Rett til innsyn og sletting.' },
              { icon: '📊', title: 'Samtalehistorikk', desc: 'Se alle chat-samtaler fra kundenettstedene dine i ett dashboard.' },
              { icon: '🎨', title: 'Tilpassbar', desc: 'Gi chatboten bedriftens navn, tone og kunnskap om produktene dine.' },
            ].map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all group">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform inline-block">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Norske bedrifter elsker SvarAI</h2>
          <p className="text-center text-gray-600 mb-16 max-w-xl mx-auto">Se hva kundene våre sier om opplevelsen med SvarAI.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${t.color}`}>{t.initials}</div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Klar til å prøve?</h2>
          <p className="text-blue-100 text-lg mb-8">
            Start gratis i dag. Ingen kredittkort, ingen bindingstid.
          </p>
          <Link href="/signup" className="inline-block bg-white text-blue-600 px-10 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg">
            Kom i gang gratis →
          </Link>
          <p className="text-blue-200 text-sm mt-4">14 dager gratis prøveperiode · Over 2 400 norske bedrifter</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xl font-bold text-blue-600">SvarAI</span>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/pricing" className="hover:text-gray-700">Priser</Link>
            <Link href="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
            <Link href="/personvern" className="hover:text-gray-700">Personvernerklæring</Link>
            <Link href="/login" className="hover:text-gray-700">Logg inn</Link>
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} Helkrypt AI AS</p>
        </div>
      </footer>
    </main>
  )
}
