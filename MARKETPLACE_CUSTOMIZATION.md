# Marketplace UI Customization Guide

This guide explains how to customize and extend the marketplace UI components for different use cases and visual preferences.

---

## Component API Reference

### MarketplaceCard Props

```typescript
interface MarketplaceCardProps {
  id: string                    // Unique identifier
  slug: string                  // URL slug for detail page
  title: string                 // Offering/service name
  hostName: string              // Display name (required)
  hostTagline?: string          // Professional credential or tagline
  hostAvatar?: string           // Avatar image URL
  price: number                 // Price in cents (e.g., 50000 = $500.00)
  priceLabel?: string           // Format label (default: "Session")
  type: string                  // IN_PERSON, VIRTUAL, or HYBRID
  badge?: string                // Optional status (e.g., "Top Expert")
  bio?: string                  // Short biography (shown on hover)
  rating?: number               // Star rating (0-5)
  reviewCount?: number          // Number of reviews (default: 0)
}
```

#### Usage Example

```tsx
<MarketplaceCard
  id="listing-123"
  slug="chef-marie-cooking"
  title="Italian Cooking Masterclass"
  hostName="Marie Rossi"
  hostTagline="Michelin-trained Chef"
  hostAvatar="/avatars/marie.jpg"
  price={50000}  // $500
  priceLabel="120min"
  type="VIRTUAL"
  badge="Top Rated"
  bio="French chef with 15 years of experience..."
  rating={4.8}
  reviewCount={42}
/>
```

---

### MarketplaceToolbar Props

```typescript
interface MarketplaceToolbarProps {
  onSearch?: (query: string) => void
  onSortChange?: (sort: SortOption) => void
  onTypeChange?: (type: string | null) => void
  currentType?: string | null
  currentSort?: SortOption
  currentSearch?: string
}

type SortOption = 'recommended' | 'price-low' | 'price-high' | 'rating'
```

#### Usage Example

```tsx
<MarketplaceToolbar
  currentType="VIRTUAL"
  currentSort="price-low"
  currentSearch="cooking"
  onSearch={(query) => console.log('Search:', query)}
  onSortChange={(sort) => console.log('Sort:', sort)}
  onTypeChange={(type) => console.log('Type:', type)}
/>
```

---

### CategorySection Props

```typescript
interface CategorySectionProps {
  title: string                 // Section heading
  subtitle?: string             // Optional description
  children: ReactNode           // Card components
  isEmpty?: boolean             // Show empty state
}
```

#### Usage Example

```tsx
<CategorySection
  title="Virtual Cooking Classes"
  subtitle="Learn from expert chefs online"
  isEmpty={listings.length === 0}
>
  {listings.map(listing => (
    <MarketplaceCard key={listing.id} {...listing} />
  ))}
</CategorySection>
```

---

## Styling Customization

### Tailwind Configuration

Edit `tailwind.config.ts` to customize colors, spacing, and other design tokens:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Add custom colors
        marketplace: {
          card: '#ffffff',
          border: '#e5e7eb',
        },
      },
      spacing: {
        // Custom spacing values
        card: '24px',
      },
    },
  },
}
```

### Card Styling Customization

To customize card appearance, edit `components/marketplace-card.tsx`:

```tsx
// Example: Change headshot size
<div className="w-32 h-32">  {/* was w-28 h-28 */}
  <Image {...} />
</div>

// Example: Change card padding
<div className="p-6">  {/* was p-4 */}
  {/* content */}
</div>

// Example: Change border style
<div className="border-2 border-blue-200 rounded-xl">  {/* was border rounded-lg */}
  {/* content */}
</div>
```

### Grid Responsive Breakpoints

To change responsive grid columns, edit `app/marketplace/page.tsx`:

```tsx
// Current: 4 cols desktop, 3 tablet, 1 mobile
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

// Alternative: 3 cols desktop, 2 tablet, 1 mobile
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

// Alternative: 5 cols desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
```

---

## Adding New Features

### 1. Save/Favorite Button

Add to `marketplace-card.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'

