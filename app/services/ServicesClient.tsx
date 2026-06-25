'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Service {
  id: string
  title: string
  description: string
  price: string
  category_id: number
  provider_id: string
  status: string
  created_at: string
  categoryName: string
  provider: { full_name: string; phone: string | null }
}

interface ServicesClientProps {
  initialServices: Service[]
  categories: { id: number; name: string }[]
}

export default function ServicesClient({ initialServices, categories }: ServicesClientProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('')

  // Filter services based on search and category
  const filteredServices = useMemo(() => {
    return initialServices.filter(service => {
      const matchesSearch = search === '' ||
        service.title.toLowerCase().includes(search.toLowerCase()) ||
        service.description.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = selectedCategory === '' || service.category_id === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [initialServices, search, selectedCategory])

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Available Services</h1>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search by title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 px-4 py-2 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
       <select
         value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : '' )}
         className="w-full md:w-48 bg-gray-800 text-white border border-gray-600 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
         >
          <option value="" className="bg-gray-800 text-white">All Categories</option>
           {categories.map(cat => (
           <option key={cat.id} value={cat.id} className="bg-gray-800 text-white">
           {cat.name}
          </option>
           ))}
        </select>
      </div>

      {filteredServices.length === 0 ? (
        <p className="text-gray-500">No services match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div key={service.id} className="border rounded-xl p-4 shadow hover:shadow-lg transition bg-white">
              <h2 className="text-xl font-semibold mb-2">{service.title}</h2>
              <p className="text-gray-600 mb-2 line-clamp-2">{service.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                <span>{service.categoryName}</span>
                <span>by {service.provider?.full_name || 'Unknown'}</span>
              </div>
              <p className="text-lg font-bold text-blue-600 mb-3">{service.price}</p>
              <Link
                href={`/services/${service.id}`}
                className="block text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}