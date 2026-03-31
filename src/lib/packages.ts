export interface PackageTier {
  tier: string
  price: number
}

export interface PackageFaq {
  q: string
  a: string
}

export interface PackageItinerary {
  time: string
  label: string
}

export interface PackageConfig {
  slug: string
  name: string
  tagline: string
  duration: string
  durationHours: number
  description: string
  includes: string[]
  itinerary: PackageItinerary[]
  pricing: PackageTier[]
  faqs: PackageFaq[]
  image: string
  keywords: string
  metaTitle?: string
  metaDescription?: string
  heroHeading?: string
  extraSections?: { heading: string; content: string }[]
}

export const PACKAGES: PackageConfig[] = [
  {
    slug: 'vegas-sign-photo-tour',
    name: 'Vegas Sign Photo Tour',
    tagline: 'The iconic Vegas photo every group needs',
    duration: '2 hours',
    durationHours: 2,
    metaTitle: 'VIP Las Vegas Sign Photo Tour & Limo Package | American Royalty',
    metaDescription: 'Skip the rideshare lines. Book a VIP Las Vegas Sign photo tour in a luxury limo or party bus. We handle the driving and parking so you get the perfect shot.',
    heroHeading: 'The Ultimate Las Vegas Sign Photo Tour',
    extraSections: [
      {
        heading: 'Arrive Like Royalty: The VIP Transportation Experience',
        content: "Forget fighting for parking or waiting for a rideshare in the desert heat. When you book a private Las Vegas Sign photo tour with American Royalty, your group travels in a luxury party bus or limousine with premium sound, LED lighting, and ice-cold drinks. Your professional chauffeur handles every detail — from navigating Strip traffic to securing parking at the sign — while you and your crew enjoy the ride. This isn't just a photo stop. It's the full VIP Vegas experience from pickup to drop-off.",
      },
      {
        heading: 'Why Book a Private Limo for the Welcome to Vegas Sign?',
        content: "The Welcome to Fabulous Las Vegas sign is one of the most photographed landmarks in the world — and one of the hardest to get to without your own transportation. The parking lot holds fewer than 20 cars and is constantly full, especially at night when the sign is lit up. Rideshare drivers can't always find the pullover spot, and walking from the nearest casino is over a mile in the Las Vegas heat. A private limo or party bus eliminates all of that. Your chauffeur knows exactly where to go, waits while your group takes photos, and drives you back via a Strip cruise so you see every landmark along the way.",
      },
    ],
    description:
      "Skip the rideshare lines and parking headaches. Book a VIP Las Vegas Sign photo tour in a luxury limo or party bus. Your professional chauffeur handles the driving and parking while your crew enjoys premium sound, LED lighting, and the full party bus experience. Stop at the liquor store to stock up, cruise to the world-famous Welcome to Las Vegas sign for the ultimate group photo op, then ride back via the Las Vegas Strip and soak in the neon-lit skyline.",
    includes: [
      'Liquor store stop',
      'Welcome to Las Vegas Sign photo stop (15-20 min)',
      'Las Vegas Strip cruise on return',
      'Professional chauffeur',
      'Premium sound system & LED party lighting',
      'Ice water and cups provided',
    ],
    itinerary: [
      { time: 'Start', label: 'Pickup at your hotel or location' },
      { time: '15 min', label: 'Liquor store stop — stock up for the ride' },
      { time: '30 min', label: 'Cruise to the Welcome to Las Vegas Sign' },
      { time: '45 min', label: 'Photo stop at the Vegas Sign (15-20 min)' },
      { time: '1 hr 15 min', label: 'Strip cruise back — Mandalay Bay to SLS' },
      { time: '2 hrs', label: 'Drop-off at your destination' },
    ],
    pricing: [
      { tier: '1-12 guests', price: 450 },
      { tier: '13-20 guests', price: 550 },
      { tier: '21-30 guests', price: 650 },
      { tier: '31-40 guests', price: 750 },
    ],
    faqs: [
      {
        q: 'How long is the Vegas Sign photo tour?',
        a: 'The full tour is 2 hours from pickup to drop-off. This includes a liquor store stop, 15-20 minutes at the Vegas Sign for photos, and a cruise back along the Las Vegas Strip.',
      },
      {
        q: 'Where does the liquor store stop happen?',
        a: 'We stop at a liquor store near your pickup location at the beginning of the tour so your group can grab drinks, mixers, and snacks for the ride. We provide ice water and cups on the bus.',
      },
      {
        q: 'Can we bring our own drinks on the bus?',
        a: 'Yes! You are welcome to bring your own beverages. We provide ice water, cups, and glassware. All passengers must be 21+ to consume alcohol.',
      },
      {
        q: 'What time of day is best for Vegas Sign photos?',
        a: 'Sunset and after dark are the most popular times — the sign lights up beautifully at night. Daytime works well too if you want clearer photos without crowds. We recommend booking for 30 minutes before sunset for the best of both.',
      },
      {
        q: "What's included in the price?",
        a: 'Everything — professional chauffeur, party bus with premium sound and LED lighting, ice water and cups, and all stops. The price shown is the total, taxes and fees included. Just bring your drinks and your crew.',
      },
      {
        q: 'How hard is it to park at the Las Vegas sign?',
        a: 'Parking at the Welcome to Fabulous Las Vegas sign is notoriously difficult, with a very small lot that is constantly full. Booking a private photo tour means your chauffeur navigates the traffic and secures a spot while your group relaxes in a climate-controlled limo or party bus.',
      },
      {
        q: 'Will the limo driver wait for us while we take pictures?',
        a: 'Yes. Your chauffeur remains with the vehicle in the designated parking area while your group takes as much time as needed in the photo line.',
      },
      {
        q: 'Can we drink in the limo on the way to the Vegas sign?',
        a: 'Absolutely. Our Las Vegas photo tour packages are BYOB-friendly. We provide the ice, coolers, and glassware so you can toast to your Vegas trip on the way down the Strip.',
      },
    ],
    image: 'https://byyjlt2ddbva9ljx.public.blob.vercel-storage.com/packages/vegas-sign-photo-tour/IMG_8627.JPG',
    keywords:
      'vegas sign photo tour, las vegas sign party bus, welcome to las vegas sign tour, vegas sign photo op party bus, welcome to fabulous las vegas sign limo, vip vegas sign transportation',
  },
  {
    slug: 'fremont-street-experience',
    name: 'Fremont Street Experience',
    tagline: 'Old Vegas vibes and downtown energy',
    image: '/images/packages/fremont-street-hero.webp',
    duration: '3 hours',
    durationHours: 3,
    description:
      "Experience the original Las Vegas. Start with a liquor store stop to get the party going, then cruise downtown to Fremont Street — the heart of old Vegas. Walk the Fremont Street Experience under the massive LED canopy, explore the bars and casinos of Fremont East, and soak in the live entertainment. When you're ready, hop back on the bus for a cruise back via the Las Vegas Strip.",
    includes: [
      'Liquor store stop',
      'Fremont Street Experience drop-off and pickup',
      'Time to explore downtown bars and casinos',
      'Las Vegas Strip cruise on return',
      'Professional chauffeur',
      'Premium sound system & LED party lighting',
      'Ice water and cups provided',
    ],
    itinerary: [
      { time: 'Start', label: 'Pickup at your hotel or location' },
      { time: '15 min', label: 'Liquor store stop — stock up for the ride' },
      { time: '30 min', label: 'Cruise to Fremont Street / Downtown' },
      { time: '45 min', label: 'Arrive at Fremont Street — explore, drink, experience' },
      { time: '2 hrs', label: 'Board the bus for return cruise' },
      { time: '2 hr 15 min', label: 'Strip cruise back — downtown to the Strip' },
      { time: '3 hrs', label: 'Drop-off at your destination' },
    ],
    pricing: [
      { tier: '1-12 guests', price: 675 },
      { tier: '13-20 guests', price: 825 },
      { tier: '21-30 guests', price: 975 },
      { tier: '31-40 guests', price: 1125 },
    ],
    faqs: [
      {
        q: 'What do we do on Fremont Street?',
        a: "Fremont Street is the original Las Vegas Strip — a pedestrian-friendly street covered by a massive LED canopy with live music, street performers, bars, and casinos. Your group is free to explore, grab drinks, gamble, or just take it all in.",
      },
      {
        q: 'How long do we spend on Fremont Street?',
        a: 'About 1 hour and 15 minutes on Fremont Street. Enough time to walk the Experience, grab a drink at one of the famous bars, and take photos under the canopy.',
      },
      {
        q: 'Is the liquor store stop before or after Fremont?',
        a: 'Before — we stop at a liquor store near your pickup location at the start of the tour so your group has drinks for the ride downtown.',
      },
      {
        q: 'Can we stop at specific bars downtown?',
        a: "Absolutely. Your chauffeur will drop you off at Fremont Street and pick you up when you're ready. You're free to hit any bars, casinos, or restaurants in the area during your time there.",
      },
      {
        q: 'Is this package available during the day?',
        a: 'Yes, but Fremont Street really comes alive after dark when the LED canopy lights up and the live entertainment starts. We recommend an evening booking for the full experience.',
      },
    ],
    keywords:
      'fremont street party bus, downtown las vegas tour, fremont street experience party bus, old vegas tour',
  },
  {
    slug: 'las-vegas-strip-cruise',
    name: 'Las Vegas Strip Cruise',
    tagline: 'See the Strip like a VIP',
    duration: '2 hours',
    durationHours: 2,
    description:
      'The quintessential Vegas experience. Start with a liquor store stop, then cruise the entire Las Vegas Strip from end to end in a luxury party bus. Pass the Bellagio Fountains, the High Roller, Caesars Palace, the Venetian, and every iconic casino in between. Your chauffeur keeps the party rolling with premium sound and LED lighting while you and your crew take in the neon skyline from the best seat in the house.',
    includes: [
      'Liquor store stop',
      'Full Las Vegas Strip cruise (Mandalay Bay to SLS and back)',
      'Photo stops available on request',
      'Professional chauffeur',
      'Premium sound system & LED party lighting',
      'Ice water and cups provided',
    ],
    itinerary: [
      { time: 'Start', label: 'Pickup at your hotel or location' },
      { time: '15 min', label: 'Liquor store stop — stock up for the ride' },
      { time: '30 min', label: 'Begin Strip cruise — southbound from SLS' },
      { time: '1 hr', label: 'Bellagio Fountains, Caesars, Venetian — photo ops available' },
      { time: '1 hr 30 min', label: 'Return cruise northbound' },
      { time: '2 hrs', label: 'Drop-off at your destination' },
    ],
    pricing: [
      { tier: '1-12 guests', price: 450 },
      { tier: '13-20 guests', price: 550 },
      { tier: '21-30 guests', price: 650 },
      { tier: '31-40 guests', price: 750 },
    ],
    faqs: [
      {
        q: 'What does the Strip Cruise route cover?',
        a: "We cruise the full Las Vegas Strip — from Mandalay Bay at the south end to SLS at the north end and back. You'll pass every major casino, hotel, and landmark on the Strip.",
      },
      {
        q: 'Can we make stops along the Strip?',
        a: 'Photo stops are available on request — just let your chauffeur know. Keep in mind that stops will use some of your 2-hour window, so most groups choose to cruise and enjoy from the bus.',
      },
      {
        q: "What's included on the bus?",
        a: 'Premium sound system, LED party lighting, ice water, cups, and glassware. Bring your own drinks and we handle everything else. A professional chauffeur drives so your whole group can enjoy the ride.',
      },
      {
        q: 'Is this good for a first time in Vegas?',
        a: "Perfect for it. The Strip Cruise gives you a full overview of everything Las Vegas has to offer. It's the best way to see the entire Strip without walking miles in the heat.",
      },
      {
        q: 'Can we extend the cruise if we want more time?',
        a: "Yes — if you're having a great time and want to keep going, let your chauffeur know. Extensions are subject to availability and billed at the same hourly rate.",
      },
    ],
    image: '/images/services/strip-tour.webp',
    keywords:
      'las vegas strip tour party bus, vegas strip cruise, las vegas boulevard party bus tour, strip party bus ride',
  },
  {
    slug: 'sphere-transportation',
    name: 'Sphere Transportation',
    tagline: 'Arrive at the Sphere in style — no surge, no stress',
    heroHeading: 'Las Vegas Sphere Transportation — Party Bus To & From The Show',
    metaTitle: 'Sphere Las Vegas Transportation | Party Bus To The Sphere | American Royalty',
    metaDescription: 'Skip the Uber surge and parking chaos. Book a luxury party bus to the Sphere Las Vegas. Group pickup, liquor store stop, VIP drop-off, and guaranteed post-show ride back. Groups of 1-40.',
    duration: 'Approx. 4 hours',
    durationHours: 4,
    description:
      'The Sphere experience starts before you walk through the doors. Skip the $70 parking, the Uber surge after the show, and the chaos of 20,000 people all trying to leave at once. Your group gets a private luxury party bus from your hotel — with a liquor store stop on the way so you can pregame the ride over. We drop you at the Sphere entrance, then pick you up right after the show ends. No waiting, no surge pricing, no splitting a tiny Uber with your whole crew. Cap the night with a Strip cruise back to your hotel. Show tickets not included — transportation only.',
    includes: [
      'Private luxury party bus for your group',
      'Hotel or Strip pickup at your location',
      'Liquor store stop on the way to the show',
      'VIP drop-off at Sphere entrance (255 Sands Ave)',
      'Post-show pickup — driver returns when show ends',
      'Las Vegas Strip cruise on the return',
      'Drop-off at your hotel or destination',
      'Ice, cups, and water provided',
      'Professional licensed chauffeur',
      'Show tickets not included — bring your own',
    ],
    itinerary: [
      { time: 'Start', label: 'Private pickup at your hotel or Strip location' },
      { time: '~15 min', label: 'Liquor store stop — stock up and pregame on the ride' },
      { time: '~30 min', label: 'Party bus cruise to the Sphere' },
      { time: '~45 min', label: 'VIP drop-off at Sphere entrance — 255 Sands Ave' },
      { time: 'Show time', label: 'Enjoy the show — driver departs and returns at show end' },
      { time: 'After show', label: 'Post-show pickup at designated meetup point' },
      { time: 'Return', label: 'Strip cruise back — drop-off at your hotel or destination' },
    ],
    pricing: [
      { tier: '1-12 guests', price: 800 },
      { tier: '13-20 guests', price: 1000 },
      { tier: '21-30 guests', price: 1200 },
      { tier: '31-40 guests', price: 1400 },
    ],
    faqs: [
      {
        q: 'What is the best way to get to the Sphere Las Vegas?',
        a: 'A private party bus is the best way to get to the Sphere as a group. Rideshare pickup and drop-off at the Sphere is located at the corner of Sands Avenue and Koval Lane, but after a sold-out show that area is extremely congested and surge pricing is common. A pre-booked private party bus means guaranteed pickup with no surge, no waiting, and your whole group rides together.',
      },
      {
        q: 'Where does my driver pick me up after the Sphere show?',
        a: 'Your chauffeur will coordinate your post-show pickup location with you before the show. Since drivers cannot wait on Sphere property during the event, your driver will return at show end and meet your group at a designated nearby pickup point. We will confirm the exact meetup location on the day of your booking.',
      },
      {
        q: 'Is there surge pricing after Sphere shows?',
        a: 'Yes — post-show Uber and Lyft surge pricing at the Sphere can be significant, especially after sold-out concerts. With a pre-booked party bus your price is locked in at the time of booking with no surprises.',
      },
      {
        q: 'How much does parking cost at the Sphere Las Vegas?',
        a: 'Sphere parking ranges from $45 to $75 and must be booked in advance through the Sphere website or Ticketmaster. Valet is available at the Sands Avenue entrance. For groups, a private party bus typically costs less per person than parking plus Uber combined.',
      },
      {
        q: 'Does the chauffeur wait during the show?',
        a: 'The Sphere does not allow vehicles to wait on property during events. Your driver will drop your group off, then return when the show ends to pick you up. We track show end times and coordinate timing so your group is not waiting long after the show.',
      },
      {
        q: 'How early should we book before a Sphere show?',
        a: 'We recommend booking at least 1-2 weeks in advance for weekend shows. Sphere residencies like the Backstreet Boys, Eagles, and Wizard of Oz draw large crowds and transportation fills up fast on show nights.',
      },
      {
        q: 'Can we make stops on the way to or from the Sphere?',
        a: 'Yes. Most groups do a liquor store stop on the way — that is built into every booking. On the return, we can cruise the Strip, stop for photos at the Welcome to Las Vegas sign, grab dinner, or take you to a club. Just let us know your plan.',
      },
      {
        q: 'What time should we get picked up for a Sphere show?',
        a: 'We recommend scheduling pickup about 60-75 minutes before your show start time. This allows time for the liquor store stop, the drive to the Sphere, and arrival before doors open. Sphere doors open 45 minutes before showtime and there is no late seating.',
      },
      {
        q: 'Is this better than just taking an Uber to the Sphere?',
        a: 'For groups, yes — significantly. A party bus means your whole group rides together, you get a pregame experience on the way, VIP drop-off, and a guaranteed post-show ride with no surge pricing. After a sold-out Sphere show, getting a rideshare for a large group can take 20-30 minutes with 2-3x surge pricing. Your party bus is waiting for you.',
      },
      {
        q: 'What Sphere shows is this package available for?',
        a: 'This package is available for any Sphere Las Vegas event including the Backstreet Boys Into the Millennium residency, Eagles at Sphere, ILLENIUM, Wizard of Oz, Kenny Chesney, No Doubt, and all future residencies. Book for any show date.',
      },
      {
        q: 'Are show tickets included?',
        a: 'No — this is transportation only. You purchase your own Sphere tickets separately through thesphere.com or Ticketmaster. We handle everything from your hotel to the Sphere and back.',
      },
    ],
    extraSections: [
      {
        heading: 'Why Not Just Take an Uber to the Sphere?',
        content: 'For a solo couple, an Uber works fine. For a group of 8, 12, or 20 people — it is a logistical nightmare. You are splitting into multiple cars, coordinating pickups, and hoping nobody gets left behind. After the show, you are competing with thousands of other concertgoers all trying to get a ride at the exact same moment. Post-show surge pricing at the Sphere regularly runs 2-3x normal rates. A private party bus costs less per person than parking plus Uber for most groups, and the ride itself becomes part of the experience — not a stressful afterthought.',
      },
      {
        heading: 'The Best Group Transportation to the Sphere Las Vegas',
        content: 'The Sphere is located at 255 Sands Avenue, just east of The Venetian Resort. Rideshare drop-off is at the corner of Sands Avenue and Koval Lane. Parking on-site runs $45-$75 and must be pre-booked. For groups, a private party bus is the most cost-effective and enjoyable way to arrive — your group travels together, the pregame happens on the way, and you have a guaranteed ride home the moment the show ends.',
      },
    ],
    image: '/images/packages/sphere-hero.jpg',
    keywords:
      'Sphere Las Vegas transportation, party bus to Sphere Las Vegas, how to get to Sphere Las Vegas, Sphere Las Vegas group transportation, Sphere Las Vegas limo service, ride to Sphere Las Vegas, Backstreet Boys Sphere transportation, Eagles Sphere Las Vegas party bus, Wizard of Oz Sphere Las Vegas transportation, no surge pricing Sphere Las Vegas, post-show pickup Sphere Las Vegas',
  },
  {
    slug: 'allegiant-stadium',
    name: 'Allegiant Stadium Transportation',
    tagline: 'Skip the surge — private pickup, drop-off, and return ride',
    heroHeading: 'Las Vegas Allegiant Stadium Transportation | Party Bus & Limo Service',
    metaTitle: 'Allegiant Stadium Transportation Las Vegas | Party Bus & Limo | American Royalty',
    metaDescription: 'Skip the $150 parking and post-game traffic. Book a private party bus or limo to Allegiant Stadium Las Vegas. Hotel pickup, VIP drop-off, and guaranteed post-event return ride. Raiders games, concerts, WrestleMania, BTS, and more.',
    duration: 'Approx. 4 hours',
    durationHours: 4,
    description:
      'Getting to Allegiant Stadium is easy. Getting out after 65,000 people try to leave at the same time is not. Skip the $60-$150 parking pass, the post-event traffic gridlock, and the Uber surge. Your private party bus or limo picks you up from your hotel, drops you at the stadium entrance on Diablo Drive and Procyon Street, and your driver returns when the event ends to bring you back. No surge pricing, no waiting in a rideshare crowd, no stress. Just show up, enjoy the event, and your ride is waiting.',
    includes: [
      'Private party bus or limo for your group',
      'Hotel or Strip pickup at your location',
      'Drop-off at Allegiant Stadium — Diablo Dr & Procyon St entrance',
      'Post-event pickup — driver returns when event ends',
      'Return trip to your hotel or destination',
      'Ice, cups, and water provided',
      'Professional licensed chauffeur',
      'Event tickets not included — bring your own',
    ],
    itinerary: [
      { time: 'Start', label: 'Private pickup at your hotel or Strip location' },
      { time: '~30 min', label: 'Drive to Allegiant Stadium' },
      { time: 'Arrival', label: 'Drop-off at Diablo Dr & Procyon St stadium entrance' },
      { time: 'Event', label: 'Enjoy the game or show — driver departs and returns at event end' },
      { time: 'Event ends', label: 'Post-event pickup at designated meetup point' },
      { time: 'Return', label: 'Direct return to your hotel or destination' },
    ],
    pricing: [
      { tier: '1-12 guests', price: 800 },
      { tier: '13-20 guests', price: 1000 },
      { tier: '21-30 guests', price: 1200 },
      { tier: '31-40 guests', price: 1400 },
    ],
    faqs: [
      {
        q: 'What is the best way to get to Allegiant Stadium in Las Vegas?',
        a: 'A private party bus or limo is the best option for groups. Official stadium parking runs $60-$150 per car and must be booked in advance through SpotHero. After the event, I-15 and surrounding streets gridlock immediately as 65,000 people leave at once. A pre-booked private vehicle means guaranteed post-event pickup with no surge pricing and no searching for a rideshare in a crowd.',
      },
      {
        q: 'Where does the driver drop off and pick up at Allegiant Stadium?',
        a: 'Our standard drop-off location is at Diablo Drive and Procyon Street at the stadium entrance. For post-event pickup, your chauffeur will coordinate a designated nearby meetup point with you before the event. We confirm the exact location on the day of your booking.',
      },
      {
        q: 'Does the driver wait during the event?',
        a: 'No — your driver drops your group off at the stadium, then returns when the event ends to pick you up. We track event end times and coordinate timing so your group is not waiting long after the game or show.',
      },
      {
        q: 'How much does Allegiant Stadium parking cost?',
        a: 'Official Allegiant Stadium parking ranges from $60 to $150 per car depending on the event and lot location. Lots must be booked in advance through SpotHero or ParkMobile and sell out quickly for major events. For a group of 12 in three cars, parking alone can cost $180-$450 before the event starts.',
      },
      {
        q: 'Is there surge pricing after Allegiant Stadium events?',
        a: 'Yes — post-event Uber and Lyft surge pricing is significant after sold-out Raiders games and major concerts. With 65,000 people leaving at once, wait times can be 20-40 minutes with 2-3x normal rates. A pre-booked party bus locks in your price with no surprises.',
      },
      {
        q: 'What events at Allegiant Stadium is this package available for?',
        a: 'This package is available for all Allegiant Stadium events including Las Vegas Raiders NFL games, WrestleMania, BTS, Morgan Wallen, Queens of the Stone Age, UNLV Rebels football, and all concerts and special events throughout the year. Book for any event date.',
      },
      {
        q: 'How early should we get picked up before an Allegiant Stadium event?',
        a: 'We recommend scheduling pickup 90 minutes before your event start time. This allows comfortable travel time from the Strip, drop-off at the stadium, and arrival before gates open. For Raiders games and major concerts, arriving early also means beating the worst inbound traffic.',
      },
      {
        q: 'Can we walk to Allegiant Stadium from the Strip?',
        a: 'Yes — the Hacienda Bridge from Mandalay Bay is the official pedestrian walkway to the stadium, about a 15-20 minute walk. It is closed to vehicles on event days. However for groups of 8 or more, a private party bus is more comfortable, eliminates the walk in Las Vegas heat, and guarantees a ride home.',
      },
      {
        q: 'Is Allegiant Stadium cashless?',
        a: 'Yes — Allegiant Stadium is a fully cashless venue. All concessions, merchandise, and parking accept credit cards and mobile payments only.',
      },
      {
        q: 'Are event tickets included in the transportation package?',
        a: 'No — this is transportation only. You purchase your own event tickets separately through Ticketmaster or allegiantstadium.com. We handle everything from your hotel to the stadium and back.',
      },
    ],
    extraSections: [
      {
        heading: 'Why Not Just Drive and Park at Allegiant Stadium?',
        content: 'Parking at Allegiant Stadium costs $60-$150 per car and sells out fast for major events like Raiders games, WrestleMania, and BTS. Even with a parking pass, post-event traffic on I-15 and surrounding streets can add 45-60 minutes to your exit. For groups, a private party bus typically costs the same or less per person than multiple parking passes combined — and you skip the traffic entirely. Your driver drops you off, returns when it ends, and handles everything while your group focuses on the experience.',
      },
      {
        heading: 'Group Transportation to Every Major Allegiant Stadium Event',
        content: 'Allegiant Stadium is the highest-grossing stadium in the United States, hosting the Las Vegas Raiders NFL season, WrestleMania, BTS (May 23-27, 2026), Morgan Wallen (May 1-2, 2026), Queens of the Stone Age, UNLV Rebels football, and dozens of major concerts and events throughout the year. Our party bus and limo service is available for every event. Book your transportation at the same time you book your tickets.',
      },
    ],
    image: '/images/packages/allegiant-stadium.jpg',
    keywords:
      'Allegiant Stadium transportation Las Vegas, party bus Allegiant Stadium, limo service Allegiant Stadium Las Vegas, Raiders game transportation Las Vegas, how to get to Allegiant Stadium, Allegiant Stadium parking alternative, BTS Allegiant Stadium transportation, WrestleMania Las Vegas transportation, Morgan Wallen Allegiant Stadium party bus, Las Vegas stadium limo service, group transportation Allegiant Stadium',
  },
]

