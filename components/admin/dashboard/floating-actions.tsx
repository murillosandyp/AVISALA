'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  X,
  DoorOpen,
  Tag,
  BookOpen,
  Bell,
} from 'lucide-react'
import { AddRoomDialog } from '@/app/admin/rooms/add-room-dialog'
import { AddPromoDialog } from './edit-promo-dialog'
import { NewBookingDialog } from '@/app/admin/bookings/new-booking-dialog'

type Room = { id: string; roomNumber: number; name: string; capacity: number }

export function FloatingActions({ rooms }: { rooms: Room[] }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const actions = [
    {
      label: 'New Booking',
      icon: BookOpen,
      render: () => <NewBookingDialog rooms={rooms} />,
    },
    {
      label: 'Add Room',
      icon: DoorOpen,
      render: () => <AddRoomDialog />,
    },
    {
      label: 'Add Promo',
      icon: Tag,
      render: () => <AddPromoDialog />,
    },
    {
      label: 'Post Update',
      icon: Bell,
      render: null,
      onClick: () => {
        const msg = prompt('Post a short announcement to the team:')
        if (msg) {
          alert(`Announcement posted: "${msg}"`)
          setOpen(false)
        }
      },
    },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Expanded action list */}
      {open && (
        <div className="flex flex-col items-end gap-2 mb-1">
          {actions.map((a, idx) => {
            const Icon = a.icon

            // Use Dialog-based trigger if available (New Booking, Add Room, Add Promo)
            if (a.render) {
              return (
                <div
                  key={a.label}
                  className="flex items-center gap-2"
                  style={{
                    animation: `fadeIn 200ms ease-out ${idx * 40}ms both`,
                  }}
                >
                  <span className="bg-[#103713] text-[#FFFDF5] text-xs font-medium px-2.5 py-1.5 rounded-md shadow-md whitespace-nowrap">
                    {a.label}
                  </span>
                  <a.render />
                </div>
              )
            }

            // Plain button (Post Update)
            return (
              <div
                key={a.label}
                className="flex items-center gap-2"
                style={{
                  animation: `fadeIn 200ms ease-out ${idx * 40}ms both`,
                }}
              >
                <span className="bg-[#103713] text-[#FFFDF5] text-xs font-medium px-2.5 py-1.5 rounded-md shadow-md whitespace-nowrap">
                  {a.label}
                </span>
                <button
                  type="button"
                  onClick={a.onClick}
                  aria-label={a.label}
                  className="w-11 h-11 rounded-full bg-[#FFFDF5] border-2 border-[#628B35] text-[#628B35] flex items-center justify-center shadow-md hover:bg-[#E2DBD0] focus:outline-none focus:ring-2 focus:ring-[#628B35] transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Main FAB */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close quick actions' : 'Open quick actions'}
        aria-expanded={open}
        className="w-14 h-14 rounded-full bg-[#628B35] hover:bg-[#4f7029] text-[#FFFDF5] shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#628B35] focus:ring-offset-2 transition-all active:scale-95"
      >
        {open ? (
          <X className="w-6 h-6" aria-hidden="true" />
        ) : (
          <Plus className="w-6 h-6" aria-hidden="true" />
        )}
      </button>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}