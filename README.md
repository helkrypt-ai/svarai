# SvarAI

AI-drevet e-postsvar-applikasjon for norske SMBer.

## Teknisk stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL, EU-region for GDPR)
- **Auth:** Supabase Auth (e-post/passord + magic link)
- **E-post:** Resend (inbound webhooks + outbound)
- **AI:** Anthropic Claude API (claude-sonnet-4-6)
- **Betaling:** Stripe (NOK)
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

### 3. Supabase-oppsett

1. Opprett nytt Supabase-prosjekt i EU-regionen (Frankfurt)
2. Kjør migreringene i SQL Editor:
   - supabase/migrations/001_core_schema.sql
   - supabase/migrations/002_rls_policies.sql

### 4. Resend-oppsett

1. Bekreft domenet ditt i Resend Dashboard
2. Aktiver Inbound email → webhook: https://din-app.vercel.app/api/webhooks/inbound
3. Lagre inbound-adressen per org i organizations.inbound_email

### 5. Stripe-oppsett

1. Opprett produkter (199/399/799 NOK/mnd) og kopier Price IDs til .env.local
2. Konfigurer webhook: https://din-app.vercel.app/api/webhooks/stripe
   Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted

### 6. Kjør lokalt

```bash
npm run dev
```

## Deploy til Vercel

```bash
npm install -g vercel
vercel --prod
```

Legg til miljøvariabler i Vercel Dashboard.

## Mappestruktur

```
src/
├── app/
│   ├── page.tsx             # Landing page
│   ├── login/               # Innlogging (passord + magic link)
│   ├── signup/              # Registrering
│   ├── onboarding/          # 3-stegs oppsettveiviser
│   ├── dashboard/           # Hoved-dashboard med e-postliste
│   ├── settings/            # Bedriftsinnstillinger + GDPR
│   ├── pricing/             # Stripe checkout
│   ├── privacy/             # Personvernpolicy
│   └── api/
│       ├── ai/generate/     # POST — generer AI-svar
│       ├── emails/send/     # POST — send godkjent svar
│       ├── checkout/        # POST — Stripe checkout session
│       ├── gdpr/delete-data # DELETE — slett alle brukerdata
│       └── webhooks/
│           ├── inbound/     # POST — Resend inbound e-post
│           └── stripe/      # POST — Stripe events
├── lib/
│   ├── supabase.ts          # Browser-klient
│   ├── supabase-server.ts   # Server-klient
│   ├── supabase-admin.ts    # Admin-klient (service role)
│   ├── anthropic.ts         # Claude API + generateEmailReply()
│   ├── resend.ts            # E-postutsending
│   ├── stripe.ts            # Stripe checkout + webhooks
│   └── audit.ts             # GDPR audit logging
├── types/
│   └── database.ts          # TypeScript-typer for DB-tabeller
└── middleware.ts             # Auth-beskyttelse av ruter

supabase/
└── migrations/
    ├── 001_core_schema.sql  # Tabeller og indekser
    └── 002_rls_policies.sql # Row Level Security (multi-tenant)
```

## GDPR-compliance

- All data lagres i EU (Supabase Frankfurt)
- Row Level Security — data isolert per organisasjon
- Audit log for all databehandling
- Rett til sletting via Innstillinger eller DELETE /api/gdpr/delete-data
- Personvernpolicy tilgjengelig på /privacy
- Ingen sporings-cookies
