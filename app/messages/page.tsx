import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  // Get conversations where user is a participant
  const { data: participations } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('profile_id', user.id)

  if (!participations || participations.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Messages</h1>
        <p>No conversations yet. Go to a service and click Message  to start.</p>
      </div>
    )
  }

  const conversationIds = participations.map(p => p.conversation_id)

  // Fetch all conversations with their latest message and participants
  const conversations = await Promise.all(
    conversationIds.map(async (convId) => {
      // Get the other participant's profile
      const { data: otherParticipant } = await supabase
        .from('conversation_participants')
        .select('profile_id')
        .eq('conversation_id', convId)
        .neq('profile_id', user.id)
        .single()

      let otherName = 'Unknown'
      if (otherParticipant) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', otherParticipant.profile_id)
          .single()
        otherName = profile?.full_name || 'Unknown'
      }

      // Get last message
      const { data: lastMsg } = await supabase
        .from('messages')
        .select('content, created_at')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle() // Use maybeSingle to avoid error if no messages

      return {
        id: convId,
        otherName,
        lastMessage: lastMsg?.content || 'No messages yet',
        lastTime: lastMsg?.created_at,
      }
    })
  )

  // Sort by last message time (most recent first)
  conversations.sort((a, b) => {
    if (!a.lastTime) return 1
    if (!b.lastTime) return -1
    return new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime()
  })

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <ul className="space-y-3">
        {conversations.map((conv) => (
          <li key={conv.id}>
            <Link
              href={`/messages/${conv.id}`}
              className="block border rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <div className="font-semibold">{conv.otherName}</div>
              <div className="text-sm text-gray-600 truncate">{conv.lastMessage}</div>
              {conv.lastTime && (
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(conv.lastTime).toLocaleDateString()}
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}