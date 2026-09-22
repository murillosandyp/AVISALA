import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import {
  Tag,
  Calendar,
  Clock,
  Percent,
  Sparkles,
} from 'lucide-react'
import { AddPromoDialog } from '@/components/admin/dashboard/edit-promo-dialog'
import { PromoGridItem } from './promo-grid-item'

export const dynamic = 'force-dynamic'

export default async function PromosPage() {
  const promos = await prisma.promo.findMany({
    orderBy: { validFrom: 'asc' },
  })

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
  const expiredPromos = promos.filter(
    (p) => !p.isActive || new Date(p.validUntil) < now
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#103713]">
            Promos
          </h1>
          <p className="text-sm text-[#628B35] mt-1">
            Manage discount codes and seasonal offers.
          </p>
        </div>
        <AddPromoDialog />
      </div>

      {/* Active */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#628B35]" aria-hidden="true" />
          <h2 className="font-serif text-lg font-bold text-[#103713]">
            Active Promos
          </h2>
          <span className="text-xs text-[#103713]/50">
            ({activePromos.length})
          </span>
        </div>
        {activePromos.length === 0 ? (
          <div className="bg-[#FFFDF5] border border-[#E2DBD0] rounded-lg p-6 text-center text-sm text-[#103713]/60">
            No active promos right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePromos.map((p) => (
              <PromoGridItem key={p.id} promo={p} variant="active" />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-[#103713]/60" aria-hidden="true" />
          <h2 className="font-serif text-lg font-bold text-[#103713]">
            Upcoming
          </h2>
          <span className="text-xs text-[#103713]/50">
            ({upcomingPromos.length})
          </span>
        </div>
        {upcomingPromos.length === 0 ? (
          <div className="bg-[#FFFDF5] border border-[#E2DBD0] rounded-lg p-6 text-center text-sm text-[#103713]/60">
            No upcoming promos scheduled.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingPromos.map((p) => (
              <PromoGridItem key={p.id} promo={p} variant="upcoming" />
            ))}
          </div>
        )}
      </section>

      {/* Expired */}
      {expiredPromos.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-[#103713]/40" aria-hidden="true" />
            <h2 className="font-serif text-lg font-bold text-[#103713]/70">
              Expired / Inactive
            </h2>
            <span className="text-xs text-[#103713]/50">
              ({expiredPromos.length})
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">
            {expiredPromos.map((p) => (
              <PromoGridItem key={p.id} promo={p} variant="expired" />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}