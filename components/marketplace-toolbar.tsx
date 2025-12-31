'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { MagnifyingGlassIcon, Cross1Icon } from '@radix-ui/react-icons'

export type SortOption = 'recommended' | 'price-low' | 'price-high' | 'rating'

interface MarketplaceToolbarProps {
  onSearch?: (query: string) => void
  onSortChange?: (sort: SortOption) => void
  onTypeChange?: (type: string | null) => void
  currentType?: string | null
  currentSort?: SortOption
  currentSearch?: string
}

export function MarketplaceToolbar({
  onSearch,
  onSortChange,
  onTypeChange,
  currentType = null,
  currentSort = 'recommended',
  currentSearch = ''
}: MarketplaceToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams)
      if (query) {
        params.set('search', query)
      } else {
        params.delete('search')
      }
      router.push(`/marketplace?${params.toString()}`)
      onSearch?.(query)
    },
    [searchParams, router, onSearch]
  )

  const handleTypeFilter = useCallback(
    (type: string | null) => {
      const params = new URLSearchParams(searchParams)
      if (type) {
        params.set('type', type)
      } else {
        params.delete('type')
      }
      router.push(`/marketplace?${params.toString()}`)
      onTypeChange?.(type)
    },
    [searchParams, router, onTypeChange]
  )

  const handleSort = useCallback(
    (sort: SortOption) => {
      const params = new URLSearchParams(searchParams)
      params.set('sort', sort)
      router.push(`/marketplace?${params.toString()}`)
      onSortChange?.(sort)
    },
    [searchParams, router, onSortChange]
  )

  const clearSearch = useCallback(() => {
    handleSearch('')
  }, [handleSearch])

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search by host name, cuisine, location..."
          defaultValue={currentSearch}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-10 py-2 h-10"
        />
        {currentSearch && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <Cross1Icon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Category Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={currentType === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeFilter(null)}
            className="h-9 px-4"
          >
            All
          </Button>
          <Button
            variant={currentType === 'IN_PERSON' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeFilter('IN_PERSON')}
            className="h-9 px-4"
          >
            In Person
          </Button>
          <Button
            variant={currentType === 'VIRTUAL' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeFilter('VIRTUAL')}
            className="h-9 px-4"
          >
            Virtual
          </Button>
          <Button
            variant={currentType === 'HYBRID' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleTypeFilter('HYBRID')}
            className="h-9 px-4"
          >
            Hybrid
          </Button>
        </div>

        {/* Sorting Dropdown */}
        <Select defaultValue={currentSort} onValueChange={(v) => handleSort(v as SortOption)}>
          <SelectTrigger className="w-full sm:w-48 h-9">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recommended">Recommended</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
