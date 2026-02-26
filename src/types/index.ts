export interface Vehicle {
  id: string
  name: string
  slug: string
  type: 'Party Bus' | 'Sprinter Limo' | 'Stretch Limo'
  capacity: number
  hourly_rate: number
  min_hours: number
  description: string
  features: string[]
  image_url: string | null
  gallery_urls: string[]
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  title: string
  slug: string
  tagline: string
  description: string
  long_description: string
  icon: string
  keywords: string
  image_url: string | null
  display_order: number
  is_active: boolean
  created_at: string
}

export interface Quote {
  id: string
  name: string
  email: string
  phone: string
  event_type: string
  preferred_vehicle_id: string | null
  event_date: string
  pickup_time: string | null
  guest_count: number | null
  duration_hours: number | null
  pickup_location: string | null
  dropoff_location: string | null
  details: string | null
  status: 'new' | 'contacted' | 'quoted' | 'booked' | 'completed' | 'cancelled'
  quoted_amount: number | null
  admin_notes: string | null
  created_at: string
  updated_at: string
  vehicle?: Vehicle
}

export interface Booking {
  id: string
  quote_id: string | null
  client_name: string
  client_email: string | null
  client_phone: string | null
  event_type: string
  vehicle_id: string | null
  booking_date: string
  start_time: string
  end_time: string | null
  duration_hours: number | null
  pickup_location: string | null
  dropoff_location: string | null
  guest_count: number | null
  total_amount: number | null
  deposit_amount: number | null
  deposit_paid: boolean
  status: 'pending' | 'confirmed' | 'deposit_paid' | 'in_progress' | 'completed' | 'cancelled'
  notes: string | null
  created_at: string
  updated_at: string
  vehicle?: Vehicle
}

export interface Testimonial {
  id: string
  name: string
  event_type: string | null
  rating: number
  text: string
  is_featured: boolean
  is_active: boolean
  created_at: string
}
