import { SearchBar } from './search-bar'
import { NotificationsDropdown, MessagesDropdown, ProfileDropdown } from './header-dropdowns'
import { getUnreadNotifications } from '@/app/admin/actions/notifications'

export async function Header() {
  const notifications = await getUnreadNotifications()

  return (
    <header className="bg-[#FFFDF5] border-b border-[#E2DBD0] px-6 py-3 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
      <SearchBar />
      <div className="flex items-center gap-1">
        <MessagesDropdown />
        <NotificationsDropdown
          notifications={notifications.map((n) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type,
            isRead: n.isRead,
            createdAt: n.createdAt,
          }))}
        />
        <ProfileDropdown />
      </div>
    </header>
  )
}