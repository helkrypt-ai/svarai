'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useRef, useEffect, Suspense } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function ChatWidget() {
  const searchParams = useSearchParams()
  const orgId = searchParams.get('org') ?? ''

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [welcomeMessage, setWelcomeMessage] = useState('Hei! Hvordan kan jeg hjelpe deg?')
  const [chatbotName, setChatbotName] = useState('Assistent')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const visitorSessionId = useRef(
    typeof sessionStorage !== 'undefined'
      ? (sessionStorage.getItem('svarai_session') ?? (() => {
          const id = Math.random().toString(36).slice(2)
          sessionStorage.setItem('svarai_session', id)
          return id
        })())
      : Math.random().toString(36).slice(2)
  )
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load chatbot config (name + welcome message)
  useEffect(() => {
    if (!orgId) return
    fetch(`/api/chatbot-config?org=${orgId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.chatbotName) setChatbotName(data.chatbotName)
        if (data?.welcomeMessage) {
          setWelcomeMessage(data.welcomeMessage)
          setMessages([{ role: 'assistant', content: data.welcomeMessage }])
        }
      })
      .catch(() => {})
  }, [orgId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Listen for open signal from parent
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'svarai-open') {
        /* nothing needed — iframe is already shown */
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading || !orgId) return

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          conversationId,
          visitorSessionId: visitorSessionId.current,
          messages: newMessages,
        }),
      })
      const data = await res.json()
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
        if (data.conversationId) setConversationId(data.conversationId)
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Beklager, noe gikk galt. Prøv igjen.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    window.parent.postMessage({ type: 'svarai-close' }, '*')
  }

  if (!orgId) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-gray-400 text-sm">
        Mangler org-id
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span className="font-semibold text-sm">{chatbotName}</span>
        </div>
        <button
          onClick={handleClose}
          aria-label="Lukk"
          className="text-white/80 hover:text-white text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8">
            {welcomeMessage}
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-900 rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-gray-100 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Skriv en melding..."
            disabled={loading}
            className="flex-1 text-sm px-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40 shrink-0"
            aria-label="Send"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          Drevet av <span className="font-medium">SvarAI</span>
        </p>
      </div>
    </div>
  )
}

export default function EmbedPage() {
  return (
    <Suspense>
      <ChatWidget />
    </Suspense>
  )
}
