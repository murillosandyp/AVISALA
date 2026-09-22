'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function toggleReviewPublished(id: string, isPublished: boolean) {
  try {
    await prisma.review.update({
      where: { id },
      data: { isPublished },
    })
    revalidatePath('/admin/reviews')
    return { success: true, message: 'Review updated.' }
  } catch (err) {
    console.error(err)
    return { success: false, message: 'Failed to update review.' }
  }
}

export async function deleteReview(id: string) {
  try {
    await prisma.review.delete({ where: { id } })
    revalidatePath('/admin/reviews')
    return { success: true, message: 'Review deleted.' }
  } catch (err) {
    console.error(err)
    return { success: false, message: 'Failed to delete review.' }
  }
}