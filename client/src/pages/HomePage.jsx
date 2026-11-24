
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

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

const FALLBACK_IMAGE = '/images/mi-casa-view.png'
const LOGO_IMAGE = '/images/mi-casa-logo.png'

export default function HomePage() {
  const navigate = useNavigate()

  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'))
    } catch {
      return null
    }
  })

  useEffect(() => {
    let isMounted = true

    const fetchRooms = async () => {
      try {
        const response = await fetch(`${API_URL}/rooms`)
        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load rooms.')
        }

        if (isMounted) {
          setRooms(Array.isArray(data.rooms) ? data.rooms : [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to connect to the server.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchRooms()

    return () => {
      isMounted = false
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  const scrollToRooms = () => {
    document.getElementById('rooms')?.scrollIntoView({
      behavior: 'smooth',
    })
  }

  const getRoomImage = (room) => {
    return room.image || roomImages[room.name] || FALLBACK_IMAGE
  }

  const formatPrice = (price) => {
    const amount = Number(price)

    return Number.isFinite(amount)
      ? `₱${amount.toLocaleString()}`
      : 'Price unavailable'
  }

  return (
    <div className="min-h-screen bg-[#F9F8F3] text-[#10391A]">

      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 border-b border-[#E8E5DA] bg-[#F9F8F3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-5 py-3 md:px-10">

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-left"
          >
            <img
              src={LOGO_IMAGE}
              alt="Mi Casa De Cagsawa Logo"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
              className="h-11 w-auto object-contain"
            />

            <div>
              <h1 className="font-serif text-xl font-bold text-[#10391A]">
                Mi Casa Express
              </h1>
              <p className="text-[9px] tracking-[0.18em] text-[#638D35]">
                COMFORT FEELS LIKE HOME
              </p>
            </div>
          </button>

          <div className="flex flex-wrap items-center justify-center gap-5 text-sm font-medium">
            <a href="#home" className="transition hover:text-[#638D35]">Home</a>
            <a href="#rooms" className="transition hover:text-[#638D35]">Rooms</a>
            <a href="#transient" className="transition hover:text-[#638D35]">Transient</a>
            <a href="#about" className="transition hover:text-[#638D35]">About</a>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {user ? (
              <>
                <button
                  onClick={() => navigate('/profile')}
                  className="rounded-full border border-[#4A7A24] px-4 py-2 text-xs transition hover:bg-[#4A7A24] hover:text-white"
                >
                  Profile
                </button>

                <button
                  onClick={() => navigate('/my-bookings')}
                  className="rounded-full border border-[#4A7A24] px-4 py-2 text-xs transition hover:bg-[#4A7A24] hover:text-white"
                >
                  Bookings
                </button>

                <button
                  onClick={handleLogout}
                  className="rounded-full bg-[#10391A] px-5 py-2 text-xs text-white transition hover:bg-[#4A7A24]"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="rounded-full bg-[#10391A] px-6 py-2 text-xs text-white transition hover:bg-[#4A7A24]"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section id="home" className="relative min-h-[480px] overflow-hidden md:min-h-[590px]">

        <img
          src={FALLBACK_IMAGE}
          alt="Mi Casa De Cagsawa transient house"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#102716]/90 via-[#102716]/55 to-transparent" />

        <div className="relative mx-auto flex min-h-[480px] max-w-[1500px] items-center px-7 py-16 md:min-h-[590px] md:px-16 lg:px-28">

          <div className="max-w-2xl text-white">

            <p className="mb-5 font-serif text-lg text-[#E3E9C9] md:text-xl">
              Welcome to
              <br />
              Mi Casa De Cagsawa
            </p>

            <h2 className="mb-6 font-serif text-5xl font-bold leading-[1.05] md:text-6xl lg:text-7xl">
              Your home away
              <br />
              from home.
            </h2>

            <p className="mb-8 max-w-lg text-sm leading-7 text-white/85 md:text-base">
              A welcoming transient house where you can slow down,
              relax, and enjoy a comfortable stay with family and friends.
            </p>

            <button
              onClick={scrollToRooms}
              className="rounded-full border border-white/80 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-[#10391A]"
            >
              Explore Our Rooms <span className="ml-2">→</span>
            </button>

          </div>
        </div>
      </section>

      {/* ACCOMMODATION */}
      <section id="rooms" className="scroll-mt-24 px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-[1500px] gap-8 lg:grid-cols-[230px_1fr] lg:items-center">

          <div>
            <p className="mb-3 font-serif text-lg font-bold text-[#638D35]">
              Our Accommodation
            </p>

            <div className="mb-5 h-0.5 w-14 bg-[#638D35]" />

            <h2 className="mb-5 font-serif text-4xl font-bold leading-tight">
              Find your perfect stay
            </h2>

            <p className="mb-7 text-sm leading-7 text-gray-600">
              Discover a space that suits your stay, from relaxing
              getaways to moments shared with family and friends.
            </p>

            <button
              onClick={scrollToRooms}
              className="rounded-full border border-[#4A7A24] px-6 py-2.5 text-sm font-semibold transition hover:bg-[#4A7A24] hover:text-white"
            >
              View All Rooms <span className="ml-2">→</span>
            </button>
          </div>

          <div>
            {loading ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-[#DCE7CE] border-t-[#4A7A24]" />
                <p className="text-sm text-gray-500">Loading rooms...</p>
              </div>
            ) : error ? (
              <div className="rounded-2xl bg-red-50 p-8 text-center">
                <p className="mb-4 text-sm text-red-600">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-full bg-[#4A7A24] px-6 py-2.5 text-sm text-white"
                >
                  Try Again
                </button>
              </div>
            ) : rooms.length === 0 ? (
              <p className="py-16 text-center text-gray-500">
                No rooms available at the moment.
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {rooms.map((room) => (
                  <article
                    key={room._id}
                    className="group overflow-hidden rounded-2xl border border-[#EAE5D9] bg-[#FDFBF5] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={getRoomImage(room)}
                        alt={room.name || 'Mi Casa room'}
                        onError={(e) => {
                          e.currentTarget.onerror = null
                          e.currentTarget.src = FALLBACK_IMAGE
                        }}
                        className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      <span
                        className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-semibold ${
                          room.status === 'Available'
                            ? 'bg-[#E5F0DC] text-[#426C2C]'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {room.status || 'Status unavailable'}
                      </span>
                    </div>

                    <div className="p-4">
                      <h3 className="mb-2 font-serif text-lg font-bold">
                        {room.name || 'Unnamed Room'}
                      </h3>

                      <p className="mb-4 min-h-[42px] text-xs leading-5 text-gray-600">
                        {room.description || 'A comfortable space for your stay.'}
                      </p>

                      <p className="mb-3 text-sm font-bold">
                        {formatPrice(room.price)}
                        <span className="font-normal text-gray-500"> / night</span>
                      </p>

                      <button
                        onClick={() => navigate(`/rooms/${room._id}`)}
                        className="w-full rounded-full bg-[#3E631D] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#10391A]"
                      >
                        View Room <span className="ml-1">→</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TRANSIENT HOUSE PROMOTION */}
      <section id="transient" className="scroll-mt-24 px-5 pb-16 md:px-10">
        <div className="relative mx-auto max-w-[1500px] overflow-hidden rounded-2xl bg-[#DDE2C4]">

          <img
            src={FALLBACK_IMAGE}
            alt="Mi Casa transient house accommodation"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.style.display = 'none'
            }}
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#DDE2C4] via-[#DDE2C4]/95 to-[#DDE2C4]/35" />

          <div className="relative flex flex-col items-start justify-between gap-6 px-7 py-10 md:flex-row md:items-center md:px-16">

            <div>
              <p className="mb-2 font-serif text-base font-bold text-[#638D35]">
                Short Stay · Transient House
              </p>

              <h2 className="font-serif text-3xl font-bold md:text-4xl">
                Need a place to rest for a while?
              </h2>

              <p className="mt-2 text-sm text-[#38512C]">
                Enjoy a comfortable and convenient short stay.
              </p>
            </div>

            <button
              onClick={scrollToRooms}
              className="shrink-0 rounded-full bg-[#10391A] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#4A7A24]"
            >
              Explore Rooms <span className="ml-2">→</span>
            </button>

          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="scroll-mt-24 bg-[#F9F8F3] px-6 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-2 md:items-center">

          <div>
            <p className="mb-3 font-serif text-lg font-bold text-[#638D35]">
              About Mi Casa
            </p>

            <h2 className="mb-5 font-serif text-3xl font-bold leading-tight md:text-4xl">
              More than a place to stay.
              <br />
              A place to feel at home.
            </h2>

            <p className="max-w-lg text-sm leading-7 text-gray-600">
              Mi Casa De Cagsawa is a welcoming transient house for guests
              seeking comfort, convenience, and relaxation. We believe
              that a good stay is more than just a room — it's the feeling
              of being comfortable, cared for, and at ease.
            </p>

            <button
              onClick={scrollToRooms}
              className="mt-6 rounded-full border border-[#4A7A24] px-6 py-2.5 text-sm font-semibold transition hover:bg-[#4A7A24] hover:text-white"
            >
              Explore Rooms <span className="ml-2">→</span>
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                icon: '⌂',
                title: 'Comfort',
                description: 'A relaxing space to unwind.',
              },
              {
                icon: '✧',
                title: 'Convenience',
                description: 'An easy and convenient stay.',
              },
              {
                icon: '♥',
                title: 'Warmth',
                description: 'A welcoming atmosphere.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col items-center border-[#D8D2C0] px-4 py-5 text-center sm:border-l"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E5E8D1] font-serif text-3xl text-[#3E631D]">
                  {item.icon}
                </div>

                <h3 className="mb-2 font-serif text-lg font-bold">
                  {item.title}
                </h3>

                <p className="text-xs leading-5 text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#10391A] px-6 py-12 text-white md:px-10">
        <div className="mx-auto max-w-[1500px]">

          {/* MAIN FOOTER */}
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

            {/* BRAND */}
            <div className="lg:col-span-1">
              <button
                onClick={() => navigate('/')}
                className="mb-4 flex items-center gap-3 text-left"
              >
                <img
                  src={LOGO_IMAGE}
                  alt="Mi Casa De Cagsawa Logo"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                  className="h-14 w-auto object-contain"
                />

                <div>
                  <h3 className="font-serif text-xl font-bold">
                    Mi Casa Express
                  </h3>
                  <p className="text-[9px] tracking-widest text-white/60">
                    COMFORT FEELS LIKE HOME
                  </p>
                </div>
              </button>

              <p className="max-w-xs text-sm leading-7 text-white/65">
                A welcoming transient house where comfort, warmth,
                and convenience come together for a relaxing stay.
              </p>
            </div>

            {/* QUICK LINKS */}
            <div>
              <h3 className="mb-5 font-serif text-lg font-bold text-[#DDE5C9]">
                Quick Links
              </h3>

              <ul className="space-y-3 text-sm text-white/70">
                <li>
                  <a href="#home" className="transition hover:text-[#DDE5C9]">
                    Home
                  </a>
                </li>

                <li>
                  <a href="#rooms" className="transition hover:text-[#DDE5C9]">
                    Our Rooms
                  </a>
                </li>

                <li>
                  <a href="#transient" className="transition hover:text-[#DDE5C9]">
                    Transient Accommodation
                  </a>
                </li>

                <li>
                  <a href="#about" className="transition hover:text-[#DDE5C9]">
                    About Us
                  </a>
                </li>
              </ul>
            </div>

            {/* CONTACT INFORMATION */}
            <div>
              <h3 className="mb-5 font-serif text-lg font-bold text-[#DDE5C9]">
                Contact Us
              </h3>

              <div className="space-y-4 text-sm text-white/70">

                {/* PHONE */}
                <a
                  href="tel:09618219733"
                  className="flex items-start gap-3 transition hover:text-[#DDE5C9]"
                >
                  <span className="text-lg">☎</span>
                  <span>0961 821 9733</span>
                </a>

                {/* EMAIL */}
                <a
                  href="mailto:micasadecagsawa@gmail.com"
                  className="flex items-start gap-3 transition hover:text-[#DDE5C9]"
                >
                  <span className="text-lg">✉</span>
                  <span className="break-all">
                    micasadecagsawa@gmail.com
                  </span>
                </a>

                {/* FACEBOOK */}
                <a
                  href="https://www.facebook.com/MiCasaDeCagsawa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 transition hover:text-[#DDE5C9]"
                >
                  <span className="text-lg font-bold">f</span>
                  <span>Mi Casa De Cagsawa</span>
                </a>

              </div>
            </div>

            {/* LOCATION */}
            <div>
              <h3 className="mb-5 font-serif text-lg font-bold text-[#DDE5C9]">
                Our Location
              </h3>

              <div className="flex items-start gap-3 text-sm leading-6 text-white/70">
                <span className="text-lg">⌖</span>

                <p>
                  325 Maharlika Highway, Cullat,
                  Daraga, 4501 Albay, Philippines
                </p>
              </div>

              <a
                href="https://www.google.com/maps?q=13.16480541229248,123.6962661743164"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#8BA56A] px-5 py-2.5 text-xs font-semibold text-[#DDE5C9] transition hover:bg-[#4A7A24] hover:text-white"
              >
                View on Google Maps <span>↗</span>
              </a>
            </div>

          </div>

          {/* BOTTOM FOOTER */}
          <div className="mt-10 border-t border-white/15 pt-6">

            <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">

              <p className="text-xs text-white/50">
                © {new Date().getFullYear()} Mi Casa De Cagsawa. All rights reserved.
              </p>

              <p className="text-xs tracking-wide text-white/50">
                Comfort feels like home.
              </p>

            </div>

          </div>

        </div>
      </footer>

    </div>
  )
}
