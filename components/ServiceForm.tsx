'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

interface Category {
  id: number
  name: string
}

interface ServiceData {
  id?: string
  title: string
  description: string
  price: string
  category_id: number
}

interface ServiceFormProps {
  categories: Category[]
  userId: string
  initialData?: ServiceData
}

export default function ServiceForm({ categories, userId, initialData }: ServiceFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [price, setPrice] = useState(initialData?.price || '')
  const [categoryId, setCategoryId] = useState<number | ''>(initialData?.category_id || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const isEditing = !!initialData?.id

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!categoryId) {
      setError('Please select a category')
      setLoading(false)
      return
    }

    let result
    if (isEditing) {
      result = await supabase
        .from('services')
        .update({
          title,
          description,
          price,
          category_id: categoryId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', initialData.id)
    } else {
      result = await supabase
        .from('services')
        .insert({
          title,
          description,
          price,
          category_id: categoryId,
          provider_id: userId,
          status: 'active',
        })
    }

    if (result.error) {
      setError(result.error.message)
      toast.error(result.error.message)
      setLoading(false)
    } else {
      toast.success(isEditing ? 'Service updated successfully!' : 'Service posted successfully!')
      setTimeout(() => {
        router.push('/services')
        router.refresh()
      }, 1500)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded p-6">
      <div className="mb-4">
        <label className="block text-black font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 rounded text-black placeholder-gray-400"
          required
          maxLength={100}
          placeholder="e.g., Math Tutoring"
        />
      </div>

      <div className="mb-4">
        <label className="block text-black font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 rounded text-black placeholder-gray-400"
          rows={4}
          required
          placeholder="Describe your service..."
        />
      </div>

      <div className="mb-4">
        <label className="block text-black font-medium mb-1">Price</label>
        <input
          type="text"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 rounded text-black placeholder-gray-400"
          placeholder="e.g., KES 500 or Negotiable"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-black font-medium mb-1">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : '')}
          className="w-full border border-gray-300 px-3 py-2 rounded text-black placeholder-gray-400"
          required
        >
          <option value="" className="text-gray-400">Select a category</option>
           {categories.map((cat) => (
            <option key={cat.id} value={cat.id} className="text-black">
            {cat.name}
           </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? (isEditing ? 'Updating...' : 'Posting...') : (isEditing ? 'Update Service' : 'Post Service')}
      </button>
    </form>
  )
}