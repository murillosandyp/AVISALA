'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const VALID_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'CHECKED_IN',
  'CHECKED_OUT',
  'CANCELLED',
  'NO_SHOW',
  'REFUNDED',
] as const

export async function updateBookingStatus(id: string, status: string) {
  if (!VALID_STATUSES.includes(status as any)) {
    return { success: false, message: 'Invalid status' }
  }

  try {
    const data: any = { status }

    // Auto-update payment status when refunded
    if (status === 'REFUNDED') {
      data.paymentStatus = 'REFUNDED'
    }

    await prisma.reservation.update({
      where: { id },
      data,
    })

    revalidatePath('/admin/bookings')
    revalidatePath('/admin/payment')
    revalidatePath('/admin')
    return { success: true, message: 'Status updated.' }
  } catch (err) {
    console.error(err)
    return { success: false, message: 'Failed to update status.' }
  }
}

export async function createBooking(formData: FormData) {
  const guestFullName = (formData.get('guestFullName') as string)?.trim()
  const guestEmail = (formData.get('guestEmail') as string)?.trim()
  const guestPhone = (formData.get('guestPhone') as string)?.trim() || null
  const guestTitle = (formData.get('guestTitle') as string) || 'None'
  const guestGender = (formData.get('guestGender') as string) || null
  const roomId = formData.get('roomId') as string
  const checkIn = formData.get('checkIn') as string
  const checkOut = formData.get('checkOut') as string
  const guestCount = parseInt(formData.get('guestCount') as string)
  const notes = (formData.get('notes') as string)?.trim() || null

  if (!guestFullName || guestFullName.length < 2) {
    return {
      success: false,
      message: 'Full name is required (min 2 characters).',
    }
  }
  if (!guestEmail || !guestEmail.includes('@')) {
    return { success: false, message: 'A valid email address is required.' }
  }
  if (!roomId) {
    return { success: false, message: 'Please select a room.' }
  }
  if (!checkIn || !checkOut) {
    return {
      success: false,
      message: 'Check-in and check-out dates are required.',
    }
  }
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  if (checkOutDate <= checkInDate) {
    return { success: false, message: 'Check-out must be after check-in.' }
  }
  if (!guestCount || guestCount < 1) {
    return { success: false, message: 'Guest count must be at least 1.' }
  }

  const room = await prisma.room.findUnique({ where: { id: roomId } })
  if (!room) {
    return { success: false, message: 'Selected room not found.' }
  }
  if (guestCount > room.capacity) {
    return {
      success: false,
      message: `Room capacity is ${room.capacity} guests. You entered ${guestCount}.`,
    }
  }

  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const totalPrice = nights * room.basePrice

  const count = await prisma.reservation.count()
  const bookingRef = `MC-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`

  try {
    await prisma.reservation.create({
      data: {
        bookingRef,
        guestFullName,
        guestEmail,
        guestPhone,
        guestTitle,
        guestGender,
        roomId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guestCount,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        totalPrice,
        depositPaid: false,
        notes,
      },
    })

    revalidatePath('/admin/bookings')
    revalidatePath('/admin')
    return {
      success: true,
      message: `Booking ${bookingRef} created for ${guestFullName}.`,
    }
  } catch (err) {
    console.error(err)
    return { success: false, message: 'Failed to create booking.' }
  }
}