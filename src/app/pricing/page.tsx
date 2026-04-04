'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PLANS } from '@/lib/stripe'

export default function PricingPage() {
  const router = useRouter()

  const handleCheckout = async (planId: string) => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else if (res.status === 401) {
      router.push('/signup')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold text-blue-600">SvarAI</Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Logg inn</Link>
          <Link href="/signup" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">Kom i gang</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Enkle, transparente priser</h1>
          <p className="text-xl text-gray-600">Start gratis — oppgrader når du trenger mer</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {(Object.entries(PLANS) as [string, typeof PLANS[keyof typeof PLANS]][]).map(([id, plan]) => (
            <div key={id} className={`bg-white rounded-2xl border-2 p-8 ${id === 'pro' ? 'border-blue-500 shadow-lg shadow-blue-100' : 'border-gray-200'}`}>
              {id === 'pro' && (
                <div className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4">Mest populær</div>
              )}
              <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
              <div className="mt-4 mb-6">
                <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-500 ml-1">NOK/mnd</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-500 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout(id)}
                className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                  id === 'pro'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Velg {plan.name}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Alle priser inkl. MVA · Faktureres månedlig · Avbryt når som helst
        </p>
      </main>
    </div>
  )
}
