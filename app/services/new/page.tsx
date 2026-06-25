import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ServiceForm from '../../../components/ServiceForm'

export default async function NewServicePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Fetch categories for the dropdown
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name') 
    .order('name')

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Post a New Service</h1>
      <ServiceForm categories={categories || []} userId={user.id} />
    </div>
  )
}