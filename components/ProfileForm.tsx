'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

interface Profile {
  id: string
  full_name: string
  phone: string | null
  is_verified: boolean
  user_type: string | null
  created_at: string
  updated_at: string
}

interface ProfileFormProps {
  profile: Profile
  userEmail: string
}

export default function ProfileForm({ profile, userEmail }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile.full_name)
  const [phone, setPhone] = useState(profile.phone || '')
  const [email, setEmail] = useState(userEmail)
  const [userType, setUserType] = useState<'seeker' | 'provider'>(
    (profile.user_type as 'seeker' | 'provider') || 'seeker'
  )
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Step 1: Update profile fields including user_type
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone || null,
        user_type: userType,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (profileError) {
      toast.error(profileError.message)
      setLoading(false)
      return
    }

    // Step 2: Update email if it changed
    if (email !== userEmail) {
      const { error: emailError } = await supabase.auth.updateUser({ email })
      if (emailError) {
        toast.error('Profile saved but email update failed: ' + emailError.message)
        setLoading(false)
        return
      }
      toast.success('Profile updated! Check your new email for a confirmation link.')
    } else {
      toast.success('Profile updated successfully!')
    }

    setLoading(false)
    router.refresh()
  }

  return (
    <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* User type selector */}
        <div>
          <label className="block text-black font-medium mb-2">I want to</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setUserType('seeker')}
              className={`flex-1 py-3 rounded-lg border text-sm font-medium transition ${
                userType === 'seeker'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-black border-gray-300 hover:border-blue-400'
              }`}
            >
              🔍 Find Services
            </button>
            <button
              type="button"
              onClick={() => setUserType('provider')}
              className={`flex-1 py-3 rounded-lg border text-sm font-medium transition ${
                userType === 'provider'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-black border-gray-300 hover:border-blue-400'
              }`}
            >
              🚀 Offer Services
            </button>
          </div>
        </div>

        {/* Email — now editable */}
        <div>
          <label className="block text-black font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            placeholder="you@example.com"
          />
          {email !== userEmail && (
            <p className="text-xs text-blue-600 mt-1">
              ⚠️ A confirmation link will be sent to your new email address.
            </p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-black font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            placeholder="Your full name"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-black font-medium mb-1">
            Phone <span className="text-gray-500 font-normal text-sm">(for WhatsApp)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 254712345678"
          />
        </div>

        {/* Verification status */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-black">Account status:</span>
          {profile.is_verified ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✓ Verified
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Pending Verification
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}