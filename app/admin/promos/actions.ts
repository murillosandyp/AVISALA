'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

type ActionResult = { success: boolean; message: string }

export async function createPromo(formData: FormData): Promise<ActionResult> {
  const code = (formData.get('code') as string)?.trim().toUpperCase()
  const description = (formData.get('description') as string)?.trim()
  const discountPct = parseInt(formData.get('discountPct') as string)
  const validFrom = formData.get('validFrom') as string
  const validUntil = formData.get('validUntil') as string
  const isActive = formData.get('isActive') === 'true'

  if (!code || code.length < 3) {
    return { success: false, message: 'Promo code is required (min 3 characters).' }
  }
  if (!description || description.length < 3) {
    return { success: false, message: 'Description is required.' }
  }
  if (!discountPct || discountPct < 1 || discountPct > 100) {
    return { success: false, message: 'Discount must be between 1 and 100.' }
  }
  if (!validFrom || !validUntil) {
    return { success: false, message: 'Valid from and until dates are required.' }
  }

  const from = new Date(validFrom)
  const until = new Date(validUntil)
  if (until <= from) {
    return { success: false, message: 'End date must be after start date.' }
  }

  const existing = await prisma.promo.findUnique({ where: { code } })
  if (existing) {
    return { success: false, message: `Promo code "${code}" already exists.` }
  }

  try {
    await prisma.promo.create({
      data: {
        code,
        description,
        discountPct,
        validFrom: from,
        validUntil: until,
        isActive,
      },
    })

    revalidatePath('/admin')
    revalidatePath('/admin/promos')
    return { success: true, message: `Promo "${code}" created.` }
  } catch (err) {
    console.error(err)
    return { success: false, message: 'Failed to create promo.' }
  }
}

export async function updatePromo(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const code = (formData.get('code') as string)?.trim().toUpperCase()
  const description = (formData.get('description') as string)?.trim()
  const discountPct = parseInt(formData.get('discountPct') as string)
  const validFrom = formData.get('validFrom') as string
  const validUntil = formData.get('validUntil') as string
  const isActive = formData.get('isActive') === 'true'

  if (!code || code.length < 3) {
    return { success: false, message: 'Promo code is required.' }
  }
  if (!description) {
    return { success: false, message: 'Description is required.' }
  }
  if (!discountPct || discountPct < 1 || discountPct > 100) {
    return { success: false, message: 'Discount must be between 1 and 100.' }
  }
  if (!validFrom || !validUntil) {
    return { success: false, message: 'Dates are required.' }
  }

  const from = new Date(validFrom)
  const until = new Date(validUntil)
  if (until <= from) {
    return { success: false, message: 'End date must be after start date.' }
  }

  const existing = await prisma.promo.findUnique({ where: { code } })
  if (existing && existing.id !== id) {
    return { success: false, message: `Promo code "${code}" is already used.` }
  }

  try {
    await prisma.promo.update({
      where: { id },
      data: {
        code,
        description,
        discountPct,
        validFrom: from,
        validUntil: until,
        isActive,
      },
    })

    revalidatePath('/admin')
    revalidatePath('/admin/promos')
    return { success: true, message: `Promo "${code}" updated.` }
  } catch (err) {
    console.error(err)
    return { success: false, message: 'Failed to update promo.' }
  }
}

export async function deletePromo(id: string): Promise<ActionResult> {
  try {
    await prisma.promo.delete({ where: { id } })
    revalidatePath('/admin')
    revalidatePath('/admin/promos')
    return { success: true, message: 'Promo deleted.' }
  } catch (err) {
    console.error(err)
    return { success: false, message: 'Failed to delete promo.' }
  }
}