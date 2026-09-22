'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
} from 'date-fns'

type Booking = {
  id: string
  bookingRef: string
  guestFullName: string
  checkIn: Date
  checkOut: Date
  status: string
  roomId: string
  room: { roomNumber: number; name: string }
}

export function CalendarView({ bookings }: { bookings: Booking[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 8, 1))
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  function bookingsOnDay(day: Date) {
    return bookings.filter((b) => {
      const checkIn = new Date(b.checkIn)
      const checkOut = new Date(b.checkOut)
      const d = new Date(day.getFullYear(), day.getMonth(), day.getDate())
      const ci = new Date(
        checkIn.getFullYear(),
        checkIn.getMonth(),
        checkIn.getDate()
      )
      const co = new Date(
        checkOut.getFullYear(),
        checkOut.getMonth(),
        checkOut.getDate()
      )
      return d >= ci && d < co
    })
  }

  const selectedDayBookings = selectedDay ? bookingsOnDay(selectedDay) : []

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-[#FFFDF5] rounded-lg border border-[#E2DBD0] p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            className="border-[#E2DBD0] text-[#103713] hover:bg-[#E2DBD0]/50"
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1,
                  1
                )
              )
            }
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="font-serif text-lg font-bold text-[#103713]">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="border-[#E2DBD0] text-[#103713] hover:bg-[#E2DBD0]/50"
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1,
                  1
                )
              )
            }
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-semibold text-[#628B35] py-2"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Date cells */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const dayBookings = bookingsOnDay(day)
            const inMonth = isSameMonth(day, currentMonth)
            const isToday = isSameDay(day, new Date())
            const isSelected = selectedDay && isSameDay(day, selectedDay)

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`h-16 p-1 rounded-md text-sm flex flex-col items-center justify-start transition-colors focus:outline-none focus:ring-2 focus:ring-[#628B35] border ${
                  !inMonth
                    ? 'text-[#103713]/20 bg-[#E2DBD0]/20 border-transparent'
                    : 'text-[#103713] hover:bg-[#E2DBD0]/40 border-[#E2DBD0]'
                } ${
                  isSelected
                    ? 'bg-[#E2DBD0]/60 ring-2 ring-[#628B35]'
                    : ''
                } ${
                  isToday && !isSelected
                    ? 'font-bold border-[#628B35]'
                    : ''
                }`}
                aria-label={`${format(
                  day,
                  'MMMM d, yyyy'
                )}, ${dayBookings.length} bookings`}
              >
                <span className="text-xs">{format(day, 'd')}</span>
                {dayBookings.length > 0 && (
                  <span className="mt-1 text-[10px] bg-[#628B35] text-[#FFFDF5] rounded-full px-1.5 leading-tight">
                    {dayBookings.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Side panel */}
      <div className="bg-[#FFFDF5] rounded-lg border border-[#E2DBD0] p-4">
        <h3 className="font-serif font-bold text-[#103713] mb-3">
          {selectedDay ? format(selectedDay, 'EEEE, MMM d, yyyy') : 'Select a day'}
        </h3>

        {!selectedDay && (
          <p className="text-sm text-[#103713]/60">
            Click a date on the calendar to see bookings for that day.
          </p>
        )}

        {selectedDay && selectedDayBookings.length === 0 && (
          <p className="text-sm text-[#103713]/60">
            No bookings on this day. All rooms available.
          </p>
        )}

        {selectedDay && selectedDayBookings.length > 0 && (
          <ul className="space-y-2">
            {selectedDayBookings.map((b) => (
              <li
                key={b.id}
                className="p-3 rounded-md bg-[#E2DBD0]/30 border border-[#E2DBD0]"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-[#103713]">
                    Room {b.room.roomNumber}
                  </span>
                  <Badge
                    variant="secondary"
                    className="text-[10px] bg-[#628B35] text-[#FFFDF5] hover:bg-[#628B35]"
                  >
                    {b.status}
                  </Badge>
                </div>
                <p className="text-xs text-[#103713]/70">{b.guestFullName}</p>
                <p className="text-[10px] text-[#103713]/50 font-mono mt-1">
                  {b.bookingRef}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}