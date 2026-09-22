import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Admin user
  const passwordHash = await bcrypt.hash('Admin@123', 10)
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@micasa.com' },
    update: {},
    create: {
      email: 'admin@micasa.com',
      passwordHash,
      fullName: 'Mi Casa Admin',
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin created:', admin.email)

  // 2. Rooms
  const rooms = [
    {
      roomNumber: 1,
      name: 'Room 1 — Family Suite',
      description: 'Spacious room good for 5–10 guests. Air-conditioned with private bathroom.',
      capacity: 10,
      basePrice: 3500,
      amenities: 'AC, WiFi, Smart TV, Private Bathroom',
      imageAlt: 'Room 1 with two double beds and air conditioning',
      status: 'BOOKED',
    },
    {
      roomNumber: 2,
      name: 'Room 2 — Barkada Room',
      description: 'Large room good for 5–10 guests. Ideal for groups.',
      capacity: 10,
      basePrice: 3500,
      amenities: 'AC, WiFi, Smart TV, Private Bathroom',
      imageAlt: 'Room 2 with multiple beds for group stays',
      status: 'BOOKED',
    },
    {
      roomNumber: 3,
      name: 'Room 3 — Couple Room',
      description: 'Cozy room for 1–4 guests. Perfect for couples.',
      capacity: 4,
      basePrice: 2200,
      amenities: 'AC, WiFi, Smart TV, Private Bathroom',
      imageAlt: 'Room 3 with one queen bed and warm lighting',
      status: 'AVAILABLE',
    },
    {
      roomNumber: 4,
      name: 'Room 4 — Deluxe Room',
      description: 'Comfortable room for 1–4 guests with Mayon view.',
      capacity: 4,
      basePrice: 2500,
      amenities: 'AC, WiFi, Smart TV, Private Bathroom, Mayon View',
      imageAlt: 'Room 4 with a large window showing Mayon Volcano',
      status: 'AVAILABLE',
    },
  ]

  for (const r of rooms) {
    await prisma.room.upsert({
      where: { roomNumber: r.roomNumber },
      update: {},
      create: r,
    })
  }
  console.log('✅ Rooms created:', rooms.length)

  // 3. Sample reservations
  const roomRecords = await prisma.room.findMany()
  const sampleReservations = [
    {
      bookingRef: 'MC-2024-001',
      guestFullName: 'Maria Santos',
      guestEmail: 'maria@example.com',
      guestPhone: '09171234567',
      guestGender: 'Woman',
      guestTitle: 'Ms',
      roomId: roomRecords[0].id,
      checkIn: new Date('2026-10-01'),
      checkOut: new Date('2026-10-03'),
      guestCount: 6,
      status: 'CONFIRMED',
      paymentStatus: 'DEPOSIT_PAID',
      paymentRef: 'GCASH-88213',
      totalPrice: 7000,
      depositPaid: true,
      notes: 'Celebrating a birthday',
    },
    {
      bookingRef: 'MC-2024-002',
      guestFullName: 'Alex Reyes',
      guestEmail: 'alex@example.com',
      guestPhone: '09181234567',
      guestGender: 'Non-binary',
      guestTitle: 'Mx',
      roomId: roomRecords[1].id,
      checkIn: new Date('2026-10-05'),
      checkOut: new Date('2026-10-07'),
      guestCount: 8,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      totalPrice: 7000,
      depositPaid: false,
    },
    {
      bookingRef: 'MC-2024-003',
      guestFullName: 'John Dela Cruz',
      guestEmail: 'john@example.com',
      guestPhone: '09191234567',
      guestGender: 'Man',
      guestTitle: 'Mr',
      roomId: roomRecords[2].id,
      checkIn: new Date('2026-09-25'),
      checkOut: new Date('2026-09-27'),
      guestCount: 2,
      status: 'CHECKED_IN',
      paymentStatus: 'PAID',
      paymentRef: 'GCASH-88100',
      totalPrice: 4400,
      depositPaid: true,
    },
    {
      bookingRef: 'MC-2024-004',
      guestFullName: 'Jamie Cruz',
      guestEmail: 'jamie@example.com',
      guestGender: 'Prefer not to say',
      guestTitle: 'None',
      roomId: roomRecords[3].id,
      checkIn: new Date('2026-11-10'),
      checkOut: new Date('2026-11-12'),
      guestCount: 3,
      status: 'CONFIRMED',
      paymentStatus: 'DEPOSIT_PAID',
      paymentRef: 'GCASH-88250',
      totalPrice: 5000,
      depositPaid: true,
    },
    {
      bookingRef: 'MC-2024-005',
      guestFullName: 'Sam Villanueva',
      guestEmail: 'sam@example.com',
      guestPhone: '09201234567',
      guestGender: 'Man',
      guestTitle: 'Mr',
      roomId: roomRecords[0].id,
      checkIn: new Date('2026-09-15'),
      checkOut: new Date('2026-09-17'),
      guestCount: 5,
      status: 'CHECKED_OUT',
      paymentStatus: 'PAID',
      paymentRef: 'GCASH-87950',
      totalPrice: 7000,
      depositPaid: true,
    },
  ]

  for (const res of sampleReservations) {
    await prisma.reservation.upsert({
      where: { bookingRef: res.bookingRef },
      update: {},
      create: res,
    })
  }
  console.log('✅ Reservations created:', sampleReservations.length)

  // 4. Promos
  await prisma.promo.upsert({
    where: { code: 'MAYON10' },
    update: {},
    create: {
      code: 'MAYON10',
      description: '10% off for Mayon-view stays',
      discountPct: 10,
      validFrom: new Date('2026-01-01'),
      validUntil: new Date('2026-12-31'),
    },
  })
  await prisma.promo.upsert({
    where: { code: 'BARKADA15' },
    update: {},
    create: {
      code: 'BARKADA15',
      description: '15% off for group bookings of 6+',
      discountPct: 15,
      validFrom: new Date('2026-01-01'),
      validUntil: new Date('2026-12-31'),
    },
  })
  console.log('✅ Promos created')

  // 5. Reviews
  const reviews = [
    { guestName: 'Carlo M.', rating: 5, comment: 'Amazing Mayon view from the roof deck!', isPublished: true },
    { guestName: 'Liza R.', rating: 4, comment: 'Friendly host, clean rooms. Stairs a bit steep.', isPublished: true },
    { guestName: 'Anonymous', rating: 5, comment: 'Great value for groups.', isPublished: false },
  ]
  for (const rev of reviews) {
    await prisma.review.create({ data: rev })
  }
  console.log('✅ Reviews created:', reviews.length)

  // 6. Notifications
  await prisma.notification.createMany({
    data: [
      { title: 'New booking', message: 'Maria Santos booked Room 1 for Oct 1–3.', type: 'BOOKING' },
      { title: 'Payment received', message: 'GCash payment confirmed for MC-2024-003.', type: 'PAYMENT' },
      { title: 'Low availability', message: 'Rooms 1 & 2 fully booked next week.', type: 'SYSTEM' },
    ],
  })
  console.log('✅ Notifications created')

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })