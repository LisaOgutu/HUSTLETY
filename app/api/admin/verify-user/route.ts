import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { userId } = await req.json()

  console.log('Verifying user:', userId)
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('Service key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('profiles')
    .update({ is_verified: true })
    .eq('id', userId)
    .select()

  console.log('Update result data:', data)
  console.log('Update result error:', error)

  if (error) {
    return NextResponse.json({ error: error.message, details: error }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'No rows updated — user ID may not exist' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}