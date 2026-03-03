'use server'

import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { Quote, Booking, Testimonial, Vehicle, Invoice } from '@/types'
import type {
  Quote as PrismaQuote,
  Booking as PrismaBooking,
  Vehicle as PrismaVehicle,
  Invoice as PrismaInvoice,
} from '@prisma/client'
import { Resend } from 'resend'
import { buildInvoiceEmailHtml } from '@/lib/emails/invoice-email'
import { BRAND } from '@/lib/constants'
import { formatCurrency, formatDate } from '@/lib/utils'

// ─── Auth guard ─────────────────────────────────────────

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
  return session
}

// ─── Mapping helpers ────────────────────────────────────

const VEHICLE_TYPE_MAP: Record<string, Vehicle['type']> = {
  PARTY_BUS: 'Party Bus',
  SPRINTER_LIMO: 'Sprinter Limo',
  STRETCH_LIMO: 'Stretch Limo',
  SUV: 'SUV',
}

const VEHICLE_TYPE_REVERSE: Record<string, string> = {
  'Party Bus': 'PARTY_BUS',
  'Sprinter Limo': 'SPRINTER_LIMO',
  'Stretch Limo': 'STRETCH_LIMO',
  'SUV': 'SUV',
}

const QUOTE_STATUS_MAP: Record<string, string> = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUOTED: 'quoted',
  INVOICED: 'invoiced',
  BOOKED: 'booked',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

const QUOTE_STATUS_REVERSE: Record<string, string> = {
  new: 'NEW',
  contacted: 'CONTACTED',
  quoted: 'QUOTED',
  invoiced: 'INVOICED',
  booked: 'BOOKED',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
}

const INVOICE_STATUS_MAP: Record<string, string> = {
  DRAFT: 'draft',
  SENT: 'sent',
  VIEWED: 'viewed',
  PAID: 'paid',
  CANCELLED: 'cancelled',
}

const BOOKING_STATUS_MAP: Record<string, string> = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  DEPOSIT_PAID: 'deposit_paid',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

const BOOKING_STATUS_REVERSE: Record<string, string> = {
  pending: 'PENDING',
  confirmed: 'CONFIRMED',
  deposit_paid: 'DEPOSIT_PAID',
  in_progress: 'IN_PROGRESS',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
}

function mapQuote(q: PrismaQuote & { preferredVehicle?: PrismaVehicle | null }): Quote {
  return {
    id: q.id,
    name: q.name,
    email: q.email,
    phone: q.phone,
    event_type: q.eventType,
    preferred_vehicle_id: q.preferredVehicleId,
    event_date: q.eventDate,
    pickup_time: q.pickupTime,
    guest_count: q.guestCount,
    duration_hours: q.durationHours,
    pickup_location: q.pickupLocation,
    dropoff_location: q.dropoffLocation,
    details: q.details,
    status: (QUOTE_STATUS_MAP[q.status] || 'new') as Quote['status'],
    quoted_amount: q.quotedAmount ? Number(q.quotedAmount) : null,
    admin_notes: q.adminNotes,
    created_at: q.createdAt.toISOString(),
    updated_at: q.updatedAt.toISOString(),
  }
}

