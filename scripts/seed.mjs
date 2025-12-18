import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Helper to hash passwords (matching auth.ts logic)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return { hash, salt }
}

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

// Demo users data
const demoUsers = [
  {
    email: 'admin@dinewith.com',
    name: 'Admin User',
    role: 'ADMIN',
    password: 'admin123'
  },
  {
    email: 'moderator@dinewith.com',
    name: 'Mod Smith',
    role: 'MODERATOR',
    password: 'mod123'
  },
  {
    email: 'guest@dinewith.com',
    name: 'Sarah Johnson',
    role: 'GUEST',
    password: 'guest123'
  },
  {
    email: 'guest2@dinewith.com',
    name: 'Mike Chen',
    role: 'GUEST',
    password: 'guest123'
  }
]

// Demo hosts with profiles and listings
const demoHosts = [
  {
    user: {
      email: 'maria@dinewith.com',
      name: 'Maria Rodriguez',
      role: 'HOST',
      password: 'host123'
    },
    profile: {
      displayName: 'Chef Maria',
      bio: 'Authentic Mexican cuisine with modern twists. 15+ years cooking experience.',
      tagline: 'Farm-to-table Mexican dining experiences',
      cuisines: ['Mexican', 'Latin American', 'Fusion'],
      languages: ['English', 'Spanish']
    },
    listings: [
      {
        title: 'Authentic Tacos & Tequila Night',
        slug: 'authentic-tacos-tequila-chicago',
        type: 'IN_PERSON',
        status: 'ACTIVE',
        priceAmount: 7500, // $75
        duration: 180,
        maxGuests: 6,
        city: 'Chicago',
        state: 'IL',
        content: JSON.stringify({
          description: 'Join me for an evening of handmade tacos, fresh salsas, and premium tequila tasting. Learn traditional techniques while enjoying amazing food and conversation.',
          highlights: ['Handmade tortillas', 'Tequila pairing', 'Recipe cards included'],
          menu: 'Street tacos (carnitas, al pastor, vegetarian), fresh guacamole, tres leches dessert'
        })
      },
      {
        title: 'Virtual Salsa Making Workshop',
        slug: 'virtual-salsa-workshop-maria',
        type: 'VIRTUAL',
        status: 'ACTIVE',
        priceAmount: 3500, // $35
        duration: 90,
        maxGuests: 10,
        content: JSON.stringify({
          description: 'Learn to make 5 different salsas from scratch in this interactive online class. Shopping list provided in advance.',
          highlights: ['5 salsa recipes', 'Ingredient prep tips', 'Q&A session']
        })
      }
    ]
  },
  {
    user: {
      email: 'david@dinewith.com',
      name: 'David Park',
      role: 'HOST',
      password: 'host123'
    },
    profile: {
      displayName: 'Chef David',
      bio: 'Korean-American fusion chef specializing in BBQ and fermentation.',
      tagline: 'Korean BBQ reimagined',
      cuisines: ['Korean', 'Asian Fusion', 'BBQ'],
      languages: ['English', 'Korean']
    },
    listings: [
      {
        title: 'Korean BBQ & Kimchi Making Class',
        slug: 'korean-bbq-kimchi-minneapolis',
        type: 'IN_PERSON',
        status: 'ACTIVE',
        priceAmount: 8500, // $85
        duration: 240,
        maxGuests: 8,
        city: 'Minneapolis',
        state: 'MN',
        content: JSON.stringify({
          description: 'Experience authentic Korean BBQ while learning to make your own kimchi to take home. Perfect for food lovers wanting to explore fermentation.',
          highlights: ['Unlimited banchan', 'Kimchi to take home', 'Soju tasting'],
          menu: 'Bulgogi, galbi, various banchan, kimchi fried rice'
        })
      }
    ]
  },
  {
    user: {
      email: 'emma@dinewith.com',
      name: 'Emma Wilson',
      role: 'HOST',
      password: 'host123'
    },
    profile: {
      displayName: 'Emma the Baker',
      bio: 'Pastry chef and sourdough enthusiast. Teaching baking with heart.',
      tagline: 'Artisan bread & pastries',
      cuisines: ['Baking', 'French', 'European'],
      languages: ['English', 'French']
    },
    listings: [
      {
        title: 'Sourdough Workshop & Dinner',
        slug: 'sourdough-workshop-madison',
        type: 'IN_PERSON',
        status: 'ACTIVE',
        priceAmount: 6500, // $65
        duration: 180,
        maxGuests: 6,
        city: 'Madison',
        state: 'WI',
        content: JSON.stringify({
          description: 'Learn sourdough fundamentals while enjoying a farm-to-table dinner featuring fresh bread, local cheese, and seasonal produce.',
          highlights: ['Starter culture included', 'Recipe book', 'Dinner included'],
          menu: 'Fresh sourdough, artisan cheeses, seasonal salads, soup'
        })
      }
    ]
  }
]

