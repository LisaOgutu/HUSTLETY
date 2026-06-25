import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import ServiceForm from '@/components/ServiceForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditServicePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/signin')
  }

  // Fetch the service
  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !service) {
    notFound()
  }

  // Ensure the current user is the provider
  if (service.provider_id !== user.id) {
    redirect('/dashboard?error=unauthorized')
  }

  // Fetch categories for dropdown
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Service</h1>
      <ServiceForm
        categories={categories || []}
        userId={user.id}
        initialData={{
          id: service.id,
          title: service.title,
          description: service.description,
          price: service.price,
          category_id: service.category_id,
        }}
      />
    </div>
  )
}