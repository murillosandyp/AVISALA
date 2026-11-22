
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/mi-casa-mobile/lib/prisma'

export async function PATCH(req: Request) {
  try {
    const { customerId, currentPassword, newPassword } =
      await req.json()

    if (!customerId || !currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'All password fields are required.',
        },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: 'New password must be at least 8 characters.',
        },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    })

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: 'Customer account not found.',
        },
        { status: 404 }
      )
    }

    const passwordIsValid = await bcrypt.compare(
      currentPassword,
      customer.passwordHash
    )

    if (!passwordIsValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'Your current password is incorrect.',
        },
        { status: 401 }
      )
    }

    const samePassword = await bcrypt.compare(
      newPassword,
      customer.passwordHash
    )

    if (samePassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Your new password must be different from your current password.',
        },
        { status: 400 }
      )
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10)

    await prisma.customer.update({
      where: { id: customerId },
      data: {
        passwordHash: newPasswordHash,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully.',
    })
  } catch (error) {
    console.error('[CHANGE PASSWORD ERROR]', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong while changing your password.',
      },
      { status: 500 }
    )
  }
}
