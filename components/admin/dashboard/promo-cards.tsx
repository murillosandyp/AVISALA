'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tag,
  Calendar,
  Clock,
  Percent,
  Pencil,
  Trash2,
  Sparkles,
} from 'lucide-react'
import { deletePromo } from '@/app/admin/promos/actions'
import { EditPromoDialog } from './edit-promo-dialog'

type Promo = {
  id: string
  code: string
  description: string
  discountPct: number
  validFrom: Date
  validUntil: Date
  isActive: boolean
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function PromoCard({
  promo,
  variant,
}: {
  promo: Promo
  variant: 'active' | 'upcoming'
}) {
  const isActive = variant === 'active'

  async function handleDelete() {
    if (!confirm(`Delete promo "${promo.code}"?`)) return
    const result = await deletePromo(promo.id)
    if (!result.success) alert(result.message)
    else window.location.reload()
  }

  return (
    <div
      className={`relative rounded-lg border overflow-hidden transition-all hover:shadow-md ${
        isActive
          ? 'bg-gradient-to-br from-[#FFFDF5] to-[#E2DBD0]/40 border-[#628B35]/50'
          : 'bg-[#FFFDF5] border-[#E2DBD0]'
      }`}
    >
      {/* Accent stripe */}
      <div
        className={`h-1 ${
          isActive ? 'bg-[#628B35]' : 'bg-[#103713]/30'
        }`}
      />

      <div className="p-3.5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Tag
              className={`w-3.5 h-3.5 flex-shrink-0 ${
                isActive ? 'text-[#628B35]' : 'text-[#103713]/50'
              }`}
              aria-hidden="true"
            />
            <span className="font-mono font-bold text-sm text-[#103713] truncate">
              {promo.code}
            </span>
          </div>
          <Badge
            variant="secondary"
            className={`text-[9px] px-1.5 py-0.5 flex-shrink-0 ${
              isActive
                ? 'bg-[#628B35] text-[#FFFDF5] hover:bg-[#628B35]'
                : 'bg-[#103713] text-[#FFFDF5] hover:bg-[#103713]'
            }`}
          >
            {isActive && (
              <Sparkles className="w-2.5 h-2.5 mr-0.5" aria-hidden="true" />
            )}
            {isActive ? 'ACTIVE' : 'UPCOMING'}
          </Badge>
        </div>

        {/* Discount badge — big */}
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-2xl font-bold text-[#628B35] leading-none">
            {promo.discountPct}%
          </span>
          <span className="text-xs text-[#103713]/60 font-medium">OFF</span>
        </div>

        {/* Description */}
        <p className="text-xs text-[#103713]/70 mb-3 line-clamp-2 min-h-[2rem]">
          {promo.description}
        </p>

        {/* Dates */}
        <div className="flex items-center gap-1 text-[10px] text-[#103713]/60 mb-3">
          {isActive ? (
            <>
              <Clock className="w-3 h-3" aria-hidden="true" />
              <span>Valid until {formatDate(promo.validUntil)}</span>
            </>
          ) : (
            <>
              <Calendar className="w-3 h-3" aria-hidden="true" />
              <span>Starts {formatDate(promo.validFrom)}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-1 pt-2 border-t border-[#E2DBD0]">
          <EditPromoDialog promo={promo} />
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 hover:bg-red-50"
            aria-label={`Delete ${promo.code}`}
            onClick={handleDelete}
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function PromoCards({ promos }: { promos: Promo[] }) {
  const now = new Date()

  const activePromos = promos.filter(
    (p) =>
      p.isActive &&
      new Date(p.validFrom) <= now &&
      new Date(p.validUntil) >= now
  )

  const upcomingPromos = promos.filter(
    (p) => p.isActive && new Date(p.validFrom) > now
  )

  return (
    <div className="bg-[#FFFDF5] rounded-lg border border-[#E2DBD0] p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#103713]">
            Promos
          </h2>
          <p className="text-xs text-[#628B35] mt-0.5">
            {activePromos.length} active · {upcomingPromos.length} upcoming
          </p>
        </div>
      </div>

      {/* Active */}
      <div className="mb-4">
        <p className="text-[10px] font-semibold text-[#628B35] uppercase tracking-wider mb-2">
          Available Now
        </p>
        {activePromos.length === 0 ? (
          <p className="text-xs text-[#103713]/50 italic py-2">
            No active promos right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activePromos.map((p) => (
              <PromoCard key={p.id} promo={p} variant="active" />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming */}
      <div>
        <p className="text-[10px] font-semibold text-[#103713]/60 uppercase tracking-wider mb-2">
          Upcoming
        </p>
        {upcomingPromos.length === 0 ? (
          <p className="text-xs text-[#103713]/50 italic py-2">
            No upcoming promos scheduled.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {upcomingPromos.map((p) => (
              <PromoCard key={p.id} promo={p} variant="upcoming" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}