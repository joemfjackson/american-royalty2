'use server'

import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import type { Quote, QuoteLineItem, Booking, Testimonial, Vehicle, Invoice, AdditionalCharge, PackageBooking } from '@/types'
import type {
  Quote as PrismaQuote,
  Booking as PrismaBooking,
  Vehicle as PrismaVehicle,
  Invoice as PrismaInvoice,
  QuoteLineItem as PrismaQuoteLineItem,
  AdditionalCharge as PrismaAdditionalCharge,
} from '@prisma/client'
import { Resend } from 'resend'
import { buildInvoiceEmailHtml } from '@/lib/emails/invoice-email'
import { buildQuoteEmailHtml } from '@/lib/emails/quote-email'
import { buildBookingConfirmationEmailHtml } from '@/lib/emails/booking-confirmation-email'
import { buildAdditionalChargeEmailHtml } from '@/lib/emails/additional-charge-email'
import { getStripe } from '@/lib/stripe'
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

function mapQuote(q: PrismaQuote & { preferredVehicle?: PrismaVehicle | null; lineItems?: PrismaQuoteLineItem[] }): Quote {
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
    deposit_percent: q.depositPercent,
    quote_token: q.quoteToken,
    quote_sent_at: q.quoteSentAt?.toISOString() || null,
    hourly_rate: q.hourlyRate ? Number(q.hourlyRate) : null,
    base_fare: q.baseFare ? Number(q.baseFare) : null,
    fuel_surcharge: q.fuelSurcharge ? Number(q.fuelSurcharge) : null,
    gratuity_percent: q.gratuityPercent ?? null,
    driver_gratuity: q.driverGratuity ? Number(q.driverGratuity) : null,
    tax_amount: q.taxAmount ? Number(q.taxAmount) : null,
    custom_items: (q.customItems as { description: string; amount: number }[] | null) ?? null,
    created_at: q.createdAt.toISOString(),
    updated_at: q.updatedAt.toISOString(),
    line_items: q.lineItems?.map(mapQuoteLineItem),
  }
}

function mapQuoteLineItem(li: PrismaQuoteLineItem): QuoteLineItem {
  return {
    id: li.id,
    quote_id: li.quoteId,
    description: li.description,
    quantity: li.quantity,
    unit_price: Number(li.unitPrice),
    sort_order: li.sortOrder,
    is_preset: li.isPreset,
    preset_key: li.presetKey,
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
    stripe_customer_id: b.stripeCustomerId,
    stripe_payment_method: b.stripePaymentMethod,
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

export async function markDepositPaidOffPlatform(quoteId: string, paymentMethod: string): Promise<Booking> {
  await requireAdmin()

  const quote = await prisma.quote.findUnique({ where: { id: quoteId } })
  if (!quote) throw new Error('Quote not found')
  if (!quote.quotedAmount) throw new Error('Quote has no quoted amount')

  const depositAmount = Math.round(Number(quote.quotedAmount) * quote.depositPercent / 100)

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
      notes: `${quote.adminNotes ? quote.adminNotes + '\n' : ''}Deposit paid via ${paymentMethod}`,
    },
  })

  await prisma.quote.update({
    where: { id: quoteId },
    data: { status: 'BOOKED' },
  })

  await sendBookingConfirmationEmail(quote, depositAmount)

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

async function sendBookingConfirmationEmail(quote: PrismaQuote, depositAmount: number) {
  if (!process.env.RESEND_API_KEY) return
  try {
    const vehicle = quote.preferredVehicleId
      ? await prisma.vehicle.findUnique({ where: { id: quote.preferredVehicleId }, select: { name: true } })
      : null
    const totalAmount = Number(quote.quotedAmount || 0)
    const depositAmt = Number(depositAmount)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://americanroyaltylasvegas.com'
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'American Royalty <noreply@americanroyaltylasvegas.com>',
      to: [quote.email],
      subject: `Booking Confirmed — ${quote.eventType}, ${new Date(quote.eventDate + 'T00:00:00').toLocaleDateString('en-US')}`,
      html: buildBookingConfirmationEmailHtml({
        clientName: quote.name.split(' ')[0],
        eventType: quote.eventType,
        eventDate: quote.eventDate,
        pickupTime: quote.pickupTime,
        durationHours: quote.durationHours,
        vehicleName: vehicle?.name || null,
        guestCount: quote.guestCount,
        pickupLocation: quote.pickupLocation,
        dropoffLocation: quote.dropoffLocation,
        totalAmount,
        depositAmount: depositAmt,
        balanceDue: totalAmount - depositAmt,
        siteUrl,
      }),
    })
  } catch (emailError) {
    console.error('Booking confirmation email failed:', emailError)
  }
}

