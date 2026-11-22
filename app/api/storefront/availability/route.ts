import { NextResponse } from 'next/server'
import { prisma } from '@/mi-casa-mobile/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Check-in and check-out dates are required.' },
        { status: 400 }
      )
    }

    const arrival = new Date(checkIn)
    const departure = new Date(checkOut)

    if (
      isNaN(arrival.getTime()) ||
      isNaN(departure.getTime()) ||
      departure <= arrival
    ) {
      return NextResponse.json(
        { error: 'Invalid booking dates.' },
        { status: 400 }
      )
    }

    const rooms = await prisma.room.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        roomNumber: 'asc',
      },
      include: {
        reservations: {
          where: {
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
          select: {
            id: true,
                checkIn: true,
            checkOut: true,
            status: true,
          },
        },
      },
    })

    const results = rooms.map((room) => {
      const available = room.reservations.length === 0

      return {
        id: room.id,
        roomNumber: room.roomNumber,
        name: room.name,
        description: room.description,
        capacity: room.capacity,
        basePrice: room.basePrice,
        amenities: room.amenities
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        category: room.category,
        imageUrl: room.imageUrl,
        imageAlt: room.imageAlt,
        available,
        conflictingReservations: room.reservations.length,
      }
    })

    return NextResponse.json({
      success: true,
      checkIn,
      checkOut,
      rooms: results,
    })
  } catch (error) {
    console.error('Availability check error:', error)

    return NextResponse.json(
      { error: 'Unable to check room availability.' },
      { status: 500 }
    )
  }
}