export const BRAND = {
  name: 'American Royalty',
  tagline: 'Ride Like Royalty',
  phone: process.env.NEXT_PUBLIC_PHONE || '(702) 666-4037',
  email: process.env.NEXT_PUBLIC_EMAIL || 'admin@americanroyaltylasvegas.com',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://americanroyaltylasvegas.com',
  address: 'Las Vegas, NV',
} as const

export const SERVICE_AREAS = [
  'Las Vegas Strip',
  'Downtown Las Vegas',
  'Henderson',
  'Summerlin',
  'North Las Vegas',
  'Spring Valley',
  'Boulder City',
  'Harry Reid Airport',
] as const

export const EVENT_TYPES = [
  'Bachelor Party',
  'Bachelorette Party',
  'Wedding',
  'Nightlife & Club Crawl',
  'Corporate Event',
  'Birthday Celebration',
  'Prom & Homecoming',
  'Airport Transfer',
  'Las Vegas Strip Tour',
  'Other',
] as const

export const FAQ_ITEMS = [
  {
    question: 'How much does a party bus cost in Las Vegas?',
    answer: 'Our party bus rentals start at $125/hour for stretch limousines and go up to $350/hour for our flagship 40-passenger Empire party bus. Most bookings require a 2-4 hour minimum depending on the vehicle. Contact us for a custom quote based on your group size, date, and itinerary.',
  },
  {
    question: 'How far in advance should I book?',
    answer: 'We recommend booking at least 2-4 weeks in advance, especially for weekend dates and peak seasons (March-May, September-November, New Year\'s Eve, and major convention weeks). Popular vehicles book out quickly for bachelor/bachelorette parties and prom season.',
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'Cancellations made 72+ hours before your reservation receive a full refund of the deposit. Cancellations within 48-72 hours receive a 50% refund. Cancellations within 48 hours are non-refundable. We understand plans change — contact us and we\'ll work with you to reschedule when possible.',
  },
  {
    question: 'Can we bring our own alcohol on the party bus?',
    answer: 'Yes! You are welcome to bring your own beverages aboard any of our party buses and limousines. We provide ice, coolers, and glassware. All passengers must be 21+ to consume alcohol. Our drivers do not serve alcohol but ensure everyone has a safe and enjoyable time.',
  },
  {
    question: 'Do you offer VIP club entry or bottle service?',
    answer: 'While we don\'t directly provide club entry or bottle service, our team has relationships with many Las Vegas venues and can help coordinate VIP entry, skip-the-line access, and bottle service reservations at top clubs on the Strip.',
  },
  {
    question: 'What areas do you serve?',
    answer: 'We serve the entire Las Vegas valley including the Las Vegas Strip, Downtown/Fremont Street, Henderson, Summerlin, North Las Vegas, Spring Valley, Boulder City, and Harry Reid International Airport. Custom routes to Red Rock Canyon, Lake Las Vegas, and Hoover Dam are also available.',
  },
  {
    question: 'Is gratuity included?',
    answer: 'Gratuity is not included in our quoted rates. A 18-20% gratuity for your chauffeur is customary and greatly appreciated. Gratuity can be added to your final invoice or given directly to your driver.',
  },
  {
    question: 'What happens if our event runs longer than booked?',
    answer: 'No problem! If you\'re having a great time and want to extend, just let your driver know. Overtime is billed at the standard hourly rate in 30-minute increments, subject to vehicle availability. We\'ll do our best to accommodate extensions.',
  },
]
