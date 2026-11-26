
import Link from 'next/link'
import { prisma } from '@/mi-casa-mobile/lib/prisma'
import {
  ArrowRight,
  ArrowUpRight,
  Leaf,
  Heart,
  Sparkles,
  Users,
  Star,
  MapPin,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

const olive = '#628B35'

function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default async function HomePage() {
  const [rooms, reviews] = await Promise.all([
    prisma.room.findMany({
      where: { isActive: true },
      orderBy: { roomNumber: 'asc' },
    }),
    prisma.review.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
  ])

  const features = [
    {
      icon: Heart,
      title: 'Comfort Comes First',
      text: 'Enjoy a comfortable space where you can relax and feel at home.',
    },
    {
      icon: Leaf,
      title: 'A Peaceful Stay',
      text: 'Take a break from busy days and enjoy a more relaxing atmosphere.',
    },
    {
      icon: Sparkles,
      title: 'Made for Memories',
      text: 'Make your visits, vacations, and special moments more memorable.',
    },
  ]

  return (
    <main className="overflow-hidden bg-[#FFFDF5] text-[#103713]">
      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-[#E2DBD0]/70 bg-[#FFFDF5]/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#103713] text-[#FFFDF5]">
              <Leaf size={21} />
            </div>

            <div>
              <p className="font-serif text-lg font-bold leading-none">
                Mi Casa
              </p>
              <p className="mt-1 text-[9px] tracking-[3px] text-[#628B35]">
                DE CA GSAWA
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            <Link href="#home" className="hover:text-[#628B35]">
              Home
            </Link>
            <Link href="#rooms" className="hover:text-[#628B35]">
              Rooms
            </Link>
            <Link href="#about" className="hover:text-[#628B35]">
              About
            </Link>
            <Link href="#location" className="hover:text-[#628B35]">
              Location
            </Link>
          </nav>

          <Link
            href="/booking"
            className="rounded-full bg-[#103713] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#628B35]"
          >
            Book Your Stay
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section
        id="home"
        className="relative flex min-h-[620px] items-center md:min-h-[720px]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/mi-casa-bg.jpg')",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#0b210d]/90 via-[#103713]/65 to-[#103713]/10" />

        <div className="relative mx-auto w-full max-w-7xl px-6 py-24 md:px-12">
          <div className="max-w-2xl">
            <div className="mb-6 flex items-center gap-3 text-xs tracking-[3px] text-[#D8E6C4]">
              <span className="h-px w-10 bg-[#D8E6C4]" />
              A PLACE TO REST & FEEL AT HOME
            </div>

            <h1 className="font-serif text-5xl font-medium leading-tight text-white sm:text-6xl md:text-7xl">
              Your home away
              <br />
              <span className="italic text-[#D6E4C2]">
                from home.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-base leading-8 text-white/85 md:text-lg">
              Discover comfort, warm hospitality, and a peaceful place
              to make every stay a little more special.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="#rooms"
                className="inline-flex items-center gap-3 rounded-full bg-[#FFFDF5] px-7 py-4 text-sm font-semibold text-[#103713] transition hover:bg-[#E2DBD0]"
              >
                Explore Our Rooms
                <ArrowRight size={17} />
              </Link>

              <Link
                href="#about"
                className="inline-flex items-center gap-3 rounded-full border border-white/40 px-7 py-4 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Discover Mi Casa
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="border-b border-[#E2DBD0] bg-[#F5F1E8]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-7 px-6 py-10 md:grid-cols-3 md:px-12">
          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E2DBD0]">
                  <Icon size={21} color={olive} />
                </div>

                <div>
                  <h3 className="font-serif text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-[#103713]/65">
                    {feature.text}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ROOMS */}
      <section
        id="rooms"
        className="scroll-mt-24 px-6 py-20 md:px-12 md:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[3px] text-[#628B35]">
                FIND YOUR SPACE
              </p>

              <h2 className="mt-3 font-serif text-4xl font-medium md:text-5xl">
                Rooms made for rest.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#103713]/65">
                Explore our accommodations and find the perfect space
                for your next stay.
              </p>
            </div>

            <p className="text-sm text-[#628B35]">
              {rooms.length} accommodation{rooms.length !== 1 ? 's' : ''}
            </p>
          </div>

          {rooms.length === 0 ? (
            <div className="rounded-2xl border border-[#E2DBD0] bg-[#F5F1E8] px-6 py-16 text-center">
              <Leaf size={35} className="mx-auto text-[#628B35]" />

              <h3 className="mt-5 font-serif text-2xl">
                Our rooms are being prepared
              </h3>

              <p className="mt-3 text-sm text-[#103713]/60">
                Please check back soon for our accommodations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => {
                const amenities = room.amenities
                  ? room.amenities
                      .split(',')
                      .map((a) => a.trim())
                      .filter(Boolean)
                      .slice(0, 4)
                  : []

                return (
                  <article
                    key={room.id}
                    className="group overflow-hidden rounded-2xl border border-[#E2DBD0] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {/* ROOM IMAGE */}
                    <div className="relative h-64 overflow-hidden bg-[#E2DBD0]">
                      {room.imageUrl ? (
                        <img
                          src={room.imageUrl}
                          alt={room.imageAlt || room.name}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#E2DBD0] to-[#D4CBB9">
                          <div className="text-center text-[#103713]/50">
                            <Leaf size={38} className="mx-auto" />
                            <p className="mt-3 text-sm">
                              Mi Casa De Cagsawa
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="absolute left-4 top-4 rounded-full bg-[#FFFDF5]/95 px-4 py-2 text-xs font-medium text-[#103713]">
                        {room.category}
                      </div>

                      <div
                        className={`absolute right-4 top-4 rounded-full px-3 py-2 text-xs font-medium ${
                          room.status === 'AVAILABLE'
                            ? 'bg-[#103713] text-white'
                            : 'bg-white/90 text-[#103713]'
                        }`}
                      >
                        {room.status === 'AVAILABLE'
                          ? 'Available'
                          : room.status.replace(/_/g, ' ')}
                      </div>
                    </div>

                    {/* ROOM DETAILS */}
                    <div className="p-6">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs tracking-[2px] text-[#628B35]">
                          ROOM {room.roomNumber}
                        </p>

                        <div className="flex items-center gap-1 text-xs text-[#103713]/60">
                          <Users size={14} />
                          {room.capacity} guests
                        </div>
                      </div>

                      <h3 className="mt-3 font-serif text-2xl font-semibold">
                        {room.name}
                      </h3>

                      <p className="mt-3 line-clamp-2 min-h-[48px] text-sm leading-6 text-[#103713]/60">
                        {room.description ||
                          'A welcoming space designed for your comfort and relaxation.'}
                      </p>

                      {amenities.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {amenities.map((amenity, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-[#F5F1E8] px-3 py-1.5 text-xs text-[#103713]/70"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-6 flex items-end justify-between border-t border-[#E2DBD0] pt-5">
                        <div>
                          <p className="text-xs text-[#103713]/50">
                            Starting from
                          </p>

                          <p className="mt-1 font-serif text-2xl font-semibold">
                            {formatPrice(room.basePrice)}
                          </p>

                          <p className="text-xs text-[#103713]/50">
                            per night
                          </p>
                        </div>

                        <Link
                          href={`/booking?roomId=${room.id}`}
                          className="inline-flex items-center gap-2 rounded-full bg-[#103713] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#628B35]"
                        >
                          Inquire
                          <ArrowUpRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="scroll-mt-24 bg-[#F5F1E8] px-6 py-20 md:px-12 md:py-24"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          <div className="relative min-h-[380px] overflow-hidden rounded-2xl md:min-h-[520px]">
            <img
              src="/mi-casa-bg.jpg"
              alt="Mi Casa De Cagsawa"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[3px] text-[#628B35]">
              OUR STORY
            </p>

            <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
              More than just
              <span className="italic"> a place to stay.</span>
            </h2>

            <p className="mt-6 text-sm leading-8 text-[#103713]/70">
              At Mi Casa De Cagsawa, we believe every guest deserves
              a place where comfort and hospitality come together.
              Whether you are visiting for a vacation, a special occasion,
              or simply taking time to unwind, we want you to feel welcome.
            </p>

            <p className="mt-4 text-sm leading-8 text-[#103713]/70">
              Our goal is simple — to make your stay comfortable,
              memorable, and filled with the warmth of feeling at home.
            </p>

            <Link
              href="#rooms"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#103713] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#628B35]"
            >
              Find Your Room
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

  {/* WHY MI CASA */}
  <section className="px-6 py-20 md:px-12 md:py-24">
    <div className="mx-auto max-w-7xl text-center">
      <p className="text-xs font-semibold tracking-[3px] text-[#628B35]">
        THE MI CASA EXPERIENCE
      </p>

      <h2 className="mt-4 font-serif text-4xl md:text-5xl">
        A stay worth looking forward to.
      </h2>

      <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#103713]/65">
        Thoughtful hospitality, welcoming spaces, and comfort
        that make every visit feel a little more special.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon

          return (
            <div
              key={feature.title}
              className="rounded-2xl border border-[#E2DBD0] bg-white p-8 text-left transition hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F1E8]">
                <Icon size={22} color={olive} />
              </div>

              <h3 className="mt-5 font-serif text-xl font-semibold">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-[#103713]/65">
                {feature.text}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  </section>

  {/* REVIEWS */}
  <section className="bg-[#103713] px-6 py-20 text-[#FFFDF5] md:px-12 md:py-24">
    <div className="mx-auto max-w-7xl">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-[3px] text-[#BFD4A7]">
          GUEST EXPERIENCES
        </p>

        <h2 className="mt-4 font-serif text-4xl md:text-5xl">
          Words from our guests.
        </h2>

        <p className="mt-4 text-sm text-white/60">
          The experiences and memories shared by our guests.
        </p>
      </div>

      {reviews.length > 0 ? (
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-7"
            >
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={15}
                    className={
                      n <= review.rating
                        ? 'fill-[#BFD4A7] text-[#BFD4A7]'
                        : 'text-white/20'
                    }
                  />
                ))}
              </div>

              <p className="mt-5 text-sm leading-7 text-white/80">
                &ldquo;{review.comment}&rdquo;
              </p>

              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="font-serif text-lg">
                  {review.guestName}
                </p>

                <p className="mt-1 text-xs text-[#BFD4A7]">
                  Verified guest review
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.06] p-10 text-center">
          <Star size={28} className="mx-auto text-[#BFD4A7]" />

          <p className="mt-4 text-sm text-white/70">
            Guest experiences will be featured here.
          </p>
        </div>
      )}
    </div>
  </section>

  {/* LOCATION */}
  <section
    id="location"
    className="scroll-mt-24 px-6 py-20 md:px-12 md:py-24"
  >
    <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2">
      <div>
        <p className="text-xs font-semibold tracking-[3px] text-[#628B35]">
          COME VISIT US
        </p>

        <h2 className="mt-4 font-serif text-4xl md:text-5xl">
          Find your way to Mi Casa.
        </h2>

        <p className="mt-5 text-sm leading-7 text-[#103713]/65">
          Planning your visit? Find our location and get directions
          to make your journey easier.
        </p>

        <div className="mt-7 flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E2DBD0]">
            <MapPin size={20} color={olive} />
          </div>

          <div>
            <h3 className="font-medium">Our Location</h3>
            <p className="mt-1 text-sm text-[#103713]/60">
              Mi Casa De Cagsawa
            </p>
          </div>
        </div>

        <a
          href="https://www.google.com/maps/search/?api=1&query=Mi+Casa+De+Cagsawa"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#103713] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#628B35]"
        >
          Get Directions
          <ArrowUpRight size={16} />
        </a>
      </div>

      <div className="relative min-h-[340px] overflow-hidden rounded-2xl border border-[#E2DBD0] bg-[#F5F1E8]">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#103713] text-white">
            <MapPin size={28} />
          </div>

          <h3 className="mt-5 font-serif text-2xl">
            Mi Casa De Cagsawa
          </h3>

          <p className="mt-2 text-sm text-[#103713]/60">
            Find us on Google Maps
          </p>

          <a
            href="https://www.google.com/maps/search/?api=1&query=Mi+Casa+De+Cagsawa"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 text-sm font-medium text-[#628B35] underline underline-offset-4"
          >
            Open Google Maps
            <ArrowUpRight size={14} className="inline" />
          </a>
        </div>
      </div>
    </div>
  </section>

  {/* CONTACT / CTA */}
  <section id="contact" className="px-6 pb-16 md:px-12 md:pb-20">
    <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-[#D8D0C2] bg-[#F3EEE5]">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border border-[#103713]/10" />
      <div className="pointer-events-none absolute -right-10 -top-14 h-64 w-64 rounded-full border border-[#103713]/10" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full border border-[#628B35]/15" />

      {/* Accent strip */}
      <div className="absolute left-0 top-0 h-full w-1.5 bg-[#628B35]" />

      <div className="relative grid items-center gap-12 px-8 py-16 md:grid-cols-[1fr_auto] md:px-16 md:py-20 lg:px-24">
        {/* Text content */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 text-xs font-semibold tracking-[3px] text-[#628B35]">
            <span className="h-px w-8 bg-[#628B35]" />
            YOUR NEXT STAY STARTS HERE
          </div>

          <h2 className="mt-6 font-serif text-4xl leading-tight text-[#103713] md:text-5xl lg:text-6xl">
            A little comfort.
            <br />
            <span className="italic">A lot of warmth.</span>
          </h2>

          <p className="mt-6 max-w-lg text-sm leading-7 text-[#103713]/65 md:text-base">
            Whether you're planning ahead or simply looking
            for a place to unwind, Mi Casa is ready to welcome
            you with comfort and hospitality.
          </p>

          <p className="mt-5 text-xs tracking-[2px] text-[#103713]/45">
            COMFORT FEELS LIKE HOME
          </p>
        </div>

        {/* Booking action */}
        <div className="relative flex flex-col items-start md:items-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-[#103713]/10 bg-[#E2DBD0]">
            <Leaf size={30} color="#628B35" />
          </div>

          <Link
            href="/booking"
            className="group inline-flex items-center justify-center gap-4 rounded-full bg-[#103713] px-8 py-4 text-sm font-semibold text-white transition duration-300 hover:bg-[#628B35] hover:shadow-lg"
          >
            Explore Accommodations
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>

          <span className="mt-4 text-xs text-[#103713]/45">
            Find your perfect room
          </span>
        </div>
      </div>
    </div>
  </section>

  {/* FOOTER */}
  <footer className="bg-[#0B260D] px-6 py-12 text-white md:px-12">
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#628B35]">
              <Leaf size={21} />
            </div>

            <div>
              <p className="font-serif text-lg font-bold">
                Mi Casa
              </p>

              <p className="mt-1 text-[9px] tracking-[3px] text-[#BFD4A7]">
                DE CA GSAWA
              </p>
            </div>
          </div>

          <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
            Your home away from home.
            Comfort, hospitality, and memorable stays.
          </p>
        </div>

        <div>
          <h3 className="font-serif text-lg">Explore</h3>

          <div className="mt-5 flex flex-col gap-3 text-sm text-white/60">
            <Link href="#home" className="hover:text-white">
              Home
            </Link>
            <Link href="#rooms" className="hover:text-white">
              Rooms
            </Link>
            <Link href="#about" className="hover:text-white">
              About Us
            </Link>
            <Link href="#location" className="hover:text-white">
              Location
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-serif text-lg">Get in touch</h3>

          <p className="mt-5 text-sm leading-7 text-white/60">
            Have questions about your stay? We would be happy
            to hear from you.
          </p>

          <a
            href="https://www.google.com/maps/search/?api=1&query=Mi+Casa+De+Cagsawa"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-[#BFD4A7] hover:text-white"
          >
            <MapPin size={16} />
            Find our location
          </a>
        </div>
      </div>

      <div className="mt-10 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
        <p>
          © {new Date().getFullYear()} Mi Casa De Cagsawa. All rights reserved.
        </p>

        <p>Made with care for your comfort.</p>
      </div>
    </div>
  </footer>
</main>
  )
}
