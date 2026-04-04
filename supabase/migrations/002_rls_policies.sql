-- ============================================================
-- Row Level Security Policies — SvarAI Multi-tenant
-- ============================================================

ALTER TABLE organizations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_configs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log           ENABLE ROW LEVEL SECURITY;

-- Helper: is the current authenticated user a member of this org?
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.org_id = $1
      AND organization_members.user_id = auth.uid()
  )
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: is the user an owner or admin of this org?
CREATE OR REPLACE FUNCTION is_org_admin(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_members.org_id = $1
      AND organization_members.user_id = auth.uid()
      AND role IN ('owner', 'admin')
  )
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- Organizations
-- ============================================================
CREATE POLICY "org_select" ON organizations
  FOR SELECT USING (is_org_member(id));

CREATE POLICY "org_update" ON organizations
  FOR UPDATE USING (is_org_admin(id));

CREATE POLICY "org_insert" ON organizations
  FOR INSERT WITH CHECK (true); -- server-controlled

-- ============================================================
-- Organization Members
-- ============================================================
CREATE POLICY "member_select" ON organization_members
  FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "member_insert" ON organization_members
  FOR INSERT WITH CHECK (is_org_admin(org_id) OR user_id = auth.uid());

CREATE POLICY "member_delete" ON organization_members
  FOR DELETE USING (is_org_admin(org_id));

-- ============================================================
-- Chatbot Configs
-- ============================================================
CREATE POLICY "chatbot_select" ON chatbot_configs
  FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "chatbot_update" ON chatbot_configs
  FOR UPDATE USING (is_org_admin(org_id));

CREATE POLICY "chatbot_insert" ON chatbot_configs
  FOR INSERT WITH CHECK (is_org_admin(org_id));

-- ============================================================
-- Conversations (widget inserts via service role; admins read)
-- ============================================================
CREATE POLICY "conversations_select" ON conversations
  FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "conversations_insert" ON conversations
  FOR INSERT WITH CHECK (true); -- widget POSTs via service role

-- ============================================================
-- Messages (same as conversations)
-- ============================================================
CREATE POLICY "messages_select" ON messages
  FOR SELECT USING (is_org_member(org_id));

CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (true); -- widget/chat API via service role

-- ============================================================
-- Subscriptions
-- ============================================================
CREATE POLICY "subscriptions_select" ON subscriptions
  FOR SELECT USING (is_org_member(org_id));

-- ============================================================
-- Audit Log
-- ============================================================
CREATE POLICY "audit_select" ON audit_log
  FOR SELECT USING (is_org_admin(org_id));
