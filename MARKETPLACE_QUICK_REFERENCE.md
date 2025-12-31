# Marketplace UI — Quick Reference Card

**For developers implementing or maintaining the marketplace UI**

---

## 🔍 File Map

| File | Purpose | LOC |
|------|---------|-----|
| `components/marketplace-card.tsx` | Individual card component | ~150 |
| `components/marketplace-toolbar.tsx` | Search, filter, sort controls | ~120 |
| `components/marketplace-category-section.tsx` | Category wrapper | ~35 |
| `app/marketplace/page.tsx` | Main page (redesigned) | ~95 |
| `app/marketplace/actions.ts` | Data fetching with sorting | ~110 |

---

## ⚡ Component Usage

### MarketplaceCard
```tsx
import { MarketplaceCard } from '@/components/marketplace-card'

<MarketplaceCard
  id="listing-1"
  slug="chef-marie"
  title="Italian Cooking Class"
  hostName="Marie Rossi"
  hostTagline="Michelin Chef"
  hostAvatar="/marie.jpg"
  price={50000}  // $500
  type="VIRTUAL"
  badge="Top Expert"
  bio="French chef with 15 years..."
  rating={4.8}
  reviewCount={42}
/>
```

### MarketplaceToolbar
```tsx
import { MarketplaceToolbar } from '@/components/marketplace-toolbar'

<MarketplaceToolbar
  currentType="VIRTUAL"
  currentSort="recommended"
  currentSearch="cooking"
/>
```

### CategorySection
```tsx
import { CategorySection } from '@/components/marketplace-category-section'

<CategorySection title="Virtual Experiences" subtitle="Learn online">
  {/* Cards go here */}
</CategorySection>
```

---

## 🗂️ Data Flow

```
User Input (search/filter/sort)
  ↓
URL updated with searchParams
  ↓
Server: getActiveListings(searchParams)
  ↓
Database query with filters + ordering
  ↓
Page re-renders with new listings
  ↓
MarketplaceCard components display
```

---

## 🎚️ URL Parameters

| Param | Values | Example |
|-------|--------|---------|
| `type` | IN_PERSON, VIRTUAL, HYBRID | `?type=VIRTUAL` |
| `search` | Any string | `?search=cooking` |
| `sort` | recommended, price-low, price-high, rating | `?sort=price-low` |
| `city` | City name | `?city=Chicago` |

**Full Example**: `/marketplace?type=VIRTUAL&sort=price-low&search=cooking`

---

## 🎨 Responsive Grid

```css
/* Desktop (xl, ≥1280px) */
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6

/* To change: */
/* 5 cols on XL: xl:grid-cols-5 */
/* 3 cols on LG: lg:grid-cols-3 (default) */
```

**Gap**: 24px (6 Tailwind units)  
**Container**: 1280px max-width with 48px padding

---

## 🔧 Customization Hotspots

### 1. Card Appearance
**File**: `components/marketplace-card.tsx`
- Headshot size: Line 43 - `w-28 h-28`
- Card padding: Line 38 - `p-4`
- Header height: Line 33 - `h-48`

### 2. Toolbar Styling
**File**: `components/marketplace-toolbar.tsx`
- Button sizes: Line 55 - `h-9 px-4`
- Search placeholder: Line 31
- Sort label: Line 78

### 3. Grid Layout
**File**: `app/marketplace/page.tsx`
- Grid columns: Line 58 - `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- Gap size: Line 58 - `gap-6`

### 4. Sorting Logic
**File**: `app/marketplace/actions.ts`
- Sort implementations: Lines 55-73
- Add new sort types here

---

## 🚀 Common Modifications

### Add 5th Column on Desktop
```tsx
// Current: xl:grid-cols-4
// Change to:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
```

### Increase Card Padding
```tsx
// Current: p-4
// Change to:
<div className="p-6">
```

### Change Primary Color
```tsx
// Current: using default (blue)
// Change button active state in Tailwind config or use:
<Button variant="default" className="bg-purple-600 hover:bg-purple-700">
```

### Add More Sort Options
```typescript
// In actions.ts, add to sortOption type:
type SortOption = 'recommended' | 'price-low' | 'price-high' | 'rating' | 'your-new-option'

