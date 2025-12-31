'use client'

import { ReactNode } from 'react'

interface CategorySectionProps {
  title: string
  subtitle?: string
  children: ReactNode
  isEmpty?: boolean
}

export function CategorySection({
  title,
  subtitle,
  children,
  isEmpty = false
}: CategorySectionProps) {
  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Content */}
      {isEmpty ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-500">No listings available in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {children}
        </div>
      )}
    </div>
  )
}
