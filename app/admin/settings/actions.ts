'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) {
  // Validation
  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, message: 'All fields are required.' }
  }
  if (newPassword.length < 8) {
    return {
      success: false,
      message: 'New password must be at least 8 characters.',
    }
  }
  if (newPassword !== confirmPassword) {
    return { success: false, message: 'New passwords do not match.' }
  }

  const user = await prisma.adminUser.findUnique({ where: { id: userId } })
  if (!user) return { success: false, message: 'User not found.' }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!isValid) {
    return { success: false, message: 'Current password is incorrect.' }
  }

  const newHash = await bcrypt.hash(newPassword, 10)
  await prisma.adminUser.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  })

  return { success: true, message: 'Password changed successfully.' }
}