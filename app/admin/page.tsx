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
import { MapCard } from '@/components/admin/dashboard/map-card'
import { Gallery } from '@/components/admin/dashboard/gallery'
import { PromoCards } from '@/components/admin/dashboard/promo-cards'
import { CompactCalendar } from '@/components/admin/dashboard/compact-calendar'
import { FloatingActions } from '@/components/admin/dashboard/floating-actions'
import { ContactFooter } from '@/components/admin/dashboard/contact-footer'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [
    totalRooms,
    availableRooms,
    totalBookings,
    pendingBookings,
    checkedInBookings,
    allBookings,
    recentReviews,
    rooms,
    promos,
    calendarBookings,
  ] = await Promise.all([
    prisma.room.count(),
    prisma.room.count({ where: { status: 'AVAILABLE' } }),
    prisma.reservation.count(),
    prisma.reservation.count({ where: { status: 'PENDING' } }),
    prisma.reservation.count({ where: { status: 'CHECKED_IN' } }),
    prisma.reservation.findMany(),
    prisma.review.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.room.findMany({ orderBy: { roomNumber: 'asc' } }),
    prisma.promo.findMany({ orderBy: { validFrom: 'asc' } }),
    prisma.reservation.findMany({
      where: {
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'PENDING'] },
      },
    }),
  ])

  const revenue = allBookings
    .filter((b) => b.paymentStatus === 'PAID')
    .reduce((s, b) => s + b.totalPrice, 0)

  const now = new Date()
  const in7Days = new Date()
  in7Days.setDate(now.getDate() + 7)

  const bookingsNext7Days = await prisma.reservation.count({
    where: {
      status: { in: ['CONFIRMED', 'CHECKED_IN'] },
      checkIn: { lte: in7Days },
      checkOut: { gte: now },
    },
  })

  const roomsAvailableNext7Days = totalRooms - bookingsNext7Days

  const stats = [
    {
      label: 'Total Rooms',
      value: totalRooms,
      sub: `${availableRooms} available now`,
      icon: DoorOpen,
      color: 'text-[#103713] bg-[#E2DBD0]',
      href: '/admin/rooms',
    },
    {
      label: 'Total Bookings',
      value: totalBookings,
      sub: `${pendingBookings} pending`,
      icon: BookOpen,
      color: 'text-[#103713] bg-[#E2DBD0]',
      href: '/admin/bookings',
    },
    {
      label: 'Revenue',
      value: `₱${revenue.toLocaleString()}`,
      sub: 'Collected',
      icon: TrendingUp,
      color: 'text-[#FFFDF5] bg-[#628B35]',
      href: '/admin/payment',
    },
    {
      label: 'Currently Checked In',
      value: checkedInBookings,
      sub: 'Guests on-site',
      icon: Users,
      color: 'text-[#103713] bg-[#E2DBD0]',
      href: '/admin/bookings',
    },
  ]

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#103713]">
            Dashboard
          </h1>
          <p className="text-sm text-[#628B35] mt-1">
            Welcome to Mi Casa De Cagsawa Admin Panel.
          </p>
        </div>

        {/* Alerts */}
        {roomsAvailableNext7Days <= 2 && (
          <div
            role="alert"
            className={`p-4 rounded-lg border flex items-start gap-3 ${
              roomsAvailableNext7Days <= 1
                ? 'bg-red-50 border-red-200'
                : 'bg-[#E2DBD0]/40 border-[#E2DBD0]'
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                roomsAvailableNext7Days <= 1
                  ? 'text-red-700'
                  : 'text-[#628B35]'
              }`}
              aria-hidden="true"
            />
            <div>
              <p
                className={`font-semibold ${
                  roomsAvailableNext7Days <= 1
                    ? 'text-red-900'
                    : 'text-[#103713]'
                }`}
              >
                {roomsAvailableNext7Days <= 1
                  ? `Low availability — only ${roomsAvailableNext7Days} room${
                      roomsAvailableNext7Days !== 1 ? 's' : ''
                    } free in the next 7 days`
                  : `${roomsAvailableNext7Days} rooms available in the next 7 days`}
              </p>
              <p
                className={`text-sm ${
                  roomsAvailableNext7Days <= 1
                    ? 'text-red-800'
                    : 'text-[#103713]/70'
                }`}
              >
                {bookingsNext7Days} of {totalRooms} rooms already booked.
              </p>
            </div>
          </div>
        )}

        {pendingBookings > 0 && (
          <div
            role="alert"
            className="p-4 rounded-lg bg-[#E2DBD0]/40 border border-[#E2DBD0] flex items-start gap-3"
          >
            <AlertTriangle
              className="w-5 h-5 text-[#628B35] flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-[#103713]">
                {pendingBookings} pending booking
                {pendingBookings !== 1 ? 's' : ''} need attention
              </p>
              <Link
                href="/admin/bookings"
                className="text-sm text-[#628B35] underline hover:text-[#4f7029] focus:outline-none focus:ring-2 focus:ring-[#628B35] rounded"
              >
                Review pending bookings →
              </Link>
            </div>
          </div>
        )}

        {/* 1. Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <Link
                key={s.label}
                href={s.href}
                className="bg-[#FFFDF5] rounded-lg border border-[#E2DBD0] p-5 hover:border-[#628B35] hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#628B35]"
              >
                <div
                  className={`inline-flex p-2 rounded-md ${s.color} mb-3`}
                  aria-hidden="true"
                >
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xs text-[#103713]/70 uppercase tracking-wide">
                  {s.label}
                </p>
                <p className="text-2xl font-bold text-[#103713] mt-1">
                  {s.value}
                </p>
                <p className="text-xs text-[#103713]/60 mt-1">{s.sub}</p>
              </Link>
            )
          })}
        </div>

        {/* 2. Map + 3. Calendar side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MapCard />
          </div>
          <div className="lg:col-span-1">
            <CompactCalendar bookings={calendarBookings} />
          </div>
        </div>

        {/* 4. Room Gallery */}
        <Gallery rooms={rooms} />

        {/* 5. Promos */}
        <PromoCards promos={promos} />

        {/* 6. Reviews (minimal) */}
        {recentReviews.length > 0 && (
          <div className="bg-[#FFFDF5] rounded-lg border border-[#E2DBD0] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-bold text-[#103713]">
                Latest Reviews
              </h2>
              <Link
                href="/admin/reviews"
                className="text-sm text-[#628B35] hover:underline focus:outline-none focus:ring-2 focus:ring-[#628B35] rounded flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentReviews.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-md bg-[#E2DBD0]/30 border border-[#E2DBD0]"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-[#103713]">
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
                              ? 'fill-[#628B35] text-[#628B35]'
                              : 'fill-[#E2DBD0] text-[#E2DBD0]'
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[#103713]/70 line-clamp-2">
                    {r.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <ContactFooter />
      </div>

      {/* Floating actions */}
      <FloatingActions rooms={rooms} />
    </>
  )
}