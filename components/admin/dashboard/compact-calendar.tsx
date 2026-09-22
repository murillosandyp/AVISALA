'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
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
  checkIn: Date
  checkOut: Date
  status: string
}

export function CompactCalendar({ bookings }: { bookings: Booking[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  function bookingsOnDay(day: Date) {
    return bookings.filter((b) => {
      const ci = new Date(b.checkIn)
      const co = new Date(b.checkOut)
      const d = new Date(day.getFullYear(), day.getMonth(), day.getDate())
      const cid = new Date(ci.getFullYear(), ci.getMonth(), ci.getDate())
      const cod = new Date(co.getFullYear(), co.getMonth(), co.getDate())
      return d >= cid && d < cod
    })
  }

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className="bg-[#FFFDF5] rounded-lg border border-[#E2DBD0] p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#103713]">
            Calendar
          </h2>
          <p className="text-xs text-[#628B35] mt-0.5">
            {format(currentMonth, 'MMMM yyyy')}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 border-[#E2DBD0] text-[#103713] hover:bg-[#E2DBD0]/50"
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
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 border-[#E2DBD0] text-[#103713] hover:bg-[#E2DBD0]/50"
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
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {dayNames.map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-semibold text-[#628B35] py-1"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 flex-1">
        {days.map((day, idx) => {
          const dayBookings = bookingsOnDay(day)
          const inMonth = isSameMonth(day, currentMonth)
          const isToday = isSameDay(day, new Date())
          const hasBookings = dayBookings.length > 0

          return (
            <div
              key={idx}
              className={`relative aspect-square flex flex-col items-center justify-center rounded text-xs ${
                !inMonth ? 'text-[#103713]/20' : 'text-[#103713]'
              } ${isToday ? 'font-bold' : ''}`}
            >
              <span
                className={
                  isToday
                    ? 'text-[#628B35] font-bold'
                    : inMonth
                    ? 'text-[#103713]'
                    : 'text-[#103713]/30'
                }
              >
                {format(day, 'd')}
              </span>
              {hasBookings && inMonth && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayBookings.slice(0, 3).map((_, i) => (
                    <span
                      key={i}
                      className="w-1 h-1 rounded-full bg-[#628B35]"
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-[#E2DBD0] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-[#103713]/60">
          <span className="w-2 h-2 rounded-full bg-[#628B35]" />
          <span>= has bookings</span>
        </div>
        <Link
          href="/admin/calendar"
          className="text-xs text-[#628B35] hover:text-[#4f7029] hover:underline focus:outline-none focus:ring-2 focus:ring-[#628B35] rounded flex items-center gap-1"
        >
          Full view <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}