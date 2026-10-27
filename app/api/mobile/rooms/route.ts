import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      where: { isActive: true },
      orderBy: { roomNumber: 'asc' },
      include: {
        reservations: {
          where: {
            status: { in: ['CONFIRMED', 'CHECKED_IN'] },
            checkOut: { gte: new Date() },
          },
          select: {
            checkIn: true,
            checkOut: true,
          },
        },
      },
    })

    const result = rooms.map((room) => {
      const isBookedNow = room.reservations.some(
        (r) => new Date(r.checkIn) <= new Date() && new Date(r.checkOut) >= new Date()
      )

      return {
        id: room.id,
        roomNumber: room.roomNumber,
        name: room.name,
        description: room.description,
        capacity: room.capacity,
        basePrice: room.basePrice,
        amenities: room.amenities ? room.amenities.split(',').map((a) => a.trim()) : [],
        category: room.category,
        imageUrl: room.imageUrl,
        imageAlt: room.imageAlt,
        status: isBookedNow ? 'BOOKED' : room.status,
      }
    })

    return NextResponse.json({ success: true, rooms: result })
  } catch (err) {
    console.error('[MOBILE ROOMS ERROR]', err)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}