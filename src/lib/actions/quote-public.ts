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
  line_items: {
    description: string
    quantity: number
    unit_price: number
    sort_order: number
  }[]
}

export async function getQuotePublic(token: string): Promise<PublicQuoteData | null> {
  const quote = await prisma.quote.findUnique({
    where: { quoteToken: token },
    include: {
      preferredVehicle: { select: { name: true } },
      lineItems: { orderBy: { sortOrder: 'asc' } },
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
    line_items: quote.lineItems.map((li) => ({
      description: li.description,
      quantity: li.quantity,
      unit_price: Number(li.unitPrice),
      sort_order: li.sortOrder,
    })),
  }
}
