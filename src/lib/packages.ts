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
  gallery?: string[]
  keywords: string
}

export const PACKAGES: PackageConfig[] = [
  {
    slug: 'vegas-sign-photo-tour',
    name: 'Vegas Sign Photo Tour',
    tagline: 'The iconic Vegas photo every group needs',
    duration: '2 hours',
    durationHours: 2,
    description:
      "Start the night right with a stop at the liquor store to stock up, then cruise to the world-famous Welcome to Las Vegas sign for the ultimate group photo op. Your professional chauffeur handles everything while your crew enjoys premium sound, LED lighting, and the full party bus experience. After the sign, cruise back via the Las Vegas Strip and soak in the neon-lit skyline.",
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
    ],
    image: '/images/packages/vegas-sign/IMG_8627.JPG',
    gallery: [
      '/images/packages/vegas-sign/IMG_8620.JPG',
      '/images/packages/vegas-sign/IMG_8621.JPG',
      '/images/packages/vegas-sign/IMG_8623.JPG',
      '/images/packages/vegas-sign/IMG_8624.JPG',
      '/images/packages/vegas-sign/IMG_8625.JPG',
      '/images/packages/vegas-sign/IMG_8626.JPG',
      '/images/packages/vegas-sign/IMG_8628.JPG',
      '/images/packages/vegas-sign/IMG_8629.JPG',
      '/images/packages/vegas-sign/IMG_8630.JPG',
      '/images/packages/vegas-sign/IMG_8631.JPG',
      '/images/packages/vegas-sign/IMG_8632.JPG',
      '/images/packages/vegas-sign/IMG_8633.JPG',
      '/images/packages/vegas-sign/IMG_8634.JPG',
      '/images/packages/vegas-sign/IMG_8635.JPG',
      '/images/packages/vegas-sign/IMG_8636.JPG',
      '/images/packages/vegas-sign/IMG_8637.JPG',
      '/images/packages/vegas-sign/IMG_8638.JPG',
      '/images/packages/vegas-sign/IMG_8639.JPG',
    ],
    keywords:
      'vegas sign photo tour, las vegas sign party bus, welcome to las vegas sign tour, vegas sign photo op party bus',
  },
  {
    slug: 'fremont-street-experience',
    name: 'Fremont Street Experience',
    tagline: 'Old Vegas vibes and downtown energy',
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
    image: '/images/services/nightlife.webp',
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
    slug: 'after-dark-strip-tour',
    name: 'After Dark Strip Tour',
    tagline: 'Vegas hits different at night',
    duration: '2 hours',
    durationHours: 2,
    description:
      "See Las Vegas the way it was meant to be seen — lit up after dark. This late-night tour starts with a liquor store stop, then takes your crew on a slow cruise down the Strip when the neon is at its brightest. The Bellagio Fountains, the High Roller glowing against the sky, the Mirage, the LINQ — everything looks completely different after midnight. Photo stops available so your group can capture the magic. This is the perfect add-on after dinner, a show, or a club.",
    includes: [
      'Liquor store stop',
      'Late-night Las Vegas Strip cruise',
      'Photo stops at iconic lit-up landmarks',
      'Professional chauffeur',
      'Premium sound system & LED party lighting',
      'Ice water and cups provided',
    ],
    itinerary: [
      { time: 'Start', label: 'Late night pickup at your hotel or location' },
      { time: '15 min', label: 'Liquor store stop — grab drinks for the ride' },
      { time: '30 min', label: 'Begin after-dark Strip cruise' },
      { time: '1 hr', label: 'Bellagio Fountains, High Roller, Venetian — photo stops available' },
      { time: '1 hr 30 min', label: 'Continue cruise — Fremont Street drive-by optional' },
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
        q: 'What time does the After Dark tour start?',
        a: 'This tour is designed for late night — most groups book between 9 PM and midnight. The later you go, the more dramatic the Strip looks.',
      },
      {
        q: 'Is this different from the regular Strip Cruise?',
        a: 'Same route, completely different vibe. The After Dark tour is specifically for nighttime when the Strip is fully lit up. The energy, the lights, and the atmosphere are on another level after dark.',
      },
      {
        q: 'What makes the Strip special at night?',
        a: "Every casino and hotel is lit up with millions of lights. The Bellagio Fountains run their choreographed water shows, the High Roller glows against the sky, and the streets are packed with energy. It's the Vegas you see in the movies.",
      },
      {
        q: 'Can we make stops for photos?',
        a: "Yes — just let your chauffeur know and they'll find safe spots for your group to hop out and grab photos. The Bellagio Fountains and the Welcome to Las Vegas sign are popular nighttime photo stops.",
      },
      {
        q: 'Is this a good option after dinner or a show?',
        a: "It's perfect for that. A lot of groups book the After Dark tour as a nightcap — a 2-hour cruise after dinner, a show, or when they're winding down from a club. It's a great way to end the night.",
      },
    ],
    image: '/images/services/nightlife.webp',
    keywords:
      'las vegas night tour party bus, after dark vegas strip tour, late night las vegas party bus, nighttime strip cruise',
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