export function MarketplaceCard(props: MarketplaceCardProps) {
  const [isSaved, setIsSaved] = useState(false)

  return (
    <div className="...">
      {/* Existing content */}
      
      {/* Add favorite button */}
      <button
        onClick={(e) => {
          e.preventDefault()
          setIsSaved(!isSaved)
        }}
        className="absolute top-3 right-12 z-10"
      >
        <Heart
          className={`w-5 h-5 transition-colors ${
            isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'
          }`}
        />
      </button>
    </div>
  )
}
```

### 2. Advanced Filters

Extend `marketplace-toolbar.tsx`:

```tsx
'use client'

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Slider } from '@/components/ui/slider'

export function MarketplaceToolbar(props: MarketplaceToolbarProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 10000])

  return (
    <>
      {/* Existing toolbar */}
      <Button onClick={() => setShowFilters(true)}>
        Advanced Filters
      </Button>

      {/* Price range filter */}
      <Drawer open={showFilters} onOpenChange={setShowFilters}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filter Listings</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <label>Price Range</label>
            <Slider
              min={0}
              max={10000}
              step={100}
              value={priceRange}
              onValueChange={setPriceRange}
            />
            <span>${priceRange[0]} - ${priceRange[1]}</span>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
```

### 3. Quick Book Modal

Add to marketplace card:

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function MarketplaceCard(props: MarketplaceCardProps) {
  const [showBooking, setShowBooking] = useState(false)

  return (
    <>
      {/* Card content */}
      <div className="...">
        {/* Existing */}
        <Button
          onClick={(e) => {
            e.preventDefault()
            setShowBooking(true)
          }}
          className="w-full mt-4"
        >
          Book Now
        </Button>
      </div>

      {/* Quick booking modal */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book with {props.hostName}</DialogTitle>
          </DialogHeader>
          {/* Booking form */}
        </DialogContent>
      </Dialog>
    </>
  )
}
```

### 4. Rating Aggregation

Update `app/marketplace/actions.ts`:

```typescript
import { Prisma } from '@prisma/client'

export async function getActiveListings(filters?: {...}) {
  // ... existing code ...

  const listings = await prisma.listing.findMany({
    where,
    include: {
      hostProfile: {
        select: {
          displayName: true,
          avatar: true,
          bio: true,
          tagline: true,
          cuisines: true,
        }
      },
      // Add reviews aggregation
      reviews: {
        select: {
          rating: true,
        }
      }
    },
    orderBy,
  })

  // Calculate average rating
  const listingsWithRating = listings.map(listing => ({
    ...listing,
    averageRating: listing.reviews.length > 0
      ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length
      : undefined,
    reviewCount: listing.reviews.length,
  }))

  return { listings: listingsWithRating }
}
```

Then pass to card:

```tsx
<MarketplaceCard
  {...listing}
  rating={listing.averageRating}
  reviewCount={listing.reviewCount}
/>
```

### 5. Top Expert Badge Logic

Update `app/marketplace/actions.ts`:

```typescript
// Determine badge based on criteria
const isBadgeEligible = (listing: any) => {
  const minBookings = 10
  const minRating = 4.7
  const minReviews = 5

  return (
    listing.bookingCount >= minBookings &&
    listing.averageRating >= minRating &&
    listing.reviews.length >= minReviews
  )
}

const listingsWithBadges = listingsWithRating.map(listing => ({
  ...listing,
  badge: isBadgeEligible(listing) ? 'Top Expert' : undefined,
}))
```

---

## Data Fetching Patterns

### Server-Side Fetching (Current)

```typescript
// app/marketplace/page.tsx
const result = await getActiveListings(searchParams)
const { listings } = result

return <div>{/* render */}</div>
```

**Pros**: SEO-friendly, no waterfall, secure
**Cons**: Full page reload on filter change

### Client-Side Fetching (Alternative)

```typescript
'use client'

import { useEffect, useState } from 'react'

export function MarketplaceContent() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchListings = async () => {
      const result = await getActiveListings(filters)
      setListings(result.listings)
      setLoading(false)
    }
    fetchListings()
  }, [filters])

  return <div>{/* render */}</div>
}
```

**Pros**: Instant filter/sort updates, no page reload
**Cons**: Waterfall requests, less SEO-friendly

### Hybrid Approach (Recommended)

```typescript
// Use server-side for initial load, client-side for updates
'use client'

import { useTransition } from 'react'

export function MarketplaceContent({ initialListings }: { initialListings: any[] }) {
  const [listings, setListings] = useState(initialListings)
  const [isPending, startTransition] = useTransition()

  const handleFilterChange = (filter: any) => {
    startTransition(async () => {
      const result = await getActiveListings(filter)
      setListings(result.listings)
    })
  }

  return <div>{/* render */}</div>
}
```

---

## Performance Optimization

### Image Optimization

```tsx
import Image from 'next/image'

// Good: optimized with Next.js
<Image
  src={hostAvatar}
  alt={hostName}
  width={112}
  height={112}
  className="rounded-full"
  priority={false}  // Lazy load
  sizes="(max-width: 640px) 80px, (max-width: 1024px) 100px, 112px"
/>

// Avoid: regular img tag
<img src={hostAvatar} />
```

### Virtualization for Large Lists

For 1000+ listings, consider virtualization:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual'

export function VirtualizedMarketplaceGrid({ listings }: { listings: any[] }) {
  const parentRef = useRef(null)

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(listings.length / 4),  // 4 columns
    size: 400,  // Approximate row height
    parentRef,
  })

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div className="grid grid-cols-4 gap-6">
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <React.Fragment key={virtualRow.key}>
            {/* Render 4 cards per row */}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