function mapBooking(b: PrismaBooking): Booking {
  return {
    id: b.id,
    quote_id: b.quoteId,
    client_name: b.clientName,
    client_email: b.clientEmail,
    client_phone: b.clientPhone,
    event_type: b.eventType,
    vehicle_id: b.vehicleId,
    booking_date: b.bookingDate,
    start_time: b.startTime,
    end_time: b.endTime,
    duration_hours: b.durationHours,
    pickup_location: b.pickupLocation,
    dropoff_location: b.dropoffLocation,
    guest_count: b.guestCount,
    total_amount: b.totalAmount ? Number(b.totalAmount) : null,
    deposit_amount: b.depositAmount ? Number(b.depositAmount) : null,
    deposit_paid: b.depositPaid,
    status: (BOOKING_STATUS_MAP[b.status] || 'pending') as Booking['status'],
    notes: b.notes,
    created_at: b.createdAt.toISOString(),
    updated_at: b.updatedAt.toISOString(),
  }
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

function mapTestimonial(t: { id: string; name: string; eventType: string | null; rating: number; text: string; isFeatured: boolean; isActive: boolean; createdAt: Date }): Testimonial {
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

function mapInvoice(i: PrismaInvoice): Invoice {
  return {
    id: i.id,
    quote_id: i.quoteId,
    total_amount: Number(i.totalAmount),
    deposit_amount: Number(i.depositAmount),
    deposit_percent: i.depositPercent,
    status: (INVOICE_STATUS_MAP[i.status] || 'draft') as Invoice['status'],
    payment_method: i.paymentMethod?.toLowerCase() as Invoice['payment_method'] || null,
    stripe_session_id: i.stripeSessionId || null,
    stripe_payment_id: i.stripePaymentId || null,
    paid_at: i.paidAt?.toISOString() || null,
    paid_by: i.paidBy || null,
    token: i.token,
    sent_at: i.sentAt?.toISOString() || null,
    viewed_at: i.viewedAt?.toISOString() || null,
    notes: i.notes || null,
    created_at: i.createdAt.toISOString(),
    updated_at: i.updatedAt.toISOString(),
  }
}

// ─── Dashboard ──────────────────────────────────────────

export async function getDashboardStats() {
  await requireAdmin()

  const [
    newQuotes,
    contactedQuotes,
    quotedQuotes,
    bookedQuotes,
    upcomingBookings,
    revenueResult,
  ] = await Promise.all([
    prisma.quote.count({ where: { status: 'NEW' } }),
    prisma.quote.count({ where: { status: 'CONTACTED' } }),
    prisma.quote.count({ where: { status: 'QUOTED' } }),
    prisma.quote.count({ where: { status: 'BOOKED' } }),
    prisma.booking.count({
      where: {
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
      },
    }),
    prisma.booking.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ])

  return {
    newQuotes,
    pendingResponse: contactedQuotes,
    quoted: quotedQuotes,
    booked: bookedQuotes,
    upcomingBookings,
    monthlyRevenue: Number(revenueResult._sum.totalAmount || 0),
  }
}

export async function getRecentQuotes(): Promise<Quote[]> {
  await requireAdmin()
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  })
  return quotes.map(mapQuote)
}

export async function getUpcomingBookings(): Promise<Booking[]> {
  await requireAdmin()
  const bookings = await prisma.booking.findMany({
    where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
    orderBy: { bookingDate: 'asc' },
    take: 5,
  })
  return bookings.map(mapBooking)
}

// ─── Quotes ─────────────────────────────────────────────

export async function getQuotes(): Promise<Quote[]> {
  await requireAdmin()
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return quotes.map(mapQuote)
}

export async function updateQuote(
  id: string,
  data: { status?: string; admin_notes?: string | null; quoted_amount?: number | null }
) {
  await requireAdmin()

  const updateData: Record<string, unknown> = {}
  if (data.status !== undefined) {
    updateData.status = QUOTE_STATUS_REVERSE[data.status] || data.status
  }
  if (data.admin_notes !== undefined) {
    updateData.adminNotes = data.admin_notes
  }
  if (data.quoted_amount !== undefined) {
    updateData.quotedAmount = data.quoted_amount
  }

  const updated = await prisma.quote.update({
    where: { id },
    data: updateData,
  })

  revalidatePath('/admin/quotes')
  revalidatePath('/admin')
  return mapQuote(updated)
}

// ─── Convert Quote to Booking ───────────────────────────

