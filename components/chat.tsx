'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  read: boolean
  sender: { full_name: string } | null
}

interface RawMessage {
  id: string
  content: string
  created_at: string
  sender_id: string
  read: boolean
  sender: { full_name: string } | { full_name: string }[] | null
}

interface ChatProps {
  conversationId: string
  currentUserId: string
  currentUserName: string
  initialMessages: Message[]
}

export default function Chat({ conversationId, currentUserId, currentUserName, initialMessages }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const subscription = supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, async (payload) => {
        const newMsg = payload.new as { id: string; sender_id: string }

        // Skip our own messages — already added optimistically
        if (newMsg.sender_id === currentUserId) return

        const { data, error } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            sender_id,
            read,
            sender:profiles!sender_id (full_name)
          `)
          .eq('id', newMsg.id)
          .single()

        if (!error && data) {
          const raw = data as RawMessage
          let senderName: string | null = null
          if (raw.sender) {
            if (Array.isArray(raw.sender)) {
              senderName = raw.sender[0]?.full_name ?? null
            } else {
              senderName = raw.sender.full_name ?? null
            }
          }
          setMessages(prev => [...prev, {
            id: raw.id,
            content: raw.content,
            created_at: raw.created_at,
            sender_id: raw.sender_id,
            read: raw.read,
            sender: senderName ? { full_name: senderName } : null,
          }])
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [conversationId, currentUserId])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const content = newMessage.trim()
    setNewMessage('')

    // Add message to UI immediately
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      created_at: new Date().toISOString(),
      sender_id: currentUserId,
      read: false,
      sender: { full_name: currentUserName },
    }
    setMessages(prev => [...prev, tempMessage])

    setLoading(true)
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content,
      })

    if (error) {
      // Remove optimistic message if it failed
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id))
      toast.error('Failed to send message')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto border p-4 mb-4 rounded bg-white">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`mb-3 ${isMe ? 'text-right' : ''}`}>
              <div className={`inline-block max-w-[70%] p-2 rounded-lg ${isMe ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                {!isMe && (
                  <div className="text-xs font-semibold text-gray-700">{msg.sender?.full_name}</div>
                )}
                <div>{msg.content}</div>
                <div className="text-xs opacity-75 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !newMessage.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}