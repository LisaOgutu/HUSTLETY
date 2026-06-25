import { createClient } from '@/lib/supabase/server'
import ServicesClient from './ServicesClient'

export default async function ServicesPage() {
  const supabase = await createClient()

  // Fetch all active services with provider and category
  const { data: services } = await supabase
    .from('services')
    .select(`
      *,
      provider:profiles(id, full_name, phone),
      categories:category_id ( name )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // Fetch all categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  // Helper to extract category name safely 
  const normalizedServices = services?.map(service => ({
    ...service,
    categoryName: Array.isArray(service.categories)
      ? service.categories[0]?.name
      : service.categories?.name || 'Uncategorized'
  })) || []

  return (
    <ServicesClient
      initialServices={normalizedServices}
      categories={categories || []}
    />
  )
}