export async function convertQuoteToBooking(quoteId: string): Promise<Booking> {
  await requireAdmin()

  const quote = await prisma.quote.findUnique({ where: { id: quoteId } })
  if (!quote) throw new Error('Quote not found')

  // Create booking from quote data
  const booking = await prisma.booking.create({
    data: {
      quoteId: quote.id,
      clientName: quote.name,
      clientEmail: quote.email,
      clientPhone: quote.phone,
      eventType: quote.eventType,
      vehicleId: quote.preferredVehicleId,
      bookingDate: quote.eventDate,
      startTime: quote.pickupTime || 'TBD',
      durationHours: quote.durationHours,
      pickupLocation: quote.pickupLocation,
      dropoffLocation: quote.dropoffLocation,
      guestCount: quote.guestCount,
      totalAmount: quote.quotedAmount,
      status: 'CONFIRMED',
      notes: quote.adminNotes,
    },
  })

  // Update quote status to booked
  await prisma.quote.update({
    where: { id: quoteId },
    data: { status: 'BOOKED' },
  })

  revalidatePath('/admin/quotes')
  revalidatePath('/admin/bookings')
  revalidatePath('/admin/calendar')
  revalidatePath('/admin')
  return mapBooking(booking)
}

// ─── Shared: Create Booking from Quote ──────────────────

async function createBookingFromQuote(quoteId: string, depositAmount: number): Promise<PrismaBooking> {
  const quote = await prisma.quote.findUnique({ where: { id: quoteId } })
  if (!quote) throw new Error('Quote not found')

  const booking = await prisma.booking.create({
    data: {
      quoteId: quote.id,
      clientName: quote.name,
      clientEmail: quote.email,
      clientPhone: quote.phone,
      eventType: quote.eventType,
      vehicleId: quote.preferredVehicleId,
      bookingDate: quote.eventDate,
      startTime: quote.pickupTime || 'TBD',
      durationHours: quote.durationHours,
      pickupLocation: quote.pickupLocation,
      dropoffLocation: quote.dropoffLocation,
      guestCount: quote.guestCount,
      totalAmount: quote.quotedAmount,
      depositAmount,
      depositPaid: true,
      status: 'DEPOSIT_PAID',
      notes: quote.adminNotes,
    },
  })

  await prisma.quote.update({
    where: { id: quoteId },
    data: { status: 'BOOKED' },
  })

  revalidatePath('/admin/quotes')
  revalidatePath('/admin/bookings')
  revalidatePath('/admin/calendar')
  revalidatePath('/admin')

  return booking
}

// ─── Invoices ───────────────────────────────────────────

export async function createAndSendInvoice(
  quoteId: string,
  depositPercent: number = 50
): Promise<Invoice> {
  await requireAdmin()

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { preferredVehicle: { select: { name: true } } },
  })
  if (!quote) throw new Error('Quote not found')
  if (!quote.quotedAmount) throw new Error('Quote has no amount set')

  const totalAmount = Number(quote.quotedAmount)
  const depositAmount = Math.round(totalAmount * depositPercent / 100)

  // Cancel any existing non-paid invoices for this quote
  await prisma.invoice.updateMany({
    where: { quoteId, status: { in: ['DRAFT', 'SENT', 'VIEWED'] } },
    data: { status: 'CANCELLED' },
  })

  const invoice = await prisma.invoice.create({
    data: {
      quoteId,
      totalAmount,
      depositAmount,
      depositPercent,
      status: 'SENT',
      sentAt: new Date(),
    },
  })

  // Update quote status
  await prisma.quote.update({
    where: { id: quoteId },
    data: { status: 'INVOICED' },
  })

  // Send email
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://americanroyaltylasvegas.com'
  const invoiceUrl = `${siteUrl}/invoice/${invoice.token}`

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'American Royalty <noreply@americanroyaltylasvegas.com>',
        to: [quote.email],
        subject: `Your Invoice from American Royalty — ${quote.eventType} on ${quote.eventDate}`,
        html: buildInvoiceEmailHtml({
          clientName: quote.name,
          eventType: quote.eventType,
          eventDate: quote.eventDate,
          vehicleName: quote.preferredVehicle?.name || null,
          totalAmount: formatCurrency(totalAmount),
          depositAmount: formatCurrency(depositAmount),
          depositPercent,
          invoiceUrl,
          brandPhone: BRAND.phone,
          brandEmail: BRAND.email,
        }),
      })
    } catch (emailError) {
      console.error('Invoice email failed:', emailError)
    }
  }

  revalidatePath('/admin/quotes')
  revalidatePath('/admin')
  return { ...mapInvoice(invoice), token: invoice.token }
}

