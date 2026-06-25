import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'
import DeleteServiceButton from '@/components/DeleteServiceButton'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/signin')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error('Error fetching profile:', profileError)
  }

  if (profile?.role === 'admin') redirect('/admin')

  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select(`
      id,
      title,
      price,
      status,
      created_at,
      categories:category_id ( name )
    `)
    .eq('provider_id', user.id)
    .order('created_at', { ascending: false })

  if (servicesError) {
    console.error('Error fetching services:', servicesError)
  }

  type CategoryData = { name?: string } | { name?: string }[] | null

  const getCategoryName = (category: CategoryData): string => {
    if (!category) return 'Uncategorized'
    if (Array.isArray(category)) return category[0]?.name || 'Uncategorized'
    return category.name || 'Uncategorized'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-blue-600 text-white px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <p className="text-blue-100 text-sm mb-1">Welcome back,</p>
          <h1 className="text-3xl font-bold">{profile?.full_name || user.email}</h1>
          <p className="text-blue-100 text-sm mt-1">
            {profile?.is_verified ? '✓ Verified Student' : 'Pending Verification'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-4">
        {/* Quick Actions Card */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-black mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/services/new"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              + Post a Service
            </Link>
            <Link
              href="/profile"
              className="bg-white text-black border border-gray-300 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Edit Profile
            </Link>
            <Link
              href="/messages"
              className="bg-white text-black border border-gray-300 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Messages
            </Link>
            <SignOutButton />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-5 text-center">
            <p className="text-3xl font-bold text-blue-600">{services?.length || 0}</p>
            <p className="text-sm text-black mt-1 font-medium">Active Services</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 text-center">
            <p className="text-3xl font-bold text-green-600">
              {profile?.is_verified ? 'Verified' : 'Pending'}
            </p>
            <p className="text-sm text-black mt-1 font-medium">Account Status</p>
          </div>
        </div>

        {/* My Services Card */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-black">My Services</h2>
            <Link
              href="/services/new"
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              + Add New
            </Link>
          </div>

          {!services || services.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-black font-medium mb-1">No services posted yet</p>
              <p className="text-sm text-black mb-4">Start earning by posting your first service</p>
              <Link
                href="/services/new"
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
              >
                Post a Service
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:border-blue-300 transition"
                >
                  <div>
                    <h3 className="text-base font-semibold text-black">{service.title}</h3>
                    <p className="text-sm text-black mt-0.5">
                      {getCategoryName(service.categories)}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-blue-600 font-medium text-sm">{service.price}</span>
                      <span className="text-xs text-black">
                        {new Date(service.created_at).toLocaleDateString()}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        service.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-black'
                      }`}>
                        {service.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/services/${service.id}/edit`}
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <DeleteServiceButton serviceId={service.id} serviceTitle={service.title} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}