'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { AddRoomDialog, EditRoomDialog, RoomForForm } from './add-room-dialog'
import { deleteRoom } from './actions'

type Room = RoomForForm & {
  status: string
}

export function RoomsTable({ rooms }: { rooms: Room[] }) {
  const [search, setSearch] = useState('')

  const filtered = rooms.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.roomNumber.toString().includes(search)
  )

  return (
    <div className="bg-[#FFFDF5] rounded-lg border border-[#E2DBD0]">
      <div className="p-4 flex items-center justify-between border-b border-[#E2DBD0]">
        <input
          type="search"
          placeholder="Search rooms…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-[#E2DBD0] rounded-md text-sm w-64 bg-[#FFFDF5] text-[#103713] focus:outline-none focus:ring-2 focus:ring-[#628B35] placeholder:text-[#103713]/40"
          aria-label="Search rooms"
        />
        <AddRoomDialog />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Photo</TableHead>
            <TableHead>Room #</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Price / Night</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((room) => {
            const isAvailable = room.status === 'AVAILABLE'
            return (
              <TableRow key={room.id}>
                <TableCell>
                  {room.imageUrl ? (
                    <Image
                      src={room.imageUrl}
                      alt={room.imageAlt || `Photo of ${room.name}`}
                      width={64}
                      height={48}
                      className="rounded-md object-cover w-16 h-12"
                      unoptimized
                    />
                  ) : (
                    <div
                      className="w-16 h-12 rounded-md bg-[#E2DBD0] flex items-center justify-center text-xs text-[#103713]/40"
                      aria-label={`No photo for ${room.name}`}
                    >
                      No photo
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium text-[#103713]">
                  {room.roomNumber}
                </TableCell>
                <TableCell className="text-[#103713]">{room.name}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="border-[#E2DBD0] text-[#103713]"
                  >
                    {room.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-[#103713]/70">
                  {room.capacity} guests
                </TableCell>
                <TableCell className="text-[#103713]">
                  ₱{room.basePrice.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      isAvailable
                        ? 'bg-[#628B35] text-[#FFFDF5] hover:bg-[#628B35]'
                        : 'bg-[#103713] text-[#FFFDF5] hover:bg-[#103713]'
                    }
                  >
                    {isAvailable ? (
                      <CheckCircle2
                        className="w-3 h-3 mr-1"
                        aria-hidden="true"
                      />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" aria-hidden="true" />
                    )}
                    {room.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <EditRoomDialog room={room} />
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Delete ${room.name}`}
                    onClick={async () => {
                      if (
                        !confirm(`Delete ${room.name}? This cannot be undone.`)
                      )
                        return
                      const result = await deleteRoom(room.id)
                      if (!result.success) alert(result.message)
                      else window.location.reload()
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-8 text-[#103713]/60"
              >
                No rooms found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}