export const PACKAGE_GENERAL_FAQS = [
  {
    q: "What's included with every package?",
    a: 'Every package includes a professional chauffeur, luxury party bus with premium sound system and LED lighting, ice water and cups, and a liquor store stop. All taxes and fees are included in the price.',
  },
  {
    q: 'Can I customize a package?',
    a: 'Yes! Our packages are starting points. If you want to add stops, extend the time, or combine elements from different packages, just let us know. Request a custom quote for modified packages.',
  },
  {
    q: 'What\'s the cancellation policy for packages?',
    a: 'Full refund if cancelled 72+ hours before your event. Cancellations within 72 hours are non-refundable. We understand plans change — contact us and we\'ll work with you to reschedule if possible.',
  },
  {
    q: 'Are gratuities included in the package price?',
    a: 'Gratuities are not included in the package price. Tips for your chauffeur are appreciated and can be given in cash at the end of your ride. The standard is 15-20%.',
  },
  {
    q: 'Can we bring food and drinks on the bus?',
    a: 'Absolutely. Bring your own drinks, snacks, and food. We provide ice water, cups, and glassware. We also make a liquor store stop at the beginning of every package so you can stock up.',
  },
  {
    q: 'How far in advance should I book?',
    a: 'We recommend booking at least 1-2 weeks in advance, especially for weekends and holidays. Last-minute bookings are sometimes available — contact us to check.',
  },
  {
    q: 'What happens if our group is larger than 40?',
    a: 'For groups larger than 40, we can arrange multiple vehicles. Contact us for a custom quote and we\'ll put together a package that fits your entire crew.',
  },
  {
    q: 'Can we extend our package time?',
    a: 'Yes — if you\'re having a great time, let your chauffeur know. Extensions are subject to availability and billed at the standard hourly rate for your vehicle.',
  },
]

export function getPackageBySlug(slug: string): PackageConfig | undefined {
  return PACKAGES.find((p) => p.slug === slug)
}
