import { prisma } from '@/lib/db'

export interface PublicInvoiceData {
  id: string
  token: string
  status: string
  total_amount: number
  deposit_amount: number
  deposit_percent: number
  paid_at: string | null
  created_at: string
  quote: {
    name: string
    email: string
    phone: string
    event_type: string
    event_date: string
    pickup_time: string | null
    duration_hours: number | null
    guest_count: number | null
    pickup_location: string | null
    dropoff_location: string | null
    vehicle_name: string | null
  }
}

export async function getInvoicePublic(token: string): Promise<PublicInvoiceData | null> {
  const invoice = await prisma.invoice.findUnique({
    where: { token },
    include: {
      quote: {
        include: {
          preferredVehicle: { select: { name: true } },
        },
      },
    },
  })

  if (!invoice) return null

  // Mark as viewed on first visit
  if (!invoice.viewedAt && invoice.status === 'SENT') {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { viewedAt: new Date(), status: 'VIEWED' },
    })
  }

  return {
    id: invoice.id,
    token: invoice.token,
    status: invoice.status.toLowerCase(),
    total_amount: Number(invoice.totalAmount),
    deposit_amount: Number(invoice.depositAmount),
    deposit_percent: invoice.depositPercent,
    paid_at: invoice.paidAt?.toISOString() || null,
    created_at: invoice.createdAt.toISOString(),
    quote: {
      name: invoice.quote.name,
      email: invoice.quote.email,
      phone: invoice.quote.phone,
      event_type: invoice.quote.eventType,
      event_date: invoice.quote.eventDate,
      pickup_time: invoice.quote.pickupTime,
      duration_hours: invoice.quote.durationHours ? Number(invoice.quote.durationHours) : null,
      guest_count: invoice.quote.guestCount,
      pickup_location: invoice.quote.pickupLocation,
      dropoff_location: invoice.quote.dropoffLocation,
      vehicle_name: invoice.quote.preferredVehicle?.name || null,
    },
  }
}
