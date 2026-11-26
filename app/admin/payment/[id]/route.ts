
import { prisma } from '@/mi-casa-mobile/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const action = body.action

    if (!id) {
      return NextResponse.json(
        { error: 'Payment ID is required.' },
        { status: 400 }
      )
    }

    if (action !== 'VERIFY' && action !== 'REJECT') {
      return NextResponse.json(
        { error: 'Invalid payment action.' },
        { status: 400 }
      )
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found.' },
        { status: 404 }
      )
    }

    if (!reservation.paymentRef) {
      return NextResponse.json(
        { error: 'No payment reference was submitted.' },
        { status: 400 }
      )
    }

    if (reservation.paymentStatus !== 'PENDING_VERIFICATION') {
      return NextResponse.json(
        { error: 'This payment is not pending verification.' },
        { status: 400 }
      )
    }

    if (action === 'VERIFY') {
      const updatedReservation = await prisma.reservation.update({
        where: { id },
        data: {
          paymentStatus: 'DEPOSIT_PAID',
          depositPaid: true,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully.',
        paymentStatus: updatedReservation.paymentStatus,
      })
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        paymentStatus: 'UNPAID',
        depositPaid: false,
        paymentRef: null,
        paymentMethod: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Payment rejected successfully.',
      paymentStatus: updatedReservation.paymentStatus,
    })
  } catch (error) {
    console.error('Payment update error:', error)

    return NextResponse.json(
      {
        error: 'Failed to update payment.',
        details:
          process.env.NODE_ENV === 'development' && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 }
    )
  }
}
