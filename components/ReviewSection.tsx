'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  reviewer: { full_name: string }
  reported: boolean
}

interface ReviewSectionProps {
  serviceId: string
  currentUserId: string | null
}

export default function ReviewSection({ serviceId, currentUserId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    fetchReviews()
    return () => {
      mounted.current = false
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId])

  async function fetchReviews() {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        reported,
        reviewer:profiles!reviewer_id (full_name)
      `)
      .eq('service_id', serviceId)
      .order('created_at', { ascending: false })

    if (!error && data && mounted.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const typedReviews: Review[] = data.map((item: any) => ({
        id: item.id,
        rating: item.rating,
        comment: item.comment,
        created_at: item.created_at,
        reported: item.reported,
        reviewer: { full_name: item.reviewer?.full_name || 'Unknown' }
      }))
      setReviews(typedReviews)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUserId) {
      toast.error('Please log in to review')
      return
    }
    setLoading(true)
    const { error } = await supabase
      .from('reviews')
      .insert({
        service_id: serviceId,
        reviewer_id: currentUserId,
        rating,
        comment: comment || null,
      })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Review added')
      setComment('')
      setRating(5)
      fetchReviews()
      router.refresh()
    }
    setLoading(false)
  }

  const handleReportReview = async (reviewId: string) => {
    if (!currentUserId) {
      toast.error('Please log in to report')
      return
    }
    const reason = prompt('Please provide a reason for reporting this review:')
    if (!reason) return

    const { error } = await supabase
      .from('reports')
      .insert({
        reporter_id: currentUserId,
        reported_service_id: serviceId,
        reason,
      })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Report submitted')
    }
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Reviews</h3>
      {currentUserId && (
        <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded">
          <h4 className="font-semibold mb-2">Write a review</h4>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Rating</label>
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="border px-3 py-2 rounded">
              {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} star{r>1?'s':''}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Comment (optional)</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full border px-3 py-2 rounded" rows={3} />
          </div>
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="border p-4 rounded">
              <div className="flex justify-between">
                <div>
                  <span className="font-semibold">{rev.reviewer.full_name}</span> - 
                  <span className="text-yellow-600 ml-2">{'★'.repeat(rev.rating)}{'☆'.repeat(5-rev.rating)}</span>
                </div>
                <button onClick={() => handleReportReview(rev.id)} className="text-red-600 text-sm hover:underline">Report</button>
              </div>
              {rev.comment && <p className="mt-2 text-gray-700">{rev.comment}</p>}
              <p className="text-xs text-gray-500 mt-1">{new Date(rev.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}