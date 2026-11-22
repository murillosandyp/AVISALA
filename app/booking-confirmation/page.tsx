'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

function BookingConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const bookingRef = searchParams.get('ref')
  const name = searchParams.get('name')
  const room = searchParams.get('room')
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const guests = searchParams.get('guests')
  const total = searchParams.get('total')

  const formatDate = (date: string | null) => {
    if (!date) return 'Not specified'

    return new Date(date + 'T00:00:00').toLocaleDateString('en-PH', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.round(
            (new Date(checkOut).getTime() -
              new Date(checkIn).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0

  return (
    <main className="min-h-screen bg-[#F9F7F0] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">

        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#E7EEDC] text-[#456B32]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-10 w-10"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M5 12l4 4L19 6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="mb-2 text-sm font-medium uppercase tracking-[3px] text-[#66814A]">
            Mi Casa De Cagsawa
          </p>

          <h1 className="text-3xl font-bold text-[#183B20] sm:text-4xl">
            Booking Request Submitted!
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-gray-600">
            Thank you for choosing Mi Casa De Cagsawa. Your booking request
            has been received and is waiting for confirmation.
          </p>
        </div>

        {/* Booking Reference */}
        <div className="mb-6 rounded-2xl bg-[#183B20] p-6 text-center text-white">
          <p className="text-xs uppercase tracking-[2px] text-[#D6DFC9]">
            Your Booking Reference
          </p>

          <h2 className="mt-3 break-all text-2xl font-bold tracking-wider sm:text-3xl">
            {bookingRef || 'Unavailable'}
          </h2>

          <p className="mt-3 text-sm text-[#D6DFC9]">
            Please keep this reference for future inquiries.
          </p>
        </div>

        {/* Booking Details */}
        <div className="overflow-hidden rounded-2xl border border-[#E4DED2] bg-white shadow-sm">
          <div className="border-b border-[#E4DED2] p-5 sm:p-6">
            <h2 className="text-xl font-bold text-[#183B20]">
              Reservation Details
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Review your submitted booking information.
            </p>
          </div>

          <div className="space-y-4 p-5 sm:p-6">

            <Detail label="Guest Name" value={name} />

            <Detail label="Room" value={room} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Detail
                label="Check-in"
                value={formatDate(checkIn)}
              />

              <Detail
                label="Check-out"
                value={formatDate(checkOut)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Detail
                label="Length of Stay"
                value={`${nights} ${nights === 1 ? 'night' : 'nights'}`}
              />

              <Detail
                label="Guests"
                value={`${guests || '0'} ${Number(guests) === 1 ? 'guest' : 'guests'}`}
              />
            </div>

            <div className="rounded-xl bg-[#F5F4EC] p-4">
              <p className="text-sm text-gray-500">Estimated Total</p>

              <p className="mt-1 text-2xl font-bold text-[#183B20]">
                ₱{Number(total || 0).toLocaleString('en-PH')}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Final booking confirmation will be subject to management approval.
              </p>
            </div>

          </div>
        </div>

        {/* Pending Status */}
        <div className="mt-6 rounded-xl border border-[#E8D7A8] bg-[#FFF8E8] p-4">
          <div className="flex gap-3">
            <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[#D9A441]" />

            <div>
              <h3 className="font-semibold text-[#785A20]">
                Pending Confirmation
              </h3>

              <p className="mt-1 text-sm leading-6 text-[#8A713E]">
                Your reservation is currently pending. Please wait for
                confirmation from Mi Casa De Cagsawa before finalizing your stay.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => router.push('/')}
            className="w-full rounded-xl bg-[#183B20] px-6 py-3 font-semibold text-white transition hover:bg-[#315B35]"
          >
            Return to Homepage
          </button>

          <button
            onClick={() => router.push('/booking')}
            className="w-full rounded-xl border border-[#183B20] px-6 py-3 font-semibold text-[#183B20] transition hover:bg-[#E9EDE3]"
          >
            Make Another Booking
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          Thank you for trusting Mi Casa De Cagsawa.
        </p>

      </div>
    </main>
  )
}

function Detail({
  label,
  value,
}: {
  label: string
  value: string | null
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-words font-semibold text-[#183B20]">
        {value || 'Not specified'}
      </p>
    </div>
  )
}

export default function BookingConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F9F7F0]">
          <p className="text-[#183B20]">Loading booking details...</p>
        </div>
      }
    >
      <BookingConfirmationContent />
    </Suspense>
  )
}