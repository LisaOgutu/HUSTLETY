'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavbarProps {
  user: { email?: string } | null
  isAdmin?: boolean
}

export default function Navbar({ user, isAdmin }: NavbarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <header className="bg-white shadow">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">
          HUSTLETY.
        </Link>
        <div className="space-x-4">
          <Link
            href="/services"
            className={`${isActive('/services') ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'}`}
          >
            Services
          </Link>
          {user ? (
            <>
              <Link
                href="/messages"
                className={`${isActive('/messages') ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'}`}
              >
                Messages
              </Link>
              <Link
                href="/profile"
                className={`${isActive('/profile') ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'}`}
              >
                Profile
              </Link>
              <Link
                href="/dashboard"
                className={`${isActive('/dashboard') ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'}`}
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`${isActive('/admin') ? 'text-red-600 font-medium' : 'text-red-500 hover:text-red-600'}`}
                >
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className={`${isActive('/auth/signin') ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'}`}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className={`${isActive('/auth/signup') ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'}`}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}