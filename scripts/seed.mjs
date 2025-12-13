import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const citySeeds = [
  {
    slug: 'minneapolis-st-paul',
    name: 'Minneapolis-St. Paul',
    stateName: 'Minnesota',
    stateSlug: 'mn',
    stateCode: 'MN',
    headline: 'North loop tasting menus with the right tablemates.',
    description:
      'We are curating progressive supper clubs across the Twin Cities waterfront and warehouse districts.',
    heroCopy:
      'Expect chef-led collaborations between Northeast breweries and Lowertown kitchens, paired with guests who actually RSVP.'
  },
  {
    slug: 'chicago',
    name: 'Chicago',
    stateName: 'Illinois',
    stateSlug: 'il',
    stateCode: 'IL',
    headline: 'Skyline views, composed courses, zero awkward intros.',
    description:
      'We are soft-launching dinners in Fulton Market, Pilsen lofts, and Gold Coast brownstones.',
    heroCopy:
      'Think hearth cooking, Midwest seafood stories, and a guest list you will text after dessert.'
  },
  {
    slug: 'madison',
    name: 'Madison',
    stateName: 'Wisconsin',
    stateSlug: 'wi',
    stateCode: 'WI',
    headline: 'Lake Mendota views meet Midwest fermentation hits.',
    description:
      'Seasonal itineraries weaving together Williamson Street, the capitol square, and hidden farm partners.',
    heroCopy:
      'We match founders, creatives, and hosts over coursed menus that still feel like your favorite dinner party.'
  }
]

async function seedCities() {
  for (const city of citySeeds) {
    await prisma.city.upsert({
      where: { slug: city.slug },
      update: city,
      create: city
    })
  }
  console.log(`Seeded ${citySeeds.length} cities`)
}

async function main() {
  await seedCities()
}

main()
  .catch(error => {
    console.error('Failed seeding database:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
