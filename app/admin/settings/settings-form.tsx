'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { changePassword } from './actions'

export function SettingsForm({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const result = await changePassword(
      userId,
      fd.get('current') as string,
      fd.get('newPass') as string,
      fd.get('confirm') as string
    )

    setLoading(false)

    if (!result.success) {
      setError(result.message)
      return
    }

    setSuccess(result.message)
    ;(e.target as HTMLFormElement).reset()
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h2 className="text-lg font-semibold mb-4">Change Password</h2>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-3 p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm"
        >
          {error}
        </div>
      )}
      {success && (
        <div
          role="status"
          aria-live="polite"
          className="mb-3 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="current">Current Password</Label>
          <Input id="current" name="current" type="password" required />
        </div>
        <div>
          <Label htmlFor="newPass">New Password</Label>
          <Input
            id="newPass"
            name="newPass"
            type="password"
            required
            minLength={8}
          />
          <p className="text-xs text-slate-500 mt-1">Minimum 8 characters.</p>
        </div>
        <div>
          <Label htmlFor="confirm">Confirm New Password</Label>
          <Input id="confirm" name="confirm" type="password" required />
        </div>
        <Button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          disabled={loading}
        >
          {loading ? 'Saving…' : 'Change Password'}
        </Button>
      </form>
    </div>
  )
}