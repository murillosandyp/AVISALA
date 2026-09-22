import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import {
  DoorOpen,
  BookOpen,
  TrendingUp,
  Users,
  AlertTriangle,
  ArrowRight,
  Star,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [
    totalRooms,
    availableRooms,
    totalBookings,
    pendingBookings,
    checkedInBookings,
    allBookings,
    recentBookings,
    recentReviews,
  ] = await Promise.all([
    prisma.room.count(),
    prisma.room.count({ where: { status: 'AVAILABLE' } }),
    prisma.reservation.count(),
    prisma.reservation.count({ where: { status: 'PENDING' } }),
    prisma.reservation.count({ where: { status: 'CHECKED_IN' } }),
    prisma.reservation.findMany(),
    prisma.reservation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { room: true },
    }),
    prisma.review.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const revenue = allBookings
    .filter((b) => b.paymentStatus === 'PAID')
    .reduce((s, b) => s + b.totalPrice, 0)

  const stats = [
    {
      label: 'Total Rooms',
      value: totalRooms,
      sub: `${availableRooms} available now`,
      icon: DoorOpen,
      color: 'text-emerald-600 bg-emerald-100',
      href: '/admin/rooms',
    },
    {
      label: 'Total Bookings',
      value: totalBookings,
      sub: `${pendingBookings} pending`,
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-100',
      href: '/admin/bookings',
    },
    {
      label: 'Revenue',
      value: `₱${revenue.toLocaleString()}`,
      sub: 'Collected',
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-100',
      href: '/admin/payment',
    },
    {
      label: 'Currently Checked In',
      value: checkedInBookings,
      sub: 'Guests on-site',
      icon: Users,
      color: 'text-amber-600 bg-amber-100',
      href: '/admin/bookings',
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-600 mt-1">
          Welcome to Mi Casa De Cagsawa Admin Panel.
        </p>
      </div>

      {/* Low stock / attention alert (WCAG-compliant: text + icon) */}
      {pendingBookings > 0 && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3"
        >
          <AlertTriangle
            className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold text-amber-900">
              {pendingBookings} pending booking{pendingBookings !== 1 ? 's' : ''}{' '}
              need attention
            </p>
            <Link
              href="/admin/bookings"
              className="text-sm text-amber-800 underline hover:text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
            >
              Review pending bookings →
            </Link>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Link
              key={s.label}
              href={s.href}
              className="bg-white rounded-lg border border-slate-200 p-5 hover:border-emerald-400 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <div
                className={`inline-flex p-2 rounded-md ${s.color} mb-3`}
                aria-hidden="true"
              >
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">
                {s.label}
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {s.value}
              </p>
              <p className="text-xs text-slate-500 mt-1">{s.sub}</p>
            </Link>
          )
        })}
      </div>

      {/* Two-column: recent bookings + reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Recent Bookings</h2>
            <Link
              href="/admin/bookings"
              className="text-sm text-emerald-700 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ul className="space-y-3">
            {recentBookings.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between pb-3 border-b border-slate-100 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {b.guestFullName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Room {b.room.roomNumber} • {b.guestCount} guests
                  </p>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {b.status}
                </Badge>
              </li>
            ))}
            {recentBookings.length === 0 && (
              <li className="text-sm text-slate-500">No bookings yet.</li>
            )}
          </ul>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Latest Reviews</h2>
            <Link
              href="/admin/reviews"
              className="text-sm text-emerald-700 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ul className="space-y-3">
            {recentReviews.map((r) => (
              <li
                key={r.id}
                className="pb-3 border-b border-slate-100 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-900">
                    {r.guestName}
                  </span>
                  <div
                    className="flex items-center gap-0.5"
                    aria-label={`${r.rating} out of 5 stars`}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`w-3 h-3 ${
                          n <= r.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-200 text-slate-200'
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {r.comment}
                </p>
              </li>
            ))}
            {recentReviews.length === 0 && (
              <li className="text-sm text-slate-500">No reviews yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}