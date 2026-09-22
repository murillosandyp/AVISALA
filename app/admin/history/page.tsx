import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const pastBookings = await prisma.reservation.findMany({
    where: { status: { in: ['CHECKED_OUT', 'CANCELLED', 'NO_SHOW'] } },
    include: { room: true },
    orderBy: { checkOut: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#103713]">History</h1>
        <p className="text-sm text-[#628B35] mt-1">
          Archive of past and cancelled bookings.
        </p>
      </div>

      <div className="bg-[#FFFDF5] rounded-lg border border-[#E2DBD0]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ref</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Final Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pastBookings.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs text-[#103713]">
                  {b.bookingRef}
                </TableCell>
                <TableCell className="text-[#103713]">
                  {b.guestFullName}
                </TableCell>
                <TableCell className="text-[#103713]">
                  Room {b.room.roomNumber}
                </TableCell>
                <TableCell className="text-xs text-[#103713]/70">
                  {new Date(b.checkIn).toLocaleDateString('en-PH')}
                </TableCell>
                <TableCell className="text-xs text-[#103713]/70">
                  {new Date(b.checkOut).toLocaleDateString('en-PH')}
                </TableCell>
                <TableCell className="text-[#103713]">
                  ₱{b.totalPrice.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="text-[10px] bg-[#E2DBD0] text-[#103713] hover:bg-[#E2DBD0]"
                  >
                    {b.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {pastBookings.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-[#103713]/60"
                >
                  No past bookings yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}