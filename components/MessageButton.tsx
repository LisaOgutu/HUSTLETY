'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

interface MessageButtonProps {
  providerId: string
  currentUserId: string | null
  serviceId: string
}

export default function MessageButton({ providerId, currentUserId, serviceId }: MessageButtonProps) {
  const router = useRouter()
  const supabase = createClient()

  const startConversation = async () => {
    if (!currentUserId) {
      toast.error('Please log in to message')
      router.push('/auth/signin')
      return
    }

    try {
      const { data: userConvs, error: convError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('profile_id', currentUserId)

      if (convError) throw convError

      if (userConvs && userConvs.length > 0) {
        const convIds = userConvs.map(p => p.conversation_id)
        const { data: existing, error: existingError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .in('conversation_id', convIds)
          .eq('profile_id', providerId)
          .maybeSingle()

        if (existingError) throw existingError

        if (existing) {
          router.push(`/messages/${existing.conversation_id}`)
          return
        }
      }

      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single()

      if (createError) throw createError

      const { error: part1Error } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: newConv.id,
          profile_id: currentUserId
        })

      if (part1Error) throw part1Error

      const { error: part2Error } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: newConv.id,
          profile_id: providerId
        })

      if (part2Error) throw part2Error

      toast.success('Conversation started!')
      router.push(`/messages/${newConv.id}`)

    } catch (error: unknown) {
      // Extract Supabase error details properly
      const supabaseError = error as { message?: string; code?: string; details?: string; hint?: string }
      console.error('Message error code:', supabaseError?.code)
      console.error('Message error message:', supabaseError?.message)
      console.error('Message error details:', supabaseError?.details)
      console.error('Message error hint:', supabaseError?.hint)

      const message = supabaseError?.message || 'Failed to start conversation'
      toast.error(message)
    }
  }

  return (
    <button
      onClick={startConversation}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-2"
    >
      Message
    </button>
  )
}