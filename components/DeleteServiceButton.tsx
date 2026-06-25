'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

interface DeleteServiceButtonProps {
  serviceId: string
  serviceTitle: string
}

export default function DeleteServiceButton({ serviceId, serviceTitle }: DeleteServiceButtonProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${serviceTitle}"? This action cannot be undone.`)) {
      return
    }

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Service deleted successfully')
      router.refresh() // Refresh the page to show updated list
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:underline"
    >
      Delete
    </button>
  )
}