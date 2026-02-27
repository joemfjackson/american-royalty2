import { prisma } from './db'
import type { Vehicle, Service, Testimonial } from '@/types'
import type { Vehicle as PrismaVehicle, Service as PrismaService, Testimonial as PrismaTestimonial } from '@prisma/client'

// ─── Mapping helpers ────────────────────────────────────
// Prisma uses camelCase, but our frontend components use snake_case.
// These mappers convert so we don't have to touch 30+ component files.

const VEHICLE_TYPE_MAP: Record<string, Vehicle['type']> = {
  PARTY_BUS: 'Party Bus',
  SPRINTER_LIMO: 'Sprinter Limo',
  STRETCH_LIMO: 'Stretch Limo',
  SUV: 'SUV',
}

function mapVehicle(v: PrismaVehicle): Vehicle {
  return {
    id: v.id,
    name: v.name,
    slug: v.slug,
    type: VEHICLE_TYPE_MAP[v.type] || (v.type as Vehicle['type']),
    capacity: v.capacity,
    hourly_rate: Number(v.hourlyRate),
    min_hours: v.minHours,
    description: v.description,
    features: v.features,
    image_url: v.imageUrl,
    gallery_urls: v.galleryUrls,
    display_order: v.displayOrder,
    is_active: v.isActive,
    created_at: v.createdAt.toISOString(),
    updated_at: v.updatedAt.toISOString(),
  }
}

function mapService(s: PrismaService): Service {
  return {
    id: s.id,
    title: s.title,
    slug: s.slug,
    tagline: s.tagline,
    description: s.description,
    long_description: s.longDescription,
    icon: s.icon,
    keywords: s.keywords,
    image_url: s.imageUrl,
    display_order: s.displayOrder,
    is_active: s.isActive,
    created_at: s.createdAt.toISOString(),
  }
}

function mapTestimonial(t: PrismaTestimonial): Testimonial {
  return {
    id: t.id,
    name: t.name,
    event_type: t.eventType,
    rating: t.rating,
    text: t.text,
    is_featured: t.isFeatured,
    is_active: t.isActive,
    created_at: t.createdAt.toISOString(),
  }
}

// ─── Public data queries ────────────────────────────────

export async function getVehicles(): Promise<Vehicle[]> {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    })
    return vehicles.map(mapVehicle)
  } catch {
    console.warn('DB unavailable — returning empty vehicles')
    return []
  }
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  try {
    const vehicle = await prisma.vehicle.findFirst({
      where: { slug, isActive: true },
    })
    return vehicle ? mapVehicle(vehicle) : null
  } catch {
    console.warn('DB unavailable — vehicle lookup failed')
    return null
  }
}

export async function getServices(): Promise<Service[]> {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    })
    return services.map(mapService)
  } catch {
    console.warn('DB unavailable — returning empty services')
    return []
  }
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  try {
    const service = await prisma.service.findFirst({
      where: { slug, isActive: true },
    })
    return service ? mapService(service) : null
  } catch {
    console.warn('DB unavailable — service lookup failed')
    return null
  }
}

export async function getTestimonials(featured?: boolean): Promise<Testimonial[]> {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: {
        isActive: true,
        ...(featured ? { isFeatured: true } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
    return testimonials.map(mapTestimonial)
  } catch {
    console.warn('DB unavailable — returning empty testimonials')
    return []
  }
}
