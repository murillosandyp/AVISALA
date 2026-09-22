import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SettingsForm } from './settings-form'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.adminUser.findUnique({
    where: { email: session.user.email },
  })

  if (!user) redirect('/login')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#103713]">Settings</h1>
        <p className="text-sm text-[#628B35] mt-1">
          Manage your admin account and property information.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#FFFDF5] rounded-lg border border-[#E2DBD0] p-6">
          <h2 className="font-serif text-lg font-bold text-[#103713] mb-4">
            Admin Profile
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-[#628B35] text-xs uppercase tracking-wide">
                Full Name
              </dt>
              <dd className="font-medium text-[#103713]">{user.fullName}</dd>
            </div>
            <div>
              <dt className="text-[#628B35] text-xs uppercase tracking-wide">
                Email
              </dt>
              <dd className="font-medium text-[#103713]">{user.email}</dd>
            </div>
            <div>
              <dt className="text-[#628B35] text-xs uppercase tracking-wide">
                Role
              </dt>
              <dd className="font-medium text-[#103713]">{user.role}</dd>
            </div>
          </dl>
        </div>

        <SettingsForm userId={user.id} />
      </div>
    </div>
  )
}