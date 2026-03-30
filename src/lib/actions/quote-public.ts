import { prisma } from '@/lib/db'

export interface PublicQuoteData {
  id: string
  token: string
  name: string
  event_type: string
  event_date: string
  pickup_time: string | null
  duration_hours: number | null
  guest_count: number | null
  pickup_location: string | null
  dropoff_location: string | null
  vehicle_name: string | null
  quoted_amount: number
  deposit_percent: number
  deposit_amount: number
  quote_sent_at: string | null
  is_booked: boolean
  is_paid: boolean
  is_full_payment: boolean
  // Structured pricing
  hourly_rate: number | null
  base_fare: number | null
  fuel_surcharge: number | null
  driver_gratuity: number | null
  gratuity_percent: number | null
  tax_amount: number | null
  custom_items: { description: string; amount: number }[] | null
}

export async function getQuotePublic(token: string): Promise<PublicQuoteData | null> {
  const quote = await prisma.quote.findUnique({
    where: { quoteToken: token },
    include: {
      preferredVehicle: { select: { name: true } },
      invoices: {
        where: { status: 'PAID' },
        take: 1,
      },
    },
  })

  if (!quote) return null

  // Don't show quotes that haven't been sent yet
  if (quote.status === 'NEW' || quote.status === 'CONTACTED') return null

  const totalAmount = Number(quote.quotedAmount || 0)
  const depositAmount = Math.round(totalAmount * quote.depositPercent / 100)
  const isBooked = quote.status === 'BOOKED' || quote.status === 'COMPLETED'
  const isPaid = quote.invoices.length > 0
  const isFullPayment = quote.depositPercent >= 100

  return {
    id: quote.id,
    token: quote.quoteToken!,
    name: quote.name,
    event_type: quote.eventType,
    event_date: quote.eventDate,
    pickup_time: quote.pickupTime,
    duration_hours: quote.durationHours,
    guest_count: quote.guestCount,
    pickup_location: quote.pickupLocation,
    dropoff_location: quote.dropoffLocation,
    vehicle_name: quote.preferredVehicle?.name || null,
    quoted_amount: totalAmount,
    deposit_percent: quote.depositPercent,
    deposit_amount: depositAmount,
    quote_sent_at: quote.quoteSentAt?.toISOString() || null,
    is_booked: isBooked,
    is_paid: isPaid,
    is_full_payment: isFullPayment,
    hourly_rate: quote.hourlyRate ? Number(quote.hourlyRate) : null,
    base_fare: quote.baseFare ? Number(quote.baseFare) : null,
    fuel_surcharge: quote.fuelSurcharge ? Number(quote.fuelSurcharge) : null,
    driver_gratuity: quote.driverGratuity ? Number(quote.driverGratuity) : null,
    gratuity_percent: quote.gratuityPercent ?? null,
    tax_amount: quote.taxAmount ? Number(quote.taxAmount) : null,
    custom_items: (quote.customItems as { description: string; amount: number }[] | null) ?? null,
  }
}
