# Marketplace UI Design Guide

## Overview

The redesigned marketplace follows Dinewith's design ethos: **Human first. Tech enabled. Quietly modern.**

The marketplace is the core discovery interface where guests browse and book dining experiences. The design emphasizes:
- **The person** (face, name, credential)
- **Clear value proposition** (price and format)
- **Calm, trustworthy interaction**
- **Responsive, mobile-first layout**

---

## Components

### 1. MarketplaceCard

**Purpose**: Individual host/offering card in the marketplace grid.

**Visual Hierarchy**:
1. **Headshot** (primary visual anchor)
   - Circular crop or image container
   - 112px diameter on desktop, scales responsively
   - Fallback: colored circle with host initial
   
2. **Name** (secondary hierarchy)
   - Clear, bold typography
   - Truncated to single line
   
3. **Tagline/Credential** (tertiary)
   - One-line title or professional credential
   - Muted color, smaller font
   - Example: "Chef & Cooking Coach"

4. **Offering Title**
   - The actual service being offered
   - Example: "French Cooking Masterclass"

5. **Price and Format**
   - Large, bold price display
   - Format label (Session, 60min, etc.)
   - Type badge (In Person, Virtual, Hybrid)

**Interactive States**:
- **Hover**: Subtle shadow increase, reveals bio preview
- **Active**: Linked to listing detail page
- **Badge**: Optional "Top Expert", "Top Rated" badge in top-right

**Data Displayed**:
```typescript
interface MarketplaceCardProps {
  id: string                    // Unique listing ID
  slug: string                  // URL slug for detail page
  title: string                 // Offering title
  hostName: string              // Display name
  hostTagline?: string          // One-line credential
  hostAvatar?: string           // Avatar image URL
  price: number                 // Price in cents
  priceLabel?: string           // Format label (default: "Session")
  type: string                  // IN_PERSON, VIRTUAL, HYBRID
  badge?: string                // Optional badge (Top Expert, etc.)
  bio?: string                  // Brief bio (shown on hover)
  rating?: number               // Star rating (0-5)
  reviewCount?: number          // Number of reviews
}
```

**Responsive Behavior**:
- Desktop: 1-4 columns (adjustable per viewport)
- Tablet: 2 columns
- Mobile: 1 column (stacked)
- Consistent 6px gap between cards

---

### 2. MarketplaceToolbar

**Purpose**: Search, filter, and sort controls above the marketplace grid.

**Sections**:

#### A. Search Bar
- Full-width input field
- Placeholder: "Search by host name, cuisine, location..."
- Search icon (left side)
- Clear button (right side, shows when active)
- Searches across: host name, offering title, bio

#### B. Category Filters (Tabs)
- Horizontal button group
- Options:
  - **All** (default)
  - **In Person**
  - **Virtual**
  - **Hybrid**
- Active state: solid primary color
- Inactive state: outline variant

#### C. Sorting Dropdown
- Right-aligned on desktop, full-width on mobile
- Options:
  - **Recommended** (default: newest/published first)
  - **Price: Low to High** (ascending)
  - **Price: High to Low** (descending)
  - **Highest Rated** (by booking/view count proxy)

**URL Integration**:
- All filters update URL search params
- Bookmarkable URLs preserve state
- URL structure: `/marketplace?search=...&type=...&sort=...`

**Responsive Behavior**:
- Search bar: always full-width
- Filters and sort: row on desktop, stack on mobile
- Touch-friendly button sizes (44px minimum height)

---

### 3. CategorySection

**Purpose**: Groups listings by type with section heading and description.

**Visual Elements**:
- **Section Title** (e.g., "In-Person Experiences")
  - Large, bold heading (h2, 28px)
  - Top margin for breathing room
  
- **Section Subtitle** (optional)
  - One-line description
  - Muted color, smaller font
  
- **Grid Content**
  - Same responsive grid as toolbar
  - Consistent 6px spacing
  
- **Empty State**
  - Dashed border box
  - Centered text: "No listings available in this category"
  - Encourages browsing other categories

**Display Logic**:
- Only shown when browsing all types (no active filter)
- Auto-groups listings by `type` field
- Hides sections with zero listings
- Maintains consistent order: IN_PERSON → VIRTUAL → HYBRID

---

## Layout & Grid System

### Desktop (lg breakpoint, 1024px+)
- 4 columns per row
- 24px (6 Tailwind units) gap between cards
- Content max-width: 1280px container
- Padding: 48px horizontal (12 Tailwind units)

### Tablet (md breakpoint, 768px-1023px)
- 2-3 columns per row
- Same 24px gap
- Padding: 24px horizontal

### Mobile (sm breakpoint, <768px)
- 1 column (full-width stacked)
- 24px gap (vertical)
- Padding: 16px horizontal

---

## Interactions

### Hover States (Desktop)
1. **Card hover**:
   - Shadow increase (subtle)
   - Border color slight shift
   - Bio preview slides in (if available)
   - Background overlay (5% white)

