'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tag,
  Calendar,
  Clock,
  Trash2,
  Sparkles,
} from 'lucide-react'
import { EditPromoDialog } from '@/components/admin/dashboard/edit-promo-dialog'
import { deletePromo } from './actions'

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

export function PromoGridItem({
  promo,
  variant,
}: {
  promo: Promo
  variant: 'active' | 'upcoming' | 'expired'
}) {
  const isActive = variant === 'active'
  const isExpired = variant === 'expired'

  async function handleDelete() {
    if (!confirm(`Delete promo "${promo.code}"?`)) return
    const result = await deletePromo(promo.id)
    if (!result.success) alert(result.message)
    else window.location.reload()
  }

  return (
    <div
      className={`relative rounded-lg border overflow-hidden transition-all hover:shadow-md bg-[#FFFDF5] ${
        isActive
          ? 'border-[#628B35]/60'
          : isExpired
          ? 'border-[#E2DBD0]'
          : 'border-[#103713]/30'
      }`}
    >
      {/* Accent stripe */}
      <div
        className={`h-1 ${
          isActive
            ? 'bg-[#628B35]'
            : isExpired
            ? 'bg-[#E2DBD0]'
            : 'bg-[#103713]/40'
        }`}
      />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <Tag
              className={`w-4 h-4 flex-shrink-0 ${
                isActive
                  ? 'text-[#628B35]'
                  : isExpired
                  ? 'text-[#103713]/40'
                  : 'text-[#103713]/70'
              }`}
              aria-hidden="true"
            />
            <span className="font-mono font-bold text-base text-[#103713] truncate">
              {promo.code}
            </span>
          </div>
          <Badge
            variant="secondary"
            className={`text-[10px] px-2 py-0.5 flex-shrink-0 ${
              isActive
                ? 'bg-[#628B35] text-[#FFFDF5] hover:bg-[#628B35]'
                : isExpired
                ? 'bg-[#E2DBD0] text-[#103713]/70 hover:bg-[#E2DBD0]'
                : 'bg-[#103713] text-[#FFFDF5] hover:bg-[#103713]'
            }`}
          >
            {isActive && (
              <Sparkles className="w-2.5 h-2.5 mr-0.5" aria-hidden="true" />
            )}
            {isActive ? 'ACTIVE' : isExpired ? 'EXPIRED' : 'UPCOMING'}
          </Badge>
        </div>

        {/* Discount */}
        <div className="flex items-baseline gap-1.5 mb-3">
          <span
            className={`text-3xl font-bold leading-none ${
              isActive ? 'text-[#628B35]' : 'text-[#103713]/70'
            }`}
          >
            {promo.discountPct}%
          </span>
          <span className="text-sm text-[#103713]/60 font-medium">OFF</span>
        </div>

        <p className="text-sm text-[#103713]/70 mb-4 line-clamp-2 min-h-[2.5rem]">
          {promo.description}
        </p>

        {/* Dates */}
        <div className="flex items-center gap-1 text-xs text-[#103713]/60 mb-4">
          {isActive ? (
            <>
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Until {formatDate(promo.validUntil)}</span>
            </>
          ) : isExpired ? (
            <>
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Ended {formatDate(promo.validUntil)}</span>
            </>
          ) : (
            <>
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Starts {formatDate(promo.validFrom)}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-1 pt-3 border-t border-[#E2DBD0]">
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