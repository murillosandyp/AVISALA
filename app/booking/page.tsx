
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CalendarDays,
  BedDouble,
  Loader2,
} from 'lucide-react'

type Room = {
  id: string
  name: string
  roomNumber: number
  category: string
  capacity: number
  basePrice: number
  available?: boolean
  conflictingReservations?: number
}

function BookingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const roomId = searchParams.get('roomId') || ''

  const [rooms, setRooms] = useState<Room[]>([])
  const [availability, setAvailability] = useState<Room[]>([])
  const [roomLoading, setRoomLoading] = useState(true)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [availabilityError, setAvailabilityError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    guestFullName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: '',
    checkOut: '',
    guestCount: '1',
    notes: '',
    roomId,
  })

  // Load rooms
  useEffect(() => {
    fetch('/api/mobile/rooms')
      .then(res => res.json())
      .then(data => {
        const roomList = Array.isArray(data) ? data : data.rooms || []
        setRooms(roomList)
      })
      .catch(() => setRooms([]))
      .finally(() => setRoomLoading(false))
  }, [])

  // Check availability whenever dates change
  useEffect(() => {
    setAvailability([])
    setAvailabilityError('')

    if (!form.checkIn || !form.checkOut || form.checkOut <= form.checkIn) {
      setCheckingAvailability(false)
      return
    }

    const controller = new AbortController()

    const checkAvailability = async () => {
      setCheckingAvailability(true)

      try {
        const res = await fetch(
          `/api/storefront/availability?checkIn=${form.checkIn}&checkOut=${form.checkOut}`,
          { signal: controller.signal }
        )

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Unable to check availability.')
        }

        setAvailability(data.rooms || [])

        const selected = (data.rooms || []).find(
          (room: Room) => room.id === form.roomId
        )

        if (form.roomId && selected && !selected.available) {
          setForm(prev => ({ ...prev, roomId: '' }))
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return

        setAvailabilityError(
          error instanceof Error
            ? error.message
            : 'Unable to check room availability.'
        )
      } finally {
        if (!controller.signal.aborted) {
          setCheckingAvailability(false)
        }
      }
    }

    checkAvailability()

    return () => controller.abort()
  }, [form.checkIn, form.checkOut])

  const datesSelected =
    !!form.checkIn && !!form.checkOut && form.checkOut > form.checkIn

  const availableRooms = datesSelected
    ? availability.filter(room => room.available)
    : rooms

  const selectedRoom = availableRooms.find(
    room => room.id === form.roomId
  )

  const nights = datesSelected
    ? Math.max(
        0,
        Math.ceil(
          (new Date(form.checkOut).getTime() -
            new Date(form.checkIn).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0

  const total = selectedRoom ? nights * selectedRoom.basePrice : 0

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // Submit booking
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedRoom) {
      alert('Please select an available room.')
      return
    }

    if (!datesSelected) {
      alert('Please select valid check-in and check-out dates.')
      return
    }

    if (checkingAvailability) {
      alert('Please wait while we check room availability.')
      return
    }

    if (availabilityError) {
      alert('Please check room availability again before booking.')
      return
    }

    if (!availability.some(room => room.id === form.roomId && room.available)) {
      alert('This room is not available for your selected dates.')
      return
    }

    if (Number(form.guestCount) > selectedRoom.capacity) {
      alert(`This room can only accommodate ${selectedRoom.capacity} guests.`)
      return
    }

    setLoading(true)

    try {
      // Recheck availability before booking
      const availabilityRes = await fetch(
        `/api/storefront/availability?checkIn=${form.checkIn}&checkOut=${form.checkOut}`
      )

      const availabilityData = await availabilityRes.json()

      if (!availabilityRes.ok) {
        alert(availabilityData.error || 'Unable to verify availability.')
        return
      }

      const roomStillAvailable = availabilityData.rooms?.some(
        (room: Room) => room.id === form.roomId && room.available
      )

      if (!roomStillAvailable) {
        alert('This room is no longer available for your selected dates.')
        setAvailability(availabilityData.rooms || [])
        setForm(prev => ({ ...prev, roomId: '' }))
        return
      }

      // Create booking
      const res = await fetch('/api/storefront/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          guestCount: Number(form.guestCount),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Booking failed.')
        return
      }

      // Redirect to confirmation page
      const booking = data.booking

      router.push(
        `/booking-confirmation?ref=${encodeURIComponent(booking.bookingRef)}&name=${encodeURIComponent(form.guestFullName)}&room=${encodeURIComponent(selectedRoom.name)}&checkIn=${encodeURIComponent(form.checkIn)}&checkOut=${encodeURIComponent(form.checkOut)}&guests=${encodeURIComponent(form.guestCount)}&total=${encodeURIComponent(String(total))}`
      )
    } catch {
      alert('Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen py-10 px-4 md:px-8 bg-[#FFFDF5]">
      <div className="max-w-5xl mx-auto">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#103713] mb-8"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Booking Form */}
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border">
            <h1 className="text-3xl font-bold text-[#103713] mb-2">
              Book Your Stay
            </h1>

            <p className="text-gray-500 mb-7">
              Complete your details to request a reservation.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name *
                </label>

                <input
                  required
                  value={form.guestFullName}
                  onChange={e => updateForm('guestFullName', e.target.value)}
                  className="w-full border rounded-xl px-4 py-3"
                  placeholder="Your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address *
                </label>

                <input
                  required
                  type="email"
                  value={form.guestEmail}
                  onChange={e => updateForm('guestEmail', e.target.value)}
                  className="w-full border rounded-xl px-4 py-3"
                  placeholder="you@email.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number
                </label>

                <input
                  type="tel"
                  value={form.guestPhone}
                  onChange={e => updateForm('guestPhone', e.target.value)}
                  className="w-full border rounded-xl px-4 py-3"
                  placeholder="09XXXXXXXXX"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Check-in *
                  </label>

                  <input
                    required
                    type="date"
                    value={form.checkIn}
                    onChange={e => {
                      const value = e.target.value

                      setForm(prev => ({
                        ...prev,
                        checkIn: value,
                        checkOut: prev.checkOut <= value ? '' : prev.checkOut,
                        roomId: '',
                      }))
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border rounded-xl px-3 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Check-out *
                  </label>

                  <input
                    required
                    type="date"
                    value={form.checkOut}
                    onChange={e => {
                      setForm(prev => ({
                        ...prev,
                        checkOut: e.target.value,
                        roomId: '',
                      }))
                    }}
                    min={form.checkIn || new Date().toISOString().split('T')[0]}
                    className="w-full border rounded-xl px-3 py-3"
                  />
                </div>
              </div>

              {/* Availability Status */}
              <div className="rounded-xl bg-[#F5F3EA] p-4 text-sm">
                {!datesSelected ? (
                  <p className="text-gray-600">
                    Select your check-in and check-out dates to check room availability.
                  </p>
                ) : checkingAvailability ? (
                  <p className="flex items-center gap-2 text-gray-600">
                    <Loader2 size={16} className="animate-spin" />
                    Checking available rooms...
                  </p>
                ) : availabilityError ? (
                  <p className="text-red-600">{availabilityError}</p>
                ) : (
                  <p className="text-[#103713] font-medium">
                    {availableRooms.length} room(s) available for your selected dates.
                  </p>
                )}
              </div>

              {/* Room Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Room *
                </label>

                {roomLoading ? (
                  <p className="text-sm text-gray-500">Loading rooms...</p>
                ) : (
                  <select
                    required
                    value={form.roomId}
                    onChange={e => updateForm('roomId', e.target.value)}
                    disabled={
                      datesSelected &&
                      (checkingAvailability || !!availabilityError)
                    }
                    className="w-full border rounded-xl px-4 py-3 bg-white disabled:bg-gray-100"
                  >
                    <option value="">Choose a room</option>

                    {availableRooms.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.name} — ₱{room.basePrice.toLocaleString()}/night
                      </option>
                    ))}
                  </select>
                )}

                {datesSelected &&
                  !checkingAvailability &&
                  !availabilityError &&
                  availableRooms.length === 0 && (
                    <p className="text-sm text-red-600 mt-2">
                      No rooms are available for these dates. Please choose another date.
                    </p>
                  )}
              </div>

              {/* Guests */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Number of Guests *
                </label>

                <select
                  required
                  value={form.guestCount}
                  onChange={e => updateForm('guestCount', e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 bg-white"
                >
                  {Array.from(
                    { length: selectedRoom?.capacity || 10 },
                    (_, i) => i + 1
                  ).map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Special Requests
                </label>

                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={e => updateForm('notes', e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 resize-none"
                  placeholder="Any requests for your stay?"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  loading ||
                  roomLoading ||
                  checkingAvailability ||
                  !datesSelected ||
                  !!availabilityError ||
                  !selectedRoom
                }
                className="w-full bg-[#103713] text-white rounded-xl py-4 font-semibold hover:bg-[#1a4d1f] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Submitting...
                  </>
                ) : (
                  'Submit Booking Request'
                )}
              </button>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="space-y-5">
            <div className="bg-[#103713] text-white rounded-3xl p-7">
              <h2 className="text-xl font-semibold mb-5">
                Booking Summary
              </h2>

              {selectedRoom ? (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <BedDouble />

                    <div>
                      <p className="font-semibold">{selectedRoom.name}</p>
                      <p className="text-sm text-white/70">
                        Room {selectedRoom.roomNumber} · {selectedRoom.category}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span>Price per night</span>
                      <span>₱{selectedRoom.basePrice.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Nights</span>
                      <span>{nights}</span>
                    </div>

                    <div className="flex justify-between text-xl font-bold border-t border-white/20 pt-3">
                      <span>Estimated Total</span>
                      <span>₱{total.toLocaleString()}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-white/70">
                  Select dates and an available room to see your estimated total.
                </p>
              )}
            </div>

            {/* Booking Information */}
            <div className="bg-white rounded-3xl p-6 border">
              <div className="flex items-center gap-3 mb-3">
                <CalendarDays className="text-[#628B35]" />
                <h3 className="font-semibold">Booking Information</h3>
              </div>

              <p className="text-sm text-gray-600 leading-6">
                Submitting this form does not guarantee your reservation.
                Your booking will remain pending until confirmed by Mi Casa De Cagsawa.
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading booking form...
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  )
}
