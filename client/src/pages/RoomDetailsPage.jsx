
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API_URL from '../api'

import familySuite from '../assets/rooms/family-suite.png'
import barkadaRoom from '../assets/rooms/barkada-room.png'
import coupleRoom from '../assets/rooms/couple-room.png'
import deluxeRoom from '../assets/rooms/deluxe-room.png'

const roomImages = {
  'Family Suite': familySuite,
  'Barkada Room': barkadaRoom,
  'Couple Room': coupleRoom,
  'Deluxe Room': deluxeRoom,
}

const getToday = () => {
  const date = new Date()

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const getNextDay = (date) => {
  if (!date) return ''

  const next = new Date(`${date}T12:00:00`)
  next.setDate(next.getDate() + 1)

  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`
}

export default function RoomDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showBooking, setShowBooking] = useState(false)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)

  const [submitting, setSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState('')

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`${API_URL}/rooms/${id}`)

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Room not found.')
        }

        setRoom(data.room || data)
      } catch (err) {
        setError(err.message || 'Unable to load room details.')
      } finally {
        setLoading(false)
      }
    }

    fetchRoom()
  }, [id])

  const nights =
    checkIn && checkOut
      ? Math.round(
          (new Date(`${checkOut}T12:00:00`) -
              new Date(`${checkIn}T12:00:00`)) /
              (1000 * 60 * 60 * 24)
        )
      : 0

  const totalPrice =
    nights > 0 ? nights * Number(room?.price || 0) : 0

  const handleBookingForm = () => {
    setShowBooking(!showBooking)
    setCheckIn('')
    setCheckOut('')
    setGuests(1)
    setBookingError('')
  }

  const handleCheckIn = (date) => {
    setCheckIn(date)

    if (!checkOut || checkOut <= date) {
      setCheckOut(getNextDay(date))
    }
  }

  const handleContinue = async () => {
    setBookingError('')

    if (!checkIn || !checkOut) {
      setBookingError('Please select your check-in and check-out dates.')
      return
    }

    if (checkIn < getToday()) {
      setBookingError('Check-in cannot be in the past.')
      return
    }

    if (checkOut <= checkIn) {
      setBookingError('Check-out must be after check-in.')
      return
    }

    if (guests < 1 || guests > room.capacity) {
      setBookingError(
        `This room can accommodate up to ${room.capacity} guests.`
      )
      return
    }

    const token = localStorage.getItem('token')

    if (!token) {
      sessionStorage.setItem(
        'pendingBooking',
        JSON.stringify({
          roomId: id,
          checkIn,
          checkOut,
          guests,
        })
      )

      navigate('/login', {
        state: { from: `/rooms/${id}` },
      })

      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          room: room._id,
          checkIn,
          checkOut,
          guests,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to create booking.')
      }

      sessionStorage.removeItem('pendingBooking')

      navigate('/payment', {
        state: {
          booking: data.booking,
          room,
          checkIn,
          checkOut,
          guests,
          totalPrice,
        },
      })
    } catch (err) {
      setBookingError(err.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F8F3]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#DCE7CE] border-t-[#4A7A24]" />
          <p className="text-sm text-[#64715B]">
            Preparing your room details...
          </p>
        </div>
      </div>
    )
  }

  if (error || !room) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F9F8F3] p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#638D35]">
          Mi Casa Express
        </p>

        <h2 className="font-serif text-4xl text-[#10391A]">
          Room not found
        </h2>

        <p className="text-gray-500">
          {error || 'This room does not exist.'}
        </p>

        <button
          onClick={() => navigate('/')}
          className="rounded-full bg-[#4A7A24] px-7 py-3 text-white transition hover:bg-[#3E631D]"
        >
          Back to Home
        </button>
      </div>
    )
  }

  const image =
    room.image || roomImages[room.name] || '/images/mi-casa-view.png'

  const isAvailable = room.status === 'Available'

  return (
    <div className="min-h-screen bg-[#F9F8F3] text-[#10391A]">

      {/* NAVIGATION */}
      <nav className="sticky top-0 z-40 border-b border-[#E8E5DA] bg-[#F9F8F3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">

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
            ← Back to Rooms
          </button>

        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">

        {/* BREADCRUMB */}
        <button
          onClick={() => navigate('/')}
          className="mb-8 text-sm text-[#638D35] transition hover:text-[#10391A]"
        >
          ← Home / Accommodation / {room.name}
        </button>

        {/* ROOM TITLE */}
        <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#638D35]">
              Discover your stay
            </p>

            <h1 className="font-serif text-4xl leading-tight text-[#10391A] md:text-6xl">
              {room.name}
            </h1>

            <p className="mt-3 text-sm text-[#77796F]">
              A welcoming space to relax and feel at home.
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-5 py-2 text-sm font-semibold ${
              isAvailable
                ? 'bg-[#E5F0DC] text-[#426C2C]'
                : 'bg-red-100 text-red-700'
            }`}
          >
            ● {room.status || 'Status unavailable'}
          </span>

        </div>

        {/* MAIN ROOM IMAGE */}
        <div className="relative mb-12 overflow-hidden rounded-[28px] bg-[#E8E5DA] shadow-sm">
          <img
            src={image}
            alt={room.name}
            onError={(e) => {
              e.currentTarget.src = '/images/mi-casa-view.png'
            }}
            className="h-[300px] w-full object-cover sm:h-[420px] lg:h-[530px]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

          <div className="absolute bottom-6 left-6 text-white md:bottom-9 md:left-10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em]">
              Mi Casa De Cagsawa
            </p>

            <p className="font-serif text-2xl md:text-4xl">
              Your comfort starts here.
            </p>
          </div>
        </div>

        {/* DETAILS AND BOOKING */}
        <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr]">

          {/* LEFT SIDE */}
          <div>

            {/* DESCRIPTION */}
            <section className="mb-12">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#638D35]">
                About this room
              </p>

              <h2 className="mb-5 max-w-2xl font-serif text-3xl leading-snug text-[#10391A] md:text-4xl">
                A comfortable space for your stay.
              </h2>

              <p className="max-w-2xl text-base leading-8 text-[#77796F]">
                {room.description ||
                  'Enjoy a relaxing and welcoming space during your stay at Mi Casa De Cagsawa.'}
              </p>
            </section>

            {/* ROOM INFORMATION */}
            <section className="mb-12">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#638D35]">
                The essentials
              </p>

              <h2 className="mb-6 font-serif text-2xl text-[#10391A] md:text-3xl">
                Room Information
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="rounded-2xl border border-[#E9E6DD] bg-white p-6 transition hover:shadow-sm">
                  <p className="mb-3 text-sm text-[#85877C]">
                    Guest Capacity
                  </p>

                  <p className="text-xl font-semibold text-[#3E631D]">
                    {room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#E9E6DD] bg-white p-6 transition hover:shadow-sm">
                  <p className="mb-3 text-sm text-[#85877C]">
                    Accommodation Type
                  </p>

                  <p className="text-xl font-semibold text-[#3E631D]">
                    {room.roomType || room.name}
                  </p>
                </div>

              </div>
            </section>

            {/* AMENITIES */}
            <section className="mb-12">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#638D35]">
                Enjoy your stay
              </p>

              <h2 className="mb-6 font-serif text-2xl text-[#10391A] md:text-3xl">
                What this room offers
              </h2>

              {room.amenities?.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {room.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 rounded-xl border border-[#E9E6DD] bg-white p-4 text-[#555D4D]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8F0DF] text-sm font-bold text-[#4A7A24]">
                        ✓
                      </span>

                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No amenities listed.
                </p>
              )}
            </section>

            {/* ABOUT MI CASA */}
            <section className="rounded-[28px] bg-[#EDEFE5] p-7 md:p-10">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#638D35]">
                A place to call your own
              </p>

              <h2 className="mb-4 font-serif text-3xl text-[#10391A] md:text-4xl">
                Comfort feels like home.
              </h2>

              <p className="max-w-2xl leading-8 text-[#697362]">
                Mi Casa De Cagsawa offers a welcoming transient house
                accommodation where you can relax, rest, and spend meaningful
                moments with family, friends, or loved ones.
              </p>

              <button
                onClick={() => navigate('/')}
                className="mt-6 border-b border-[#4A7A24] pb-1 text-sm font-semibold text-[#4A7A24] transition hover:text-[#10391A]"
              >
                Discover Mi Casa →
              </button>
            </section>

          </div>

          {/* RIGHT SIDE: BOOKING CARD */}
          <aside className="h-fit lg:sticky lg:top-28">

            <div className="overflow-hidden rounded-[26px] border border-[#E9E6DD] bg-white shadow-sm">

              <div className="p-6 md:p-8">

                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#638D35]">
                  Your accommodation
                </p>

                <h2 className="mb-5 font-serif text-2xl text-[#10391A]">
                  Plan your stay
                </h2>

                <div className="mb-6 border-b border-[#E9E6DD] pb-6">
                  <p className="text-3xl font-bold text-[#4A7A24]">
                    ₱{Number(room.price).toLocaleString()}
                    <span className="text-sm font-normal text-gray-500">
                      {' '}/ night
                    </span>
                  </p>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-3">

                  <div className="rounded-xl bg-[#F9F8F3] p-4">
                    <p className="mb-2 text-xs text-gray-500">
                      Capacity
                    </p>

                    <p className="font-semibold">
                      {room.capacity} guests
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#F9F8F3] p-4">
                    <p className="mb-2 text-xs text-gray-500">
                      Availability
                    </p>

                    <p
                      className={`font-semibold ${
                        isAvailable ? 'text-[#4A7A24]' : 'text-red-600'
                      }`}
                    >
                      {room.status}
                    </p>
                  </div>

                </div>

                <button
                  disabled={!isAvailable}
                  onClick={handleBookingForm}
                  className="w-full rounded-full bg-[#4A7A24] px-7 py-4 font-semibold text-white transition duration-300 hover:bg-[#3E631D] disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {!isAvailable
                    ? 'Room Unavailable'
                    : showBooking
                      ? 'Hide Booking Form'
                      : 'Book This Room'}
                </button>

                <p className="mt-4 text-center text-xs leading-6 text-gray-500">
                  Select your dates and number of guests to see your estimated
                  accommodation cost.
                </p>

                {/* BOOKING FORM */}
                {showBooking && isAvailable && (
                  <div className="mt-7 border-t border-[#E9E6DD] pt-6">

                    <h3 className="mb-5 font-serif text-2xl text-[#10391A]">
                      Your Booking
                    </h3>

                    {/* CHECK-IN */}
                    <div className="mb-4">
                      <label className="mb-2 block text-sm font-medium text-[#46513E]">
                        Check-in Date
                      </label>

                      <input
                        type="date"
                        min={getToday()}
                        value={checkIn}
                        onChange={(e) => handleCheckIn(e.target.value)}
                        className="w-full rounded-xl border border-[#DEDCCF] bg-white p-3 text-sm outline-none transition focus:border-[#4A7A24] focus:ring-1 focus:ring-[#4A7A24]"
                      />
                    </div>

                    {/* CHECK-OUT */}
                    <div className="mb-4">
                      <label className="mb-2 block text-sm font-medium text-[#46513E]">
                        Check-out Date
                      </label>

                      <input
                        type="date"
                        min={checkIn ? getNextDay(checkIn) : getToday()}
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full rounded-xl border border-[#DEDCCF] bg-white p-3 text-sm outline-none transition focus:border-[#4A7A24] focus:ring-1 focus:ring-[#4A7A24]"
                      />
                    </div>

                    {/* GUESTS */}
                    <div className="mb-5">
                      <label className="mb-2 block text-sm font-medium text-[#46513E]">
                        Number of Guests
                      </label>

                      <select
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full rounded-xl border border-[#DEDCCF] bg-white p-3 text-sm outline-none transition focus:border-[#4A7A24] focus:ring-1 focus:ring-[#4A7A24]"
                      >
                        {Array.from(
                          { length: room.capacity },
                          (_, i) => i + 1
                        ).map((number) => (
                          <option key={number} value={number}>
                            {number} {number === 1 ? 'Guest' : 'Guests'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* PRICE SUMMARY */}
                    <div className="mb-5 rounded-2xl bg-[#F9F8F3] p-5">

                      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-[#638D35]">
                        Price Summary
                      </p>

                      <div className="flex justify-between gap-3 text-sm text-gray-600">
                        <span>Price per night</span>
                        <span>
                          ₱{Number(room.price).toLocaleString()}
                        </span>
                      </div>

                      <div className="mt-3 flex justify-between gap-3 text-sm text-gray-600">
                        <span>Number of nights</span>
                        <span>{nights > 0 ? nights : 0}</span>
                      </div>

                      <div className="mt-4 border-t border-[#E5E2D9] pt-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-[#10391A]">
                            Total Price
                          </span>

                          <span className="text-xl font-bold text-[#4A7A24]">
                            ₱{totalPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* ERROR */}
                    {bookingError && (
                      <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                        {bookingError}
                      </div>
                    )}

                    {/* CONTINUE */}
                    <button
                      onClick={handleContinue}
                      disabled={submitting}
                      className="w-full rounded-full bg-[#4A7A24] px-6 py-3.5 font-semibold text-white transition hover:bg-[#3E631D] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting
                        ? 'Processing Booking...'
                        : 'Continue'}
                    </button>

                  </div>
                )}

              </div>
            </div>

            <p className="mt-5 text-center text-xs text-[#85877C]">
              Thank you for considering Mi Casa De Cagsawa.
            </p>

          </aside>

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