// Add logic:
if (filters?.sort === 'your-new-option') {
  orderBy = { /* your custom sort */ }
}
```

---

## ✅ Quality Checks

Before deploying:
- [ ] Search returns relevant results
- [ ] Filters update URL and listings
- [ ] Sort dropdown changes order
- [ ] Cards display correct data
- [ ] Hover shows bio (desktop)
- [ ] Responsive layout works (test on mobile)
- [ ] No console errors
- [ ] Images load properly
- [ ] Links navigate correctly

---

## 🎯 Performance Tips

| Issue | Solution |
|-------|----------|
| Slow page load | Check database indices on `status`, `type` |
| Images not optimizing | Use Next.js Image component (already done) |
| Many listings (1000+) | Add pagination or infinite scroll |
| Search too slow | Add full-text search or Elasticsearch |

---

## 🧪 Testing Commands

```bash
# Run dev server
pnpm dev

# Test search
# Visit: http://localhost:3000/marketplace?search=cooking

# Test filter
# Visit: http://localhost:3000/marketplace?type=VIRTUAL

# Test sort
# Visit: http://localhost:3000/marketplace?sort=price-low

# Lint
pnpm lint

# Type check
pnpm type-check
```

---

## 📚 Related Documentation

1. **Visual Guide**: `MARKETPLACE_VISUAL_REFERENCE.md`
2. **Design Spec**: `MARKETPLACE_DESIGN_GUIDE.md`
3. **Implementation**: `MARKETPLACE_IMPLEMENTATION.md`
4. **Customization**: `MARKETPLACE_CUSTOMIZATION.md`

---

## 🆘 Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Cards not showing | No listings in DB | Check status = 'ACTIVE' |
| Search not working | Missing host name in DB | Update hostProfile includes |
| Sort not working | Wrong field name | Check schema field names |
| Layout broken | Tailwind not compiling | Run `pnpm dev` and clear cache |
| Images not loading | Wrong avatar URL | Check image URLs in DB |

---

## 💾 Database Schema (Key Fields)

### Listing
```typescript
{
  id: string
  title: string          // Offering name
  type: 'IN_PERSON' | 'VIRTUAL' | 'HYBRID'
  priceAmount: number    // In cents
  duration?: number      // In minutes
  status: 'ACTIVE' | ...
  hostProfileId: string
  createdAt: DateTime
  publishedAt?: DateTime
}
```

### HostProfile
```typescript
{
  id: string
  displayName: string
  avatar?: string        // Image URL
  bio?: string
  tagline?: string       // One-line credential
  userId: string
}
```

---

## 🔐 Security Notes

- Never expose sensitive host data in listings
- Search queries are parameterized (SQL injection safe)
- URL parameters are sanitized via Next.js
- Private data is filtered in actions.ts select clauses

---

## 📊 Key Metrics to Track

- Search volume
- Filter usage (which types/sorts most used)
- Click-through rate by position
- Hover engagement
- Conversion rate (listing → booking)
- Mobile vs desktop traffic

---

## 🎓 Key Concepts

| Concept | Location | What It Does |
|---------|----------|--------------|
| Server Actions | `app/marketplace/actions.ts` | Fetch listings with filters |
| URL State | `components/marketplace-toolbar.tsx` | Persist filters in URL |
| Responsive Grid | `app/marketplace/page.tsx` line 58 | Adapt layout to screen size |
| Hover State | `components/marketplace-card.tsx` line 50+ | Show bio on hover |
| Category Sections | `app/marketplace/page.tsx` line 75+ | Group by type |

---

## 🚨 Common Errors

```
Error: "Cannot read property 'displayName' of undefined"
→ Check listing.hostProfile is included in query

Error: "Image missing alt text"
→ Already handled, check Image component alt prop

Error: "URL parameter not updating page"
→ Use router.push() in toolbar handlers, already implemented

Error: "Grid not responsive"
→ Clear browser cache, restart dev server
```

---

## 📞 Developer Checklist

When inheriting this codebase:
- [ ] Read MARKETPLACE_REDESIGN_SUMMARY.md
- [ ] Review MARKETPLACE_DESIGN_GUIDE.md
- [ ] Test all components locally
- [ ] Understand data flow (see Data Flow section above)
- [ ] Review customization guide for common tasks
- [ ] Check database schema against code
- [ ] Test on mobile device
- [ ] Review component props and interfaces

---

**Last Updated**: December 31, 2025  
**Audience**: Developers maintaining or extending this code  
**Format**: Quick reference for fast lookup
