import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/mi-casa-mobile/lib/prisma'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password required' },
        { status: 400 }
      )
    }

    const customer = await prisma.customer.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const valid = await bcrypt.compare(password, customer.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        fullName: customer.fullName,
        phone: customer.phone,
      },
    })
  } catch (err) {
    console.error('[MOBILE LOGIN ERROR]', err)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}