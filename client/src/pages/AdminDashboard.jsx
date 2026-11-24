
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import familySuite from '../assets/rooms/family-suite.png'
import barkadaRoom from '../assets/rooms/barkada-room.png'
import coupleRoom from '../assets/rooms/couple-room.png'
import deluxeRoom from '../assets/rooms/deluxe-room.png'

const API_URL = 'http://localhost:5000/api'

const emptyRoom = {
  name: '',
  description: '',
  roomType: '',
  price: '',
  capacity: '',
  amenities: '',
  image: '',
  status: 'Available'
}

const roomImages = {
  'Family Suite': familySuite,
  'Barkada Room': barkadaRoom,
  'Couple Room': coupleRoom,
  'Deluxe Room': deluxeRoom
}

function formatPrice(price) {
  return `₱${Number(price || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

function formatDate(date) {
  if (!date) return 'N/A'

  return new Date(date).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
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
      return 'bg-amber-100 text-amber-800'
  }
}

function getRoomStatusStyle(status) {
  return status === 'Available'
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-700'
}

function getPaymentStatusStyle(status) {
  switch (status) {
    case 'Submitted':
      return 'bg-amber-100 text-amber-800'
    case 'Verified':
      return 'bg-green-100 text-green-800'
    case 'Rejected':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export default function AdminDashboard() {
  const navigate = useNavigate()

  const [rooms, setRooms] = useState([])
  const [bookings, setBookings] = useState([])
  const [customers, setCustomers] = useState([])

  const [loading, setLoading] = useState(true)
  const [customerLoading, setCustomerLoading] = useState(false)
  const [customerError, setCustomerError] = useState('')
  const [dashboardError, setDashboardError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)
  const [form, setForm] = useState(emptyRoom)
  const [saving, setSaving] = useState(false)

  const [bookingFilter, setBookingFilter] = useState('All')
  const [updatingBooking, setUpdatingBooking] = useState(null)

  const [paymentFilter, setPaymentFilter] = useState('Submitted')
  const [updatingPayment, setUpdatingPayment] = useState(null)

  const [customerSearch, setCustomerSearch] = useState('')
  const [activeSection, setActiveSection] = useState('dashboard')

  const token = localStorage.getItem('token')

  let user = {}

  try {
    user = JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    user = {}
  }

  useEffect(() => {
    if (!token || user.role !== 'admin') {
      alert('Access denied. Admin only.')
      navigate('/')
      return
    }

    fetchDashboardData()
  }, [])

  // LOAD DASHBOARD DATA
  const fetchDashboardData = async () => {
    try {
      setDashboardError('')

      const [roomResponse, bookingResponse] = await Promise.all([
        fetch(`${API_URL}/rooms`),
        fetch(`${API_URL}/bookings`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      ])

      const roomData = await roomResponse.json()
      const bookingData = await bookingResponse.json()

      if (!roomResponse.ok) {
        throw new Error(roomData.message || 'Failed to load rooms.')
      }

      if (!bookingResponse.ok) {
        throw new Error(bookingData.message || 'Failed to load bookings.')
      }

      setRooms(roomData.rooms || roomData || [])
      setBookings(bookingData.bookings || bookingData || [])

      await fetchCustomers()
    } catch (error) {
      console.error(error)
      setDashboardError(error.message || 'Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  // LOAD CUSTOMERS
  const fetchCustomers = async () => {
    setCustomerLoading(true)
    setCustomerError('')

    try {
      const response = await fetch(`${API_URL}/users/customers`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load customers.')
      }

      setCustomers(data.customers || [])
    } catch (error) {
      console.error(error)
      setCustomerError(error.message || 'Failed to load customers.')
    } finally {
      setCustomerLoading(false)
    }
  }

  // STATISTICS
  const pendingBookings = bookings.filter(
    booking => booking.status === 'Pending'
  ).length

  const confirmedBookings = bookings.filter(
    booking => booking.status === 'Confirmed'
  ).length

  const stats = [
    {
      title: 'Total Rooms',
      value: rooms.length,
      icon: '🏡',
      description: 'Registered rooms'
    },
    {
      title: 'Total Customers',
      value: customers.length,
      icon: '👥',
      description: 'Registered customers'
    },
    {
      title: 'Total Bookings',
      value: bookings.length,
      icon: '📋',
      description: 'All reservations'
    },
    {
      title: 'Pending Bookings',
      value: pendingBookings,
      icon: '🕒',
      description: 'Awaiting confirmation'
    },
    {
      title: 'Confirmed Bookings',
      value: confirmedBookings,
      icon: '✓',
      description: 'Confirmed reservations'
    }
  ]

  // PAYMENT STATISTICS
  const submittedPayments = bookings.filter(
    booking => booking.payment?.paymentStatus === 'Submitted'
  ).length

  const verifiedPayments = bookings.filter(
    booking => booking.payment?.paymentStatus === 'Verified'
  ).length

  const rejectedPayments = bookings.filter(
    booking => booking.payment?.paymentStatus === 'Rejected'
  ).length

  const unpaidPayments = bookings.filter(
    booking =>
      !booking.payment?.paymentStatus ||
      booking.payment.paymentStatus === 'Unpaid'
  ).length

  // NAVIGATION
  const scrollToSection = (section) => {
    setActiveSection(section)

    if (section === 'dashboard') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
      return
    }

    document.getElementById(section)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  // ADD ROOM
  const openAddModal = () => {
    setEditingRoom(null)
    setForm({ ...emptyRoom })
    setModalOpen(true)
  }

  // EDIT ROOM
  const openEditModal = (room) => {
    setEditingRoom(room)

    setForm({
      name: room.name || '',
      description: room.description || '',
      roomType: room.roomType || '',
      price: room.price ?? '',
      capacity: room.capacity ?? '',
      amenities: (room.amenities || []).join(', '),
      image: room.image || '',
      status: room.status || 'Available'
    })

    setModalOpen(true)
  }

  // SAVE ROOM
  const handleSaveRoom = async (e) => {
    e.preventDefault()
    setSaving(true)

    const roomData = {
      ...form,
      price: Number(form.price),
      capacity: Number(form.capacity),
      amenities: form.amenities
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
    }

    try {
      const response = await fetch(
        editingRoom
          ? `${API_URL}/rooms/${editingRoom._id}`
          : `${API_URL}/rooms`,
        {
          method: editingRoom ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(roomData)
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save room.')
      }

      alert(data.message || 'Room saved successfully!')

      setModalOpen(false)
      setForm({ ...emptyRoom })
      setEditingRoom(null)

      await fetchDashboardData()
    } catch (error) {
      alert(error.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  // DELETE ROOM
  const handleDeleteRoom = async (room) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${room.name}"?`
    )

    if (!confirmed) return

    try {
      const response = await fetch(`${API_URL}/rooms/${room._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete room.')
      }

      alert(data.message || 'Room deleted successfully!')
      await fetchDashboardData()
    } catch (error) {
      alert(error.message || 'Failed to delete room.')
    }
  }

  // UPDATE BOOKING STATUS
  const handleBookingStatus = async (bookingId, newStatus) => {
    setUpdatingBooking(bookingId)

    try {
      const response = await fetch(
        `${API_URL}/bookings/${bookingId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            status: newStatus
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update booking status.')
      }

      setBookings(prev =>
        prev.map(booking =>
          booking._id === bookingId
            ? { ...booking, status: newStatus }
            : booking
        )
      )

      alert(data.message || 'Booking status updated successfully!')
    } catch (error) {
      alert(error.message || 'Failed to update booking status.')
      await fetchDashboardData()
    } finally {
      setUpdatingBooking(null)
    }
  }

  // UPDATE DEMO PAYMENT STATUS
  const handlePaymentStatus = async (bookingId, paymentStatus) => {
    const action = paymentStatus === 'Verified' ? 'verify' : 'reject'

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this demo payment?`
    )

    if (!confirmed) return

    setUpdatingPayment(bookingId)

    try {
      const response = await fetch(
        `${API_URL}/bookings/${bookingId}/payment-status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ paymentStatus })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update payment status.')
      }

      if (data.booking) {
        setBookings(prev =>
          prev.map(booking =>
            booking._id === bookingId ? data.booking : booking
          )
        )
      } else {
        await fetchDashboardData()
      }

      alert(data.message || `Demo payment ${paymentStatus.toLowerCase()}!`)
    } catch (error) {
      alert(error.message || 'Failed to update demo payment.')
      await fetchDashboardData()
    } finally {
      setUpdatingPayment(null)
    }
  }

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  // FILTER BOOKINGS
  const filteredBookings = bookings.filter(booking =>
    bookingFilter === 'All' || booking.status === bookingFilter
  )

  // FILTER PAYMENTS
  const filteredPayments = bookings.filter(booking => {
    const status = booking.payment?.paymentStatus || 'Unpaid'

    return paymentFilter === 'All' || status === paymentFilter
  })

  // FILTER CUSTOMERS
  const filteredCustomers = customers.filter(customer => {
    const search = customerSearch.toLowerCase().trim()

    return (
      customer.fullName?.toLowerCase().includes(search) ||
      customer.email?.toLowerCase().includes(search)
    )
  })

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F8F3] flex flex-col items-center justify-center text-[#10391A]">
        <div className="w-12 h-12 border-4 border-[#DCE5D2] border-t-[#4A7A24] rounded-full animate-spin mb-5" />
        <p className="font-medium">Preparing your dashboard...</p>
        <p className="text-sm text-gray-500 mt-2">
          Mi Casa De Cagsawa Administration
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F8F3] text-[#10391A] md:flex">

      {/* SIDEBAR */}
      <aside className="bg-[#10391A] text-white md:w-64 md:min-h-screen md:fixed md:inset-y-0 md:left-0 md:z-30 flex flex-col">

        {/* BRAND */}
        <div className="px-6 py-7 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src="/images/mi-casa-logo.png"
              alt="Mi Casa De Cagsawa"
              className="w-12 h-12 object-contain"
            />

            <div>
              <h1 className="font-serif text-xl font-semibold">
                Mi Casa
              </h1>
              <p className="text-[10px] tracking-[0.25em] text-[#C8D7AE]">
                DE CAGSAWA
              </p>
            </div>
          </div>

          <p className="text-xs text-[#C8D7AE] mt-5 tracking-widest uppercase">
            Administration
          </p>
        </div>

        {/* NAVIGATION */}
        <div className="p-5 flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4 px-3">
            Main Menu
          </p>

          <nav className="space-y-2">
            <button
              onClick={() => scrollToSection('dashboard')}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg transition ${
                activeSection === 'dashboard'
                  ? 'bg-[#4A7A24] text-white'
                  : 'text-white/75 hover:bg-white/10'
              }`}
            >
              <span>▦</span>
              Dashboard
            </button>

            <button
              onClick={() => scrollToSection('room-management')}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg transition ${
                activeSection === 'room-management'
                  ? 'bg-[#4A7A24] text-white'
                  : 'text-white/75 hover:bg-white/10'
              }`}
            >
              <span>⌂</span>
              Room Management
            </button>

            <button
              onClick={() => scrollToSection('booking-management')}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg transition ${
                activeSection === 'booking-management'
          ? 'bg-[#4A7A24] text-white'
          : 'text-white/75 hover:bg-white/10'
              }`}
            >
              <span>▤</span>
              Booking Management
            </button>

            <button
              onClick={() => scrollToSection('payment-management')}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg transition ${
                activeSection === 'payment-management'
                  ? 'bg-[#4A7A24] text-white'
                  : 'text-white/75 hover:bg-white/10'
              }`}
            >
              <span>₱</span>
              Payment Management
            </button>

            <button
              onClick={() => scrollToSection('customer-management')}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg transition ${
                activeSection === 'customer-management'
                  ? 'bg-[#4A7A24] text-white'
                  : 'text-white/75 hover:bg-white/10'
              }`}
            >
              <span>♙</span>
              Customer Management
            </button>
          </nav>

          <div className="border-t border-white/10 my-6" />

          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg text-white/75 hover:bg-white/10 transition"
          >
            <span>↗</span>
            View Website
          </button>
        </div>

        {/* ADMIN PROFILE AND LOGOUT */}
        <div className="p-5 border-t border-white/10">
          <div className="mb-4 px-3">
            <p className="text-xs text-white/50">Logged in as</p>
            <p className="font-medium mt-1">
              {user.fullName || 'Administrator'}
            </p>
            <p className="text-xs text-[#C8D7AE]">
              Admin Account
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 rounded-lg text-red-200 hover:bg-red-500/20 transition"
          >
            ↪ Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 md:ml-64 p-5 md:p-8 lg:p-10">

        {/* TOP HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-9">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#638D35] mb-2">
              Mi Casa De Cagsawa
            </p>

            <h2 className="font-serif text-3xl md:text-4xl font-semibold">
              Dashboard Overview
            </h2>

            <p className="text-gray-500 mt-2">
              Welcome back! Here's an overview of your accommodation.
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
            className="bg-white border border-[#DCE2D5] text-[#3E631D] px-5 py-3 rounded-lg hover:bg-[#EDF2E7] transition"
          >
            ↻ Refresh Dashboard
          </button>
        </header>

        {/* DASHBOARD ERROR */}
        {dashboardError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-7">
            <p className="font-medium">{dashboardError}</p>
            <button
              onClick={fetchDashboardData}
              className="underline text-sm mt-2"
            >
              Try Again
            </button>
          </div>
        )}

        {/* WELCOME BANNER */}
        <section className="relative overflow-hidden rounded-2xl bg-[#10391A] text-white p-7 md:p-9 mb-8">
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-[#C8D7AE] mb-3">
              Management Portal
            </p>

            <h3 className="font-serif text-3xl md:text-4xl mb-3">
              Manage your home away from home.
            </h3>

            <p className="text-sm md:text-base text-[#E0E9D8] leading-relaxed">
              Keep track of room availability, customer reservations,
              and guest information all in one place.
            </p>
          </div>

          <div className="absolute -right-10 -bottom-24 w-64 h-64 rounded-full border border-white/10" />
          <div className="absolute -right-2 -bottom-16 w-48 h-48 rounded-full border border-white/10" />
        </section>

        {/* STATISTICS */}
        <section id="dashboard" className="scroll-mt-8 mb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-serif text-2xl font-semibold">
                At a Glance
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Your accommodation statistics
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-5">
            {stats.map(stat => (
              <div
                key={stat.title}
                className="bg-white border border-[#E9E9DF] rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    {stat.title}
                  </p>

                  <span className="w-10 h-10 flex items-center justify-center bg-[#EDF2E7] rounded-lg text-xl">
                    {stat.icon}
                  </span>
                </div>

                <h4 className="text-4xl font-semibold mt-5 text-[#10391A]">
                  {stat.value}
                </h4>

                <p className="text-xs text-gray-400 mt-2">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ROOM MANAGEMENT */}
        <section
          id="room-management"
          className="scroll-mt-8 bg-white border border-[#E9E9DF] rounded-2xl shadow-sm p-6 md:p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#638D35] mb-2">
                Accommodation
              </p>

              <h3 className="font-serif text-2xl font-semibold">
                Room Management
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Manage your available rooms and room information.
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="bg-[#4A7A24] text-white px-5 py-3 rounded-lg hover:bg-[#3E631D] transition"
            >
              + Add New Room
            </button>
          </div>

          {rooms.length === 0 ? (
            <div className="text-center py-14 bg-[#F9F8F3] rounded-xl">
              <p className="text-4xl mb-3">🏡</p>
              <h4 className="font-serif text-xl mb-2">
                No Rooms Available
              </h4>
              <p className="text-sm text-gray-500">
                Add your first room to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {rooms.map(room => {
                const roomImage = room.image || roomImages[room.name] || ''

                return (
                  <article
                    key={room._id}
                    className="border border-[#E9E9DF] rounded-xl overflow-hidden group hover:shadow-md transition"
                  >
                    <div className="h-56 bg-[#E8EBDD] flex items-center justify-center overflow-hidden">
                      {roomImage ? (
                        <img
                          src={roomImage}
                          alt={room.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="text-5xl text-[#638D35]">🏡</div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-serif text-xl font-semibold">
                            {room.name}
                          </h4>

                          <p className="text-sm text-gray-500 mt-1">
                            {room.roomType}
                          </p>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getRoomStatusStyle(room.status)}`}>
                          {room.status}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                        {room.description || 'No room description available.'}
                      </p>

                      <div className="flex items-center justify-between border-t border-[#EAEAE3] mt-5 pt-4">
                        <div>
                          <p className="text-xs text-gray-400">
                            Price per night
                          </p>
                          <p className="text-xl font-semibold text-[#3E631D]">
                            {formatPrice(room.price)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-400">Capacity</p>
                          <p className="font-medium">{room.capacity} guests</p>
                        </div>
                      </div>

                      {room.amenities?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {room.amenities.slice(0, 3).map((amenity, index) => (
                            <span
                              key={index}
                              className="bg-[#F1F3EC] text-[#526B3E] text-xs px-2 py-1 rounded"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-3 mt-5">
                        <button
                          onClick={() => openEditModal(room)}
                          className="flex-1 border border-[#4A7A24] text-[#3E631D] py-2.5 rounded-lg hover:bg-[#EDF2E7] transition"
                        >
                          Edit Room
                        </button>

                        <button
                          onClick={() => handleDeleteRoom(room)}
                          className="px-4 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* BOOKING MANAGEMENT */}
        <section
          id="booking-management"
          className="scroll-mt-8 bg-white border border-[#E9E9DF] rounded-2xl shadow-sm p-6 md:p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#638D35] mb-2">
                Reservations
              </p>

              <h3 className="font-serif text-2xl font-semibold">
                Booking Management
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Review reservations and update booking statuses.
              </p>
            </div>

            <button
              onClick={fetchDashboardData}
              className="text-[#4A7A24] text-sm font-medium hover:underline"
            >
              ↻ Refresh Bookings
            </button>
          </div>

          {/* BOOKING FILTER */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Filter by Booking Status
              </label>

              <select
                value={bookingFilter}
                onChange={e => setBookingFilter(e.target.value)}
                className="border border-[#DCE2D5] bg-[#F9F8F3] rounded-lg p-3 w-full sm:w-64 outline-none focus:ring-2 focus:ring-[#A8BD8E]"
              >
                <option value="All">All Bookings</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <p className="text-sm text-gray-500">
              Showing <strong>{filteredBookings.length}</strong> of {bookings.length} bookings
            </p>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-[#F9F8F3] rounded-xl">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-500">No bookings found for this status.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[#E9E9DF]">
              <table className="w-full text-left min-w-[1050px]">
                <thead className="bg-[#F1F3EC]">
                  <tr className="text-xs uppercase tracking-wider text-[#526B3E]">
                    <th className="py-4 px-4">Customer</th>
                    <th className="py-4 px-4">Room</th>
                    <th className="py-4 px-4">Check-in</th>
                    <th className="py-4 px-4">Check-out</th>
                    <th className="py-4 px-4">Guests</th>
                    <th className="py-4 px-4">Total Price</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">Manage</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.map(booking => (
                    <tr
                      key={booking._id}
                      className="border-t border-[#E9E9DF] hover:bg-[#FAFBF8] transition"
                    >
                      <td className="py-4 px-4">
                        <p className="font-medium text-[#10391A]">
                          {booking.user?.fullName || 'Guest'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {booking.user?.email || 'No email'}
                        </p>
                      </td>

                      <td className="py-4 px-4 font-medium">
                        {booking.room?.name || 'Room'}
                      </td>

                      <td className="py-4 px-4 text-sm text-gray-600">
                        {formatDate(booking.checkIn)}
                      </td>

                      <td className="py-4 px-4 text-sm text-gray-600">
                        {formatDate(booking.checkOut)}
                      </td>

                      <td className="py-4 px-4">
                        {booking.guests || 0}
                      </td>

                      <td className="py-4 px-4 font-medium">
                        {formatPrice(booking.totalPrice)}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusStyle(booking.status)}`}>
                          {booking.status || 'Pending'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <select
                          value={booking.status || 'Pending'}
                          disabled={updatingBooking === booking._id}
                          onChange={e =>
                            handleBookingStatus(booking._id, e.target.value)
                          }
                          className="border border-[#DCE2D5] rounded-lg p-2 text-sm bg-white outline-none focus:ring-2 focus:ring-[#A8BD8E] disabled:opacity-50"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        {updatingBooking === booking._id && (
                          <p className="text-xs text-gray-500 mt-1">Updating...</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* PAYMENT MANAGEMENT */}
        <section
          id="payment-management"
          className="scroll-mt-8 bg-white border border-[#E9E9DF] rounded-2xl shadow-sm p-6 md:p-8 mb-8"
        >
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#638D35] mb-2">
                Demo Payment Review
              </p>

              <h3 className="font-serif text-2xl font-semibold">
                Payment Management
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Review and manage simulated payment submissions.
              </p>
            </div>

            <button
              onClick={fetchDashboardData}
              className="text-[#4A7A24] text-sm font-medium hover:underline"
            >
              ↻ Refresh Payments
            </button>
          </div>

          {/* PAYMENT SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
              <p className="text-sm text-amber-700">Submitted</p>
              <h4 className="text-3xl font-semibold text-amber-800 mt-2">
                {submittedPayments}
              </h4>
              <p className="text-xs text-amber-600 mt-1">Awaiting review</p>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-xl p-5">
              <p className="text-sm text-green-700">Verified</p>
              <h4 className="text-3xl font-semibold text-green-800 mt-2">
                {verifiedPayments}
              </h4>
              <p className="text-xs text-green-600 mt-1">Marked as verified</p>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-5">
              <p className="text-sm text-red-700">Rejected</p>
              <h4 className="text-3xl font-semibold text-red-800 mt-2">
                {rejectedPayments}
              </h4>
              <p className="text-xs text-red-600 mt-1">Rejected submissions</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <p className="text-sm text-gray-600">Unpaid</p>
              <h4 className="text-3xl font-semibold text-gray-800 mt-2">
                {unpaidPayments}
              </h4>
              <p className="text-xs text-gray-500 mt-1">No submission yet</p>
            </div>
          </div>

          {/* PAYMENT FILTER */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Filter by Payment Status
              </label>

              <select
                value={paymentFilter}
                onChange={e => setPaymentFilter(e.target.value)}
                className="border border-[#DCE2D5] bg-[#F9F8F3] rounded-lg p-3 w-full sm:w-64 outline-none focus:ring-2 focus:ring-[#A8BD8E]"
              >
                <option value="Submitted">Submitted</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
                <option value="Unpaid">Unpaid</option>
                <option value="All">All Payments</option>
              </select>
            </div>

            <p className="text-sm text-gray-500">
              Showing <strong>{filteredPayments.length}</strong> of {bookings.length} bookings
            </p>
          </div>

          {/* PAYMENT TABLE */}
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12 bg-[#F9F8F3] rounded-xl">
              <p className="text-4xl mb-3">💳</p>
              <h4 className="font-serif text-xl mb-2">
                No Payments Found
              </h4>
              <p className="text-sm text-gray-500">
                There are no bookings under this payment status.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[#E9E9DF]">
              <table className="w-full text-left min-w-[1200px]">
                <thead className="bg-[#F1F3EC]">
                  <tr className="text-xs uppercase tracking-wider text-[#526B3E]">
                    <th className="py-4 px-4">Customer</th>
                    <th className="py-4 px-4">Room</th>
                    <th className="py-4 px-4">Stay Dates</th>
                    <th className="py-4 px-4">Amount</th>
                    <th className="py-4 px-4">Method</th>
                    <th className="py-4 px-4">Submitted</th>
                    <th className="py-4 px-4">Payment Status</th>
                    <th className="py-4 px-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPayments.map(booking => {
                    const paymentStatus =
                      booking.payment?.paymentStatus || 'Unpaid'

                    return (
                      <tr
                        key={booking._id}
                        className="border-t border-[#E9E9DF] hover:bg-[#FAFBF8] transition"
                      >
                        {/* CUSTOMER */}
                        <td className="py-4 px-4">
                          <p className="font-medium text-[#10391A]">
                            {booking.user?.fullName || 'Guest'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {booking.user?.email || 'No email'}
                          </p>
                        </td>

                        {/* ROOM */}
                        <td className="py-4 px-4 font-medium">
                          {booking.room?.name || 'Room'}
                        </td>

                        {/* STAY DATES */}
                        <td className="py-4 px-4 text-sm text-gray-600">
                          <p>In: {formatDate(booking.checkIn)}</p>
                          <p className="mt-1">Out: {formatDate(booking.checkOut)}</p>
                        </td>

                        {/* AMOUNT */}
                        <td className="py-4 px-4 font-semibold text-[#3E631D]">
                          {formatPrice(booking.totalPrice)}
                        </td>

                        {/* PAYMENT METHOD */}
                        <td className="py-4 px-4">
                          {booking.payment?.method || 'Not Selected'}
                        </td>

                        {/* SUBMITTED DATE */}
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {booking.payment?.submittedAt
                            ? formatDate(booking.payment.submittedAt)
                            : 'N/A'}
                        </td>

                        {/* PAYMENT STATUS */}
                        <td className="py-4 px-4">
                          <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium ${getPaymentStatusStyle(paymentStatus)}`}>
                            {paymentStatus}
                          </span>
                        </td>

                        {/* ACTION */}
                        <td className="py-4 px-4">
                          {paymentStatus === 'Submitted' ? (
                            <div className="flex flex-col gap-2 min-w-[110px]">
                              <button
                                disabled={updatingPayment === booking._id}
                                onClick={() =>
                                  handlePaymentStatus(booking._id, 'Verified')
                                }
                                className="bg-[#4A7A24] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#3E631D] transition disabled:opacity-50"
                              >
                                {updatingPayment === booking._id
                                  ? 'Updating...'
                                  : 'Verify'}
                              </button>

                              <button
                                disabled={updatingPayment === booking._id}
                                onClick={() =>
                                  handlePaymentStatus(booking._id, 'Rejected')
                                }
                                className="border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-50 transition disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">
                              No action available
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* DEMO NOTICE */}
          <div className="mt-5 bg-[#F1F3EC] border border-[#E1E8D9] rounded-xl p-4">
            <p className="text-sm text-[#526B3E]">
              <strong>Demo Notice:</strong> Payment statuses on this page are for
              project simulation purposes only. No real payment is processed or
              verified through this dashboard.
            </p>
          </div>
        </section>

        {/* CUSTOMER MANAGEMENT */}
        <section
          id="customer-management"
          className="scroll-mt-8 bg-white border border-[#E9E9DF] rounded-2xl shadow-sm p-6 md:p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#638D35] mb-2">
                Guest Information
              </p>

              <h3 className="font-serif text-2xl font-semibold">
                Customer Management
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                View and search registered customers.
              </p>
            </div>

            <button
              onClick={fetchCustomers}
              disabled={customerLoading}
              className="text-[#4A7A24] text-sm font-medium hover:underline disabled:opacity-50"
            >
              {customerLoading ? 'Refreshing...' : '↻ Refresh Customers'}
            </button>
          </div>

          {/* CUSTOMER SUMMARY */}
          <div className="bg-[#F1F3EC] rounded-xl p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Registered Customers</p>

              <h4 className="font-serif text-3xl font-semibold mt-1">
                {customers.length}
              </h4>
            </div>

            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl">
              👥
            </div>
          </div>

          {/* SEARCH */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Search Customer
            </label>

            <input
              type="text"
              value={customerSearch}
              onChange={e => setCustomerSearch(e.target.value)}
              placeholder="Search by customer name or email..."
              className="border border-[#DCE2D5] bg-[#F9F8F3] rounded-lg p-3 w-full sm:max-w-md outline-none focus:ring-2 focus:ring-[#A8BD8E]"
            />
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Showing {filteredCustomers.length} of {customers.length} customers
          </p>

          {customerLoading ? (
            <div className="text-center py-10 text-gray-500">
              Loading customers...
            </div>
          ) : customerError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              <p>{customerError}</p>

              <button
                onClick={fetchCustomers}
                className="mt-2 font-medium underline"
              >
                Try Again
              </button>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12 bg-[#F9F8F3] rounded-xl">
              <p className="text-4xl mb-3">👤</p>
              <p className="text-gray-500">
                {customerSearch
                  ? 'No customers matched your search.'
                  : 'No registered customers yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[#E9E9DF]">
              <table className="w-full text-left min-w-[650px]">
                <thead className="bg-[#F1F3EC]">
                  <tr className="text-xs uppercase tracking-wider text-[#526B3E]">
                    <th className="py-4 px-4">Customer Name</th>
                    <th className="py-4 px-4">Email Address</th>
                    <th className="py-4 px-4">Registration Date</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map(customer => (
                    <tr
                      key={customer._id}
                      className="border-t border-[#E9E9DF] hover:bg-[#FAFBF8] transition"
                    >
                      <td className="py-4 px-4">
                        <p className="font-medium text-[#10391A]">
                          {customer.fullName || 'Unnamed Customer'}
                        </p>
                      </td>

                      <td className="py-4 px-4 text-gray-600">
                        {customer.email || 'No email'}
                      </td>

                      <td className="py-4 px-4 text-gray-600">
                        {formatDate(customer.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[#E2E5DA] pt-6 pb-3 flex flex-col sm:flex-row justify-between gap-3 text-sm text-gray-500">
          <p>© 2026 Mi Casa De Cagsawa</p>
          <p>Administration Dashboard</p>
        </footer>

      </main>

      {/* ADD / EDIT ROOM MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0B1F10]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F9F8F3] w-full max-w-2xl rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">

            {/* MODAL HEADER */}
            <div className="bg-[#10391A] text-white px-6 py-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#C8D7AE] mb-2">
                  Room Information
                </p>

                <h2 className="font-serif text-2xl">
                  {editingRoom ? 'Edit Room' : 'Add New Room'}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-white/70 hover:text-white text-3xl leading-none"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            {/* MODAL FORM */}
            <form onSubmit={handleSaveRoom} className="p-6 md:p-8 space-y-5">

              <div>
                <label className="block text-sm font-medium mb-2">
                  Room Name
                </label>

                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-[#DCE2D5] rounded-lg p-3 bg-white outline-none focus:ring-2 focus:ring-[#A8BD8E]"
                  placeholder="e.g. Family Suite"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>

                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-[#DCE2D5] rounded-lg p-3 bg-white outline-none focus:ring-2 focus:ring-[#A8BD8E] resize-none"
                  placeholder="Describe the room..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Room Type
                </label>

                <input
                  required
                  value={form.roomType}
                  onChange={e => setForm({ ...form, roomType: e.target.value })}
                  className="w-full border border-[#DCE2D5] rounded-lg p-3 bg-white outline-none focus:ring-2 focus:ring-[#A8BD8E]"
                  placeholder="e.g. Family, Couple, Deluxe"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Price per Night (₱)
                  </label>

                  <input
                    required
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    className="w-full border border-[#DCE2D5] rounded-lg p-3 bg-white outline-none focus:ring-2 focus:ring-[#A8BD8E]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Guest Capacity
                  </label>

                  <input
                    required
                    type="number"
                    min="1"
                    value={form.capacity}
                    onChange={e => setForm({ ...form, capacity: e.target.value })}
                    className="w-full border border-[#DCE2D5] rounded-lg p-3 bg-white outline-none focus:ring-2 focus:ring-[#A8BD8E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Amenities
                </label>

                <input
                  value={form.amenities}
                  onChange={e => setForm({ ...form, amenities: e.target.value })}
                  className="w-full border border-[#DCE2D5] rounded-lg p-3 bg-white outline-none focus:ring-2 focus:ring-[#A8BD8E]"
                  placeholder="WiFi, Air conditioning, TV (separate with commas)"
                />

                <p className="text-xs text-gray-400 mt-2">
                  Separate each amenity with a comma.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Image URL
                </label>

                <input
                  value={form.image}
                  onChange={e => setForm({ ...form, image: e.target.value })}
                  className="w-full border border-[#DCE2D5] rounded-lg p-3 bg-white outline-none focus:ring-2 focus:ring-[#A8BD8E]"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Room Status
                </label>

                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-[#DCE2D5] rounded-lg p-3 bg-white outline-none focus:ring-2 focus:ring-[#A8BD8E]"
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

              {/* FORM BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-[#E2E5DA]">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#4A7A24] text-white py-3 rounded-lg font-medium hover:bg-[#3E631D] transition disabled:opacity-50"
                >
                  {saving
                    ? 'Saving...'
                    : editingRoom
                      ? 'Update Room'
                      : 'Add Room'}
                </button>

                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 border border-[#C9D2BE] text-[#526B3E] py-3 rounded-lg hover:bg-[#EDF2E7] transition"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
