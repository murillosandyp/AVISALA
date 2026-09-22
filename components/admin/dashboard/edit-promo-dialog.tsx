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
import { Plus, Pencil } from 'lucide-react'
import { createPromo, updatePromo } from '@/app/admin/promos/actions'

type PromoForForm = {
  id: string
  code: string
  description: string
  discountPct: number
  validFrom: Date
  validUntil: Date
  isActive: boolean
}

function formatDateForInput(d: Date) {
  const date = new Date(d)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function PromoForm({
  initial,
  onSubmit,
  submitLabel,
  loadingLabel,
}: {
  initial?: PromoForForm
  onSubmit: (fd: FormData) => Promise<{ success: boolean; message: string }>
  submitLabel: string
  loadingLabel: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const form = e.currentTarget
    const fd = new FormData(form)
    const result = await onSubmit(fd)

    setLoading(false)
    if (!result.success) return setError(result.message)

    setSuccess(result.message)
    setTimeout(() => {
      setSuccess('')
      if (!initial) form.reset()
    }, 1200)
  }

  return (
    <>
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
          className="p-3 rounded-md bg-[#E2DBD0] border border-[#628B35]/40 text-[#103713] text-sm"
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="code" className="text-[#103713]">
              Promo Code *
            </Label>
            <Input
              id="code"
              name="code"
              type="text"
              required
              defaultValue={initial?.code}
              placeholder="MAYON10"
              className="uppercase border-[#E2DBD0] focus-visible:ring-[#628B35] text-[#103713]"
            />
          </div>
          <div>
            <Label htmlFor="discountPct" className="text-[#103713]">
              Discount (%) *
            </Label>
            <Input
              id="discountPct"
              name="discountPct"
              type="number"
              min="1"
              max="100"
              required
              defaultValue={initial?.discountPct}
              placeholder="10"
              className="border-[#E2DBD0] focus-visible:ring-[#628B35] text-[#103713]"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description" className="text-[#103713]">
            Description *
          </Label>
          <Input
            id="description"
            name="description"
            type="text"
            required
            defaultValue={initial?.description}
            placeholder="10% off for Mayon-view stays"
            className="border-[#E2DBD0] focus-visible:ring-[#628B35] text-[#103713]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="validFrom" className="text-[#103713]">
              Valid From *
            </Label>
            <Input
              id="validFrom"
              name="validFrom"
              type="date"
              required
              defaultValue={
                initial ? formatDateForInput(initial.validFrom) : undefined
              }
              className="border-[#E2DBD0] focus-visible:ring-[#628B35] text-[#103713]"
            />
          </div>
          <div>
            <Label htmlFor="validUntil" className="text-[#103713]">
              Valid Until *
            </Label>
            <Input
              id="validUntil"
              name="validUntil"
              type="date"
              required
              defaultValue={
                initial ? formatDateForInput(initial.validUntil) : undefined
              }
              className="border-[#E2DBD0] focus-visible:ring-[#628B35] text-[#103713]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isActive"
            name="isActive"
            type="checkbox"
            value="true"
            defaultChecked={initial ? initial.isActive : true}
            className="w-4 h-4 accent-[#628B35] focus:outline-none focus:ring-2 focus:ring-[#628B35]"
          />
          <Label
            htmlFor="isActive"
            className="text-[#103713] cursor-pointer text-sm"
          >
            Active (visible to guests)
          </Label>
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

export function AddPromoDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-md bg-[#628B35] hover:bg-[#4f7029] text-[#FFFDF5] text-sm font-medium h-9 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#628B35] focus:ring-offset-2 transition-colors">
        <Plus className="w-4 h-4" aria-hidden="true" />
        Add Promo
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-[#FFFDF5] border-[#E2DBD0]">
        <DialogHeader>
          <DialogTitle className="font-serif text-[#103713]">
            Add New Promo
          </DialogTitle>
          <DialogDescription className="text-[#628B35]">
            Create a discount code for guests.
          </DialogDescription>
        </DialogHeader>
        <PromoForm
          onSubmit={async (fd) => {
            const result = await createPromo(fd)
            if (result.success) setTimeout(() => setOpen(false), 800)
            return result
          }}
          submitLabel="Create Promo"
          loadingLabel="Creating…"
        />
      </DialogContent>
    </Dialog>
  )
}

export function EditPromoDialog({ promo }: { promo: PromoForForm }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="p-1.5 rounded-md hover:bg-[#E2DBD0]/60 focus:outline-none focus:ring-2 focus:ring-[#628B35]"
        aria-label={`Edit promo ${promo.code}`}
      >
        <Pencil className="w-3.5 h-3.5 text-[#103713]" />
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-[#FFFDF5] border-[#E2DBD0]">
        <DialogHeader>
          <DialogTitle className="font-serif text-[#103713]">
            Edit Promo — {promo.code}
          </DialogTitle>
          <DialogDescription className="text-[#628B35]">
            Update discount details.
          </DialogDescription>
        </DialogHeader>
        <PromoForm
          initial={promo}
          onSubmit={async (fd) => {
            const result = await updatePromo(promo.id, fd)
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