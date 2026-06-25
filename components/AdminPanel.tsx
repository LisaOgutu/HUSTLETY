'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Profile {
  id: string
  full_name: string | null
}

interface Report {
  id: string
  reporter: Profile | null
  reported_user: Profile | null
  reported_service: { id: string; title: string } | null
  reason: string
  status: string
  created_at: string
}

interface BlockedUser {
  id: string
  full_name: string | null
  created_at: string
}

interface UnverifiedUser {
  id: string
  full_name: string | null
  created_at: string
  is_verified: boolean
}

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  reported: boolean
  reviewer: Profile | null
  service: { id: string; title: string } | null
}

interface AdminPanelProps {
  reports: Report[]
  blockedUsers: BlockedUser[]
  reviews: Review[]
  unverifiedUsers: UnverifiedUser[]
}

export default function AdminPanel({ reports, blockedUsers, reviews, unverifiedUsers }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'blocked' | 'reviews'>('reports')
  const router = useRouter()

  const handleResolve = async (reportId: string) => {
    const res = await fetch('/api/admin/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId }),
    })
    if (res.ok) {
      toast.success('Report resolved')
      router.refresh()
    } else {
      toast.error('Failed to resolve report')
    }
  }

  const handleBlock = async (userId: string) => {
    if (!confirm('Block this user? They will not be able to log in.')) return
    const res = await fetch('/api/admin/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    if (res.ok) {
      toast.success('User blocked')
      router.refresh()
    } else {
      toast.error('Failed to block user')
    }
  }

  const handleUnblock = async (userId: string) => {
    if (!confirm('Unblock this user?')) return
    const res = await fetch('/api/admin/unblock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    if (res.ok) {
      toast.success('User unblocked')
      router.refresh()
    } else {
      toast.error('Failed to unblock user')
    }
  }

  const handleVerify = async (userId: string) => {
    const res = await fetch('/api/admin/verify-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    if (res.ok) {
      toast.success('User verified!')
      router.refresh()
    } else {
      toast.error('Failed to verify user')
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review permanently?')) return
    const res = await fetch('/api/admin/delete-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId }),
    })
    if (res.ok) {
      toast.success('Review deleted')
      router.refresh()
    } else {
      toast.error('Failed to delete review')
    }
  }

  const tabs = [
    { key: 'reports', label: 'Reports', count: reports.length },
    { key: 'users', label: 'Pending Verification', count: unverifiedUsers.length },
    { key: 'blocked', label: 'Blocked Users', count: blockedUsers.length },
    { key: 'reviews', label: 'Reviews', count: reviews.length },
  ] as const

  return (
    <div>
      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{reports.length}</p>
          <p className="text-sm text-black mt-1 font-medium">Pending Reports</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{unverifiedUsers.length}</p>
          <p className="text-sm text-black mt-1 font-medium">Awaiting Verification</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">{blockedUsers.length}</p>
          <p className="text-sm text-black mt-1 font-medium">Blocked Users</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{reviews.length}</p>
          <p className="text-sm text-black mt-1 font-medium">Total Reviews</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-black hover:text-blue-600'
            }`}
          >
            {tab.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-black'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div>
          {reports.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-lg font-medium text-black">No pending reports</p>
              <p className="text-sm text-black mt-1">All reports have been resolved</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-sm text-black">
                        Reported by: <span className="font-semibold">{report.reporter?.full_name || 'Unknown'}</span>
                      </p>
                      {report.reported_user && (
                        <p className="text-sm text-black">
                          Against user: <span className="font-semibold">{report.reported_user.full_name}</span>
                        </p>
                      )}
                      {report.reported_service && (
                        <p className="text-sm text-black">
                          Service: <span className="font-semibold">{report.reported_service.title}</span>
                        </p>
                      )}
                      <p className="text-sm text-black">
                        Date: <span className="font-semibold">{new Date(report.created_at).toLocaleDateString()}</span>
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Pending</span>
                  </div>
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-black">
                    <span className="font-semibold">Reason: </span>{report.reason}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleResolve(report.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
                    >
                      Mark Resolved
                    </button>
                    {report.reported_user && (
                      <button
                        onClick={() => handleBlock(report.reported_user!.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition"
                      >
                        Block User
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pending Verification Tab */}
      {activeTab === 'users' && (
        <div>
          {unverifiedUsers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-lg font-medium text-black">No pending verifications</p>
              <p className="text-sm text-black mt-1">All users have been reviewed</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unverifiedUsers.map((u) => (
                <div key={u.id} className="bg-white border border-gray-200 rounded-xl p-5 flex justify-between items-center shadow-sm">
                  <div>
                    <p className="font-semibold text-black">{u.full_name || 'Unknown'}</p>
                    <p className="text-sm text-black mt-0.5">
                      Joined {new Date(u.created_at).toLocaleDateString()}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                      Pending Verification
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerify(u.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                    >
                      Verify User
                    </button>
                    <button
                      onClick={() => handleBlock(u.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition"
                    >
                      Block
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Blocked Users Tab */}
      {activeTab === 'blocked' && (
        <div>
          {blockedUsers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-lg font-medium text-black">No blocked users</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map((u) => (
                <div key={u.id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
                  <div>
                    <p className="font-semibold text-black">{u.full_name || 'Unknown'}</p>
                    <p className="text-xs text-black mt-1">
                      Member since {new Date(u.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnblock(u.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div>
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-lg font-medium text-black">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className={`bg-white border rounded-xl p-5 shadow-sm ${review.reported ? 'border-red-300' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-black">{review.reviewer?.full_name || 'Unknown'}</span>
                        <span className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                        {review.reported && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">Reported</span>
                        )}
                      </div>
                      {review.service && (
                        <p className="text-sm text-black mt-1">
                          On service: <span className="font-semibold">{review.service.title}</span>
                        </p>
                      )}
                      {review.comment && (
                        <p className="mt-2 text-black text-sm">{review.comment}</p>
                      )}
                      <p className="text-xs text-black mt-2">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-red-600 hover:underline text-sm ml-4 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}