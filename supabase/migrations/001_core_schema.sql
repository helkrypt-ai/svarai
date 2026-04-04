-- ============================================================
-- SvarAI Core Schema — Multi-tenant Chatbot SaaS
-- Run against a fresh Supabase project in EU West (Frankfurt) for GDPR.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Organizations (multi-tenant root — one row per paying customer)
-- ============================================================
CREATE TABLE IF NOT EXISTS organizations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                TEXT NOT NULL,
  industry            TEXT NOT NULL DEFAULT 'Annet',
  plan_id             TEXT CHECK (plan_id IN ('starter', 'pro', 'enterprise')),
  stripe_customer_id  TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Organization Members
-- ============================================================
CREATE TABLE IF NOT EXISTS organization_members (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id, user_id)
);

-- ============================================================
-- Chatbot Configs (one per org — the bot's personality + knowledge)
-- ============================================================
CREATE TABLE IF NOT EXISTS chatbot_configs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  chatbot_name    TEXT NOT NULL DEFAULT 'Assistent',
  welcome_message TEXT NOT NULL DEFAULT 'Hei! Hvordan kan jeg hjelpe deg?',
  system_prompt   TEXT NOT NULL DEFAULT '',
  tone            TEXT NOT NULL DEFAULT 'neutral' CHECK (tone IN ('formal', 'casual', 'neutral')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Conversations (one per chat session on a customer website)
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  visitor_session_id  TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Messages (individual chat turns)
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Subscriptions (Stripe)
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id                  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_subscription_id  TEXT UNIQUE NOT NULL,
  stripe_customer_id      TEXT NOT NULL,
  plan_id                 TEXT NOT NULL CHECK (plan_id IN ('starter', 'pro', 'enterprise')),
  status                  TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'cancelled')),
  current_period_end      TIMESTAMPTZ NOT NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Audit Log (GDPR traceability)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   TEXT NOT NULL,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_org_members_user       ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org        ON organization_members(org_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_configs_org    ON chatbot_configs(org_id);
CREATE INDEX IF NOT EXISTS idx_conversations_org      ON conversations(org_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated  ON conversations(org_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation  ON messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_org           ON messages(org_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org      ON subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_org          ON audit_log(org_id);

-- ============================================================
-- updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_chatbot_configs_updated_at
  BEFORE UPDATE ON chatbot_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
