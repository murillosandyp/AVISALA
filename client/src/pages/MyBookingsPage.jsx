import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import familySuite from '../assets/rooms/family-suite.png'
import barkadaRoom from '../assets/rooms/barkada-room.png'
import coupleRoom from '../assets/rooms/couple-room.png'
import deluxeRoom from '../assets/rooms/deluxe-room.png'

const API_URL = 'http://localhost:5000/api/bookings'

const roomImages = {
  'Family Suite': familySuite,
  'Barkada Room': barkadaRoom,
  'Couple Room': coupleRoom,
  'Deluxe Room': deluxeRoom
}

function formatDate(date) {
  if (!date) return 'Not specified'

  return new Date(date).toLocaleDateString('en-PH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatPrice(price) {
  return `₱${Number(price || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

function getStatusStyle(status) {
  switch (String(status || '').toLowerCase()) {
    case 'confirmed':
      return 'bg-green-100 text-green-800'

    case 'cancelled':
      return 'bg-red-100 text-red-700'

    case 'completed':
      return 'bg-blue-100 text-blue-800'

    default:
      return 'bg-yellow-100 text-yellow-800'
  }
}

function getPaymentStyle(status) {
  switch (String(status || '').toLowerCase()) {
    case 'verified':
      return 'bg-green-100 text-green-800'

    case 'submitted':
      return 'bg-blue-100 text-blue-800'

    case 'rejected':
      return 'bg-red-100 text-red-700'

    case 'unpaid':
    case 'not selected':
    default:
      return 'bg-yellow-100 text-yellow-800'
  }
}

function getPaymentLabel(status) {
  const normalized = String(status || '').toLowerCase()

  switch (normalized) {
    case 'verified':
      return 'Verified'

    case 'submitted':
      return 'Submitted'

    case 'rejected':
      return 'Rejected'

    case 'unpaid':
    case 'not selected':
    default:
      return 'Unpaid'
  }
}

export default function MyBookingsPage() {
  const navigate = useNavigate()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelLoading, setCancelLoading] = useState(null)

  // Fetch user's bookings
  const fetchBookings = async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_URL}/my-bookings`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
        return
      }

      if (!response.ok) {
        throw new Error(
          data.message || 'Unable to load your bookings.'
        )
      }

      setBookings(
        Array.isArray(data) ? data : data.bookings || []
      )
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong.'
      )
    } finally {
      setLoading(false)
    }
  }

  // Load bookings when page opens
  useEffect(() => {
    fetchBookings()
  }, [])

  // Cancel booking
  const handleCancel = async (bookingId) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this booking?'
    )

    if (!confirmed) return

    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      setCancelLoading(bookingId)
      setError('')

      const response = await fetch(
        `${API_URL}/${bookingId}/cancel`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const data = await response.json()

      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
        return
      }

      if (!response.ok) {
        throw new Error(
          data.message || 'Unable to cancel booking.'
        )
      }

      await fetchBookings()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to cancel booking.'
      )
    } finally {
      setCancelLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F8F3] text-[#10391A]">

      {/* Navigation */}
      <nav className="bg-white border-b border-[#E7E8DF]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-3">
            <img
              src="/images/mi-casa-logo.png"
              alt="Mi Casa De Cagsawa"
              className="h-12 w-12 object-contain"
            />

            <div>
              <h1 className="font-serif text-xl font-semibold">
                Mi Casa
              </h1>

              <p className="text-xs tracking-widest text-[#638D35]">
                DE CAGSAWA
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-5 text-sm font-medium">
            <Link to="/" className="hover:text-[#638D35]">
              Home
            </Link>

            <Link to="/profile" className="hover:text-[#638D35]">
              Profile
            </Link>

            <Link
              to="/my-bookings"
              className="text-[#638D35] font-semibold"
            >
              My Bookings
            </Link>
          </div>

        </div>
      </nav>

      {/* Page Header */}
      <section className="bg-[#10391A] text-white px-6 py-14">
        <div className="max-w-7xl mx-auto">

          <p className="text-sm tracking-[0.25em] text-[#C8D7AE] uppercase mb-3">
            Your Reservations
          </p>

          <h1 className="font-serif text-4xl md:text-5xl mb-4">
            My Bookings
          </h1>

          <p className="text-[#E2E9D8] max-w-xl">
            View and manage your reservations at Mi Casa De Cagsawa.
          </p>

        </div>
      </section>

      {/* Booking Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* Booking Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">

          <div>
            <h2 className="font-serif text-2xl font-semibold">
              Your Reservations
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {bookings.length} booking(s) found
            </p>
          </div>

          <button
            onClick={fetchBookings}
            disabled={loading}
            className="border border-[#4A7A24] text-[#3E631D] px-5 py-2.5 rounded hover:bg-[#4A7A24] hover:text-white transition disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh Bookings'}
          </button>

        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">

            <div className="animate-spin h-10 w-10 border-4 border-[#638D35] border-t-transparent rounded-full mx-auto mb-4" />

            <p className="text-gray-500">
              Loading your bookings...
            </p>

          </div>
        )}

        {/* Empty State */}
        {!loading && !error && bookings.length === 0 && (
          <div className="bg-white rounded-xl p-10 md:p-16 text-center shadow-sm">

            <div className="text-5xl mb-5">
              🏡
            </div>

            <h3 className="font-serif text-2xl mb-3">
              No Bookings Yet
            </h3>

            <p className="text-gray-500 mb-7">
              You haven't made any reservations yet.
              Explore our available rooms to get started.
            </p>

            <Link
              to="/"
              className="inline-block bg-[#4A7A24] text-white px-7 py-3 rounded hover:bg-[#3E631D] transition"
            >
              Explore Rooms
            </Link>

          </div>
        )}

        {/* Booking Cards */}
        {!loading && bookings.length > 0 && (
          <div className="space-y-7">

            {bookings.map((booking) => {
              const room =
                typeof booking.room === 'object'
                  ? booking.room
                  : null

              const roomName =
                room?.name || 'Room Reservation'

              const roomImage =
                room?.image ||
                room?.imageUrl ||
                room?.images?.[0] ||
                roomImages[roomName] ||
                ''

              const status =
                booking.status || 'Pending'

              const paymentStatus =
                booking.paymentStatus ||
                booking.payment?.status ||
                'Unpaid'

              const bookingId = booking._id

              const canCancel = [
                'pending',
                'confirmed'
              ].includes(String(status).toLowerCase())

              const totalPrice =
                booking.totalPrice ??
                booking.totalAmount ??
                booking.total ??
                booking.price ??
                0

              return (
                <article
                  key={bookingId}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#E9E9DF]"
                >

                  <div className="grid md:grid-cols-[520px_minmax(0,1fr)] lg:grid-cols-[580px_minmax(0,1fr)]">

                    {/* Room Image */}
                    <div className="w-full h-[340px] md:h-[460px] bg-[#E8EBDD] flex items-center justify-center p-2">

                      {roomImage ? (
                        <img
                          src={roomImage}
                          alt={roomName}
                          className="w-full h-full object-contain"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#638D35]">
                          <span className="text-6xl">
                            🏡
                          </span>
                        </div>
                      )}

                    </div>

                    {/* Booking Information */}
                    <div className="p-6 md:p-8">

                      {/* Booking Title and Status */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">

                        <div>
                          <p className="text-xs uppercase tracking-widest text-[#638D35] mb-2">
                            Room Reservation
                          </p>

                          <h3 className="font-serif text-2xl font-semibold">
                            {roomName}
                          </h3>

                          <p className="text-sm text-gray-400 mt-1">
                            Booking ID: {bookingId}
                          </p>
                        </div>

                        <span
                          className={`px-4 py-2 rounded-full text-xs font-semibold w-fit ${getStatusStyle(status)}`}
                        >
                          {status}
                        </span>

                      </div>

                      {/* Booking Details */}
                      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5 mb-7">

                        {/* Check-in */}
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                            Check-in
                          </p>

                          <p className="font-medium">
                            {formatDate(booking.checkIn)}
                          </p>
                        </div>

                        {/* Check-out */}
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                            Check-out
                          </p>

                          <p className="font-medium">
                            {formatDate(booking.checkOut)}
                          </p>
                        </div>

                        {/* Guests */}
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                            Number of Guests
                          </p>

                          <p className="font-medium">
                            {booking.guests || booking.numberOfGuests || 1}
                          </p>
                        </div>

                        {/* Room Price */}
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                            Room Price
                          </p>

                          <p className="font-medium">
                            {formatPrice(room?.price || booking.price)}
                          </p>
                        </div>

                      </div>

                      {/* Payment and Total */}
                      <div className="border-t border-[#EAEAE3] pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                        {/* Payment Status */}
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                            Payment Status
                          </p>

                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getPaymentStyle(paymentStatus)}`}
                          >
                            {getPaymentLabel(paymentStatus)}
                          </span>
                        </div>

                        {/* Total Amount */}
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                            Total Amount
                          </p>

                          <p className="text-2xl font-semibold text-[#3E631D]">
                            {formatPrice(totalPrice)}
                          </p>
                        </div>

                      </div>

                      {/* Cancel Booking */}
                      {canCancel && (
                        <div className="border-t border-[#EAEAE3] mt-5 pt-5 flex justify-end">

                          <button
                            onClick={() => handleCancel(bookingId)}
                            disabled={cancelLoading === bookingId}
                            className="border border-red-300 text-red-600 px-5 py-2 rounded hover:bg-red-50 transition disabled:opacity-50"
                          >
                            {cancelLoading === bookingId
                              ? 'Cancelling...'
                              : 'Cancel Booking'}
                          </button>

                        </div>
                      )}

                    </div>

                  </div>

                </article>
              )
            })}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#10391A] text-white px-6 py-10 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-6">

          <div>
            <h2 className="font-serif text-2xl mb-2">
              Mi Casa De Cagsawa
            </h2>

            <p className="text-sm text-[#D5E0CB]">
              Your comfortable home away from home.
            </p>
          </div>

          <div className="text-sm text-[#D5E0CB]">
            <p>Transient House Accommodation</p>

            <p className="mt-2">
              © 2026 Mi Casa De Cagsawa
            </p>
          </div>

        </div>
      </footer>

    </div>
  )
}