async function seedCities() {
  console.log('🌆 Seeding cities...')
  for (const city of citySeeds) {
    await prisma.city.upsert({
      where: { slug: city.slug },
      update: city,
      create: city
    })
  }
  console.log(`✅ Seeded ${citySeeds.length} cities`)
}

async function seedUsers() {
  console.log('👤 Seeding demo users...')
  
  for (const userData of demoUsers) {
    const { hash, salt } = hashPassword(userData.password)
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        password: hash,
        salt: salt
      }
    })
  }
  
  console.log(`✅ Seeded ${demoUsers.length} users (admin, mod, guests)`)
}

async function seedHosts() {
  console.log('🍳 Seeding host users with profiles and listings...')
  
  for (const hostData of demoHosts) {
    const { hash, salt } = hashPassword(hostData.user.password)
    
    // Create user
    const user = await prisma.user.upsert({
      where: { email: hostData.user.email },
      update: {},
      create: {
        email: hostData.user.email,
        name: hostData.user.name,
        role: hostData.user.role,
        password: hash,
        salt: salt
      }
    })
    
    // Create host profile
    const profile = await prisma.hostProfile.upsert({
      where: { userId: user.id },
      update: hostData.profile,
      create: {
        userId: user.id,
        ...hostData.profile
      }
    })
    
    // Create listings
    for (const listingData of hostData.listings) {
      await prisma.listing.upsert({
        where: { slug: listingData.slug },
        update: {},
        create: {
          ...listingData,
          hostProfileId: profile.id,
          publishedAt: new Date()
        }
      })
    }
    
    console.log(`  ✅ ${hostData.user.name} with ${hostData.listings.length} listing(s)`)
  }
  
  console.log(`✅ Seeded ${demoHosts.length} hosts`)
}

async function seedStreams() {
  console.log('🎥 Seeding demo streams...')
  
  // Get Maria (first host) to create streams
  const maria = await prisma.user.findUnique({
    where: { email: 'maria@dinewith.com' }
  })
  
  const david = await prisma.user.findUnique({
    where: { email: 'david@dinewith.com' }
  })
  
  if (maria) {
    // Live stream
    await prisma.stream.create({
      data: {
        hostId: maria.id,
        title: 'Taco Tuesday Live Cooking Session',
        description: 'Join me live as I make tacos from scratch! Ask questions in real-time.',
        type: 'BROADCAST',
        status: 'LIVE',
        startedAt: new Date(Date.now() - 30 * 60 * 1000), // Started 30 min ago
        viewerCount: 12,
        maxViewers: 15
      }
    })
    
    // Past stream
    await prisma.stream.create({
      data: {
        hostId: maria.id,
        title: 'Salsa Making Masterclass',
        description: 'Learn 5 different salsa recipes in one session.',
        type: 'SMALL_GROUP',
        status: 'ENDED',
        startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
        duration: 5400,
        maxViewers: 8,
        vodExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      }
    })
  }
  
  if (david) {
    await prisma.stream.create({
      data: {
        hostId: david.id,
        title: 'Kimchi Fermentation Q&A',
        description: 'Got kimchi questions? Ask away while I prep a new batch!',
        type: 'BROADCAST',
        status: 'CREATED'
      }
    })
  }
  
  console.log('✅ Seeded 3 demo streams')
}

async function main() {
  console.log('🌱 Starting database seed...\n')
  
  await seedCities()
  await seedUsers()
  await seedHosts()
  await seedStreams()
  
  console.log('\n🎉 Database seeding complete!')
  console.log('\n📝 Demo Login Credentials:')
  console.log('   Admin:     admin@dinewith.com / admin123')
  console.log('   Moderator: moderator@dinewith.com / mod123')
  console.log('   Guest:     guest@dinewith.com / guest123')
  console.log('   Host:      maria@dinewith.com / host123')
  console.log('   Host:      david@dinewith.com / host123')
  console.log('   Host:      emma@dinewith.com / host123')
}

main()
  .catch(error => {
    console.error('❌ Failed seeding database:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
