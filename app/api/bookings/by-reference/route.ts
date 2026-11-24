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
          roomName: booking.room.name,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
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