```

### Caching Strategy

```typescript
// In actions.ts
import { revalidateTag } from 'next/cache'

export async function getActiveListings(filters?: any) {
  const listings = await prisma.listing.findMany({
    where: { status: 'ACTIVE', ...filterWhere },
    // ... rest of query
  })

  return { listings }
}

// Revalidate on listing changes
export async function updateListing(id: string, data: any) {
  await prisma.listing.update({ where: { id }, data })
  revalidateTag('marketplace-listings')
}
```

---

## Testing Components

### Unit Test Example (Jest + React Testing Library)

```typescript
// __tests__/marketplace-card.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MarketplaceCard } from '@/components/marketplace-card'

describe('MarketplaceCard', () => {
  const mockCard = {
    id: 'test-1',
    slug: 'test-listing',
    title: 'Test Cooking Class',
    hostName: 'John Doe',
    hostAvatar: '/test.jpg',
    price: 50000,
    type: 'VIRTUAL',
  }

  it('renders card with correct data', () => {
    render(<MarketplaceCard {...mockCard} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Test Cooking Class')).toBeInTheDocument()
  })

  it('links to correct detail page', () => {
    render(<MarketplaceCard {...mockCard} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/listing/test-listing')
  })

  it('displays bio on hover', async () => {
    const user = userEvent.setup()
    render(<MarketplaceCard {...mockCard} bio="I am a chef" />)

    const card = screen.getByRole('link')
    await user.hover(card)
    expect(screen.getByText('I am a chef')).toBeInTheDocument()
  })
})
```

---

## Accessibility Enhancements

### ARIA Labels

```tsx
// Add meaningful aria-labels
<button
  aria-label={`Save ${hostName}'s listing`}
  onClick={toggleSave}
>
  <Heart className="w-5 h-5" />
</button>

// Semantic heading hierarchy
<h1>Marketplace</h1>  {/* Page title */}
<h2>{categoryTitle}</h2>  {/* Section title */}
<h3>{hostName}</h3>  {/* Card title */}
```

### Focus Management

```tsx
// Ensure focus visible on interactive elements
<input
  className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  {...}
/>

<button
  className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  {...}
/>
```

---

## Common Issues & Solutions

### Issue: Cards Not Linking
**Solution**: Ensure slug is valid and `href={`/listing/${slug}`}` is correct

### Issue: Images Not Loading
**Solution**: Check image URL, ensure Image component is used, check Next.js image config

### Issue: Search Not Working
**Solution**: Verify searchParams are passed to actions, check database indices on searched fields

### Issue: Responsive Grid Broken
**Solution**: Clear browser cache, check Tailwind config is loaded, verify breakpoint syntax

### Issue: Performance Slow with 1000+ Cards
**Solution**: Implement pagination, use virtualization, add image optimization, check database query performance

---

## Resources & References

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Next.js Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)
- [React Accessibility](https://react.dev/learn/accessibility)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Last Updated**: December 31, 2025
**Version**: 1.0
