'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface MarketplaceCardProps {
  id: string
  slug: string
  title: string
  hostName: string
  hostTagline?: string
  hostAvatar?: string
  price: number
  priceLabel?: string
  type: string
  badge?: string
  bio?: string
  rating?: number
  reviewCount?: number
}

export function MarketplaceCard({
  slug,
  title,
  hostName,
  hostTagline,
  hostAvatar,
  price,
  priceLabel = 'Session',
  type,
  badge,
  bio,
  rating,
  reviewCount = 0
}: MarketplaceCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link href={`/listing/${slug}`}>
      <div
        className={cn(
          'group relative overflow-hidden rounded-lg border border-gray-200 bg-white',
          'transition-all duration-300 cursor-pointer',
          'hover:shadow-md hover:border-gray-300'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Header Section - Image and Badge */}
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
          {/* Headshot */}
          <div className="flex items-center justify-center h-full">
            {hostAvatar ? (
              <div className="relative w-28 h-28">
                <Image
                  src={hostAvatar}
                  alt={hostName}
                  fill
                  className="rounded-full object-cover"
                  sizes="(max-width: 768px) 100px, 112px"
                />
              </div>
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-200 to-blue-100 flex items-center justify-center">
                <span className="text-2xl font-semibold text-blue-600">
                  {hostName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Badge - Top right */}
          {badge && (
            <div className="absolute top-3 right-3">
              <Badge
                variant="default"
                className="bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
              >
                {badge}
              </Badge>
            </div>
          )}

          {/* Rating - Top left */}
          {rating !== undefined && (
            <div className="absolute top-3 left-3 bg-white rounded-full px-2 py-1 shadow-sm flex items-center gap-1">
              <span className="text-sm font-semibold">★ {rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({reviewCount})</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Name and Title */}
          <div className="mb-3">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {hostName}
            </h3>
            {hostTagline && (
              <p className="text-sm text-gray-600 truncate">
                {hostTagline}
              </p>
            )}
          </div>

          {/* Brief Description - Shows on Hover */}
          {isHovered && bio && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-3 pb-3 border-t border-gray-100">
              {bio}
            </p>
          )}

          {/* Offering Title */}
          <p className="text-sm font-medium text-gray-700 line-clamp-1 mb-3">
            {title}
          </p>

          {/* Price and Type */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                ${(price / 100).toFixed(0)}
              </span>
              <span className="text-xs text-gray-500">• {priceLabel}</span>
            </div>

            {/* Type Badge */}
            <Badge
              variant="secondary"
              className="text-xs"
            >
              {type.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Hover Overlay - Subtle background shift */}
        {isHovered && (
          <div className="absolute inset-0 bg-white/5 pointer-events-none" />
        )}
      </div>
    </Link>
  )
}
