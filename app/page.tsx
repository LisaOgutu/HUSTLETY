import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CategoryCard from '@/components/CategoryCard'

export default async function Home() {
  const supabase = await createClient()
  
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, description, image_url')
    .order('name')

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-black mb-4">
          Hustle<span className="text-blue-600">ty</span>
        </h1>
        <p className="text-xl text-black mb-8 max-w-2xl mx-auto">
          The peer-to-peer marketplace for students – offer or find services on campus, safely and easily.
        </p>
        <div className="space-x-4">
          <Link
            href="/services"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Browse Services
          </Link>
          <Link
            href="/services/new"
            className="inline-block bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition"
          >
            Post a Service
          </Link>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-black mb-12">
          Popular Categories
        </h2>
        {categories && categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((cat) => (
              <CategoryCard
                key={cat.id}
                id={cat.id}
                name={cat.name}
                description={cat.description}
                image_url={cat.image_url}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-black">No categories found.</p>
        )}
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-black mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 border border-gray-100 rounded-xl shadow-sm">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-bold text-black mb-2">1. Sign Up</h3>
              <p className="text-black text-sm">
                Create your account using your student email and get verified by the admin.
              </p>
            </div>
            <div className="text-center p-6 border border-gray-100 rounded-xl shadow-sm">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-lg font-bold text-black mb-2">2. Post or Browse</h3>
              <p className="text-black text-sm">
                Post your own service or browse what fellow students are offering on campus.
              </p>
            </div>
            <div className="text-center p-6 border border-gray-100 rounded-xl shadow-sm">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-bold text-black mb-2">3. Connect</h3>
              <p className="text-black text-sm">
                Message the service provider directly through the app or via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to start hustling?</h2>
          <p className="text-xl mb-8">Join your fellow students today.</p>
          <Link
            href="/auth/signup"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Sign Up Now
          </Link>
        </div>
      </section>

    </div>
  )
}