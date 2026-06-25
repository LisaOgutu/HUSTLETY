import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import MessageButton from '@/components/MessageButton'
import ReviewSection from '@/components/ReviewSection'

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: service, error } = await supabase
    .from('services')
    .select(`
      *,
      provider:profiles(id, full_name, phone),
      categories:category_id ( name )
    `)
    .eq('id', id)
    .single()

  if (error || !service) {
    notFound()
  }

  const phone = service.provider?.phone
  const whatsappLink = phone
    ? `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(
        service.provider.full_name || 'there'
      )}%2C%20I'm%20interested%20in%20your%20service%3A%20${encodeURIComponent(
        service.title
      )}`
    : null

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link href="/services" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to services
      </Link>

      <h1 className="text-3xl font-bold mb-4">{service.title}</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-700 mb-4">{service.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium">{service.categories?.name || 'Uncategorized'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="font-medium text-blue-600">{service.price}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Provider</p>
            <p className="font-medium">{service.provider?.full_name || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Posted</p>
            <p className="font-medium">{new Date(service.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {whatsappLink ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Contact on WhatsApp
            </a>
          ) : (
            <p className="text-gray-500">Provider has not set a contact number.</p>
          )}
          <MessageButton
            providerId={service.provider_id}
            currentUserId={user?.id || null}
            serviceId={service.id}
          />
        </div>

        <ReviewSection serviceId={service.id} currentUserId={user?.id || null} />
      </div>
    </div>
  )
}