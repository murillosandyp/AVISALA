
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function PaymentPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const bookingData = location.state
  const booking = bookingData?.booking
  const room = bookingData?.room

  const checkIn = bookingData?.checkIn || booking?.checkIn
  const checkOut = bookingData?.checkOut || booking?.checkOut
  const guests = bookingData?.guests || booking?.guests
  const totalPrice = bookingData?.totalPrice ?? booking?.totalPrice ?? 0

  const [paymentMethod, setPaymentMethod] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'Not available'

    return new Date(date).toLocaleDateString('en-PH', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // SUBMIT DEMO PAYMENT TO BACKEND
  const handleSubmitPayment = async () => {
    setError('')

    if (!paymentMethod) {
      setError('Please select a payment method.')
      return
    }

    if (!referenceNumber.trim()) {
      setError('Please enter a demo reference number.')
      return
    }

    const bookingId = booking?._id || booking?.id

    if (!bookingId) {
      setError('Booking ID is missing. Please try booking again.')
      return
    }

    // Retrieve login token
    const token = localStorage.getItem('token')

    if (!token) {
      setError('Your session was not found. Please log in again.')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/${bookingId}/payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            method: paymentMethod,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit demo payment.')
      }

      // SUCCESS ONLY AFTER BACKEND CONFIRMATION
      setSuccess(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while submitting.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (!booking || !room) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F8F3] p-6">
        <div className="max-w-md rounded-3xl border border-[#E9E6DD] bg-white p-8 text-center shadow-sm">
          <h1 className="mb-3 font-serif text-3xl text-[#10391A]">
            Booking information unavailable
          </h1>

          <p className="mb-6 text-sm leading-7 text-gray-500">
            Please select a room and complete your booking first.
          </p>

          <button
            onClick={() => navigate('/')}
            className="rounded-full bg-[#4A7A24] px-7 py-3 font-semibold text-white transition hover:bg-[#3E631D]"
          >
            Browse Rooms
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F8F3] text-[#10391A]">

      {/* NAVIGATION */}
      <nav className="border-b border-[#E8E5DA] bg-[#F9F8F3]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-8">

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-left"
          >
            <img
              src="/images/mi-casa-logo.png"
              alt="Mi Casa Logo"
              className="h-11 w-auto object-contain"
            />

            <div>
              <h1 className="font-bold tracking-wide text-[#3E631D]">
                Mi Casa Express
              </h1>

              <p className="text-[10px] tracking-[0.2em] text-gray-500">
                COMFORT FEELS LIKE HOME
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/')}
            className="rounded-full border border-[#4A7A24] px-5 py-2 text-sm text-[#4A7A24] transition hover:bg-[#4A7A24] hover:text-white"
          >
            ← Home
          </button>

        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-16">

        {/* HEADER */}
        <div className="mb-10 text-center">

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#638D35]">
            Booking Checkout
          </p>

          <h1 className="font-serif text-4xl text-[#10391A] md:text-5xl">
            Complete Your Booking
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#77796F]">
            Review your accommodation details and choose a payment option
            for this payment demonstration.
          </p>

        </div>

        {/* DEMO NOTICE */}
        <div className="mb-8 rounded-2xl border border-[#D9E5CC] bg-[#EDF3E7] p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DCE9D1] font-bold text-[#4A7A24]">
              i
            </span>

            <div>
              <h3 className="font-semibold text-[#31551F]">
                Payment Demonstration
              </h3>

              <p className="mt-1 text-sm leading-6 text-[#66745B]">
                This is a school-project simulation. No real payment will
                be made. Please use demo information only.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">

          {/* BOOKING SUMMARY */}
          <section className="h-fit overflow-hidden rounded-[28px] border border-[#E9E6DD] bg-white shadow-sm">

            <div className="border-b border-[#E9E6DD] p-6 md:p-8">

              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#638D35]">
                Your reservation
              </p>

              <h2 className="font-serif text-2xl text-[#10391A] md:text-3xl">
                Booking Summary
              </h2>

            </div>

            <div className="p-6 md:p-8">

              {/* ROOM IMAGE */}
              <div className="mb-6 overflow-hidden rounded-2xl bg-[#E8E5DA]">
                <img
                  src={room.image || '/images/mi-casa-view.png'}
                  alt={room.name}
                  onError={(e) => {
                    e.currentTarget.src = '/images/mi-casa-view.png'
                  }}
                  className="h-56 w-full object-cover"
                />
              </div>

              <h3 className="mb-2 font-serif text-2xl text-[#10391A]">
                {room.name}
              </h3>

              <p className="mb-6 text-sm text-gray-500">
                Mi Casa De Cagsawa
              </p>

              <div className="space-y-5">

                <div className="grid grid-cols-2 gap-4">

                  <div className="rounded-xl bg-[#F9F8F3] p-4">
                    <p className="mb-2 text-xs text-gray-500">
                      Check-in
                    </p>

                    <p className="text-sm font-semibold text-[#3E631D]">
                      {formatDate(checkIn)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#F9F8F3] p-4">
                    <p className="mb-2 text-xs text-gray-500">
                      Check-out
                    </p>

                    <p className="text-sm font-semibold text-[#3E631D]">
                      {formatDate(checkOut)}
                    </p>
                  </div>

                </div>

                <div className="flex items-center justify-between border-b border-[#E9E6DD] pb-5 text-sm">
                  <span className="text-gray-500">Number of guests</span>
                  <span className="font-semibold">
                    {guests} {guests === 1 ? 'Guest' : 'Guests'}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-[#E9E6DD] pb-5 text-sm">
                  <span className="text-gray-500">Price per night</span>
                  <span className="font-semibold">
                    ₱{Number(room.price || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-[#E9E6DD] pb-5 text-sm">
                  <span className="text-gray-500">Booking status</span>

                  <span className="rounded-full bg-[#FFF3D8] px-3 py-1 text-xs font-semibold text-[#9A741F]">
                    {booking.status || 'Pending'}
                  </span>
                </div>

              </div>

              {/* TOTAL */}
              <div className="mt-7 rounded-2xl bg-[#10391A] p-6 text-white">

                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/60">
                  Total Accommodation Cost
                </p>

                <p className="font-serif text-4xl font-bold">
                  ₱{Number(totalPrice).toLocaleString()}
                </p>

                <p className="mt-2 text-sm text-white/60">
                  Based on your selected dates
                </p>

              </div>

            </div>

          </section>

          {/* PAYMENT SELECTION */}
          <section className="h-fit rounded-[28px] border border-[#E9E6DD] bg-white p-6 shadow-sm md:p-8">

            {!success ? (
              <>

                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#638D35]">
                  Payment Method
                </p>

                <h2 className="mb-2 font-serif text-2xl text-[#10391A] md:text-3xl">
                  Choose Payment
                </h2>

                <p className="mb-7 text-sm leading-6 text-gray-500">
                  Select your preferred option for the payment demo.
                </p>

                {/* GCASH */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('GCash')}
                  disabled={submitting}
                  className={`mb-4 w-full rounded-2xl border-2 p-5 text-left transition ${
                    paymentMethod === 'GCash'
                      ? 'border-[#4A7A24] bg-[#F2F6EC]'
                      : 'border-[#E9E6DD] bg-white hover:border-[#B8CBA6]'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center gap-4">

                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#E5F0DC] text-xl font-bold text-[#4A7A24]">
                      G
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-[#10391A]">
                        GCash
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Demo payment option
                      </p>
                    </div>

                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        paymentMethod === 'GCash'
                          ? 'border-[#4A7A24] bg-[#4A7A24] text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {paymentMethod === 'GCash' && '✓'}
                    </span>

                  </div>
                </button>

                {/* MARIBANK */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('MariBank')}
                  disabled={submitting}
                  className={`mb-7 w-full rounded-2xl border-2 p-5 text-left transition ${
                    paymentMethod === 'MariBank'
                      ? 'border-[#4A7A24] bg-[#F2F6EC]'
                      : 'border-[#E9E6DD] bg-white hover:border-[#B8CBA6]'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center gap-4">

                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#E5F0DC] text-xl font-bold text-[#4A7A24]">
                      M
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-[#10391A]">
                        MariBank
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Demo payment option
                      </p>
                    </div>

                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        paymentMethod === 'MariBank'
                          ? 'border-[#4A7A24] bg-[#4A7A24] text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {paymentMethod === 'MariBank' && '✓'}
                    </span>

                  </div>
                </button>

                {/* DEMO REFERENCE */}
                <div className="mb-6">

                  <label className="mb-2 block text-sm font-medium text-[#46513E]">
                    Demo Reference Number
                  </label>

                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="Enter a sample reference"
                    maxLength={30}
                    disabled={submitting}
                    className="w-full rounded-xl border border-[#DEDCCF] bg-white p-3 text-sm outline-none transition focus:border-[#4A7A24] focus:ring-1 focus:ring-[#4A7A24] disabled:opacity-50"
                  />

                  <p className="mt-2 text-xs leading-5 text-gray-400">
                    Enter a fictional reference for testing only.
                    This reference is not sent to any financial service.
                  </p>

                </div>

                {/* ERROR */}
                {error && (
                  <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* SUBMIT */}
                <button
                  type="button"
                  onClick={handleSubmitPayment}
                  disabled={submitting}
                  className="w-full rounded-full bg-[#4A7A24] px-6 py-4 font-semibold text-white transition hover:bg-[#3E631D] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? 'Submitting Demo...'
                    : 'Submit Demo Payment'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/my-bookings')}
                  className="mt-4 w-full rounded-full border border-[#D8DCCF] px-6 py-3.5 text-sm font-semibold text-[#4A7A24] transition hover:bg-[#F2F6EC]"
                >
                  My Bookings
                </button>

              </>
            ) : (

              /* SUCCESS */
              <div className="py-6 text-center">

                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#E5F0DC] text-4xl text-[#4A7A24]">
                  ✓
                </div>

                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#638D35]">
                  Demo submitted
                </p>

                <h2 className="mb-4 font-serif text-3xl text-[#10391A]">
                  Submission Complete!
                </h2>

                <p className="mb-7 text-sm leading-7 text-gray-500">
                  Your simulated payment submission has been saved.
                  The demo status is awaiting admin verification.
                </p>

                <div className="mb-6 rounded-2xl bg-[#F9F8F3] p-5 text-left">

                  <div className="mb-4 flex justify-between gap-3 text-sm">
                    <span className="text-gray-500">Method</span>
                    <span className="font-semibold text-[#10391A]">
                      {paymentMethod}
                    </span>
                  </div>

                  <div className="mb-4 flex justify-between gap-3 text-sm">
                    <span className="text-gray-500">Demo Reference</span>
                    <span className="break-all font-semibold text-[#10391A]">
                      {referenceNumber}
                    </span>
                  </div>

                  <div className="mb-4 flex justify-between gap-3 text-sm">
                    <span className="text-gray-500">Payment Status</span>
                    <span className="font-semibold text-[#9A741F]">
                      Submitted
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 border-t border-[#E5E2D9] pt-4">
                    <span className="font-semibold text-[#10391A]">
                      Total
                    </span>

                    <span className="text-lg font-bold text-[#4A7A24]">
                      ₱{Number(totalPrice).toLocaleString()}
                    </span>
                  </div>

                </div>

                <button
                  onClick={() => navigate('/my-bookings')}
                  className="w-full rounded-full bg-[#4A7A24] px-6 py-4 font-semibold text-white transition hover:bg-[#3E631D]"
                >
                  View My Bookings
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="mt-3 w-full rounded-full border border-[#D8DCCF] px-6 py-3.5 font-semibold text-[#4A7A24] transition hover:bg-[#F2F6EC]"
                >
                  Back to Home
                </button>

              </div>
            )}

          </section>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="mt-16 bg-[#10391A] px-6 py-10 text-white">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row">

          <div className="flex items-center gap-3">
            <img
              src="/images/mi-casa-logo.png"
              alt="Mi Casa Logo"
              className="h-11 w-auto object-contain"
            />

            <div>
              <p className="font-semibold tracking-wide">
                Mi Casa Express
              </p>

              <p className="text-xs text-white/60">
                Comfort feels like home.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="text-sm text-white/70 transition hover:text-white"
          >
            Back to Home ↑
          </button>

        </div>

        <div className="mx-auto mt-7 max-w-7xl border-t border-white/15 pt-5 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Mi Casa De Cagsawa. All rights reserved.
        </div>

      </footer>

    </div>
  )
}

export default PaymentPage
