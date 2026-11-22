
import { NextResponse } from 'next/server'
import { prisma } from '@/mi-casa-mobile/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get('customerId')

    if (!customerId) {
      return NextResponse.json(
        { success: false, message: 'Customer ID is required' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    })

    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, customer })
  } catch (error) {
    console.error('[PROFILE GET ERROR]', error)

    return NextResponse.json(
      { success: false, message: 'Failed to load profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { customerId, fullName, email, phone } = body

    if (!customerId || !fullName?.trim() || !email?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Name and email are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    const existingCustomer = await prisma.customer.findUnique({
      where: { id: customerId },
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { success: false, message: 'Customer not found' },
        { status: 404 }
      )
    }

    const emailOwner = await prisma.customer.findUnique({
      where: { email: normalizedEmail },
    })

    if (emailOwner && emailOwner.id !== customerId) {
      return NextResponse.json(
        { success: false, message: 'This email is already being used' },
        { status: 409 }
      )
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: phone?.trim() || null,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      customer: updatedCustomer,
    })
  } catch (error) {
    console.error('[PROFILE PATCH ERROR]', error)

    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
