'use client'

import Link from 'next/link'
import { useState } from 'react'

interface CategoryCardProps {
  id: number
  name: string
  description: string | null
  image_url: string | null
}

const getCategoryEmoji = (name: string) => {
  if (name.includes('Beauty')) return '💇'
  if (name.includes('Clean')) return '🧹'
  if (name.includes('Errand')) return '🛵'
  if (name.includes('Event')) return '🎉'
  if (name.includes('Photo')) return '📷'
  if (name.includes('Tech')) return '💻'
  if (name.includes('Tutor')) return '📚'
  return '⭐'
}

export default function CategoryCard({ id, name, description, image_url }: CategoryCardProps) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <Link
      href={`/services?category=${id}`}
      className="bg-white rounded-xl shadow hover:shadow-lg transition border border-gray-100 overflow-hidden"
    >
      {image_url && !imgFailed ? (
        <img
          src={image_url}
          alt={name}
          className="w-full h-32 object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="w-full h-32 bg-blue-50 flex items-center justify-center">
          <span className="text-4xl">{getCategoryEmoji(name)}</span>
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-black">{name}</h3>
        {description && (
          <p className="text-sm text-black mt-1 line-clamp-2">{description}</p>
        )}
      </div>
    </Link>
  )
}