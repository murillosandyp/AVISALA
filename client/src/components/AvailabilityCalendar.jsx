import { useState } from 'react'

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseDate = (value) => new Date(`${value}T12:00:00`)

const addDays = (date, amount) => {
  const result = new Date(date)
  result.setDate(result.getDate() + amount)
  return result
}

const isBookedNight = (date, bookings) => {
  const current = formatDate(date)

  return bookings.some((booking) => {
    const start = formatDate(new Date(booking.checkIn))
    const end = formatDate(new Date(booking.checkOut))

    return current >= start && current < end
  })
}

const overlapsBooking = (start, end, bookings) => {
  return bookings.some((booking) => {
    const bookedStart = formatDate(new Date(booking.checkIn))
    const bookedEnd = formatDate(new Date(booking.checkOut))

    return start < bookedEnd && end > bookedStart
  })
}

export default function AvailabilityCalendar({
  bookedDates = [],
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
}) {
  const today = formatDate(new Date())

  const [month, setMonth] = useState(() => {
    const selected = checkIn ? parseDate(checkIn) : new Date()
    return new Date(selected.getFullYear(), selected.getMonth(), 1)
  })

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const gridStart = addDays(firstDay, -startOffset)

  const days = Array.from({ length: 42 }, (_, index) =>
    addDays(gridStart, index)
  )

  const handleDateClick = (date) => {
    const value = formatDate(date)

    if (value < today) return

    // Selecting a new check-in date
    if (!checkIn || checkOut || value <= checkIn) {
      if (isBookedNight(date, bookedDates)) return

      onCheckInChange(value)
      onCheckOutChange('')
      return
    }

    // Selecting check-out date
    if (value <= checkIn) return
    if (overlapsBooking(checkIn, value, bookedDates)) return

    onCheckOutChange(value)
  }

  const previousMonth = () => {
    setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
  }

  const monthName = month.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="rounded-2xl border border-[#E9E6DD] bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={previousMonth}
          className="rounded-lg px-3 py-2 text-lg text-[#4A7A24] hover:bg-[#F9F8F3]"
        >
          ‹
        </button>

        <h4 className="font-semibold text-[#10391A]">
          {monthName}
        </h4>

        <button
          type="button"
          onClick={nextMonth}
          className="rounded-lg px-3 py-2 text-lg text-[#4A7A24] hover:bg-[#F9F8F3]"
        >
          ›
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 text-center text-xs font-semibold text-gray-500">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {days.map((date) => {
          const value = formatDate(date)
          const isCurrentMonth = date.getMonth() === month.getMonth()
          const isPast = value < today
          const booked = isBookedNight(date, bookedDates)
          const selectedStart = value === checkIn
          const selectedEnd = value === checkOut
          const inRange = checkIn && checkOut && value > checkIn && value < checkOut

          // During checkout selection, allow a booking's check-in boundary
          // when the selected stay ends before that booking begins.
          const selectingCheckout = Boolean(checkIn && !checkOut)
          const overlapsSelectedStay =
            selectingCheckout &&
            value > checkIn &&
            overlapsBooking(checkIn, value, bookedDates)

          const disabled =
            isPast ||
            !isCurrentMonth ||
            (selectingCheckout
              ? overlapsSelectedStay
              : booked)

          return (
            <button
              key={value}
              type="button"
              disabled={disabled}
              onClick={() => handleDateClick(date)}
              className={`relative flex h-11 flex-col items-center justify-center rounded-xl text-sm transition
                ${!isCurrentMonth ? 'text-gray-300' : ''}
                ${isPast && isCurrentMonth ? 'text-gray-300' : ''}
                ${booked && isCurrentMonth && !selectedEnd ? 'text-gray-400' : ''}
                ${inRange ? 'bg-[#E8F0DF] text-[#3E631D]' : ''}
                ${selectedStart || selectedEnd ? 'bg-[#4A7A24] font-semibold text-white' : ''}
                ${!disabled && !selectedStart && !selectedEnd && !inRange ? 'hover:bg-[#F0F4E9]' : ''}
              `}
            >
              <span>{date.getDate()}</span>

              {booked && isCurrentMonth && (
                <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-red-500" />
              )}

              {isPast && !booked && isCurrentMonth && (
                <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-gray-300" />
              )}

              {!disabled && !booked && !selectedStart && !selectedEnd && !inRange && (
                <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-[#76A64A]" />
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#76A64A]" />
          Available
        </span>

        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Booked
        </span>

        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-gray-300" />
          Past dates
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl bg-[#F9F8F3] p-3">
          <p className="text-xs text-gray-500">Check-in</p>
          <p className="mt-1 font-semibold text-[#10391A]">
            {checkIn || 'Select date'}
          </p>
        </div>

        <div className="rounded-xl bg-[#F9F8F3] p-3">
          <p className="text-xs text-gray-500">Check-out</p>
          <p className="mt-1 font-semibold text-[#10391A]">
            {checkOut || 'Select date'}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-gray-500">
        Select your check-in date first, then your check-out date.
        Booked nights cannot be selected.
      </p>
    </div>
  )
}
