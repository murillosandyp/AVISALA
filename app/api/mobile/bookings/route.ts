import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET — fetch bookings for a specific customer
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get('customerId')

    if (!customerId) {
      return NextResponse.json(
        { success: false, message: 'customerId required' },
        { status: 400 }
      )
    }

    const bookings = await prisma.reservation.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: { room: true },
    })

    return NextResponse.json({
      success: true,
      bookings: bookings.map((b) => ({
        id: b.id,
        bookingRef: b.bookingRef,
        roomName: b.room.name,
        roomNumber: b.room.roomNumber,
        roomImage: b.room.imageUrl,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        guestCount: b.guestCount,
        totalPrice: b.totalPrice,
        status: b.status,
        paymentStatus: b.paymentStatus,
        createdAt: b.createdAt,
      })),
    })
  } catch (err) {
    console.error('[MOBILE BOOKINGS GET ERROR]', err)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}

// POST — create a new booking from mobile
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      customerId,
      roomId,
      checkIn,
      checkOut,
      guestCount,
      guestFullName,
      guestEmail,
      guestPhone,
      guestTitle,
      guestGender,
      notes,
    } = body

    if (!customerId || !roomId || !checkIn || !checkOut || !guestCount) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    })
    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      )
    }

    const room = await prisma.room.findUnique({ where: { id: roomId } })
    if (!room) {
      return NextResponse.json(
        { success: false, message: 'Room not found' },
        { status: 404 }
      )
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { success: false, message: 'Check-out must be after check-in' },
        { status: 400 }
      )
    }

    if (guestCount > room.capacity) {
      return NextResponse.json(
        {
          success: false,
          message: `Room capacity is ${room.capacity} guests`,
        },
        { status: 400 }
      )
    }

    // Check room availability for those dates
    const conflicting = await prisma.reservation.findFirst({
      where: {
        roomId,
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        OR: [
          {
            checkIn: { lte: checkOutDate },
            checkOut: { gte: checkInDate },
          },
        ],
      },
    })

    if (conflicting) {
      return NextResponse.json(
        { success: false, message: 'Room is not available for those dates' },
        { status: 409 }
      )
    }

    // Calculate price
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    const totalPrice = nights * room.basePrice

    // Generate booking reference
    const count = await prisma.reservation.count()
    const bookingRef = `MC-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`

    const booking = await prisma.reservation.create({
      data: {
        bookingRef,
        guestFullName: guestFullName || customer.fullName,
        guestEmail: guestEmail || customer.email,
        guestPhone: guestPhone || customer.phone,
        guestGender: guestGender || null,
        guestTitle: guestTitle || 'None',
        roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guestCount,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        totalPrice,
        depositPaid: false,
        notes: notes || null,
        customerId,
        source: 'MOBILE',
      },
      include: { room: true },
    })

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingRef: booking.bookingRef,
        roomName: booking.room.name,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        guestCount: booking.guestCount,
        totalPrice: booking.totalPrice,
        status: booking.status,
      },
    })
  } catch (err) {
    console.error('[MOBILE BOOKINGS POST ERROR]', err)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}