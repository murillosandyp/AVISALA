import { prisma } from '@/lib/prisma'
import { ReviewsTable } from './reviews-table'

export const dynamic = 'force-dynamic'

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#103713]">Reviews</h1>
        <p className="text-sm text-[#628B35] mt-1">
          Guest feedback and ratings for Mi Casa De Cagsawa.
        </p>
      </div>
      <ReviewsTable reviews={reviews} />
    </div>
  )
}