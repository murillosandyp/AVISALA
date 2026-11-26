
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CheckCircle2 } from 'lucide-react'

type Booking = {
  id: string
  bookingRef: string
  guestFullName: string
  room: { roomNumber: number }
  totalPrice: number
  depositAmount: number
  paymentRef: string | null
  paymentStatus: string
  status: string
}

function PaymentBadge({ status }: { status: string }) {
  if (status === 'PAID') {
    return <Badge className="bg-[#628B35] text-white">PAID</Badge>
  }

  if (status === 'DEPOSIT_PAID') {
    return <Badge className="bg-[#103713] text-white">DEPOSIT PAID</Badge>
  }

  if (status === 'REFUNDED') {
    return <Badge className="bg-amber-100 text-amber-800">REFUNDED</Badge>
  }

  if (status === 'PENDING_VERIFICATION') {
    return <Badge className="bg-yellow-100 text-yellow-800">PENDING VERIFICATION</Badge>
  }

  return <Badge variant="secondary">{status || 'UNPAID'}</Badge>
}

export default function PaymentTable({ bookings }: { bookings: Booking[] }) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function updatePayment(id: string, action: 'VERIFY' | 'REJECT') {
    const message =
      action === 'VERIFY'
        ? 'Verify this payment reference?'
        : 'Reject this payment submission?'

    if (!window.confirm(message)) return

    try {
      setLoadingId(id)

      const response = await fetch(`/api/admin/payment/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      const result = await response.json()

      if (!response.ok) {
        alert(result.error || 'Failed to update payment.')
        console.error('Payment API error:', result)
        return
      }

      alert(result.message || 'Payment updated successfully.')
      router.refresh()
    } catch (error) {
      console.error('Payment update error:', error)
      alert('Something went wrong while updating payment. Check the terminal for errors.')
    } finally {
      setLoadingId(null)
    }
  }

  const totalCollected = bookings
    .filter((b) => b.paymentStatus === 'PAID')
    .reduce((sum, b) => sum + b.totalPrice, 0)

  const totalDeposits = bookings
    .filter((b) => b.paymentStatus === 'DEPOSIT_PAID')
    .reduce((sum, b) => sum + b.depositAmount, 0)

  const pending = bookings
    .filter(
      (b) =>
        b.paymentStatus !== 'PAID' &&
        b.paymentStatus !== 'DEPOSIT_PAID' &&
        b.status !== 'CANCELLED'
    )
    .reduce((sum, b) => sum + b.totalPrice, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fully Collected */}
        <div className="rounded-lg border border-[#E2DBD0] bg-[#FFFDF5] p-5">
          <p className="text-xs uppercase tracking-wide text-[#103713]/60">
            Fully Collected
          </p>
          <p className="mt-1 text-2xl font-bold text-[#628B35]">
            ₱{totalCollected.toLocaleString('en-PH')}
          </p>
        </div>

        {/* Deposits Verified */}
        <div className="rounded-lg border border-[#E2DBD0] bg-[#FFFDF5] p-5">
          <p className="text-xs uppercase tracking-wide text-[#103713]/60">
            Deposits Verified
          </p>
          <p className="mt-1 text-2xl font-bold text-[#103713]">
            ₱{totalDeposits.toLocaleString('en-PH')}
          </p>
        </div>

        {/* Pending Payments */}
        <div className="rounded-lg border border-[#E2DBD0] bg-[#FFFDF5] p-5">
          <p className="text-xs uppercase tracking-wide text-[#103713]/60">
            Pending Payments
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-800">
            ₱{pending.toLocaleString('en-PH')}
          </p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto rounded-lg border border-[#E2DBD0] bg-[#FFFDF5]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking Ref</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Deposit</TableHead>
              <TableHead>Payment Reference</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {bookings.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs">
                  {b.bookingRef}
                </TableCell>

                <TableCell>{b.guestFullName}</TableCell>

                <TableCell>Room {b.room.roomNumber}</TableCell>

                <TableCell>
                  ₱{b.totalPrice.toLocaleString('en-PH')}
                </TableCell>

                <TableCell>
                  ₱{b.depositAmount.toLocaleString('en-PH')}
                </TableCell>

                <TableCell className="font-mono text-xs">
                  {b.paymentRef || '—'}
                </TableCell>

                <TableCell>
                  <PaymentBadge status={b.paymentStatus} />
                </TableCell>

                <TableCell>
                  {b.paymentRef &&
          b.paymentStatus !== 'DEPOSIT_PAID' &&
          b.paymentStatus !== 'PAID' &&
          b.paymentStatus === 'PENDING_VERIFICATION' ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        disabled={loadingId === b.id}
                        onClick={() => updatePayment(b.id, 'VERIFY')}
                        className="rounded-md bg-[#628B35] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#4d7029] disabled:opacity-50"
                      >
                        <CheckCircle2 className="mr-1 inline h-3 w-3" />
                        {loadingId === b.id ? 'Processing...' : 'Verify'}
                      </button>

                      <button
                        disabled={loadingId === b.id}
                        onClick={() => updatePayment(b.id, 'REJECT')}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {loadingId === b.id ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                  ) : b.paymentStatus === 'DEPOSIT_PAID' ? (
                    <span className="text-xs text-[#628B35]">Verified</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No pending submission
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center">
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
