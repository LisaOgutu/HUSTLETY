import { createClient } from '@/lib/supabase/server'
import AdminPanel from '@/components/AdminPanel'
import SignOutButton from '@/components/SignOutButton'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: reports } = await supabase
    .from('reports')
    .select(`
      *,
      reporter:profiles!reporter_id(id, full_name),
      reported_user:profiles!reported_user_id(id, full_name),
      reported_service:services(id, title)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const { data: blockedUsers } = await supabase
    .from('profiles')
    .select('id, full_name, created_at')
    .eq('banned', true)
    .order('full_name')

  const { data: rawReviews } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      reported,
      reviewer:profiles!reviewer_id(id, full_name),
      service:services!service_id(id, title)
    `)
    .order('created_at', { ascending: false })

  // Fetch unverified users
  const { data: unverifiedUsers } = await supabase
    .from('profiles')
    .select('id, full_name, created_at, is_verified')
    .eq('is_verified', false)
    .eq('banned', false)
    .order('created_at', { ascending: false })

  const reviews = (rawReviews || []).map((r) => {
    const reviewer = Array.isArray(r.reviewer) ? r.reviewer[0] : r.reviewer
    const service = Array.isArray(r.service) ? r.service[0] : r.service
    return {
      id: r.id as string,
      rating: r.rating as number,
      comment: r.comment as string | null,
      created_at: r.created_at as string,
      reported: r.reported as boolean,
      reviewer: reviewer as { id: string; full_name: string } | null,
      service: service as { id: string; title: string } | null,
    }
  })

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <SignOutButton />
      </div>
      <AdminPanel
        reports={reports || []}
        blockedUsers={blockedUsers || []}
        reviews={reviews}
        unverifiedUsers={unverifiedUsers || []}
      />
    </div>
  )
}