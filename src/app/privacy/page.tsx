import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-blue-600">SvarAI</Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 prose prose-gray">
        <h1>Personvernpolicy</h1>
        <p className="text-gray-500">Sist oppdatert: April 2025</p>

        <h2>1. Hvem behandler dataene dine?</h2>
        <p>SvarAI (heretter «vi», «oss») er behandlingsansvarlig for personopplysningene vi samler inn.</p>

        <h2>2. Hvilke data samler vi inn?</h2>
        <ul>
          <li><strong>Kontodata:</strong> E-postadresse og passord (hashed via Supabase Auth)</li>
          <li><strong>Organisasjonsdata:</strong> Bedriftsnavn, bransje, e-postsignatur</li>
          <li><strong>E-postinnhold:</strong> Innkommende e-poster og AI-genererte svar</li>
          <li><strong>Betalingsdata:</strong> Behandles eksklusivt av Stripe — vi lagrer ikke kortnummer</li>
          <li><strong>Brukslogg:</strong> Handlinger utført i systemet (for GDPR-sporbarhet)</li>
        </ul>

        <h2>3. Datalagring — EU-region</h2>
        <p>
          All data lagres i Supabase sin EU-region (Frankfurt, Tyskland).
          Vi bruker ingen tjenester som lagrer data utenfor EØS-området uten tilstrekkelige garantier.
        </p>

        <h2>4. Behandlingsgrunnlag</h2>
        <ul>
          <li><strong>Avtale:</strong> Kjøp og levering av tjenesten</li>
          <li><strong>Berettiget interesse:</strong> Sikkerhet og forebygging av misbruk</li>
          <li><strong>Samtykke:</strong> Markedsføring (kun med eksplisitt samtykke)</li>
        </ul>

        <h2>5. Dine rettigheter (GDPR)</h2>
        <ul>
          <li><strong>Innsyn:</strong> Du kan be om en kopi av alle data vi har lagret om deg</li>
          <li><strong>Retting:</strong> Du kan oppdatere feilaktige data i innstillingene</li>
          <li><strong>Sletting:</strong> Du kan slette kontoen og alle data via Innstillinger → Datasletting</li>
          <li><strong>Portabilitet:</strong> Kontakt oss for å få data i maskinlesbart format</li>
          <li><strong>Innsigelse:</strong> Du kan protestere mot behandling basert på berettiget interesse</li>
        </ul>

        <h2>6. Informasjonskapsler (cookies)</h2>
        <p>
          Vi bruker kun nødvendige cookies for autentisering (session-token fra Supabase).
          Vi bruker ingen sporings- eller annonseringscookies.
        </p>

        <h2>7. Tredjeparter</h2>
        <ul>
          <li><strong>Supabase</strong> (database og auth) — EU-region</li>
          <li><strong>Anthropic</strong> (AI-behandling) — data sendes kun for å generere svar</li>
          <li><strong>Resend</strong> (e-postutsending) — kun teknisk nødvendig data</li>
          <li><strong>Stripe</strong> (betaling) — deres egen personvernpolicy gjelder</li>
          <li><strong>Vercel</strong> (hosting) — EU servere tilgjengelig</li>
        </ul>

        <h2>8. Sikkerhet</h2>
        <p>
          Vi bruker kryptert tilkobling (HTTPS), row-level security i databasen og
          tilgangskontroll slik at kun autoriserte brukere kan se din organisasjons data.
        </p>

        <h2>9. Kontakt</h2>
        <p>
          For spørsmål om personvern: <a href="mailto:personvern@svarai.no">personvern@svarai.no</a><br />
          Du kan også klage til Datatilsynet: <a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer">datatilsynet.no</a>
        </p>
      </main>
    </div>
  )
}
