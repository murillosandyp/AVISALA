'use client'

import { NewBookingDialog } from './new-booking-dialog'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Clock,
  CheckCircle2,
  LogIn,
  LogOut,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react'
import { updateBookingStatus } from './actions'

type Booking = {
  id: string
  bookingRef: string
  guestFullName: string
  guestEmail: string
  guestPhone: string | null
  guestGender: string | null
  guestTitle: string | null
  guestCount: number
  checkIn: Date
  checkOut: Date
  status: string
  paymentStatus: string
  totalPrice: number
  room: { roomNumber: number; name: string }
}

const STATUS_META: Record<
  string,
  { label: string; icon: any; className: string }
> = {
  PENDING: {
    label: 'PENDING',
    icon: Clock,
    className: 'bg-[#E2DBD0] text-[#103713] hover:bg-[#E2DBD0]',
  },
  CONFIRMED: {
    label: 'CONFIRMED',
    icon: CheckCircle2,
    className: 'bg-[#628B35] text-[#FFFDF5] hover:bg-[#628B35]',
  },
  CHECKED_IN: {
    label: 'CHECKED IN',
    icon: LogIn,
    className: 'bg-[#103713] text-[#FFFDF5] hover:bg-[#103713]',
  },
  CHECKED_OUT: {
    label: 'CHECKED OUT',
    icon: LogOut,
    className: 'bg-[#103713]/60 text-[#FFFDF5] hover:bg-[#103713]/60',
  },
  CANCELLED: {
    label: 'CANCELLED',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
  NO_SHOW: {
    label: 'NO SHOW',
    icon: AlertTriangle,
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
  REFUNDED: {
    label: 'REFUNDED',
    icon: RotateCcw,
    className: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  },
}

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] || STATUS_META.PENDING
  const Icon = meta.icon
  return (
    <Badge variant="secondary" className={meta.className}>
      <Icon className="w-3 h-3 mr-1" aria-hidden="true" />
      {meta.label}
    </Badge>
  )
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

type RoomOption = {
  id: string
  roomNumber: number
  name: string
  capacity: number
}

export function BookingsTable({
  bookings,
  rooms,
}: {
  bookings: Booking[]
  rooms: RoomOption[]
}) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.guestFullName.toLowerCase().includes(search.toLowerCase()) ||
      b.bookingRef.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter
    return matchSearch && matchStatus
  })

  async function handleStatusChange(id: string, newStatus: string) {
    const result = await updateBookingStatus(id, newStatus)
    if (!result.success) alert(result.message)
  }

  return (
    <div className="bg-[#FFFDF5] rounded-lg border border-[#E2DBD0]">
      <div className="p-4 flex flex-wrap items-center gap-3 border-b border-[#E2DBD0]">
        <input
          type="search"
          placeholder="Search by guest or booking ref…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-[#E2DBD0] rounded-md text-sm w-72 bg-[#FFFDF5] text-[#103713] focus:outline-none focus:ring-2 focus:ring-[#628B35] placeholder:text-[#103713]/40"
          aria-label="Search bookings"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v ?? 'ALL')}
        >
          <SelectTrigger
            className="w-48 border-[#E2DBD0] focus:ring-[#628B35] text-[#103713]"
            aria-label="Filter by status"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="CHECKED_IN">Checked In</SelectItem>
            <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="NO_SHOW">No Show</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-[#103713]/60">
            {filtered.length} booking{filtered.length !== 1 ? 's' : ''}
          </span>
          <NewBookingDialog rooms={rooms} />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ref</TableHead>
            <TableHead>Guest</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Change Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((b) => (
            <TableRow key={b.id}>
              <TableCell className="font-mono text-xs text-[#103713]">
                {b.bookingRef}
              </TableCell>
              <TableCell>
                <div className="font-medium text-[#103713]">
                  {b.guestTitle && b.guestTitle !== 'None'
                    ? `${b.guestTitle} `
                    : ''}
                  {b.guestFullName}
                </div>
                <div className="text-xs text-[#103713]/60">
                  {b.guestCount} guest{b.guestCount !== 1 ? 's' : ''}
                  {b.guestGender ? ` • ${b.guestGender}` : ''}
                </div>
              </TableCell>
              <TableCell className="text-sm text-[#103713]">
                Room {b.room.roomNumber}
              </TableCell>
              <TableCell className="text-xs text-[#103713]/70">
                {formatDate(b.checkIn)}
                <br />→ {formatDate(b.checkOut)}
              </TableCell>
              <TableCell className="text-[#103713]">
                ₱{b.totalPrice.toLocaleString()}
              </TableCell>
              <TableCell>
                <StatusBadge status={b.status} />
              </TableCell>
              <TableCell>
                <Select
                  value={b.status}
                  onValueChange={(v) => v && handleStatusChange(b.id, v)}
                >
                  <SelectTrigger
                    className="w-40 border-[#E2DBD0] focus:ring-[#628B35] text-[#103713]"
                    aria-label={`Change status for ${b.bookingRef}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="CHECKED_IN">Checked In</SelectItem>
                    <SelectItem value="CHECKED_OUT">Checked Out</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="NO_SHOW">No Show</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-[#103713]/60"
              >
                No bookings found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}