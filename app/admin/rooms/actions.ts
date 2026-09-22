'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

type ActionResult = { success: boolean; message: string }

export async function createRoom(formData: FormData): Promise<ActionResult> {
  const roomNumber = parseInt(formData.get('roomNumber') as string)
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const capacity = parseInt(formData.get('capacity') as string)
  const basePrice = parseFloat(formData.get('basePrice') as string)
  const amenities = formData.get('amenities') as string
  const imageAlt = formData.get('imageAlt') as string
  const category = (formData.get('category') as string) || 'Standard'
  const imageUrl = (formData.get('imageUrl') as string) || null

  if (!roomNumber || roomNumber < 1) {
    return { success: false, message: 'Room number must be a positive number.' }
  }
  if (!name || name.trim().length < 2) {
    return { success: false, message: 'Room name is required (min 2 characters).' }
  }
  if (!capacity || capacity < 1) {
    return { success: false, message: 'Capacity must be at least 1.' }
  }
  if (!basePrice || basePrice <= 0) {
    return { success: false, message: 'Price must be a positive number.' }
  }

  const existing = await prisma.room.findUnique({ where: { roomNumber } })
  if (existing) {
    return {
      success: false,
      message: `Room number ${roomNumber} already exists.`,
    }
  }

  try {
    await prisma.room.create({
      data: {
        roomNumber,
        name,
        description: description || null,
        capacity,
        basePrice,
        amenities: amenities || '',
        imageAlt: imageAlt || null,
        imageUrl,
        category,
        status: 'AVAILABLE',
      },
    })

    revalidatePath('/admin/rooms')
    revalidatePath('/admin')
    return { success: true, message: 'Room created successfully.' }
  } catch (err) {
    console.error(err)
    return { success: false, message: 'Failed to create room.' }
  }
}

export async function updateRoom(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const roomNumber = parseInt(formData.get('roomNumber') as string)
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const capacity = parseInt(formData.get('capacity') as string)
  const basePrice = parseFloat(formData.get('basePrice') as string)
  const amenities = formData.get('amenities') as string
  const imageAlt = formData.get('imageAlt') as string
  const category = (formData.get('category') as string) || 'Standard'
  const imageUrl = (formData.get('imageUrl') as string) || null

  if (!roomNumber || roomNumber < 1) {
    return { success: false, message: 'Room number must be a positive number.' }
  }
  if (!name || name.trim().length < 2) {
    return { success: false, message: 'Room name is required.' }
  }
  if (!capacity || capacity < 1) {
    return { success: false, message: 'Capacity must be at least 1.' }
  }
  if (!basePrice || basePrice <= 0) {
    return { success: false, message: 'Price must be a positive number.' }
  }

  const existing = await prisma.room.findUnique({ where: { roomNumber } })
  if (existing && existing.id !== id) {
    return {
      success: false,
      message: `Room number ${roomNumber} is already used by another room.`,
    }
  }

  try {
    await prisma.room.update({
      where: { id },
      data: {
        roomNumber,
        name,
        description: description || null,
        capacity,
        basePrice,
        amenities: amenities || '',
        imageAlt: imageAlt || null,
        imageUrl,
        category,
      },
    })
    revalidatePath('/admin/rooms')
    revalidatePath('/admin')
    return { success: true, message: 'Room updated successfully.' }
  } catch (err) {
    console.error(err)
    return { success: false, message: 'Failed to update room.' }
  }
}

export async function deleteRoom(id: string): Promise<ActionResult> {
  try {
    await prisma.room.delete({ where: { id } })
    revalidatePath('/admin/rooms')
    revalidatePath('/admin')
    return { success: true, message: 'Room deleted.' }
  } catch (err) {
    console.error(err)
    return { success: false, message: 'Failed to delete room.' }
  }
}