
import { NextResponse } from 'next/server'
import { prisma } from '@/mi-casa-mobile/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      guestFullName,
      guestEmail,
      guestPhone,
      roomId,
      checkIn,
      checkOut,
      guestCount,
      notes,
    } = body

    // Validate required fields
    if (
      !guestFullName ||
      !guestEmail ||
      !roomId ||
      !checkIn ||
      !checkOut ||
      !guestCount
    ) {
      return NextResponse.json(
        { error: 'Please complete all required fields.' },
        { status: 400 }
      )
    }

    const arrival = new Date(checkIn)
    const departure = new Date(checkOut)
    const guests = Number(guestCount)

    // Validate dates and guest count
    if (
      isNaN(arrival.getTime()) ||
      isNaN(departure.getTime()) ||
      departure <= arrival ||
      !Number.isInteger(guests) ||
      guests < 1
    ) {
      return NextResponse.json(
        { error: 'Invalid booking dates or guest count.' },
        { status: 400 }
      )
    }

    // Find room
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    })

    if (!room || !room.isActive) {
      return NextResponse.json(
        { error: 'Room is unavailable.' },
        { status: 404 }
      )
    }

    if (guests > room.capacity) {
      return NextResponse.json(
        { error: `This room can only accommodate ${room.capacity} guests.` },
        { status: 400 }
      )
    }

    // Check overlapping reservations
    const conflictingBooking = await prisma.reservation.findFirst({
      where: {
        roomId,
        status: {
          notIn: ['CANCELLED', 'REJECTED'],
        },
        checkIn: {
          lt: departure,
        },
        checkOut: {
          gt: arrival,
        },
      },
    })

    if (conflictingBooking) {
      return NextResponse.json(
        { error: 'This room is not available for your selected dates.' },
        { status: 409 }
      )
    }

    // Calculate total nights
    const millisecondsPerDay = 1000 * 60 * 60 * 24
    const nights = Math.ceil(
      (departure.getTime() - arrival.getTime()) / millisecondsPerDay
    )

    const totalPrice = room.basePrice * nights

    // Create booking reference
    const bookingRef = `MC-${Date.now()}`

    // Save reservation
    const reservation = await prisma.reservation.create({
      data: {
        bookingRef,
        guestFullName: String(guestFullName).trim(),
        guestEmail: String(guestEmail).trim().toLowerCase(),
        guestPhone: guestPhone ? String(guestPhone).trim() : null,
        roomId,
        checkIn: arrival,
        checkOut: departure,
        guestCount: guests,
        totalPrice,
        depositPaid: false,
        depositAmount: 1000,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        notes: notes ? String(notes).trim() : null,
        source: 'STOREFRONT',
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Booking request submitted successfully!',
        booking: {
          id: reservation.id,
          bookingRef: reservation.bookingRef,
          guestFullName: reservation.guestFullName,
          checkIn: reservation.checkIn,
          checkOut: reservation.checkOut,
          guestCount: reservation.guestCount,
          totalPrice: reservation.totalPrice,
          status: reservation.status,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Storefront booking error:', error)

    return NextResponse.json(
      { error: 'Something went wrong while creating your booking.' },
      { status: 500 }
    )
  }
}