2. **Button hover**:
   - Filter buttons: color shift
   - Sort dropdown: standard select hover

### Click Actions
1. **Card click** → Opens listing detail page (`/listing/{slug}`)
2. **Filter button click** → Updates URL, re-renders with filter applied
3. **Sort dropdown change** → Updates URL, re-renders with new sort
4. **Search input change** → Debounced URL update

### Mobile Touch
- No hover states on mobile
- Card tap → Detail page
- Buttons: 44px+ minimum touch target
- Dropdown: native select on mobile (auto-expands to full screen)

---

## Typography Hierarchy

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page Title | 36px-48px | Bold (700) | gray-900 |
| Page Subtitle | 18px | Regular (400) | gray-600 |
| Section Title | 28px | Bold (700) | gray-900 |
| Section Subtitle | 14px | Regular (400) | gray-600 |
| Card Name | 16px | Semibold (600) | gray-900 |
| Card Tagline | 14px | Regular (400) | gray-600 |
| Card Title | 14px | Medium (500) | gray-700 |
| Card Price | 18px | Bold (700) | gray-900 |
| Card Price Label | 12px | Regular (400) | gray-500 |
| Badge Text | 12px | Medium (500) | white (on color) |

---

## Color & Styling

### Card Design
- Background: white
- Border: 1px solid #e5e7eb (gray-200)
- Hover border: #d1d5db (gray-300)
- Header background: linear gradient gray-100 to gray-50
- Headshot container: 112px circle
- Padding: 16px (4 Tailwind units)

### Badges
- **Type badge** (bottom-right): Secondary variant (outline)
  - Text: gray-600
  - Border: gray-300
  
- **Status badge** (top-right): Accent color
  - Background: amber-500
  - Text: white
  - Example: "Top Expert"
  
- **Rating badge** (top-left): white background
  - Star icon + rating number
  - Text: 14px semibold
  - Border: subtle shadow

### Button States
- **Active filter**: Primary color (typically blue)
- **Inactive filter**: Outline variant
- **Hover**: Color shift per variant
- **Height**: 36px (9 Tailwind units)
- **Padding**: 12px horizontal (3 Tailwind units)

---

## Data Requirements

### For Each Listing
```typescript
listing: {
  id: string                 // Required
  slug: string               // Required, unique
  title: string              // Required, offering name
  type: 'IN_PERSON' | 'VIRTUAL' | 'HYBRID'  // Required
  priceAmount: number        // Required, in cents
  duration?: number          // Optional, in minutes
  hostProfile: {
    displayName: string      // Required
    avatar?: string          // Optional, image URL
    bio?: string             // Optional, shown on hover
    tagline?: string         // Optional, credential
  }
}
```

---

## Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Arrow keys in dropdown (native)
- Clear focus indicators (4px outline)

### Screen Readers
- Card links have descriptive titles
- Form labels present on search/filters
- Section headings properly marked (h2)
- Icon-only buttons have `aria-label`
- Badge text conveyed semantically

### Color Contrast
- All text meets WCAG AA minimum (4.5:1 for normal, 3:1 for large)
- No color-only indicators (badges include text/icon)
- Links underlined or otherwise visually distinct

---

## Performance Considerations

### Image Optimization
- Use Next.js `Image` component
- Lazy loading for off-screen cards
- Responsive sizes: `(max-width: 768px) 100px, 112px`
- Avatar format: WebP with fallback

### URL State Management
- Search params preserved in browser history
- Bookmarkable filtered views
- No page reload on filter change (client-side URL update)
- Pagination optional (infinite scroll or load-more)

---

## Future Enhancements

1. **Saved/Favorites**: Heart icon on cards, saved list page
2. **Advanced Filters**: Price range slider, cuisine multi-select, availability calendar
3. **Quick Booking**: Modal or sheet for instant booking flow
4. **Host Comparison**: Side-by-side comparison view for similar offerings
5. **Analytics**: Track filter usage, click-through rates, conversion funnels
6. **Personalization**: Recommended section based on browsing history
7. **Social Proof**: Recent bookings display, "X people booked this week"

---

## Implementation Notes

### Files
- `components/marketplace-card.tsx` - Individual card component
- `components/marketplace-toolbar.tsx` - Search, filter, sort controls
- `components/marketplace-category-section.tsx` - Section wrapper
- `app/marketplace/page.tsx` - Main marketplace page
- `app/marketplace/actions.ts` - Server actions for data fetching

### Dependencies
- Next.js Image optimization
- Tailwind CSS (responsive utilities)
- shadcn/ui components (Button, Input, Select, Badge)
- Lucide icons (Search, X for clear)

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile: iOS Safari 12+, Chrome Android
- No IE11 support (modern-only)

---

**Last Updated**: December 31, 2025
**Design System**: Dinewith Design System v1
