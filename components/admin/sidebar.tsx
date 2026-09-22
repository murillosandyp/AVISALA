'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Home,
  DoorOpen,
  Tag,
  Calendar,
  CreditCard,
  BarChart3,
  BookOpen,
  History,
  Star,
  Settings,
  LogOut,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const menuItems = [
  { label: 'Dashboard', href: '/admin', icon: Home },
  { label: 'Rooms', href: '/admin/rooms', icon: DoorOpen },
  { label: 'Promos', href: '/admin/promos', icon: Tag },
  { label: 'Calendar', href: '/admin/calendar', icon: Calendar },
  { label: 'Payment', href: '/admin/payment', icon: CreditCard },
  { label: 'Report', href: '/admin/report', icon: BarChart3 },
  { label: 'Bookings', href: '/admin/bookings', icon: BookOpen },
  { label: 'History', href: '/admin/history', icon: History },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-64 bg-[#103713] text-white flex flex-col h-screen sticky top-0"
      aria-label="Admin navigation"
    >
      {/* Logo header */}
      <div className="p-4 border-b border-[#1a4d1f] flex items-center gap-3">
        <div className="bg-[#FFFDF5] rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 overflow-hidden">
          <Image
            src="/logo.png"
            alt="Mi Casa De Cagsawa logo"
            width={48}
            height={48}
            className="object-contain w-12 h-12"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-[#E2DBD0] tracking-[0.15em] leading-tight">
            MI CASA DE
          </p>
          <p className="text-sm font-bold text-[#FFFDF5] leading-tight tracking-wide">
            CAGSAWA
          </p>
          <p className="text-[9px] text-[#E2DBD0]/70 tracking-[0.2em] leading-tight mt-0.5">
            ADMIN PANEL
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#628B35] ${
                    isActive
                      ? 'bg-[#628B35] text-[#FFFDF5] font-semibold shadow-sm'
                      : 'text-[#E2DBD0] hover:bg-[#1a4d1f] focus:bg-[#1a4d1f]'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Log out */}
      <div className="p-3 border-t border-[#1a4d1f]">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[#E2DBD0] hover:bg-red-800/70 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  )
}