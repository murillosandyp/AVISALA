'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Bell,
  MessageSquare,
  User,
  Check,
  CheckCheck,
  Clock,
  Calendar,
  Wallet,
  Send,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  markNotificationRead,
  markAllNotificationsRead,
} from '@/app/admin/actions/notifications'

type Notification = {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: Date
}

const ICON_BY_TYPE: Record<string, any> = {
  BOOKING: Calendar,
  PAYMENT: Wallet,
  SYSTEM: Bell,
}

function timeAgo(date: Date) {
  const now = new Date()
  const d = new Date(date)
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function NotificationsDropdown({
  notifications,
}: {
  notifications: Notification[]
}) {
  const [items, setItems] = useState(notifications)
  const router = useRouter()
  const unreadCount = items.filter((n) => !n.isRead).length

  async function handleMarkRead(id: string) {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
    await markNotificationRead(id)
    router.refresh()
  }

  async function handleMarkAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
    await markAllNotificationsRead()
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Notifications"
        className="p-2 rounded-md hover:bg-[#E2DBD0]/60 focus:outline-none focus:ring-2 focus:ring-[#628B35] relative"
      >
        <Bell className="w-5 h-5 text-[#103713]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#E2DBD0]">
          <span className="text-sm font-semibold text-[#103713]">
            Notifications
          </span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs text-[#628B35] hover:text-[#4f7029] hover:underline focus:outline-none flex items-center gap-1"
            >
              <CheckCheck className="w-3 h-3" />
              Mark all read
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="p-4 text-center text-sm text-[#103713]/50">
            No notifications
          </div>
        ) : (
          items.map((n) => {
            const Icon = ICON_BY_TYPE[n.type] || Bell
            return (
              <DropdownMenuItem
                key={n.id}
                className={`p-3 cursor-pointer ${
                  !n.isRead ? 'bg-[#E2DBD0]/30' : ''
                }`}
                onClick={() => !n.isRead && handleMarkRead(n.id)}
              >
                <div className="flex items-start gap-2 w-full">
                  <div className="w-7 h-7 rounded-full bg-[#628B35]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-[#628B35]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm ${
                          !n.isRead
                            ? 'font-semibold text-[#103713]'
                            : 'text-[#103713]/80'
                        }`}
                      >
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#628B35] flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-[#103713]/60 line-clamp-2 mt-0.5">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-[#103713]/40 mt-1 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            )
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const MOCK_MESSAGES = [
  {
    id: '1',
    name: 'Maria Santos',
    avatar: 'MS',
    preview: 'Hi, can we do early check-in at 12pm?',
    time: '5m ago',
    unread: true,
  },
  {
    id: '2',
    name: 'Alex Reyes',
    avatar: 'AR',
    preview: 'Thanks! Our booking confirmation received.',
    time: '2h ago',
    unread: true,
  },
  {
    id: '3',
    name: 'John Dela Cruz',
    avatar: 'JD',
    preview: 'Do you have parking for 2 cars?',
    time: '1d ago',
    unread: false,
  },
]

export function MessagesDropdown() {
  const [messages] = useState(MOCK_MESSAGES)
  const unreadCount = messages.filter((m) => m.unread).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Messages"
        className="p-2 rounded-md hover:bg-[#E2DBD0]/60 focus:outline-none focus:ring-2 focus:ring-[#628B35] relative"
      >
        <MessageSquare className="w-5 h-5 text-[#103713]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#628B35] rounded-full" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
        <div className="px-3 py-2 border-b border-[#E2DBD0]">
          <span className="text-sm font-semibold text-[#103713]">
            Messages
          </span>
        </div>

        {messages.map((m) => (
          <DropdownMenuItem
            key={m.id}
            className={`p-3 cursor-pointer ${m.unread ? 'bg-[#E2DBD0]/30' : ''}`}
          >
            <div className="flex items-start gap-3 w-full">
              <div className="w-9 h-9 rounded-full bg-[#103713] text-[#FFFDF5] flex items-center justify-center text-xs font-bold flex-shrink-0">
                {m.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-sm ${
                      m.unread
                        ? 'font-semibold text-[#103713]'
                        : 'text-[#103713]/80'
                    }`}
                  >
                    {m.name}
                  </p>
                  <span className="text-[10px] text-[#103713]/40 flex-shrink-0">
                    {m.time}
                  </span>
                </div>
                <p className="text-xs text-[#103713]/60 line-clamp-1 mt-0.5">
                  {m.preview}
                </p>
              </div>
            </div>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <div className="p-2">
          <button
            type="button"
            className="w-full text-xs text-[#628B35] hover:text-[#4f7029] py-1.5 flex items-center justify-center gap-1 rounded-md hover:bg-[#E2DBD0]/40 focus:outline-none focus:ring-2 focus:ring-[#628B35]"
          >
            <Send className="w-3 h-3" />
            View all messages
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ProfileDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Profile"
        className="p-2 rounded-md hover:bg-[#E2DBD0]/60 focus:outline-none focus:ring-2 focus:ring-[#628B35]"
      >
        <User className="w-5 h-5 text-[#103713]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href="/admin/settings" className="cursor-pointer">
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/settings" className="cursor-pointer">
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}