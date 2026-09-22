'use client'

import {
  Share2,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Smartphone,
} from 'lucide-react'

const CONTACTS = [
  {
  label: 'Facebook',
  value: 'facebook.com/MiCasaDeCagsawa',
  href: 'https://www.facebook.com/MiCasaDeCagsawa',
  icon: Share2,
},
  {
    label: 'Phone',
    value: '+63 912 345 6789',
    href: 'tel:+639123456789',
    icon: Phone,
  },
  {
    label: 'Email',
    value: 'micasa.cagsawa@gmail.com',
    href: 'mailto:micasa.cagsawa@gmail.com',
    icon: Mail,
  },
  {
    label: 'GCash',
    value: '0912 345 6789',
    href: '#',
    icon: Smartphone,
  },
  {
    label: 'Messenger',
    value: 'm.me/MiCasaDeCagsawa',
    href: 'https://m.me/MiCasaDeCagsawa',
    icon: MessageSquare,
  },
  {
    label: 'Address',
    value: 'Daraga, Albay, Philippines',
    href: 'https://maps.google.com/?q=Mi+Casa+De+Cagsawa+Daraga+Albay',
    icon: MapPin,
  },
]

export function ContactFooter() {
  return (
    <footer className="bg-[#103713] text-[#E2DBD0] rounded-lg p-5 mt-6">
      <div className="mb-4">
        <h3 className="font-serif text-lg font-bold text-[#FFFDF5]">
          Mi Casa De Cagsawa
        </h3>
        <p className="text-xs text-[#E2DBD0]/80 mt-0.5">
          Your home away from home — Daraga, Albay
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {CONTACTS.map((c) => {
          const Icon = c.icon
          return (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="flex items-start gap-2 p-2 rounded-md hover:bg-[#1a4d1f] focus:outline-none focus:ring-2 focus:ring-[#628B35] transition-colors"
            >
              <Icon
                className="w-4 h-4 text-[#628B35] flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-[#628B35] font-semibold">
                  {c.label}
                </p>
                <p className="text-xs text-[#FFFDF5] truncate">{c.value}</p>
              </div>
            </a>
          )
        })}
      </div>

      <div className="pt-4 border-t border-[#1a4d1f] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#E2DBD0]/60">
        <p>© {new Date().getFullYear()} Mi Casa De Cagsawa. All rights reserved.</p>
        <p>Admin Panel · v1.0</p>
      </div>
    </footer>
  )
}