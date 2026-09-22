import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ valid: false, message: 'Missing fields' }, { status: 400 })
    }

    const user = await prisma.adminUser.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ valid: false, message: 'Invalid email or password' }, { status: 401 })
    }

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) {
      return NextResponse.json({ valid: false, message: 'Invalid email or password' }, { status: 401 })
    }

    return NextResponse.json({ valid: true })
  } catch (err) {
    return NextResponse.json({ valid: false, message: 'Server error' }, { status: 500 })
  }
}