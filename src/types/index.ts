export interface Vehicle {
  id: string
  name: string
  slug: string
  type: 'Party Bus' | 'Sprinter Limo' | 'Stretch Limo' | 'SUV'
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

export interface QuoteLineItem {
  id: string
  quote_id: string
  description: string
  quantity: number
  unit_price: number
  sort_order: number
  is_preset: boolean
  preset_key: string | null
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
  status: 'new' | 'contacted' | 'quoted' | 'invoiced' | 'booked' | 'completed' | 'cancelled'
  quoted_amount: number | null
  admin_notes: string | null
  deposit_percent: number
  quote_token: string | null
  quote_sent_at: string | null
  hourly_rate: number | null
  base_fare: number | null
  fuel_surcharge: number | null
  gratuity_percent: number | null
  driver_gratuity: number | null
  tax_amount: number | null
  custom_items: { description: string; amount: number }[] | null
  vehicle_entries: { vehicleId: string; vehicleName: string; rate: number; duration: number; subtotal: number; date?: string; pickupTime?: string }[] | null
  created_at: string
  updated_at: string
  vehicle?: Vehicle
  line_items?: QuoteLineItem[]
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
  stripe_customer_id: string | null
  stripe_payment_method: string | null
  created_at: string
  updated_at: string
  vehicle?: Vehicle
  additional_charges?: AdditionalCharge[]
}

export interface AdditionalCharge {
  id: string
  booking_id: string
  amount: number
  reason: string
  status: 'pending' | 'succeeded' | 'failed'
  stripe_payment_id: string | null
  failure_message: string | null
  charged_at: string | null
  created_at: string
}

export interface PackageBooking {
  id: string
  package_slug: string
  package_name: string
  tier_label: string
  price: number
  event_date: string
  event_time: string
  pickup_location: string
  dropoff_location: string | null
  client_name: string
  client_email: string
  client_phone: string
  special_requests: string | null
  stripe_payment_id: string | null
  payment_status: string
  created_at: string
}

export interface Invoice {
  id: string
  quote_id: string
  total_amount: number
  deposit_amount: number
  deposit_percent: number
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'cancelled'
  payment_method: 'stripe' | 'manual' | null
  stripe_session_id: string | null
  stripe_payment_id: string | null
  paid_at: string | null
  paid_by: string | null
  token: string
  sent_at: string | null
  viewed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
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
