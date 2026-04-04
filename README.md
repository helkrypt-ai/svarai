# SvarAI

AI-drevet chatbot-plattform for norske SMBer. Kunder får en embeddable chatbot de kan lime inn på nettsiden sin på under 5 minutter.

## Teknisk stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL, EU West / Frankfurt for GDPR)
- **Auth:** Supabase Auth (e-post/passord + magic link)
- **AI:** Anthropic Claude API (claude-haiku-4-5 for chat)
- **E-post:** Resend (transaksjonell e-post)
- **Betaling:** Stripe (NOK, abonnement)
- **Deployment:** Vercel

## Kom i gang

### 1. Klon og installer

```bash
git clone https://github.com/helkrypt-ai/svarai.git
cd svarai
npm install
```

### 2. Miljøvariabler

```bash
cp .env.example .env.local
# Fyll inn verdiene i .env.local
```

Se `.env.example` for full dokumentasjon av alle nødvendige variabler.

### 3. Supabase-oppsett

1. Opprett nytt Supabase-prosjekt i **EU West (Frankfurt)** regionen
2. Kjør migreringene i SQL Editor i denne rekkefølgen:
   - `supabase/migrations/001_core_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`

### 4. Stripe-oppsett

1. Opprett 3 abonnementsprodukter i Stripe Dashboard (199/399/799 NOK/mnd)
2. Kopier Price IDs til `.env.local` (`STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_ENTERPRISE`)
3. Konfigurer webhook: `https://din-app.vercel.app/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### 5. Kjør lokalt

```bash
npm run dev
```

## Deploy til Vercel

```bash
npm install -g vercel
vercel --prod
```

Legg til alle miljøvariabler fra `.env.example` i Vercel Dashboard → Settings → Environment Variables.

## Mappestruktur

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/                # Innlogging
│   ├── signup/               # Registrering
│   ├── onboarding/           # 3-stegs oppsettveiviser
│   ├── dashboard/            # Hoved-dashboard (samtalehistorikk + stats)
│   ├── settings/             # Bedriftsinnstillinger + chatbot-konfig + GDPR
│   ├── pricing/              # Stripe checkout
│   ├── privacy/              # Personvernpolicy
│   ├── embed/                # Chat-widget iframe (cross-origin)
│   └── api/
│       ├── chat/             # POST — AI chatbot svar (CORS-åpen for widget)
│       ├── chatbot-config/   # GET — widget henter konfig
│       ├── checkout/         # POST — Stripe checkout session
│       ├── gdpr/delete-data  # DELETE — slett alle brukerdata
│       └── webhooks/
│           └── stripe/       # POST — Stripe events
├── lib/
│   ├── supabase.ts           # Browser-klient
│   ├── supabase-server.ts    # Server-klient
│   ├── supabase-admin.ts     # Admin-klient (service role)
│   ├── anthropic.ts          # Claude API + generateChatReply()
│   ├── resend.ts             # E-postutsending
│   ├── stripe.ts             # Stripe checkout + webhooks
│   └── audit.ts              # GDPR audit logging
├── types/
│   └── database.ts           # TypeScript-typer for DB-tabeller
└── middleware.ts              # Auth-beskyttelse av ruter

public/
└── widget.js                 # Embeddable chatbot-snippet

supabase/
└── migrations/
    ├── 001_core_schema.sql   # Tabeller og indekser
    └── 002_rls_policies.sql  # Row Level Security (multi-tenant isolasjon)
```

## Embeddable Widget

Kunder limer inn én kodelinje på nettstedet sitt:

```html
<script src="https://svarai.vercel.app/widget.js" data-org="ORG_ID"></script>
```

Widget-en laster en iframe fra `/embed?org=ORG_ID` og vises som en chatboble nederst til høyre.

## GDPR-compliance

- All data lagres i EU (Supabase Frankfurt)
- Row Level Security — data isolert per organisasjon
- Audit log for all databehandling
- Rett til sletting via Innstillinger eller `DELETE /api/gdpr/delete-data`
- Personvernpolicy på `/privacy`
- Ingen sporings-cookies