// ─── Delete Quote / Booking ─────────────────────────────

export async function deleteQuote(quoteId: string) {
  await requireAdmin()

  // Delete related invoices, line items, and bookings first (cascade may handle some)
  await prisma.invoice.deleteMany({ where: { quoteId } })
  await prisma.quoteLineItem.deleteMany({ where: { quoteId } })
  await prisma.booking.deleteMany({ where: { quoteId } })
  await prisma.quote.delete({ where: { id: quoteId } })

  revalidatePath('/admin/quotes')
  revalidatePath('/admin/bookings')
  revalidatePath('/admin')
}

export async function deleteBooking(bookingId: string) {
  await requireAdmin()

  await prisma.additionalCharge.deleteMany({ where: { bookingId } })
  await prisma.booking.delete({ where: { id: bookingId } })

  revalidatePath('/admin/bookings')
  revalidatePath('/admin/calendar')
  revalidatePath('/admin')
}

// ─── Invoices ───────────────────────────────────────────

export async function createAndSendInvoice(
  quoteId: string,
  depositPercent: number = 20
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
        subject: `Your Invoice from American Royalty — ${quote.eventType} on ${new Date(quote.eventDate + 'T00:00:00').toLocaleDateString('en-US')}`,
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

  // Send booking confirmation email
  const quote = await prisma.quote.findUnique({ where: { id: invoice.quoteId } })
  if (quote) {
    await sendBookingConfirmationEmail(quote, Number(invoice.depositAmount))
  }

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

// ─── Quote Builder ──────────────────────────────────────

export async function getQuoteWithLineItems(quoteId: string): Promise<{ quote: Quote; line_items: QuoteLineItem[] }> {
  await requireAdmin()

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      preferredVehicle: true,
      lineItems: { orderBy: { sortOrder: 'asc' } },
    },
  })
  if (!quote) throw new Error('Quote not found')

  return {
    quote: mapQuote(quote),
    line_items: quote.lineItems.map(mapQuoteLineItem),
  }
}

export async function getVehicleForQuote(vehicleId: string): Promise<Vehicle | null> {
  await requireAdmin()

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } })
  return vehicle ? mapVehicle(vehicle) : null
}

export interface QuotePricingData {
  hourlyRate: number
  durationHours: number
  baseFare: number
  fuelSurcharge: number
  gratuityPercent: number
  driverGratuity: number
  taxAmount: number
  customItems: { description: string; amount: number }[]
  total: number
  depositPercent: number
}

export async function saveQuotePricing(
  quoteId: string,
  pricing: QuotePricingData
): Promise<Quote> {
  await requireAdmin()

  await prisma.quote.update({
    where: { id: quoteId },
    data: {
      hourlyRate: pricing.hourlyRate,
      durationHours: pricing.durationHours,
      baseFare: pricing.baseFare,
      fuelSurcharge: pricing.fuelSurcharge,
      gratuityPercent: pricing.gratuityPercent,
      driverGratuity: pricing.driverGratuity,
      taxAmount: pricing.taxAmount,
      customItems: pricing.customItems,
      quotedAmount: pricing.total,
      depositPercent: pricing.depositPercent,
    },
  })

  const updated = await prisma.quote.findUnique({ where: { id: quoteId } })

  revalidatePath('/admin/quotes')
  revalidatePath('/admin')
  return mapQuote(updated!)
}

