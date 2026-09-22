'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getUnreadNotifications() {
  return prisma.notification.findMany({
    where: { isRead: false },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
}

export async function getAllNotifications() {
  return prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
}

export async function markNotificationRead(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })
    revalidatePath('/admin')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false }
  }
}

export async function markAllNotificationsRead() {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    })
    revalidatePath('/admin')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false }
  }
}