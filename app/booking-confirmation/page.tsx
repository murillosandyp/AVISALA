
'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

type PaymentMethod = 'GCASH' | 'MARIBANK'

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

  const [status, setStatus] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState('UNPAID')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('GCASH')
  const [paymentRef, setPaymentRef] = useState('')
  const [paymentSubmitted, setPaymentSubmitted] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [depositAmount, setDepositAmount] = useState(1000)

  // Fetch booking and payment status
  useEffect(() => {
    if (!bookingRef) return

    let active = true

    const fetchStatus = async () => {
      try {
        const res = await fetch(
          `/api/bookings/by-reference?ref=${encodeURIComponent(bookingRef)}&t=${Date.now()}`,
          { cache: 'no-store' }
        )

        const data = await res.json()

        if (active && res.ok && data.success) {
          setStatus(data.booking.status)
          setPaymentStatus(data.booking.paymentStatus || 'UNPAID')
          setDepositAmount(Number(data.booking.depositAmount || 1000))

          if (data.booking.paymentMethod) {
            setPaymentMethod(data.booking.paymentMethod)
          }

          if (data.booking.paymentRef) {
            setPaymentRef(data.booking.paymentRef)
            setPaymentSubmitted(true)
          } else {
            setPaymentRef('')
            setPaymentSubmitted(false)
          }
        }
      } catch (error) {
        console.error('Failed to fetch booking status:', error)
      }
    }

    fetchStatus()

    const interval = setInterval(fetchStatus, 10000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [bookingRef])

  // Submit payment reference
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPaymentError('')

    if (!bookingRef) {
      setPaymentError('Booking reference is missing.')
      return
    }

    if (!paymentRef.trim()) {
      setPaymentError('Please enter your payment reference number.')
      return
    }

    setPaymentLoading(true)

    try {
      const res = await fetch('/api/bookings/by-reference', {
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

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Payment submission failed.')
      }

      setPaymentSubmitted(true)
      setPaymentStatus('PENDING_VERIFICATION')
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : 'Unable to submit payment reference.'
      )
    } finally {
      setPaymentLoading(false)
    }
  }

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

  const statusInfo: Record<
    string,
    { title: string; message: string; color: string }
  > = {
    PENDING: {
      title: 'Pending Confirmation',
      message:
        'Your reservation is currently pending. Please wait for confirmation from Mi Casa De Cagsawa.',
      color: 'border-[#E8D7A8] bg-[#FFF8E8] text-[#785A20]',
    },
    CONFIRMED: {
      title: 'Booking Confirmed!',
      message:
        'Great news! Your reservation has been confirmed by management. We look forward to welcoming you to Mi Casa De Cagsawa.',
      color: 'border-[#B9D5A9] bg-[#EEF6E9] text-[#456B32]',
    },
    CHECKED_IN: {
      title: 'Checked In',
      message: 'Your reservation is currently marked as checked in.',
      color: 'border-[#B9D5A9] bg-[#EEF6E9] text-[#456B32]',
    },
    CHECKED_OUT: {
      title: 'Checked Out',
      message: 'Your reservation has been marked as checked out.',
      color: 'border-gray-200 bg-gray-50 text-gray-700',
    },
    CANCELLED: {
      title: 'Booking Cancelled',
      message: 'Your reservation has been cancelled.',
      color: 'border-red-200 bg-red-50 text-red-700',
    },
    NO_SHOW: {
      title: 'No Show',
      message: 'Your reservation has been marked as no show.',
      color: 'border-gray-200 bg-gray-50 text-gray-700',
    },
    REFUNDED: {
      title: 'Refunded',
      message: 'Your booking has been marked as refunded.',
      color: 'border-gray-200 bg-gray-50 text-gray-700',
    },
  }

  const currentStatus = status ? statusInfo[status] : null

  const money = (amount: number) =>
    `₱${amount.toLocaleString('en-PH')}`

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
            has been received.
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
              <Detail label="Check-in" value={formatDate(checkIn)} />
              <Detail label="Check-out" value={formatDate(checkOut)} />
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
                {money(Number(total || 0))}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Final booking confirmation will be subject to management approval.
              </p>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-[#E4DED2] bg-white shadow-sm">
          <div className="bg-[#183B20] p-5 text-white sm:p-6">
            <h2 className="text-xl font-bold">Reservation Deposit</h2>
            <p className="mt-1 text-sm text-white/75">
              Submit your payment reference for management verification.
            </p>

            <div className="mt-4">
              <p className="text-sm text-white/70">Deposit Amount</p>
              <p className="text-3xl font-bold">{money(depositAmount)}</p>
            </div>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            {/* VERIFIED PAYMENT */}
            {paymentStatus === 'DEPOSIT_PAID' ? (
              <div className="rounded-xl border border-[#B9D5A9] bg-[#EEF6E9] p-5 text-[#456B32]">
                <h3 className="text-lg font-bold">
                  Deposit Verified Successfully!
                </h3>

                <p className="mt-2 text-sm leading-6">
                  Your reservation deposit has been verified by Mi Casa De Cagsawa
                  management. Thank you for your payment.
                </p>

                <div className="mt-4 space-y-2 rounded-lg bg-white p-4 text-sm">
                  <p>
                    <span className="font-semibold">Payment Method:</span>{' '}
                    {paymentMethod === 'GCASH' ? 'GCash' : 'MariBank'}
                  </p>

                  <p className="break-all">
                    <span className="font-semibold">Reference Number:</span>{' '}
                    {paymentRef || 'Not available'}
                  </p>

                  <p>
                    <span className="font-semibold">Deposit Amount:</span>{' '}
                    {money(depositAmount)}
                  </p>

                  <p>
                    <span className="font-semibold">Status:</span>{' '}
                    Deposit Verified
                  </p>
                </div>
              </div>
            ) : paymentSubmitted || paymentStatus === 'PENDING_VERIFICATION' ? (
              /* PENDING VERIFICATION PAYMENT */
              <div className="rounded-xl border border-[#E8D7A8] bg-[#FFF8E8] p-5 text-[#785A20]">
                <h3 className="text-lg font-bold">
                  Payment Submitted!
                </h3>

                <p className="mt-2 text-sm leading-6">
                  Your payment reference has been submitted and is waiting for
                  verification by Mi Casa De Cagsawa management.
                </p>

                <div className="mt-4 space-y-2 rounded-lg bg-white p-4 text-sm">
                  <p>
                    <span className="font-semibold">Payment Method:</span>{' '}
                    {paymentMethod === 'GCASH' ? 'GCash' : 'MariBank'}
                  </p>

                  <p className="break-all">
                    <span className="font-semibold">Reference Number:</span>{' '}
                    {paymentRef}
                  </p>

                  <p>
                    <span className="font-semibold">Status:</span>{' '}
                    Pending Verification
                  </p>
                </div>
              </div>
            ) : (
              /* PAYMENT FORM */
              <>
                <div>
                  <h3 className="font-semibold text-[#183B20]">
                    Select Payment Method
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose where you will send your reservation deposit.
                  </p>
                </div>

                {/* Payment Method Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('GCASH')}
                    className={`rounded-xl border-2 p-4 text-center transition ${
                      paymentMethod === 'GCASH'
                        ? 'border-[#183B20] bg-[#EDF4E8]'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <span className="block text-lg font-bold text-[#007DFF]">
                      GCash
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      E-wallet
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MARIBANK')}
                    className={`rounded-xl border-2 p-4 text-center transition ${
                      paymentMethod === 'MARIBANK'
                        ? 'border-[#183B20] bg-[#EDF4E8]'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <span className="block text-lg font-bold text-[#E47725]">
                      MariBank
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      Digital Bank
                    </span>
                  </button>
                </div>

                {/* Instructions */}
                <div className="rounded-xl border border-[#E4DED2] bg-[#F9F7F0] p-4">
                  <h3 className="font-semibold text-[#183B20]">
                    {paymentMethod === 'GCASH'
                      ? 'GCash Payment Instructions'
                      : 'MariBank Payment Instructions'}
                  </h3>

                  <div className="mt-3 rounded-lg bg-white p-4">
                    <p className="text-sm font-medium text-gray-700">
                      Payment Account Details
                    </p>

                    <p className="mt-2 font-semibold text-[#183B20]">
                      Account Name: To be provided by management
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Account Number: Not yet configured
                    </p>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Please contact Mi Casa De Cagsawa management for the official
                    payment account details before sending your deposit.
                  </p>

                  <p className="mt-3 text-sm font-semibold text-[#183B20]">
                    Deposit to send: {money(depositAmount)}
                  </p>
                </div>

                {/* Reference Submission */}
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#183B20]">
                      Transaction Reference Number
                    </label>

                    <input
                      type="text"
                      required
                      value={paymentRef}
                      onChange={e => setPaymentRef(e.target.value)}
                      placeholder="Enter your transaction reference"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#183B20] focus:ring-2 focus:ring-[#183B20]/10"
                    />

                    <p className="mt-2 text-xs text-gray-500">
                      Enter the reference number from your payment receipt.
                    </p>
                  </div>

                  {paymentError && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      {paymentError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={paymentLoading || !paymentRef.trim()}
                    className="w-full rounded-xl bg-[#183B20] py-3 font-semibold text-white transition hover:bg-[#315B35] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {paymentLoading
                      ? 'Submitting Payment...'
                      : 'Submit Payment Reference'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Booking Status */}
        <div
          className={`mt-6 rounded-xl border p-4 ${
            currentStatus?.color ||
            'border-[#E4DED2] bg-white text-[#183B20]'
          }`}
        >
          <div className="flex gap-3">
            <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-current" />

            <div>
              <h3 className="font-semibold">
                {currentStatus?.title ||
                  (status
                    ? status.replace(/_/g, ' ')
                    : 'Checking Booking Status...')}
              </h3>

              <p className="mt-1 text-sm leading-6">
                {currentStatus?.message ||
                  (status
                    ? 'Your booking status has been updated.'
                    : 'Please wait while we retrieve your booking status.')}
              </p>

              <p className="mt-2 text-xs opacity-70">
                Status updates automatically every 10 seconds.
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