export async function getInvoiceByQuoteId(quoteId: string): Promise<Invoice | null> {
  await requireAdmin()

  const invoice = await prisma.invoice.findFirst({
    where: { quoteId, status: { not: 'CANCELLED' } },
    orderBy: { createdAt: 'desc' },
  })

  return invoice ? mapInvoice(invoice) : null
}

export async function markInvoicePaidManually(invoiceId: string): Promise<Invoice> {
  const session = await requireAdmin()

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  })
  if (!invoice) throw new Error('Invoice not found')
  if (invoice.status === 'PAID') throw new Error('Invoice already paid')
  if (invoice.status === 'CANCELLED') throw new Error('Invoice is cancelled')

  const updated = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: 'PAID',
      paymentMethod: 'MANUAL',
      paidAt: new Date(),
      paidBy: session.user.id || session.user.email || 'admin',
    },
  })

  await createBookingFromQuote(invoice.quoteId, Number(invoice.depositAmount))

  revalidatePath('/admin/quotes')
  revalidatePath('/admin/bookings')
  revalidatePath('/admin')
  return mapInvoice(updated)
}

export async function cancelInvoice(invoiceId: string): Promise<Invoice> {
  await requireAdmin()

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
  if (!invoice) throw new Error('Invoice not found')
  if (invoice.status === 'PAID') throw new Error('Cannot cancel a paid invoice')

  const updated = await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: 'CANCELLED' },
  })

  // Revert quote to QUOTED so admin can re-issue
  await prisma.quote.update({
    where: { id: invoice.quoteId },
    data: { status: 'QUOTED' },
  })

  revalidatePath('/admin/quotes')
  revalidatePath('/admin')
  return mapInvoice(updated)
}

export async function getInvoiceLink(quoteId: string): Promise<string | null> {
  await requireAdmin()

  const invoice = await prisma.invoice.findFirst({
    where: { quoteId, status: { not: 'CANCELLED' } },
    orderBy: { createdAt: 'desc' },
    select: { token: true },
  })

  if (!invoice) return null

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://americanroyaltylasvegas.com'
  return `${siteUrl}/invoice/${invoice.token}`
}

// ─── Bookings ───────────────────────────────────────────

export async function getBookings(): Promise<Booking[]> {
  await requireAdmin()
  const bookings = await prisma.booking.findMany({
    orderBy: { bookingDate: 'asc' },
  })
  return bookings.map(mapBooking)
}

export async function updateBookingStatus(id: string, status: string) {
  await requireAdmin()

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: (BOOKING_STATUS_REVERSE[status] || status) as 'PENDING' | 'CONFIRMED' | 'DEPOSIT_PAID' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' },
  })

  revalidatePath('/admin/bookings')
  revalidatePath('/admin')
  return mapBooking(updated)
}

// ─── Fleet ──────────────────────────────────────────────

export async function getAdminVehicles(): Promise<Vehicle[]> {
  await requireAdmin()
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { displayOrder: 'asc' },
  })
  return vehicles.map(mapVehicle)
}

export async function createVehicle(data: {
  name: string
  slug: string
  type: string
  capacity: number
  hourly_rate: number
  min_hours: number
  description: string
  features: string[]
  is_active: boolean
  image_url?: string | null
  gallery_urls?: string[]
}): Promise<Vehicle> {
  await requireAdmin()

  const maxOrder = await prisma.vehicle.aggregate({ _max: { displayOrder: true } })

  const vehicle = await prisma.vehicle.create({
    data: {
      name: data.name,
      slug: data.slug,
      type: (VEHICLE_TYPE_REVERSE[data.type] || 'PARTY_BUS') as 'PARTY_BUS' | 'SPRINTER_LIMO' | 'STRETCH_LIMO' | 'SUV',
      capacity: data.capacity,
      hourlyRate: data.hourly_rate,
      minHours: data.min_hours,
      description: data.description,
      features: data.features,
      isActive: data.is_active,
      imageUrl: data.image_url || null,
      galleryUrls: data.gallery_urls || [],
      displayOrder: (maxOrder._max.displayOrder || 0) + 1,
    },
  })

  revalidatePath('/admin/fleet')
  revalidatePath('/fleet')
  return mapVehicle(vehicle)
}

