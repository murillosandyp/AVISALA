
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Room = {
  id: string
  name: string
  roomNumber: number
  basePrice: number
  capacity: number
  category: string
}

type PaymentMethod = 'GCASH' | 'MARIBANK'

export default function BookingForm({
  rooms,
  selectedRoomId,
}: {
  rooms: Room[]
  selectedRoomId: string
}) {
  const router = useRouter()

  const [roomId, setRoomId] = useState(selectedRoomId)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guestCount, setGuestCount] = useState('1')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const [bookingRef, setBookingRef] = useState('')
  const [paymentRef, setPaymentRef] = useState('')
  const [paymentSubmitted, setPaymentSubmitted] = useState(false)
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('GCASH')

  const selectedRoom = rooms.find((room) => room.id === roomId)

  const today = new Date().toISOString().split('T')[0]

  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.ceil(
            (new Date(checkOut).getTime() -
              new Date(checkIn).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0

  const totalPrice = selectedRoom
    ? selectedRoom.basePrice * nights
    : 0

  const depositAmount = 1000

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setBookingRef('')
    setPaymentSubmitted(false)
    setPaymentRef('')

    if (!selectedRoom) {
      setError('Please select a room.')
      return
    }

    if (checkIn < today) {
      setError('Check-in date cannot be in the past.')
      return
    }

    if (checkOut <= checkIn) {
      setError('Check-out must be after check-in.')
      return
    }

    if (Number(guestCount) > selectedRoom.capacity) {
      setError(
        `This room can only accommodate ${selectedRoom.capacity} guests.`
      )
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/storefront/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestFullName: fullName,
          guestEmail: email,
          guestPhone: phone,
          roomId,
          checkIn,
          checkOut,
          guestCount: Number(guestCount),
          notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Booking failed.')
      }

      setBookingRef(data.booking.bookingRef)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit booking.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handlePaymentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPaymentError('')

    if (!bookingRef || !paymentRef.trim()) {
      setPaymentError('Please enter your payment reference number.')
      return
    }

    setPaymentLoading(true)

    try {
      const response = await fetch('/api/bookings/by-reference', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingRef,
          paymentRef: paymentRef.trim(),
          paymentMethod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || data.error || 'Payment submission failed.'
        )
      }

      setPaymentSubmitted(true)
    } catch (err) {
      setPaymentError(
        err instanceof Error
          ? err.message
          : 'Unable to submit payment reference.'
      )
    } finally {
      setPaymentLoading(false)
    }
  }

  // BOOKING CONFIRMATION AND PAYMENT
  if (bookingRef) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-[#E2DBD0] bg-white p-6 shadow-sm md:p-8">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#103713] text-3xl text-white">
          ✓
        </div>

        <h2 className="mb-3 text-3xl font-semibold text-[#103713]">
          Booking Request Received!
        </h2>

        <p className="mb-5 text-gray-600">
          Thank you for choosing Mi Casa De Cagsawa. Your booking
          request has been submitted.
        </p>

        <div className="mb-6 rounded-2xl bg-[#FFFDF5] p-5">
          <p className="text-sm text-gray-500">Booking Reference</p>
          <p className="mt-1 text-2xl font-bold text-[#103713]">
            {bookingRef}
          </p>

          <div className="mt-4 border-t border-[#E2DBD0] pt-4">
            <p className="text-sm text-gray-600">Room</p>
            <p className="font-semibold text-[#103713]">
              {selectedRoom?.name} - Room {selectedRoom?.roomNumber}
            </p>

            <p className="mt-3 text-sm text-gray-600">Booking Total</p>
            <p className="text-lg font-semibold text-[#103713]">
              ₱{totalPrice.toLocaleString()}
            </p>

            <p className="mt-3 text-sm text-gray-600">Required Deposit</p>
            <p className="text-2xl font-bold text-[#628B35]">
              ₱{depositAmount.toLocaleString()}
            </p>
          </div>
        </div>

        {!paymentSubmitted ? (
          <form onSubmit={handlePaymentSubmit}>
            <div className="mb-5 rounded-2xl border border-[#E2DBD0] p-5">
              <h3 className="mb-3 text-lg font-semibold text-[#103713]">
                Deposit Payment
              </h3>

              <p className="text-sm text-gray-600">
                Please submit your required deposit of ₱
                {depositAmount.toLocaleString()} and provide your
                payment reference below.
              </p>

              {/* PAYMENT METHOD SELECTOR */}
              <p className="mb-3 mt-5 text-sm font-medium text-[#103713]">
                Select Payment Method
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('GCASH')
                    setPaymentError('')
                  }}
                  className={`rounded-xl border-2 p-4 text-center transition ${
                    paymentMethod === 'GCASH'
                      ? 'border-[#628B35] bg-[#FFFDF5]'
                      : 'border-[#E2DBD0] bg-white hover:border-[#628B35]'
                  }`}
                >
                  <span className="block font-semibold text-[#103713]">
                    GCash
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    E-wallet
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('MARIBANK')
                    setPaymentError('')
                  }}
                  className={`rounded-xl border-2 p-4 text-center transition ${
                    paymentMethod === 'MARIBANK'
                      ? 'border-[#628B35] bg-[#FFFDF5]'
                      : 'border-[#E2DBD0] bg-white hover:border-[#628B35]'
                  }`}
                >
                  <span className="block font-semibold text-[#103713]">
                    MariBank
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    Bank / E-wallet
                  </span>
                </button>
              </div>

              {/* PAYMENT INSTRUCTIONS */}
              <div className="mt-4 rounded-xl bg-[#FFFDF5] p-4">
                <p className="text-sm font-semibold text-[#103713]">
                  {paymentMethod === 'GCASH'
                    ? 'GCash Payment'
                    : 'MariBank Payment'}
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  {paymentMethod === 'GCASH'
                    ? 'Send your deposit using the official Mi Casa De Cagsawa GCash payment details. Make sure to verify the recipient before completing your payment.'
                    : 'Send your deposit using the official Mi Casa De Cagsawa MariBank payment details. Make sure to verify the recipient before completing your payment.'}
                </p>

                <p className="mt-3 text-sm font-medium text-[#103713]">
                  Deposit Amount: ₱
                  {depositAmount.toLocaleString()}
                </p>
              </div>

              <label className="mb-2 mt-5 block text-sm font-medium text-[#103713]">
                {paymentMethod === 'GCASH'
                  ? 'GCash Reference Number'
                  : 'MariBank Reference Number'}
              </label>

              <input
                required
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="Enter your payment reference number"
                className="w-full rounded-xl border border-[#E2DBD0] px-4 py-3 outline-none focus:border-[#628B35]"
              />

              <p className="mt-2 text-xs text-gray-500">
                Enter the reference number from your completed payment.
              </p>
            </div>

            {paymentError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {paymentError}
              </div>
            )}

            <button
              type="submit"
              disabled={paymentLoading || !paymentRef.trim()}
              className="w-full rounded-full bg-[#628B35] px-6 py-4 font-medium text-white transition hover:bg-[#103713] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {paymentLoading
                ? 'Submitting Payment Reference...'
                : 'Submit Payment Reference'}
            </button>
          </form>
        ) : (
          <div className="rounded-2xl border border-[#E2DBD0] bg-[#FFFDF5] p-5">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#628B35] text-xl text-white">
              ✓
            </div>

            <h3 className="text-lg font-semibold text-[#103713]">
              Payment Submitted!
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              Your payment reference has been sent successfully.
              Please wait while the admin verifies your payment.
            </p>

            <div className="mt-4 rounded-xl bg-white p-4">
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="mt-1 font-semibold text-[#103713]">
                {paymentMethod === 'GCASH' ? 'GCash' : 'MariBank'}
              </p>

              <p className="mt-3 text-sm text-gray-500">
                Submitted Reference
              </p>
              <p className="mt-1 font-semibold text-[#103713]">
                {paymentRef}
              </p>

              <p className="mt-3 text-sm text-gray-500">
                Payment Status
              </p>
              <p className="font-semibold text-amber-700">
                Pending Verification
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => router.push('/')}
          className="mt-5 w-full rounded-full border border-[#E2DBD0] px-7 py-3 text-[#103713] transition hover:bg-[#FFFDF5]"
        >
          Back to Home
        </button>
      </div>
    )
  }

  // BOOKING FORM
  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-[#E2DBD0] bg-white p-6 shadow-sm md:p-8"
    >
      <div className="mb-7">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-[#628B35]">
          Reservation Form
        </p>
        <h2 className="text-3xl font-semibold text-[#103713]">
          Book Your Stay
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Complete the form below to request your reservation.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#103713]">
            Full Name *
          </label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full rounded-xl border border-[#E2DBD0] px-4 py-3 outline-none focus:border-[#628B35]"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#103713]">
              Email Address *
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-[#E2DBD0] px-4 py-3 outline-none focus:border-[#628B35]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#103713]">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09XXXXXXXXX"
              className="w-full rounded-xl border border-[#E2DBD0] px-4 py-3 outline-none focus:border-[#628B35]"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#103713]">
            Select Room *
          </label>
          <select
            required
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full rounded-xl border border-[#E2DBD0] bg-white px-4 py-3 outline-none focus:border-[#628B35]"
          >
            <option value="">Choose a room</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                Room {room.roomNumber} - {room.name} (₱
                {room.basePrice.toLocaleString()} / night)
              </option>
            ))}
          </select>
        </div>

        {selectedRoom && (
          <div className="rounded-2xl bg-[#FFFDF5] p-4">
            <p className="font-semibold text-[#103713]">
              {selectedRoom.name}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Room {selectedRoom.roomNumber} · Maximum{' '}
              {selectedRoom.capacity} guests
            </p>
            <p className="mt-2 font-medium text-[#628B35]">
              ₱{selectedRoom.basePrice.toLocaleString()} per night
            </p>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#103713]">
              Check-in *
            </label>
            <input
              required
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value)
                if (checkOut && e.target.value >= checkOut) {
                  setCheckOut('')
                }
              }}
              className="w-full rounded-xl border border-[#E2DBD0] px-4 py-3 outline-none focus:border-[#628B35]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#103713]">
              Check-out *
            </label>
            <input
              required
              type="date"
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full rounded-xl border border-[#E2DBD0] px-4 py-3 outline-none focus:border-[#628B35]"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#103713]">
            Number of Guests *
          </label>
          <select
            required
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
            className="w-full rounded-xl border border-[#E2DBD0] bg-white px-4 py-3 outline-none focus:border-[#628B35]"
          >
            {Array.from(
              { length: selectedRoom?.capacity || 1 },
              (_, i) => i + 1
            ).map((count) => (
              <option key={count} value={count}>
                {count} {count === 1 ? 'Guest' : 'Guests'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#103713]">
            Special Requests (Optional)
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any requests or additional information..."
            className="w-full resize-y rounded-xl border border-[#E2DBD0] px-4 py-3 outline-none focus:border-[#628B35]"
          />
        </div>
      </div>

      {nights > 0 && selectedRoom && (
        <div className="mt-6 rounded-2xl bg-[#103713] p-5 text-white">
          <div className="flex justify-between text-sm text-white/80">
            <span>
              {nights} {nights === 1 ? 'night' : 'nights'}
            </span>
            <span>
              ₱{selectedRoom.basePrice.toLocaleString()} × {nights}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/20 pt-3">
            <span className="font-medium">Estimated Total</span>
            <span className="text-2xl font-semibold">
              ₱{totalPrice.toLocaleString()}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-white/80">
            <span>Required Deposit</span>
            <span>₱{depositAmount.toLocaleString()}</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || rooms.length === 0}
        className="mt-7 w-full rounded-full bg-[#628B35] px-6 py-4 font-medium text-white transition hover:bg-[#103713] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Submitting Request...' : 'Submit Booking Request'}
      </button>

      <p className="mt-4 text-center text-xs text-gray-500">
        Your booking will be pending until confirmed by Mi Casa De Cagsawa.
      </p>
    </form>
  )
}
