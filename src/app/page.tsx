import Link from 'next/link'

export default function Home() {
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
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-28 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          AI-drevet kundeservice 24/7
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6 max-w-3xl mx-auto">
          Legg en AI-chatbot på nettsiden din — <span className="text-blue-600">på 5 minutter</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          SvarAI gir norske SMBer en smart chatbot som svarer kundehenvendelser automatisk,
          hele døgnet. Enkel oppsett, ingen koding nødvendig.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
            Start gratis prøveperiode
          </Link>
          <Link href="/pricing" className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-colors border-2 border-blue-200">
            Se priser
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-4">14 dager gratis · Ingen kredittkort nødvendig</p>
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
              },
              {
                step: '2',
                title: 'Konfigurer chatboten',
                desc: 'Gi chatboten et navn, skriv inn hva den vet om bedriften din, og velg tone.',
              },
              {
                step: '3',
                title: 'Lim inn kode-snippet',
                desc: 'Kopier én kodelinje og lim den inn på nettsiden din. Chatboten er live.',
              },
            ].map(s => (
              <div key={s.step} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mb-4">
                  {s.step}
                </div>
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
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Alt du trenger i én løsning</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🤖', title: 'Claude AI', desc: 'Drevet av Anthropics Claude — en av verdens beste AI-modeller for norsk tekst.' },
              { icon: '⚡', title: 'Lynrask', desc: 'Svar innen sekunder, hele døgnet. Ingen ventetid for kundene dine.' },
              { icon: '🏢', title: 'Multi-tenant SaaS', desc: 'Hver bedrift har sitt eget isolerte miljø, sin egen bot og sine egne data.' },
              { icon: '🔒', title: 'GDPR-compliant', desc: 'All data lagres i EU (Supabase EU West). Rett til innsyn og sletting.' },
              { icon: '📊', title: 'Samtalehistorikk', desc: 'Se alle chat-samtaler fra kundenettstedene dine i ett dashboard.' },
              { icon: '🎨', title: 'Tilpassbar', desc: 'Gi chatboten bedriftens navn, tone og kunnskap om produktene dine.' },
            ].map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
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
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-sm text-gray-500">
        <p>© 2025 SvarAI · <Link href="/privacy" className="hover:text-gray-700">Personvern</Link></p>
      </footer>
    </main>
  )
}
