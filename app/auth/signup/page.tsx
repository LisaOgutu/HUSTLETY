'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [userType, setUserType] = useState<'seeker' | 'provider'>('seeker')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Save user_type to profiles table
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ user_type: userType })
        .eq('id', data.user.id)

      if (profileError) {
        console.error('Profile update error:', profileError)
      }
    }

    setLoading(false)
    router.push('/auth/signin?message=Check your email to confirm signup')
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow border border-gray-200">
      <h1 className="text-2xl font-bold mb-2 text-black">Create an account</h1>
      <p className="text-sm text-black mb-6">Join Hustlety and start hustling</p>

      <form onSubmit={handleSignUp} className="space-y-4">

        {/* User type selector */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">I want to</label>
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
          <p className="text-xs text-black mt-1">
            You can change this later in your profile settings.
          </p>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-gray-300 text-black px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            placeholder="Jane Doe"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Phone <span className="text-gray-400 font-normal">(for WhatsApp contact)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 text-black px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 254712345678"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 text-black px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            placeholder="you@example.com"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-black mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 text-black px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={6}
            placeholder="Min. 6 characters"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <p className="mt-4 text-sm text-center text-black">
        Already have an account?{' '}
        <Link href="/auth/signin" className="text-blue-600 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}