export async function buildAndSendQuote(
  quoteId: string,
  pricing: QuotePricingData,
  adminNotes?: string | null
): Promise<Quote> {
  await requireAdmin()

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { preferredVehicle: { select: { name: true } } },
  })
  if (!quote) throw new Error('Quote not found')

  const quoteToken = quote.quoteToken || require('crypto').randomUUID()

  await prisma.quote.update({
    where: { id: quoteId },
    data: {
      hourlyRate: pricing.hourlyRate,
      durationHours: pricing.durationHours,
      baseFare: pricing.baseFare,
      fuelSurcharge: pricing.fuelSurcharge,
      gratuityPercent: pricing.gratuityPercent,
      driverGratuity: pricing.driverGratuity,
      taxAmount: pricing.taxAmount,
      customItems: pricing.customItems,
      quotedAmount: pricing.total,
      depositPercent: pricing.depositPercent,
      status: 'QUOTED',
      quoteToken,
      quoteSentAt: new Date(),
      adminNotes: adminNotes ?? quote.adminNotes,
    },
  })

  // Send email
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://americanroyaltylasvegas.com'
  const quoteUrl = `${siteUrl}/quote/view/${quoteToken}`
  const depositAmount = Math.round(pricing.total * pricing.depositPercent / 100)

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'American Royalty <noreply@americanroyaltylasvegas.com>',
        to: [quote.email],
        subject: `Your American Royalty Quote — ${quote.eventType}, ${new Date(quote.eventDate + 'T00:00:00').toLocaleDateString('en-US')}`,
        html: buildQuoteEmailHtml({
          clientName: quote.name.split(' ')[0],
          eventType: quote.eventType,
          eventDate: quote.eventDate,
          pickupTime: quote.pickupTime,
          durationHours: pricing.durationHours,
          hourlyRate: pricing.hourlyRate,
          baseFare: pricing.baseFare,
          fuelSurcharge: pricing.fuelSurcharge,
          customItems: pricing.customItems,
          taxAmount: pricing.taxAmount,
          driverGratuity: pricing.driverGratuity,
          gratuityPercent: pricing.gratuityPercent,
          total: pricing.total,
          depositPercent: pricing.depositPercent,
          depositAmount,
          quoteUrl,
          adminNotes: adminNotes || null,
        }),
      })
    } catch (emailError) {
      console.error('Quote email failed:', emailError)
    }
  }

  const updated = await prisma.quote.findUnique({ where: { id: quoteId } })

  revalidatePath('/admin/quotes')
  revalidatePath('/admin')
  return mapQuote(updated!)
}

export async function getQuotePublicLink(quoteId: string): Promise<string | null> {
  await requireAdmin()

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    select: { quoteToken: true },
  })

  if (!quote?.quoteToken) return null

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://americanroyaltylasvegas.com'
  return `${siteUrl}/quote/view/${quote.quoteToken}`
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

export async function createBooking(data: {
  clientName: string
  clientEmail?: string | null
  clientPhone?: string | null
  eventType: string
  bookingDate: string
  startTime: string
  endTime?: string | null
  durationHours?: number | null
  vehicleId?: string | null
  pickupLocation?: string | null
  dropoffLocation?: string | null
  guestCount?: number | null
  totalAmount?: number | null
  depositAmount?: number | null
  depositPaid?: boolean
  notes?: string | null
}): Promise<Booking> {
  await requireAdmin()

  const booking = await prisma.booking.create({
    data: {
      quoteId: null,
      clientName: data.clientName,
      clientEmail: data.clientEmail || null,
      clientPhone: data.clientPhone || null,
      eventType: data.eventType,
      vehicleId: data.vehicleId || null,
      bookingDate: data.bookingDate,
      startTime: data.startTime,
      endTime: data.endTime || null,
      durationHours: data.durationHours || null,
      pickupLocation: data.pickupLocation || null,
      dropoffLocation: data.dropoffLocation || null,
      guestCount: data.guestCount || null,
      totalAmount: data.totalAmount || null,
      depositAmount: data.depositAmount || null,
      depositPaid: data.depositPaid ?? false,
      status: 'CONFIRMED',
      notes: data.notes || null,
    },
  })

  revalidatePath('/admin/bookings')
  revalidatePath('/admin/calendar')
  revalidatePath('/admin')
  return mapBooking(booking)
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
  revalidatePath('/quote')
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
  revalidatePath('/quote')
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
  revalidatePath('/quote')
}

