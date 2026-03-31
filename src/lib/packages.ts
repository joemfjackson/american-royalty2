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
    tagline: 'Arrive at the Sphere in style',
    duration: '3 hours',
    durationHours: 3,
    description:
      "Make your Sphere experience unforgettable from the moment you leave your hotel. Skip the rideshare chaos and arrive like a VIP in a luxury party bus. We handle pickup from your hotel, a liquor store stop so your group can pregame on the ride over, and drop-off right at the Sphere entrance. After the show, your chauffeur is waiting to pick you up — no surge pricing, no waiting in line for a ride. Cruise the Strip on the way back and keep the party going.",
    includes: [
      'Hotel pickup and return',
      'Liquor store stop before the show',
      'VIP drop-off at the Sphere entrance',
      'Post-show pickup — no waiting for rideshare',
      'Las Vegas Strip cruise on return',
      'Professional chauffeur',
      'Premium sound system & LED party lighting',
      'Ice water and cups provided',
    ],
    itinerary: [
      { time: 'Start', label: 'Pickup at your hotel or location' },
      { time: '15 min', label: 'Liquor store stop — stock up for the ride' },
      { time: '30 min', label: 'Party bus cruise to the Sphere' },
      { time: '45 min', label: 'VIP drop-off at the Sphere entrance' },
      { time: 'Show', label: 'Enjoy the show — your chauffeur waits nearby' },
      { time: 'After show', label: 'Post-show pickup at the Sphere' },
      { time: '3 hrs', label: 'Strip cruise back and drop-off at your destination' },
    ],
    pricing: [
      { tier: '1-12 guests', price: 675 },
      { tier: '13-20 guests', price: 825 },
      { tier: '21-30 guests', price: 975 },
      { tier: '31-40 guests', price: 1125 },
    ],
    faqs: [
      {
        q: 'Does the chauffeur wait during the show?',
        a: 'Yes — your chauffeur stays in the area while you enjoy the show and picks you up right at the Sphere entrance when it ends. No need to worry about finding a ride after.',
      },
      {
        q: 'How early should we book before a Sphere show?',
        a: 'We recommend booking at least 1-2 weeks in advance, especially for weekend shows. Sphere events are popular and our vehicles fill up fast on show nights.',
      },
      {
        q: 'Can we make stops on the way to or from the Sphere?',
        a: 'Absolutely. Most groups do a liquor store stop on the way there. On the way back, we can cruise the Strip, stop for photos, or take you directly to dinner, a club, or your hotel.',
      },
      {
        q: 'What time should we get picked up?',
        a: "We recommend scheduling pickup about 1 hour before your show starts. This gives your group time for the liquor store stop and a relaxed cruise to the venue without rushing.",
      },
      {
        q: 'Is this better than just taking an Uber to the Sphere?',
        a: "Night and day. No surge pricing after the show, no waiting in a crowd for a rideshare, and your whole group rides together. Plus you get the pregame cruise, the sound system, and the VIP arrival experience. It's the difference between transportation and an experience.",
      },
    ],
    image: '/images/services/nightlife.webp',
    keywords:
      'sphere las vegas transportation, sphere party bus, sphere show transportation, vegas sphere limo, sphere vip transportation las vegas',
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
