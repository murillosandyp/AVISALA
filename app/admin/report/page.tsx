import { prisma } from '@/lib/prisma'
import { BarChart3, TrendingUp, Users, DoorOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ReportPage() {
  const [
    totalBookings,
    confirmedBookings,
    cancelledBookings,
    totalRooms,
    allBookings,
  ] = await Promise.all([
    prisma.reservation.count(),
    prisma.reservation.count({ where: { status: 'CONFIRMED' } }),
    prisma.reservation.count({ where: { status: 'CANCELLED' } }),
    prisma.room.count(),
    prisma.reservation.findMany(),
  ])

  const totalRevenue = allBookings
    .filter((b) => b.paymentStatus === 'PAID')
    .reduce((s, b) => s + b.totalPrice, 0)

  const totalGuests = allBookings.reduce((s, b) => s + b.guestCount, 0)

  const stats = [
    {
      label: 'Total Bookings',
      value: totalBookings,
      icon: BarChart3,
      color: 'text-[#103713] bg-[#E2DBD0]',
    },
    {
      label: 'Total Revenue',
      value: `₱${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-[#FFFDF5] bg-[#628B35]',
    },
    {
      label: 'Total Guests',
      value: totalGuests,
      icon: Users,
      color: 'text-[#103713] bg-[#E2DBD0]',
    },
    {
      label: 'Active Rooms',
      value: totalRooms,
      icon: DoorOpen,
      color: 'text-[#103713] bg-[#E2DBD0]',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#103713]">Report</h1>
        <p className="text-sm text-[#628B35] mt-1">
          Overview of business performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="bg-[#FFFDF5] rounded-lg border border-[#E2DBD0] p-5"
            >
              <div
                className={`inline-flex p-2 rounded-md ${s.color} mb-3`}
                aria-hidden="true"
              >
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xs text-[#103713]/60 uppercase tracking-wide">
                {s.label}
              </p>
              <p className="text-2xl font-bold text-[#103713] mt-1">
                {s.value}
              </p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#FFFDF5] rounded-lg border border-[#E2DBD0] p-6">
          <h2 className="font-serif text-lg font-bold text-[#103713] mb-4">
            Booking Status
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#103713]">Confirmed</span>
              <span className="font-bold text-[#628B35]">
                {confirmedBookings}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#103713]">Cancelled</span>
              <span className="font-bold text-red-600">
                {cancelledBookings}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#103713]">Other</span>
              <span className="font-bold text-[#103713]">
                {totalBookings - confirmedBookings - cancelledBookings}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#FFFDF5] rounded-lg border border-[#E2DBD0] p-6">
          <h2 className="font-serif text-lg font-bold text-[#103713] mb-4">
            Quick Facts
          </h2>
          <ul className="space-y-2 text-sm text-[#103713]">
            <li>• Property: Mi Casa De Cagsawa Transient House</li>
            <li>• Location: Daraga, Albay</li>
            <li>• {totalRooms} rooms total</li>
            <li>• Deposit: ₱1,000 per booking (GCash)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}