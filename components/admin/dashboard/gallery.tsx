'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Pencil,
  Trash2,
  Users,
  Maximize2,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react'
import { EditRoomDialog, RoomForForm } from '@/app/admin/rooms/add-room-dialog'
import { deleteRoom } from '@/app/admin/rooms/actions'

type Room = RoomForForm & {
  status: string
}

export function Gallery({ rooms }: { rooms: Room[] }) {
  const [previewRoom, setPreviewRoom] = useState<Room | null>(null)

  async function handleDelete(room: Room) {
    if (!confirm(`Delete ${room.name}? This cannot be undone.`)) return
    const result = await deleteRoom(room.id)
    if (!result.success) alert(result.message)
    else window.location.reload()
  }

  if (rooms.length === 0) {
    return (
      <div className="bg-[#FFFDF5] rounded-lg border border-[#E2DBD0] p-12 text-center">
        <p className="text-[#103713]/60 text-sm">
          No rooms yet. Add a room to see the gallery.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-[#FFFDF5] rounded-lg border border-[#E2DBD0] p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#103713]">
              Property Gallery
            </h2>
            <p className="text-xs text-[#628B35] mt-0.5">
              {rooms.length} room{rooms.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {rooms.map((room) => {
            const isAvailable = room.status === 'AVAILABLE'
            return (
              <div
                key={room.id}
                className="group relative rounded-lg overflow-hidden border border-[#E2DBD0] bg-[#E2DBD0]/30 hover:shadow-md transition-shadow"
              >
                {/* Photo */}
                <button
                  type="button"
                  onClick={() => setPreviewRoom(room)}
                  className="relative block w-full aspect-square bg-[#E2DBD0] focus:outline-none focus:ring-2 focus:ring-[#628B35] focus:ring-inset"
                  aria-label={`Preview ${room.name}`}
                >
                  {room.imageUrl ? (
                    <Image
                      src={room.imageUrl}
                      alt={room.imageAlt || `Photo of ${room.name}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#103713]/40">
                      No photo
                    </div>
                  )}

                  {/* Expand icon overlay */}
                  <span className="absolute top-2 right-2 bg-[#103713]/70 text-[#FFFDF5] rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-3 h-3" aria-hidden="true" />
                  </span>

                  {/* Status badge */}
                  <span className="absolute top-2 left-2">
                    <Badge
                      variant="secondary"
                      className={`text-[9px] px-1.5 py-0.5 ${
                        isAvailable
                          ? 'bg-[#628B35] text-[#FFFDF5] hover:bg-[#628B35]'
                          : 'bg-[#103713] text-[#FFFDF5] hover:bg-[#103713]'
                      }`}
                    >
                      {isAvailable ? (
                        <CheckCircle2
                          className="w-2.5 h-2.5 mr-0.5"
                          aria-hidden="true"
                        />
                      ) : (
                        <XCircle
                          className="w-2.5 h-2.5 mr-0.5"
                          aria-hidden="true"
                        />
                      )}
                      {room.status}
                    </Badge>
                  </span>
                </button>

                {/* Info + actions */}
                <div className="p-2.5 bg-[#FFFDF5]">
                  <p className="text-xs font-semibold text-[#103713] truncate">
                    {room.name}
                  </p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[11px] font-bold text-[#628B35]">
                      ₱{room.basePrice.toLocaleString()}
                      <span className="text-[9px] font-normal text-[#103713]/50">
                        {' '}
                        / night
                      </span>
                    </p>
                    <div className="flex items-center gap-0.5">
                      <EditRoomDialog room={room} />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 hover:bg-red-50"
                        aria-label={`Delete ${room.name}`}
                        onClick={() => handleDelete(room)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Preview modal */}
      <Dialog open={!!previewRoom} onOpenChange={() => setPreviewRoom(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-[#FFFDF5] border-[#E2DBD0]">
          {previewRoom && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>{previewRoom.name}</DialogTitle>
              </DialogHeader>

              {/* Hero image */}
              <div className="relative w-full aspect-video bg-[#E2DBD0]">
                {previewRoom.imageUrl ? (
                  <Image
                    src={previewRoom.imageUrl}
                    alt={
                      previewRoom.imageAlt || `Photo of ${previewRoom.name}`
                    }
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#103713]/40 text-sm">
                    No photo available
                  </div>
                )}
                <span className="absolute top-3 left-3">
                  <Badge
                    variant="secondary"
                    className={`${
                      previewRoom.status === 'AVAILABLE'
                        ? 'bg-[#628B35] text-[#FFFDF5] hover:bg-[#628B35]'
                        : 'bg-[#103713] text-[#FFFDF5] hover:bg-[#103713]'
                    }`}
                  >
                    {previewRoom.status}
                  </Badge>
                </span>
              </div>

              {/* Details */}
              <div className="p-6">
                <h2 className="font-serif text-2xl font-bold text-[#103713] mb-1">
                  {previewRoom.name}
                </h2>
                <p className="text-sm text-[#628B35] mb-4">
                  {previewRoom.category} · Room {previewRoom.roomNumber}
                </p>

                {previewRoom.description && (
                  <p className="text-sm text-[#103713]/70 mb-4">
                    {previewRoom.description}
                  </p>
                )}

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-[#103713]">
                    <Users
                      className="w-4 h-4 text-[#628B35]"
                      aria-hidden="true"
                    />
                    Up to {previewRoom.capacity} guests
                  </div>
                  <div className="text-[#628B35] font-bold text-lg">
                    ₱{previewRoom.basePrice.toLocaleString()}
                    <span className="text-xs font-normal text-[#103713]/60 ml-1">
                      per night
                    </span>
                  </div>
                </div>

                {/* Amenities */}
                {previewRoom.amenities && (
                  <div className="border-t border-[#E2DBD0] pt-4">
                    <p className="text-xs font-semibold text-[#628B35] uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Sparkles
                        className="w-3 h-3"
                        aria-hidden="true"
                      />
                      Amenities
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {previewRoom.amenities
                        .split(',')
                        .map((a) => a.trim())
                        .filter(Boolean)
                        .map((a) => (
                          <span
                            key={a}
                            className="text-xs bg-[#E2DBD0]/60 text-[#103713] px-2.5 py-1 rounded-full"
                          >
                            {a}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}