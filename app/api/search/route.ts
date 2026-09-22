import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() || ''

  if (q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const [rooms, bookings] = await Promise.all([
    prisma.room.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
        ],
      },
      take: 5,
    }),
    prisma.reservation.findMany({
      where: {
        OR: [
          { guestFullName: { contains: q } },
          { bookingRef: { contains: q } },
          { guestEmail: { contains: q } },
        ],
      },
      include: { room: true },
      take: 5,
    }),
  ])

  const results = [
    ...rooms.map((r) => ({
      id: r.id,
      type: 'room' as const,
      label: r.name,
      sub: `Room ${r.roomNumber} · ₱${r.basePrice.toLocaleString()}/night`,
      href: `/admin/rooms`,
    })),
    ...bookings.map((b) => ({
      id: b.id,
      type: 'booking' as const,
      label: `${b.guestFullName} — ${b.bookingRef}`,
      sub: `Room ${b.room.roomNumber} · ${b.status}`,
      href: `/admin/bookings`,
    })),
  ]

  return NextResponse.json({ results })
}