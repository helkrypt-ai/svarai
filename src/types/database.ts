export interface Organization {
  id: string
  name: string
  industry: string
  plan_id: 'starter' | 'pro' | 'enterprise' | null
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

export interface OrganizationMember {
  id: string
  org_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  created_at: string
}

export interface ChatbotConfig {
  id: string
  org_id: string
  chatbot_name: string
  welcome_message: string
  system_prompt: string
  tone: 'formal' | 'casual' | 'neutral'
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  org_id: string
  visitor_session_id: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  org_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface Subscription {
  id: string
  org_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  plan_id: 'starter' | 'pro' | 'enterprise'
  status: 'active' | 'trialing' | 'past_due' | 'cancelled'
  current_period_end: string
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: string
  org_id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string
  metadata: Record<string, unknown>
  created_at: string
}