export async function updateVehicle(
  id: string,
  data: {
    name: string
    slug: string
    type: string
    capacity: number
    hourly_rate: number
    min_hours: number
    description: string
    features: string[]
    is_active: boolean
    image_url?: string | null
    gallery_urls?: string[]
  }
): Promise<Vehicle> {
  await requireAdmin()

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      type: (VEHICLE_TYPE_REVERSE[data.type] || 'PARTY_BUS') as 'PARTY_BUS' | 'SPRINTER_LIMO' | 'STRETCH_LIMO' | 'SUV',
      capacity: data.capacity,
      hourlyRate: data.hourly_rate,
      minHours: data.min_hours,
      description: data.description,
      features: data.features,
      isActive: data.is_active,
      imageUrl: data.image_url || null,
      galleryUrls: data.gallery_urls || [],
    },
  })

  revalidatePath('/admin/fleet')
  revalidatePath('/fleet')
  return mapVehicle(vehicle)
}

export async function reorderVehicles(orderedIds: string[]) {
  await requireAdmin()

  await Promise.all(
    orderedIds.map((id, index) =>
      prisma.vehicle.update({
        where: { id },
        data: { displayOrder: index },
      })
    )
  )

  revalidatePath('/admin/fleet')
  revalidatePath('/fleet')
}

export async function deleteVehicle(id: string) {
  await requireAdmin()

  await prisma.vehicle.delete({ where: { id } })

  revalidatePath('/admin/fleet')
  revalidatePath('/fleet')
}

// ─── Testimonials ───────────────────────────────────────

export async function getAdminTestimonials(): Promise<Testimonial[]> {
  await requireAdmin()
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return testimonials.map(mapTestimonial)
}

export async function createTestimonial(data: {
  name: string
  event_type: string
  rating: number
  text: string
  is_featured: boolean
  is_active: boolean
}): Promise<Testimonial> {
  await requireAdmin()

  const testimonial = await prisma.testimonial.create({
    data: {
      name: data.name,
      eventType: data.event_type,
      rating: data.rating,
      text: data.text,
      isFeatured: data.is_featured,
      isActive: data.is_active,
    },
  })

  revalidatePath('/admin/testimonials')
  revalidatePath('/')
  return mapTestimonial(testimonial)
}

export async function updateTestimonial(
  id: string,
  data: {
    name?: string
    event_type?: string
    rating?: number
    text?: string
    is_featured?: boolean
    is_active?: boolean
  }
): Promise<Testimonial> {
  await requireAdmin()

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.event_type !== undefined) updateData.eventType = data.event_type
  if (data.rating !== undefined) updateData.rating = data.rating
  if (data.text !== undefined) updateData.text = data.text
  if (data.is_featured !== undefined) updateData.isFeatured = data.is_featured
  if (data.is_active !== undefined) updateData.isActive = data.is_active

  const testimonial = await prisma.testimonial.update({
    where: { id },
    data: updateData,
  })

  revalidatePath('/admin/testimonials')
  revalidatePath('/')
  return mapTestimonial(testimonial)
}

export async function deleteTestimonial(id: string) {
  await requireAdmin()

  await prisma.testimonial.delete({ where: { id } })

  revalidatePath('/admin/testimonials')
  revalidatePath('/')
}

// ─── Vehicle name helper ────────────────────────────────

export async function getVehicleNameById(vehicleId: string | null): Promise<string> {
  if (!vehicleId) return 'Not specified'
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { name: true },
  })
  return vehicle?.name || 'Unknown'
}

export async function getVehicleNames(): Promise<Record<string, string>> {
  const vehicles = await prisma.vehicle.findMany({
    select: { id: true, name: true },
  })
  const map: Record<string, string> = {}
  for (const v of vehicles) {
    map[v.id] = v.name
  }
  return map
}
