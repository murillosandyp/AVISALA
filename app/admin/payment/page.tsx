
import { prisma } from '@/mi-casa-mobile/lib/prisma'
import PaymentTable from './payment-table'

export const dynamic = 'force-dynamic'

export default async function PaymentPage() {
  const bookings = await prisma.reservation.findMany({
    orderBy: { createdAt: 'desc' },
    include: { room: true },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#103713]">
          Payment Management
        </h1>
        <p className="mt-1 text-sm text-[#628B35]">
          Review guest payment references and verify submitted deposits.
        </p>
      </div>

      <div className="rounded-lg border border-[#E2DBD0] bg-[#FFFDF5] p-5">
        <p className="text-sm text-[#103713]">
          <strong>Admin instructions:</strong> Review the submitted payment
          reference before verifying. Only confirm payments that you have
          actually received.
        </p>
      </div>

      <PaymentTable
        bookings={bookings.map((b) => ({
          id: b.id,
          bookingRef: b.bookingRef,
          guestFullName: b.guestFullName,
          room: { roomNumber: b.room.roomNumber },
          totalPrice: b.totalPrice,
          depositAmount: b.depositAmount,
          paymentRef: b.paymentRef,
          paymentStatus: b.paymentStatus,
          status: b.status,
        }))}
      />
    </div>
  )
}
