import { prisma } from '@/lib/prisma'
import { BookingsTable } from './bookings-table'

export const dynamic = 'force-dynamic'

export default async function BookingsPage() {
  const [bookings, rooms] = await Promise.all([
    prisma.reservation.findMany({
      orderBy: { createdAt: 'desc' },
      include: { room: true },
    }),
    prisma.room.findMany({ orderBy: { roomNumber: 'asc' } }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#103713]">
          Bookings
        </h1>
        <p className="text-sm text-[#628B35] mt-1">
          View and manage all guest reservations.
        </p>
      </div>
      <BookingsTable bookings={bookings} rooms={rooms} />
    </div>
  )
}