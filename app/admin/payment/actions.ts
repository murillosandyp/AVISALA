
'use server'

import { prisma } from '@/mi-casa-mobile/lib/prisma'
import { revalidatePath } from 'next/cache'

type PaymentType = 'DEPOSIT' | 'FULL'

export async function updatePayment(
  reservationId: string,
  paymentType: PaymentType,
  paymentRef?: string
) {
  if (!reservationId) {
    return { success: false, message: 'Reservation ID is required.' }
  }

  if (!['DEPOSIT', 'FULL'].includes(paymentType)) {
    return { success: false, message: 'Invalid payment type.' }
  }

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    })

    if (!reservation) {
      return { success: false, message: 'Reservation not found.' }
    }

    if (
      reservation.status === 'CANCELLED' ||
      reservation.status === 'REFUNDED'
    ) {
      return {
        success: false,
        message: 'Cancelled or refunded reservations cannot be paid.',
      }
    }

    if (reservation.paymentStatus === 'REFUNDED') {
      return {
        success: false,
        message: 'Refunded reservations cannot be updated.',
      }
    }

    if (reservation.paymentStatus === 'PAID') {
      return {
        success: false,
        message: 'This reservation is already fully paid.',
      }
    }

    const reference = paymentRef?.trim() || reservation.paymentRef

    if (paymentType === 'DEPOSIT') {
      if (reservation.depositPaid) {
        return {
          success: false,
          message: 'The deposit has already been recorded.',
        }
      }

      await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          depositPaid: true,
          paymentStatus: 'DEPOSIT_PAID',
          paymentRef: reference,
        },
      })
    }

    if (paymentType === 'FULL') {
      await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          depositPaid: true,
          paymentStatus: 'PAID',
          paymentRef: reference,
        },
      })
    }

    revalidatePath('/admin/payment')
    revalidatePath('/admin/bookings')
    revalidatePath('/admin')
    revalidatePath('/admin/report')
    revalidatePath('/admin/history')

    return {
      success: true,
      message:
        paymentType === 'DEPOSIT'
          ? 'Deposit recorded successfully.'
          : 'Full payment recorded successfully.',
    }
  } catch (error) {
    console.error('Payment update error:', error)
    return {
      success: false,
      message: 'Failed to update payment.',
    }
  }
}
