import { prisma } from '@/lib/prisma'
import { RoomsTable } from './rooms-table'

export const dynamic = 'force-dynamic'

export default async function RoomsPage() {
  const rooms = await prisma.room.findMany({
    orderBy: { roomNumber: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#103713]">Rooms</h1>
        <p className="text-sm text-[#628B35] mt-1">
          Manage room details, capacity, and pricing.
        </p>
      </div>
      <RoomsTable rooms={rooms} />
    </div>
  )
}