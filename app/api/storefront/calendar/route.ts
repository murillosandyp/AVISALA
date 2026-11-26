import { NextResponse } from 'next/server'
import { prisma } from '@/mi-casa-mobile/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const roomId = searchParams.get('roomId')

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required.' },
        { status: 400 }
      )
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: {
        id: true,
        roomNumber: true,
        name: true,
        isActive: true,
      },
    })

    if (!room || !room.isActive) {
      return NextResponse.json(
        { error: 'Room not found or unavailable.' },
        { status: 404 }
      )
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        roomId,
        status: {
          notIn: ['CANCELLED', 'REJECTED'],
        },
      },
      select: {
        checkIn: true,
        checkOut: true,
        status: true,
      },
      orderBy: {
        checkIn: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      room,
      bookedDates: reservations.map((reservation) => ({
        checkIn: reservation.checkIn.toISOString(),
        checkOut: reservation.checkOut.toISOString(),
        status: reservation.status,
      })),
    })
  } catch (error) {
    console.error('Calendar availability error:', error)

    return NextResponse.json(
      { error: 'Unable to load calendar availability.' },
      { status: 500 }
    )
  }
}
