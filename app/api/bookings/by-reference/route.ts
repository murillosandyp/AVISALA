
import { NextResponse } from 'next/server'
import { prisma } from '@/mi-casa-mobile/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const ref = searchParams.get('ref')

    if (!ref) {
      return NextResponse.json(
        { success: false, message: 'Booking reference required' },
        { status: 400 }
      )
    }

    const booking = await prisma.reservation.findUnique({
      where: { bookingRef: ref },
      include: { room: true },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        booking: {
          bookingRef: booking.bookingRef,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          paymentRef: booking.paymentRef,
          paymentMethod: booking.paymentMethod,
          depositAmount: booking.depositAmount,
          roomName: booking.room.name,
        },
      },
      {
        headers: { 'Cache-Control': 'no-store' },
      }
    )
  } catch (error) {
    console.error('[BOOKING STATUS ERROR]', error)

    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()

    const bookingRef = String(body.bookingRef || '').trim()
    const paymentRef = String(body.paymentRef || '').trim()
    const paymentMethod = String(body.paymentMethod || '').trim().toUpperCase()

    if (!bookingRef || !paymentRef || !paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          message: 'Booking reference, payment method, and payment reference are required.',
        },
        { status: 400 }
      )
    }

    if (!['GCASH', 'MARIBANK'].includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment method.' },
        { status: 400 }
      )
    }

    const booking = await prisma.reservation.findUnique({
      where: { bookingRef },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found.' },
        { status: 404 }
      )
    }

    if (booking.status === 'CANCELLED' || booking.status === 'REJECTED') {
      return NextResponse.json(
        { success: false, message: 'This booking cannot accept payments.' },
        { status: 400 }
      )
    }

    if (
      booking.paymentStatus === 'PAID' ||
      booking.paymentStatus === 'DEPOSIT_PAID'
    ) {
      return NextResponse.json(
        { success: false, message: 'This booking has already been paid or verified.' },
        { status: 400 }
      )
    }

    await prisma.reservation.update({
      where: { id: booking.id },
      data: {
        paymentRef,
        paymentMethod,
        paymentStatus: 'PENDING_VERIFICATION',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Payment reference submitted. Waiting for admin verification.',
    })
  } catch (error) {
    console.error('[PAYMENT SUBMISSION ERROR]', error)

    return NextResponse.json(
      { success: false, message: 'Failed to submit payment reference.' },
      { status: 500 }
    )
  }
}
