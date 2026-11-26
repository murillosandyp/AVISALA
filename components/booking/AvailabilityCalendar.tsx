'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type BookedDate = {
  checkIn: string
  checkOut: string
  status: string
}

type AvailabilityCalendarProps = {
  roomId: string
  checkIn: string
  checkOut: string
  onCheckInChange: (date: string) => void
  onCheckOutChange: (date: string) => void
}

export default function AvailabilityCalendar({
  roomId,
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [bookedDates, setBookedDates] = useState<BookedDate[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!roomId) {
      setBookedDates([])
      return
    }

    let cancelled = false

    async function loadCalendar() {
      setLoading(true)

      try {
        const response = await fetch(
          `/api/storefront/calendar?roomId=${encodeURIComponent(roomId)}`
        )
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load calendar.')
        }

        if (!cancelled) {
          setBookedDates(data.bookedDates || [])
        }
      } catch (error) {
        console.error('Calendar loading error:', error)
        if (!cancelled) setBookedDates([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadCalendar()

    return () => {
      cancelled = true
    }
  }, [roomId])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const formatDate = (day: number) => {
    const date = new Date(year, month, day)
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const dateValue = (value: string) => value.slice(0, 10)

  const isPastDate = (day: number) => {
    return formatDate(day) < [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-')
  }

  const isBookedDate = (day: number) => {
    const date = formatDate(day)

    return bookedDates.some((booking) => {
      const start = dateValue(booking.checkIn)
      const end = dateValue(booking.checkOut)

      return date >= start && date < end
    })
  }

  const hasBookingBetween = (startDate: string, endDate: string) => {
    return bookedDates.some((booking) => {
      const bookedStart = dateValue(booking.checkIn)
      const bookedEnd = dateValue(booking.checkOut)

      return bookedStart < endDate && bookedEnd > startDate
    })
  }

  const handleDateClick = (day: number) => {
    if (isPastDate(day) || isBookedDate(day) || loading) return

    const selectedDate = formatDate(day)

    // Start a new booking selection
    if (!checkIn || checkOut || selectedDate <= checkIn) {
      onCheckInChange(selectedDate)
      onCheckOutChange('')
      return
    }

    // Prevent selecting a checkout date that crosses booked dates
    if (hasBookingBetween(checkIn, selectedDate)) {
      onCheckInChange(selectedDate)
      onCheckOutChange('')
      return
    }

    onCheckOutChange(selectedDate)
  }

  const isSelected = (day: number) => {
    const date = formatDate(day)
    return date === checkIn || date === checkOut
  }

  const isInSelectedRange = (day: number) => {
    const date = formatDate(day)
    return !!checkIn && !!checkOut && date > checkIn && date < checkOut
  }

  const isInvalidCheckout = (day: number) => {
    if (!checkIn || checkOut) return false

    const date = formatDate(day)

    if (date <= checkIn || isBookedDate(day)) return false

    return hasBookingBetween(checkIn, date)
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="rounded-lg p-2 hover:bg-gray-100"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <h3 className="text-base font-semibold text-gray-900">
          {currentMonth.toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </h3>

        <button
          type="button"
          onClick={goToNextMonth}
          className="rounded-lg p-2 hover:bg-gray-100"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-gray-500">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {Array.from({ length: daysInMonth }, (_, index) => index + 1).map(
          (day) => {
            const past = isPastDate(day)
            const booked = isBookedDate(day)
            const selected = isSelected(day)
            const inRange = isInSelectedRange(day)
            const invalidCheckout = isInvalidCheckout(day)

            const disabled =
              past || booked || invalidCheckout || loading

            let classes =
              'relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm font-medium transition '

            if (past) {
              classes += 'bg-gray-50 text-gray-400 cursor-not-allowed '
            } else if (booked) {
              classes += 'bg-red-50 text-red-700 cursor-not-allowed '
            } else if (selected) {
              classes += 'bg-green-700 text-white '
            } else if (inRange) {
              classes += 'bg-green-100 text-green-800 '
            } else if (invalidCheckout) {
              classes += 'bg-gray-100 text-gray-400 cursor-not-allowed '
            } else {
              classes += 'bg-white text-gray-700 hover:bg-green-50 '
            }

            return (
              <button
                key={day}
                type="button"
                disabled={disabled}
                onClick={() => handleDateClick(day)}
                className={classes}
                title={
                  past
                    ? 'Past date'
                    : booked
                      ? 'Booked - unavailable'
                      : invalidCheckout
                        ? 'Unavailable for this booking range'
                        : 'Available'
                }
              >
                <span>{day}</span>

                {booked && (
                  <span
                    className="mt-0.5 h-1.5 w-1.5 rounded-full bg-red-500"
                    aria-label="Booked"
                  />
                )}

                {past && !booked && (
                  <span
                    className="mt-0.5 h-1.5 w-1.5 rounded-full bg-gray-400"
                    aria-label="Unavailable"
                  />
                )}

                {invalidCheckout && !booked && (
                  <span
                    className="mt-0.5 h-1.5 w-1.5 rounded-full bg-gray-400"
                    aria-label="Unavailable"
                  />
                )}
              </button>
            )
          }
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-700" />
          Selected
        </div>

        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-300" />
          Selected stay
        </div>

        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Booked
        </div>

        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-gray-400" />
          Unavailable
        </div>
      </div>

      {loading && (
        <p className="mt-3 text-center text-sm text-gray-500">
          Loading availability...
        </p>
      )}

      {!roomId && (
        <p className="mt-3 text-center text-sm text-gray-500">
          Select a room to view its availability.
        </p>
      )}
    </div>
  )
}
