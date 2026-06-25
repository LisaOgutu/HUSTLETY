import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Chat from '@/components/chat'

interface PageProps {
  params: Promise<{ conversationId: string }>
}

interface RawMessage {
  id: string
  content: string
  created_at: string
  sender_id: string
  read: boolean
  sender: { full_name: string } | { full_name: string }[] | null
}

export default async function ConversationPage({ params }: PageProps) {
  const { conversationId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const { data: participant } = await supabase
    .from('conversation_participants')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('profile_id', user.id)
    .single()

  if (!participant) redirect('/messages')

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const { data: messages, error } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      sender_id,
      read,
      sender:profiles!sender_id (full_name)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
  }

  const safeMessages = (messages as RawMessage[] || []).map((msg) => {
    let senderName: string | null = null
    if (msg.sender) {
      if (Array.isArray(msg.sender)) {
        senderName = msg.sender[0]?.full_name ?? null
      } else {
        senderName = msg.sender.full_name ?? null
      }
    }
    return {
      id: msg.id,
      content: msg.content,
      created_at: msg.created_at,
      sender_id: msg.sender_id,
      read: msg.read,
      sender: senderName ? { full_name: senderName } : null,
    }
  })

  return (
    <div className="max-w-2xl mx-auto p-6 h-screen flex flex-col">
      <h1 className="text-xl font-bold mb-4">Conversation</h1>
      <Chat
        conversationId={conversationId}
        currentUserId={user.id}
        currentUserName={currentProfile?.full_name || 'You'}
        initialMessages={safeMessages}
      />
    </div>
  )
}