export async function deleteVehicle(id: string) {
  await requireAdmin()

  await prisma.vehicle.delete({ where: { id } })

  revalidatePath('/admin/fleet')
  revalidatePath('/fleet')
  revalidatePath('/quote')
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

// ─── Additional Charges (Card on File) ─────────────────

const CHARGE_STATUS_MAP: Record<string, AdditionalCharge['status']> = {
  PENDING: 'pending',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
}

function mapAdditionalCharge(c: PrismaAdditionalCharge): AdditionalCharge {
  return {
    id: c.id,
    booking_id: c.bookingId,
    amount: Number(c.amount),
    reason: c.reason,
    status: (CHARGE_STATUS_MAP[c.status] || 'pending') as AdditionalCharge['status'],
    stripe_payment_id: c.stripePaymentId,
    failure_message: c.failureMessage,
    charged_at: c.chargedAt?.toISOString() || null,
    created_at: c.createdAt.toISOString(),
  }
}

export async function getBookingCharges(bookingId: string): Promise<AdditionalCharge[]> {
  await requireAdmin()
  const charges = await prisma.additionalCharge.findMany({
    where: { bookingId },
    orderBy: { createdAt: 'desc' },
  })
  return charges.map(mapAdditionalCharge)
}

export async function chargeCardOnFile(
  bookingId: string,
  amount: number,
  reason: string
): Promise<AdditionalCharge> {
  await requireAdmin()

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking) throw new Error('Booking not found')
  if (!booking.stripeCustomerId || !booking.stripePaymentMethod) {
    throw new Error('No card on file for this booking')
  }

  const stripe = getStripe()
  if (!stripe) throw new Error('Stripe not configured')

  // Create charge record as PENDING
  const charge = await prisma.additionalCharge.create({
    data: {
      bookingId,
      amount,
      reason,
      status: 'PENDING',
    },
  })

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      customer: booking.stripeCustomerId,
      payment_method: booking.stripePaymentMethod,
      off_session: true,
      confirm: true,
      description: `Additional charge — ${reason}`,
      metadata: {
        bookingId,
        chargeId: charge.id,
        reason,
      },
    })

    const updated = await prisma.additionalCharge.update({
      where: { id: charge.id },
      data: {
        status: 'SUCCEEDED',
        stripePaymentId: paymentIntent.id,
        chargedAt: new Date(),
      },
    })

    // Send receipt email
    if (booking.clientEmail && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'American Royalty <noreply@americanroyaltylasvegas.com>',
          to: [booking.clientEmail],
          subject: `Additional Charge Receipt — $${amount.toFixed(2)}`,
          html: buildAdditionalChargeEmailHtml({
            clientName: booking.clientName.split(' ')[0],
            amount,
            reason,
            bookingDate: booking.bookingDate,
            eventType: booking.eventType,
          }),
        })
      } catch (emailErr) {
        console.error('Additional charge receipt email failed:', emailErr)
      }
    }

    revalidatePath('/admin/bookings')
    return mapAdditionalCharge(updated)
  } catch (err: unknown) {
    const failureMessage = err instanceof Error ? err.message : 'Unknown error'
    const failed = await prisma.additionalCharge.update({
      where: { id: charge.id },
      data: {
        status: 'FAILED',
        failureMessage,
      },
    })
    return mapAdditionalCharge(failed)
  }
}

// ─── Package Bookings ───────────────────────────────────

import type { PackageBooking as PrismaPackageBooking } from '@prisma/client'

function mapPackageBooking(b: PrismaPackageBooking): PackageBooking {
  return {
    id: b.id,
    package_slug: b.packageSlug,
    package_name: b.packageName,
    tier_label: b.tierLabel,
    price: Number(b.price),
    event_date: b.eventDate,
    event_time: b.eventTime,
    pickup_location: b.pickupLocation,
    client_name: b.clientName,
    client_email: b.clientEmail,
    client_phone: b.clientPhone,
    special_requests: b.specialRequests,
    stripe_payment_id: b.stripePaymentId,
    payment_status: b.paymentStatus,
    created_at: b.createdAt.toISOString(),
  }
}

export async function getPackageBookings(): Promise<PackageBooking[]> {
  await requireAdmin()
  const bookings = await prisma.packageBooking.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return bookings.map(mapPackageBooking)
}

export async function deletePackageBooking(id: string) {
  await requireAdmin()
  await prisma.packageBooking.delete({ where: { id } })
  revalidatePath('/admin/packages')
}
