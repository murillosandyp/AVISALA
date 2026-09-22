'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Star, Eye, EyeOff, Trash2 } from 'lucide-react'
import { toggleReviewPublished, deleteReview } from './actions'

type Review = {
  id: string
  guestName: string
  rating: number
  comment: string
  isPublished: boolean
  createdAt: Date
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`w-4 h-4 ${
            n <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-slate-200 text-slate-200'
          }`}
          aria-hidden="true"
        />
      ))}
      <span className="ml-2 text-xs text-slate-500">{rating}/5</span>
    </div>
  )
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function ReviewsTable({ reviews }: { reviews: Review[] }) {
  async function handleToggle(id: string, current: boolean) {
    const result = await toggleReviewPublished(id, !current)
    if (!result.success) alert(result.message)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete review from ${name}? This cannot be undone.`)) return
    const result = await deleteReview(id)
    if (!result.success) alert(result.message)
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Guest</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.guestName}</TableCell>
              <TableCell>
                <StarRating rating={r.rating} />
              </TableCell>
              <TableCell className="max-w-md text-sm text-slate-700">
                {r.comment}
              </TableCell>
              <TableCell className="text-xs text-slate-500">
                {formatDate(r.createdAt)}
              </TableCell>
              <TableCell>
                {r.isPublished ? (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                  >
                    <Eye className="w-3 h-3 mr-1" aria-hidden="true" />
                    PUBLISHED
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-700 hover:bg-slate-100"
                  >
                    <EyeOff className="w-3 h-3 mr-1" aria-hidden="true" />
                    HIDDEN
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={r.isPublished ? 'Hide review' : 'Publish review'}
                  onClick={() => handleToggle(r.id, r.isPublished)}
                >
                  {r.isPublished ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`Delete review from ${r.guestName}`}
                  onClick={() => handleDelete(r.id, r.guestName)}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {reviews.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                No reviews yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}