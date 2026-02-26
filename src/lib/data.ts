import { MOCK_VEHICLES, MOCK_SERVICES, MOCK_TESTIMONIALS } from './constants'
import type { Vehicle, Service, Testimonial } from '@/types'

const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function getSupabaseClient() {
  if (!isSupabaseConfigured) return null
  const { createClient } = await import('./supabase/server')
  return createClient()
}

export async function getVehicles(): Promise<Vehicle[]> {
  const supabase = await getSupabaseClient()
  if (!supabase) return MOCK_VEHICLES

  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (error || !data?.length) return MOCK_VEHICLES
  return data
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const supabase = await getSupabaseClient()
  if (!supabase) return MOCK_VEHICLES.find(v => v.slug === slug) || null

  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) return MOCK_VEHICLES.find(v => v.slug === slug) || null
  return data
}

export async function getServices(): Promise<Service[]> {
  const supabase = await getSupabaseClient()
  if (!supabase) return MOCK_SERVICES

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (error || !data?.length) return MOCK_SERVICES
  return data
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const supabase = await getSupabaseClient()
  if (!supabase) return MOCK_SERVICES.find(s => s.slug === slug) || null

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) return MOCK_SERVICES.find(s => s.slug === slug) || null
  return data
}

export async function getTestimonials(featured?: boolean): Promise<Testimonial[]> {
  const supabase = await getSupabaseClient()
  if (!supabase) {
    if (featured) return MOCK_TESTIMONIALS.filter(t => t.is_featured)
    return MOCK_TESTIMONIALS
  }

  let query = supabase
    .from('testimonials')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (featured) query = query.eq('is_featured', true)

  const { data, error } = await query

  if (error || !data?.length) {
    if (featured) return MOCK_TESTIMONIALS.filter(t => t.is_featured)
    return MOCK_TESTIMONIALS
  }
  return data
}
