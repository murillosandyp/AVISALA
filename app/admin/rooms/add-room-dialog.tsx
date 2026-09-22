'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil } from 'lucide-react'
import { createRoom, updateRoom } from './actions'

export type RoomForForm = {
  id: string
  roomNumber: number
  name: string
  description: string | null
  capacity: number
  basePrice: number
  amenities: string
  imageAlt: string | null
  imageUrl: string | null
  category: string
}

function RoomForm({
  initial,
  onSubmit,
  submitLabel,
  loadingLabel,
}: {
  initial?: RoomForForm
  onSubmit: (fd: FormData) => Promise<{ success: boolean; message: string }>
  submitLabel: string
  loadingLabel: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [category, setCategory] = useState(initial?.category || 'Standard')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const fd = new FormData(e.currentTarget)
    fd.set('category', category)
    const result = await onSubmit(fd)

    setLoading(false)
    if (!result.success) return setError(result.message)

    setSuccess(result.message)
  }

  return (
    <>
      {error && (
        <div
          role="alert"
          className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm"
        >
          {error}
        </div>
      )}
      {success && (
        <div
          role="status"
          className="p-3 rounded-md bg-[#E2DBD0]/60 border border-[#628B35]/40 text-[#103713] text-sm"
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="roomNumber" className="text-[#103713]">
              Room Number *
            </Label>
            <Input
              id="roomNumber"
              name="roomNumber"
              type="number"
              min="1"
              required
              defaultValue={initial?.roomNumber}
              placeholder="5"
              className="border-[#E2DBD0] focus-visible:ring-[#628B35] text-[#103713]"
            />
          </div>
          <div>
            <Label htmlFor="capacity" className="text-[#103713]">
              Capacity *
            </Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              required
              defaultValue={initial?.capacity}
              placeholder="4"
              className="border-[#E2DBD0] focus-visible:ring-[#628B35] text-[#103713]"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="name" className="text-[#103713]">
            Room Name *
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={initial?.name}
            placeholder="Room 5 — Garden View"
            className="border-[#E2DBD0] focus-visible:ring-[#628B35] text-[#103713]"
          />
        </div>

        <div>
          <Label htmlFor="category" className="text-[#103713]">
            Category
          </Label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v ?? 'Standard')}
          >
            <SelectTrigger
              id="category"
              className="border-[#E2DBD0] focus:ring-[#628B35] text-[#103713]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Standard">Standard</SelectItem>
              <SelectItem value="Deluxe">Deluxe</SelectItem>
              <SelectItem value="Suite">Suite</SelectItem>
              <SelectItem value="Family">Family</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="basePrice" className="text-[#103713]">
            Price Per Night (₱) *
          </Label>
          <Input
            id="basePrice"
            name="basePrice"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={initial?.basePrice}
            placeholder="2500"
            className="border-[#E2DBD0] focus-visible:ring-[#628B35] text-[#103713]"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-[#103713]">
            Description
          </Label>
          <Input
            id="description"
            name="description"
            type="text"
            defaultValue={initial?.description || ''}
            placeholder="Cozy room with a garden view…"
            className="border-[#E2DBD0] focus-visible:ring-[#628B35] text-[#103713]"
          />
        </div>

        <div>
          <Label htmlFor="amenities" className="text-[#103713]">
            Amenities
          </Label>
          <Input
            id="amenities"
            name="amenities"
            type="text"
            defaultValue={initial?.amenities || ''}
            placeholder="AC, WiFi, Smart TV, Private Bathroom"
            className="border-[#E2DBD0] focus-visible:ring-[#628B35] text-[#103713]"
          />
        </div>

        <div>
          <Label htmlFor="imageUrl" className="text-[#103713]">
            Image URL
          </Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            type="text"
            defaultValue={initial?.imageUrl || ''}
            placeholder="/rooms/room-1.png"
            className="border-[#E2DBD0] focus-visible:ring-[#628B35] text-[#103713]"
          />
        </div>

        <div>
          <Label htmlFor="imageAlt" className="text-[#103713]">
            Image Alt Text (for accessibility) *
          </Label>
          <Input
            id="imageAlt"
            name="imageAlt"
            type="text"
            defaultValue={initial?.imageAlt || ''}
            placeholder="Room 5 with garden view and queen bed"
            className="border-[#E2DBD0] focus-visible:ring-[#628B35] text-[#103713]"
          />
          <p className="text-xs text-[#103713]/60 mt-1">
            Describe the room for screen reader users.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="submit"
            className="bg-[#628B35] hover:bg-[#4f7029] text-[#FFFDF5]"
            disabled={loading}
          >
            {loading ? loadingLabel : submitLabel}
          </Button>
        </div>
      </form>
    </>
  )
}

export function AddRoomDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md bg-[#628B35] hover:bg-[#4f7029] text-[#FFFDF5] text-sm font-medium h-9 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#628B35] focus:ring-offset-2 transition-colors">
        <Plus className="w-4 h-4" aria-hidden="true" />
        Add Room
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#FFFDF5] border-[#E2DBD0]">
        <DialogHeader>
          <DialogTitle className="font-serif text-[#103713]">
            Add New Room
          </DialogTitle>
          <DialogDescription className="text-[#628B35]">
            All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <RoomForm
          onSubmit={async (fd) => {
            const result = await createRoom(fd)
            if (result.success) setTimeout(() => setOpen(false), 800)
            return result
          }}
          submitLabel="Create Room"
          loadingLabel="Creating…"
        />
      </DialogContent>
    </Dialog>
  )
}

export function EditRoomDialog({ room }: { room: RoomForForm }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="p-2 rounded-md hover:bg-[#E2DBD0]/60 focus:outline-none focus:ring-2 focus:ring-[#628B35]"
        aria-label={`Edit ${room.name}`}
      >
        <Pencil className="w-4 h-4 text-[#103713]" />
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#FFFDF5] border-[#E2DBD0]">
        <DialogHeader>
          <DialogTitle className="font-serif text-[#103713]">
            Edit Room {room.roomNumber}
          </DialogTitle>
          <DialogDescription className="text-[#628B35]">
            Update room details below.
          </DialogDescription>
        </DialogHeader>
        <RoomForm
          initial={room}
          onSubmit={async (fd) => {
            const result = await updateRoom(room.id, fd)
            if (result.success) setTimeout(() => setOpen(false), 800)
            return result
          }}
          submitLabel="Save Changes"
          loadingLabel="Saving…"
        />
      </DialogContent>
    </Dialog>
  )
}