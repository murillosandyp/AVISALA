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
import { Plus } from 'lucide-react'
import { createBooking } from './actions'

type Room = { id: string; roomNumber: number; name: string; capacity: number }

export function NewBookingDialog({ rooms }: { rooms: Room[] }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [title, setTitle] = useState('None')
  const [gender, setGender] = useState('Prefer not to say')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const form = e.currentTarget
    const fd = new FormData(form)
    fd.set('guestTitle', title)
    fd.set('guestGender', gender)

    const result = await createBooking(fd)
    setLoading(false)

    if (!result.success) {
      setError(result.message)
      return
    }

    setSuccess(result.message)
    setTimeout(() => {
      setOpen(false)
      setSuccess('')
      setTitle('None')
      setGender('Prefer not to say')
      form.reset()
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md bg-[#628B35] hover:bg-[#4f7029] text-[#FFFDF5] text-sm font-medium h-9 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#628B35] focus:ring-offset-2 transition-colors">
        <Plus className="w-4 h-4" aria-hidden="true" />
        New Booking
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FFFDF5] border-[#E2DBD0]">
        <DialogHeader>
          <DialogTitle className="font-serif text-[#103713]">
            Create New Booking
          </DialogTitle>
          <DialogDescription className="text-[#628B35]">
            Fill in the guest details. All fields marked * are required.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm"
          >
            {error}
          </div>
        )}
        {success && (
          <div
            role="status"
            aria-live="polite"
            className="p-3 rounded-md bg-[#E2DBD0]/60 border border-[#628B35]/40 text-[#103713] text-sm"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="guestTitle" className="text-[#103713]">
                Title
              </Label>
              <Select
                value={title}
                onValueChange={(v) => setTitle(v ?? 'None')}
              >
                <SelectTrigger
                  id="guestTitle"
                  className="border-[#E2DBD0] focus:ring-[#628B35] text-[#103713]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="Mr">Mr</SelectItem>
                  <SelectItem value="Ms">Ms</SelectItem>
                  <SelectItem value="Mx">Mx</SelectItem>
                  <SelectItem value="Dr">Dr</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="guestFullName" className="text-[#103713]">
                Full Name *
              </Label>
              <Input
                id="guestFullName"
                name="guestFullName"
                type="text"
                required
                placeholder="Maria Santos"
                autoComplete="name"
                className="border-[#E2DBD0] focus-visible:ring-[#628B35] text-[#103713]"
              />
              <p className="text-xs text-[#103713]/60 mt-1">
                Single field — enter your name as you'd like it displayed.
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="guestGender" className="text-[#103713]">
              Gender
            </Label>
            <Select
              value={gender}
              onValueChange={(v) => setGender(v ?? 'Prefer not to say')}
            >
              <SelectTrigger
                id="guestGender"
                className="border-[#E2DBD0] focus:ring-[#628B35] text-[#103713]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Woman">Woman</SelectItem>
                <SelectItem value="Man">Man</SelectItem>
                <SelectItem value="Non-binary">Non-binary</SelectItem>
                <SelectItem value="Prefer to self-describe">
                  Prefer to self-describe
                </SelectItem>
                <SelectItem value="Prefer not to say">
                  Prefer not to say
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-[#103713]/60 mt-1">
              Optional — used only for guest records.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="guestEmail" className="text-[#103713]">
                Email *
              </Label>
              <Input
                id="guestEmail"
                name="guestEmail"
                type="email"
                required
                placeholder="maria@example.com"
                autoComplete="email"
                className="border-[#E2DBD0] focus-visible:ring-[#628B35] text-[#103713]"
              />
            </div>
            <div>
              <Label htmlFor="guestPhone" className="text-[#103713]">
                Phone
              </Label>
              <Input
                id="guestPhone"
                name="guestPhone"
                type="tel"
                placeholder="09171234567"
                autoComplete="tel"
                className="border-[#E2DBD0] focus-visible:ring-[#628B35] text-[#103713]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="roomId" className="text-[#103713]">
                Room *
              </Label>
              <Select name="roomId" required>
                <SelectTrigger
                  id="roomId"
                  className="border-[#E2DBD0] focus:ring-[#628B35] text-[#103713]"
                >
                  <SelectValue placeholder="Select a room…" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      Room {r.roomNumber} — {r.name} (max {r.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="guestCount" className="text-[#103713]">
                Number of Guests *
              </Label>
              <Input
                id="guestCount"
                name="guestCount"
                type="number"
                min="1"
                required
                placeholder="2"
                className="border-[#E2DBD0] focus-visible:ring-[#628B35] text-[#103713]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="checkIn" className="text-[#103713]">
                Check-in *
              </Label>
              <Input
                id="checkIn"
                name="checkIn"
                type="date"
                required
                className="border-[#E2DBD0] focus-visible:ring-[#628B35] text-[#103713]"
              />
            </div>
            <div>
              <Label htmlFor="checkOut" className="text-[#103713]">
                Check-out *
              </Label>
              <Input
                id="checkOut"
                name="checkOut"
                type="date"
                required
                className="border-[#E2DBD0] focus-visible:ring-[#628B35] text-[#103713]"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-[#103713]">
              Special Requests / Notes
            </Label>
            <Input
              id="notes"
              name="notes"
              type="text"
              placeholder="Celebrating a birthday, early check-in, etc."
              className="border-[#E2DBD0] focus-visible:ring-[#628B35] text-[#103713]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="border-[#E2DBD0] text-[#103713]"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#628B35] hover:bg-[#4f7029] text-[#FFFDF5]"
              disabled={loading}
            >
              {loading ? 'Creating…' : 'Create Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}