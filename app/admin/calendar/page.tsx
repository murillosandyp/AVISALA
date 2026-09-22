import { prisma } from '@/lib/prisma'
import { CalendarView } from './calendar-view'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const bookings = await prisma.reservation.findMany({
    where: {
      status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
    },
    include: { room: true },
    orderBy: { checkIn: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#103713]">
          Calendar
        </h1>
        <p className="text-sm text-[#628B35] mt-1">
          Monthly view of room availability and reservations.
        </p>
      </div>
      <CalendarView bookings={bookings} />
    </div>
  )
}