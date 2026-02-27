import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ─── Admin User ─────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@americanroyalty.com' },
    update: {},
    create: {
      email: 'admin@americanroyalty.com',
      name: 'Admin',
      hashedPassword,
      role: 'ADMIN',
    },
  })
  console.log('  ✓ Admin user created')

  // ─── Vehicles ───────────────────────────────────────────
  const vehicles = [
    {
      name: 'The Sovereign',
      slug: 'the-sovereign',
      type: 'PARTY_BUS' as const,
      capacity: 30,
      hourlyRate: 250,
      minHours: 3,
      description: 'Our flagship 30-passenger party bus. The ultimate nightlife experience on wheels with full club amenities including LED club lighting, a premium sound system, wet bar, and dance area.',
      features: ['LED Club Lighting', 'Premium Sound System', 'Wet Bar', 'Bluetooth Audio', 'Stripper Pole', 'Smoke Machine'],
      displayOrder: 1,
    },
    {
      name: 'The Crown Jewel',
      slug: 'the-crown-jewel',
      type: 'PARTY_BUS' as const,
      capacity: 20,
      hourlyRate: 200,
      minHours: 3,
      description: 'Mid-size luxury party bus perfect for bachelor and bachelorette parties, birthday celebrations, and nightlife adventures. Features laser lights, a powerful subwoofer system, and dedicated bar area.',
      features: ['Laser Lights', 'Subwoofer System', 'Bar Area', 'TV Screens', 'Privacy Tinting', 'Climate Control'],
      displayOrder: 2,
    },
    {
      name: 'Royal Sprinter',
      slug: 'royal-sprinter',
      type: 'SPRINTER_LIMO' as const,
      capacity: 14,
      hourlyRate: 175,
      minHours: 2,
      description: 'Sleek Mercedes Sprinter limo van with premium leather interior and fiber optic lighting. Perfect for VIP groups, corporate events, and intimate celebrations.',
      features: ['Mercedes-Benz', 'Leather Interior', 'Fiber Optic Lighting', 'Premium Audio', 'USB Charging', 'Champagne Bar'],
      displayOrder: 3,
    },
    {
      name: 'The Monarch',
      slug: 'the-monarch',
      type: 'STRETCH_LIMO' as const,
      capacity: 10,
      hourlyRate: 150,
      minHours: 2,
      description: 'Classic stretch SUV limousine with J-seating configuration and mini bar. Arrive in style for weddings, proms, and special occasions throughout Las Vegas.',
      features: ['Stretch SUV', 'J-Seating', 'Mini Bar', 'Flat Screens', 'Fiber Optics', 'Privacy Partition'],
      displayOrder: 4,
    },
    {
      name: 'Black Diamond',
      slug: 'black-diamond',
      type: 'STRETCH_LIMO' as const,
      capacity: 8,
      hourlyRate: 125,
      minHours: 2,
      description: 'Elegant stretch Lincoln limousine offering timeless luxury for airport transfers, date nights, and intimate celebrations. Features champagne setup and premium leather seating.',
      features: ['Lincoln Stretch', 'Leather Seats', 'Champagne Setup', 'LED Lighting', 'Sound System', 'Tinted Windows'],
      displayOrder: 5,
    },
    {
      name: 'The Empire',
      slug: 'the-empire',
      type: 'PARTY_BUS' as const,
      capacity: 40,
      hourlyRate: 350,
      minHours: 4,
      description: 'The biggest party on wheels in Las Vegas. Our 40-passenger mega bus features dual zone lighting, concert-grade sound, multiple bars, a dance floor, and a VIP lounge area.',
      features: ['Dual Zone Lighting', 'Concert Sound', 'Multiple Bars', 'Dance Floor', 'Karaoke', 'VIP Lounge Area'],
      displayOrder: 6,
    },
  ]

  for (const v of vehicles) {
    await prisma.vehicle.upsert({
      where: { slug: v.slug },
      update: v,
      create: v,
    })
  }
  console.log(`  ✓ ${vehicles.length} vehicles seeded`)

  // ─── Services ───────────────────────────────────────────
  const services = [
    {
      title: 'Bachelor Parties',
      slug: 'bachelor-party',
      tagline: 'Send him off in legendary style',
      description: "Your last night of freedom deserves a party bus that matches the energy. Strip tours, club crawls, VIP access — we handle it all.",
      longDescription: "Planning a bachelor party in Las Vegas? American Royalty delivers the ultimate groom's night out with our fleet of luxury party buses and limousines. From the moment your group steps aboard, the party starts — LED club lighting, premium sound systems, wet bars, and enough room for your entire crew to celebrate in style.\n\nOur professional chauffeurs know every hot spot on the Las Vegas Strip and beyond. Whether you're hitting the clubs at Hakkasan, XS, and Omnia, or prefer a high-energy Strip tour with VIP access, we'll create the perfect bachelor party route.\n\nPopular bachelor party packages include Strip club tours, nightclub crawls with VIP entry, pool party shuttles, and custom adventure routes. Every party bus comes fully stocked and ready to roll, so the groom and his crew can focus on making memories.\n\nWe serve groups from 8 to 40 guests, with vehicles ranging from sleek stretch limos to our flagship 40-passenger Empire party bus. Book early — Las Vegas bachelor parties are our most popular service.",
      icon: '🎉',
      keywords: 'bachelor party bus Las Vegas, bachelor party limo Vegas, grooms night out Las Vegas',
      displayOrder: 1,
    },
    {
      title: 'Bachelorette Parties',
      slug: 'bachelorette-party',
      tagline: 'Crown the bride-to-be',
      description: "Pink lights, champagne, and the hottest spots on the Strip. Our party buses are the ultimate bachelorette experience.",
      longDescription: "Give the bride-to-be the Las Vegas bachelorette party she deserves. American Royalty specializes in creating unforgettable bachelorette experiences with our luxury party buses and limousines.\n\nOur vehicles set the mood from the start — think champagne on ice, custom lighting, Bluetooth audio for your playlists, and a rolling VIP experience that rivals any nightclub. Your group will turn heads pulling up to every venue in style.\n\nPopular bachelorette routes include pool party circuits (Wet Republic, Marquee Dayclub, Encore Beach Club), dinner and nightclub crawls, male revue shows, and custom photo-stop tours of the Strip. We'll coordinate with venues to ensure VIP treatment everywhere you go.\n\nOur experienced drivers handle everything — navigation, timing, parking — so the bride and her crew never have to worry about logistics. Available for groups of 8 to 40 guests with vehicles to match any party size and vibe.",
      icon: '💎',
      keywords: 'bachelorette party bus Las Vegas, bachelorette limo Vegas, bride tribe Las Vegas',
      displayOrder: 2,
    },
    {
      title: 'Wedding Transportation',
      slug: 'wedding',
      tagline: 'Your grand entrance awaits',
      description: 'Elegant limousines and luxury buses for your wedding party. Arrive in style, depart in luxury.',
      longDescription: "Your wedding day deserves flawless transportation. American Royalty provides elegant limousine and luxury bus service for weddings throughout Las Vegas, Henderson, and the surrounding valley.\n\nFrom ceremony to reception, our professional chauffeurs ensure your wedding party arrives on time and in style. Our stretch limousines are perfect for the bride and groom, while our party buses accommodate the entire wedding party for group transportation.\n\nWedding services include ceremony-to-reception transfers, bridal party transportation, guest shuttles, photo stop routes (including the iconic Welcome to Las Vegas sign), and elegant getaway cars. Every vehicle is detailed to perfection and arrives with complimentary champagne.\n\nWe work closely with Las Vegas wedding planners and venues to coordinate seamless timing. Popular venue routes include Chapel of the Flowers, The Little Church, Bellagio, Caesars Palace, and dozens of other Las Vegas wedding venues.\n\nBook a consultation to discuss your wedding transportation needs — we'll customize a package that fits your timeline, group size, and budget.",
      icon: '💒',
      keywords: 'wedding limo Las Vegas, wedding party bus Vegas, wedding transportation Las Vegas',
      displayOrder: 3,
    },
    {
      title: 'Nightlife & Club Crawls',
      slug: 'nightlife',
      tagline: 'Own the night',
      description: 'Skip the Uber surge and taxi lines. Our VIP party buses take you door-to-door across the hottest clubs and venues.',
      longDescription: "Las Vegas nightlife is legendary — and the best way to experience it is from the back of an American Royalty party bus. Skip the surge pricing, taxi lines, and parking hassles. Our VIP nightlife transportation takes your group door-to-door across the hottest clubs, bars, and venues on the Strip.\n\nOur drivers know the Las Vegas nightlife scene inside and out. Popular club crawl routes include XS Nightclub, Hakkasan, Omnia, Marquee, Drai's, and dozens more. We'll customize your route and timing to maximize your night.\n\nThe party doesn't stop between venues — our party buses keep the energy going with club-quality sound systems, LED lighting, and fully stocked bars. It's like having your own private nightclub that takes you wherever you want to go.\n\nAvailable Thursday through Sunday nights (and any night for private bookings). Groups of 8 to 40 guests. Ask about our popular 4-hour and 6-hour nightlife packages.",
      icon: '🌃',
      keywords: 'Las Vegas club crawl party bus, nightlife transportation Vegas, VIP nightlife Las Vegas',
      displayOrder: 4,
    },
    {
      title: 'Corporate Events',
      slug: 'corporate',
      tagline: 'Impress without the stress',
      description: 'Professional transportation for conventions, trade shows, team outings, and corporate entertainment in Las Vegas.',
      longDescription: "Make a lasting impression on clients and colleagues with American Royalty's corporate transportation services. We provide professional luxury vehicles for conventions, trade shows, team outings, client entertainment, and executive travel throughout Las Vegas.\n\nOur Sprinter limo vans and stretch limousines are ideal for client dinners, airport transfers for VIP guests, and executive group transportation. For larger corporate events, our party buses handle team outings and company celebrations with style.\n\nWe regularly serve groups attending CES, SEMA, MJBizCon, and other major Las Vegas conventions. Our professional chauffeurs are punctual, discreet, and dressed in formal attire — exactly the image your company wants to project.\n\nCorporate services include airport meet-and-greet, hotel-to-venue shuttles, multi-stop evening itineraries, and all-day event transportation. We offer corporate billing, W-9 on file, and can coordinate with your event planner.\n\nContact us for custom corporate transportation quotes — volume discounts available for multi-day bookings.",
      icon: '🏢',
      keywords: 'corporate transportation Las Vegas, convention shuttle Vegas, corporate limo Las Vegas',
      displayOrder: 5,
    },
    {
      title: 'Birthday Celebrations',
      slug: 'birthday',
      tagline: 'Make it unforgettable',
      description: 'Turn your birthday into an event. Our party buses transform your celebration into the party of the year.',
      longDescription: "Celebrate your birthday Las Vegas style with American Royalty. Whether you're turning 21, 30, 40, or beyond, our party buses and limousines transform your birthday into an unforgettable event.\n\nOur party buses are essentially nightclubs on wheels — LED lighting, premium sound systems, dance space, and full bar setups. Your birthday crew will be partying from the moment they step on board. Popular birthday routes include dinner stops, club crawls, Strip tours, and custom itineraries.\n\nWe accommodate birthday groups from 8 to 40 guests. The birthday VIP gets the royal treatment — think champagne toasts, custom lighting, and a party bus that's ready to celebrate. Our drivers will make sure the birthday star has the best night ever.\n\nPopular birthday packages include 4-hour nightlife crawls, dinner-and-clubs combos, and all-day pool party circuits. We can coordinate with venues for VIP entry, bottle service reservations, and special birthday perks.\n\nBook your Las Vegas birthday party bus today — popular dates fill up fast, especially weekends and holidays.",
      icon: '🎂',
      keywords: 'birthday party bus Las Vegas, birthday limo rental Vegas, birthday celebration Las Vegas',
      displayOrder: 6,
    },
    {
      title: 'Prom & Homecoming',
      slug: 'prom',
      tagline: "The entrance they'll never forget",
      description: 'Safe, stylish, and unforgettable. Professional chauffeurs ensure a prom night your group will talk about forever.',
      longDescription: "Make prom night one for the ages with American Royalty's premium limousine and party bus service. We specialize in safe, stylish, and memorable prom transportation for Las Vegas area high schools.\n\nSafety is our top priority. All vehicles are professionally maintained, fully insured, and operated by experienced, background-checked chauffeurs. Parents can rest easy knowing their teens are in professional hands — no surge-priced rideshares or inexperienced drivers.\n\nOur stretch limousines are perfect for groups of 8-10, while our party buses accommodate larger prom groups up to 40 students. Every vehicle features premium sound systems, LED lighting, and climate control for a comfortable, fun ride.\n\nProm packages typically include home pickup for photos, transportation to the venue, a post-prom activity stop, and safe drop-off. We work with parents and schools to establish clear itineraries and timing.\n\nWe serve all Las Vegas valley high schools including Centennial, Arbor View, Bishop Gorman, Green Valley, Coronado, and more. Book early — prom season dates sell out months in advance.",
      icon: '🎓',
      keywords: 'prom limo Las Vegas, homecoming party bus Vegas, prom transportation Las Vegas',
      displayOrder: 7,
    },
    {
      title: 'Airport Transfers',
      slug: 'airport',
      tagline: 'First class from landing',
      description: 'Luxury airport pickup and drop-off from Harry Reid International Airport. Start and end your Vegas trip like royalty.',
      longDescription: "Start your Las Vegas trip in style with American Royalty's luxury airport transfer service. We provide premium pickup and drop-off service from Harry Reid International Airport (LAS) to any hotel, resort, or destination in the Las Vegas valley.\n\nSkip the taxi line and rideshare surge. Our professional chauffeurs monitor your flight status and are waiting for you at arrivals with a personalized sign. From baggage claim to your hotel, you'll travel in a luxury sedan, stretch limousine, or Sprinter van depending on your group size.\n\nOur airport transfer service covers all Las Vegas area destinations including the Strip, Downtown, Henderson, Summerlin, and North Las Vegas. We also serve groups traveling to Lake Las Vegas, Red Rock Canyon, and other popular destinations outside the city center.\n\nServices include individual and group airport transfers, VIP meet-and-greet, hotel-to-airport departures, and private aviation terminal service. Corporate accounts welcome — we offer consistent billing and scheduling for frequent travelers.\n\nBook your airport transfer in advance for guaranteed pricing and availability. Same-day booking available based on vehicle availability.",
      icon: '✈️',
      keywords: 'airport limo Las Vegas, Harry Reid airport car service, Las Vegas airport transfer',
      displayOrder: 8,
    },
    {
      title: 'Las Vegas Strip Tours',
      slug: 'strip-tour',
      tagline: 'See Vegas like a VIP',
      description: 'Custom Strip tours with photo stops, sightseeing, and the best views of the Las Vegas skyline.',
      longDescription: "Experience the Las Vegas Strip like never before with American Royalty's VIP tour service. Our custom Strip tours combine sightseeing, photo opportunities, and the excitement of cruising the world's most famous boulevard in a luxury party bus or limousine.\n\nOur guided Strip tours include stops at iconic landmarks — the Welcome to Las Vegas sign, the Bellagio fountains, the High Roller, Fremont Street Experience, and more. Your professional chauffeur doubles as your local guide, sharing insider knowledge and photo-worthy spots most tourists never find.\n\nPopular tour routes include the Classic Strip Tour (2-3 hours), the Full Vegas Experience (4-5 hours including Downtown), and custom itineraries that combine sightseeing with dinner reservations, show tickets, or shopping stops.\n\nOur party buses make the tour itself part of the entertainment — enjoy the views through panoramic windows while the onboard sound system, lighting, and bar keep the party going between stops.\n\nPerfect for first-time visitors, birthday celebrations, anniversary trips, and anyone who wants to see Las Vegas from the VIP perspective. Groups of 2 to 40 guests welcome.",
      icon: '🎰',
      keywords: 'Las Vegas Strip tour party bus, Vegas Strip limo tour, Las Vegas sightseeing tour',
      displayOrder: 9,
    },
  ]

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    })
  }
  console.log(`  ✓ ${services.length} services seeded`)

  // ─── Testimonials ───────────────────────────────────────
  const testimonials = [
    {
      name: 'Marcus T.',
      eventType: 'Bachelor Party',
      rating: 5,
      text: 'Absolute legends. The Sovereign party bus was insane — lights, sound, the whole vibe. Our group of 25 had the best night ever on the Strip.',
      isFeatured: true,
      isActive: true,
    },
    {
      name: 'Jessica L.',
      eventType: 'Bachelorette Party',
      rating: 5,
      text: "We felt like actual royalty. The driver was amazing, the bus was spotless, and they even had champagne ready. 10/10 would book again!",
      isFeatured: true,
      isActive: true,
    },
    {
      name: 'David & Sarah K.',
      eventType: 'Wedding',
      rating: 5,
      text: 'American Royalty handled all our wedding transportation flawlessly. The limos were beautiful and the drivers were incredibly professional.',
      isFeatured: true,
      isActive: true,
    },
    {
      name: 'Chris R.',
      eventType: 'Corporate Event',
      rating: 5,
      text: 'Booked the Royal Sprinter for a client dinner. Impressed everyone. Professional, on time, and the vehicle was immaculate.',
      isFeatured: false,
      isActive: true,
    },
    {
      name: 'Amanda P.',
      eventType: 'Birthday Celebration',
      rating: 5,
      text: 'My 30th birthday was EPIC thanks to American Royalty. The party bus was basically a club on wheels. Best birthday ever!',
      isFeatured: true,
      isActive: true,
    },
    {
      name: 'Tyler M.',
      eventType: 'Nightlife & Club Crawl',
      rating: 5,
      text: 'Skip the taxis and Ubers. This is the only way to do Vegas nightlife. Our driver knew all the best spots and got us VIP everywhere.',
      isFeatured: false,
      isActive: true,
    },
  ]

  // Delete existing and recreate to avoid duplicates
  await prisma.testimonial.deleteMany()
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t })
  }
  console.log(`  ✓ ${testimonials.length} testimonials seeded`)

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
