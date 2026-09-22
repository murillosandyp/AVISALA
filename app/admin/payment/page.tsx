import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CheckCircle2, Clock, RotateCcw, Wallet } from 'lucide-react'

export const dynamic = 'force-dynamic'

function PaymentBadge({ status }: { status: string }) {
  if (status === 'PAID') {
    return (
      <Badge variant="secondary" className="bg-[#628B35] text-[#FFFDF5] hover:bg-[#628B35]">
        <CheckCircle2 className="w-3 h-3 mr-1" aria-hidden="true" />
        PAID
      </Badge>
    )
  }
  if (status === 'DEPOSIT_PAID') {
    return (
      <Badge variant="secondary" className="bg-[#103713] text-[#FFFDF5] hover:bg-[#103713]">
        <Wallet className="w-3 h-3 mr-1" aria-hidden="true" />
        DEPOSIT PAID
      </Badge>
    )
  }
  if (status === 'REFUNDED') {
    return (
      <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
        <RotateCcw className="w-3 h-3 mr-1" aria-hidden="true" />
        REFUNDED
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="bg-[#E2DBD0] text-[#103713] hover:bg-[#E2DBD0]">
      <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
      UNPAID
    </Badge>
  )
}

export default async function PaymentPage() {
  const bookings = await prisma.reservation.findMany({
    orderBy: { createdAt: 'desc' },
    include: { room: true },
  })

  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === 'PAID')
    .reduce((s, b) => s + b.totalPrice, 0)

  const pending = bookings
    .filter((b) => b.paymentStatus !== 'PAID' && b.status !== 'CANCELLED')
    .reduce((s, b) => s + b.totalPrice, 0)

  const stats = [
    { label: 'Collected', value: totalRevenue, color: 'text-[#628B35]' },
    { label: 'Pending', value: pending, color: 'text-[#8B5A2B]' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#103713]">Payment</h1>
        <p className="text-sm text-[#628B35] mt-1">
          Track guest payments and outstanding balances.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-[#FFFDF5] rounded-lg border border-[#E2DBD0] p-5"
          >
            <p className="text-xs text-[#103713]/60 uppercase tracking-wide">
              {s.label}
            </p>
            <p className={`text-2xl font-bold ${s.color} mt-1`}>
              ₱{s.value.toLocaleString()}
            </p>
          </div>
        ))}
        <div className="bg-[#FFFDF5] rounded-lg border border-[#E2DBD0] p-5">
          <p className="text-xs text-[#103713]/60 uppercase tracking-wide">
            Total Bookings
          </p>
          <p className="text-2xl font-bold text-[#103713] mt-1">
            {bookings.length}
          </p>
        </div>
      </div>

      <div className="bg-[#FFFDF5] rounded-lg border border-[#E2DBD0]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ref</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>GCash Ref</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((b) => (
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
                <TableCell className="text-[#103713]">
                  ₱{b.totalPrice.toLocaleString()}
                </TableCell>
                <TableCell className="text-xs text-[#103713]/60">
                  {b.paymentRef || '—'}
                </TableCell>
                <TableCell>
                  <PaymentBadge status={b.paymentStatus} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}