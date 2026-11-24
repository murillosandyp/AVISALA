
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:5000/api/users'
const MAX_PHOTO_SIZE = 2 * 1024 * 1024

type Profile = {
  fullName: string
  email: string
  contactNumber: string
  profilePhoto: string
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<Profile>({
    fullName: '',
    email: '',
    contactNumber: '',
    profilePhoto: ''
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState('')

  const token = localStorage.getItem('token')

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load profile.')
      }

      setProfile({
        fullName: data.fullName || '',
        email: data.email || '',
        contactNumber: data.contactNumber || '',
        profilePhoto: data.profilePhoto || ''
      })
    } catch (error: unknown) {
      setMessage(
        error instanceof Error ? error.message : 'Failed to load profile.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    fetchProfile()
  }, [])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image file.')
      e.target.value = ''
      return
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setMessage('Photo must be 2MB or smaller.')
      e.target.value = ''
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setProfile((prev) => ({
        ...prev,
        profilePhoto: reader.result as string
      }))
      setMessage('')
    }

    reader.onerror = () => {
      setMessage('Failed to read the selected photo.')
    }

    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleRemovePhoto = () => {
    setProfile((prev) => ({
      ...prev,
      profilePhoto: ''
    }))
    setMessage('')
  }

  const handleSave = async () => {
    if (!profile.fullName.trim() || !profile.email.trim()) {
      setMessage('Full name and email are required.')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: profile.fullName.trim(),
          email: profile.email.trim(),
          contactNumber: profile.contactNumber.trim(),
          profilePhoto: profile.profilePhoto
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile.')
      }

      const updatedUser = data.user

      setProfile({
        fullName: updatedUser.fullName || '',
        email: updatedUser.email || '',
        contactNumber: updatedUser.contactNumber || '',
        profilePhoto: updatedUser.profilePhoto || ''
      })

      const savedUser = JSON.parse(
        localStorage.getItem('user') || '{}'
      )

      localStorage.setItem(
        'user',
        JSON.stringify({
          ...savedUser,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          contactNumber: updatedUser.contactNumber || '',
          profilePhoto: updatedUser.profilePhoto || ''
        })
      )

      setEditing(false)
      setMessage('Profile updated successfully!')
    } catch (error: unknown) {
      setMessage(
        error instanceof Error ? error.message : 'Failed to update profile.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setLoading(true)
    setMessage('')
    fetchProfile()
  }

  const displayInitial = profile.fullName
    ? profile.fullName.charAt(0).toUpperCase()
    : 'U'

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F8F3]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#DCE7CE] border-t-[#4A7A24]" />
          <p className="text-sm text-gray-500">
            Loading your profile...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F8F3] text-[#10391A]">

      {/* NAVIGATION */}
      <nav className="sticky top-0 z-40 border-b border-[#E9E6DD] bg-[#F9F8F3]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-left"
          >
            <img
              src="/images/mi-casa-logo.png"
              alt="Mi Casa Logo"
              className="h-11 w-auto object-contain"
            />

            <div>
              <h1 className="font-semibold tracking-wide text-[#3E631D]">
                Mi Casa Express
              </h1>
              <p className="text-[10px] tracking-[0.2em] text-gray-500">
                COMFORT FEELS LIKE HOME
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/')}
            className="rounded-full border border-[#4A7A24] px-5 py-2.5 text-sm font-medium text-[#4A7A24] transition hover:bg-[#4A7A24] hover:text-white"
          >
            Back to Home
          </button>

        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-16">

        {/* PAGE INTRODUCTION */}
        <div className="mb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#638D35]">
            Account Settings
          </p>

          <h1 className="font-serif text-4xl text-[#10391A] md:text-5xl">
            My Profile
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-[#85877C]">
            Manage your personal information and keep your account details
            up to date for a smoother booking experience.
          </p>
        </div>

        {/* PROFILE CARD */}
        <div className="overflow-hidden rounded-[28px] border border-[#E9E6DD] bg-white shadow-[0_15px_50px_rgba(16,57,26,0.05)]">

          {/* GREEN PROFILE BANNER */}
          <div className="relative overflow-hidden bg-[#10391A] px-6 py-10 text-white md:px-10 md:py-12">

            <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="absolute -right-6 -top-16 h-52 w-52 rounded-full border border-white/10" />

            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center">

              {/* PROFILE PHOTO */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white/80 bg-[#638D35] text-3xl font-semibold text-white shadow-lg">
                {profile.profilePhoto ? (
                  <img
                    src={profile.profilePhoto}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  displayInitial
                )}
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#B8CE9F]">
                  Mi Casa Guest
                </p>

                <h2 className="font-serif text-3xl md:text-4xl">
                  {profile.fullName || 'Guest User'}
                </h2>

                <p className="mt-2 text-sm text-white/65">
                  {profile.email}
                </p>
              </div>

            </div>
          </div>

          {/* PROFILE INFORMATION */}
          <div className="p-6 md:p-10">

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#638D35]">
                  Personal Details
                </p>

                <h3 className="font-serif text-2xl text-[#10391A]">
                  Account Information
                </h3>

                <p className="mt-2 text-sm text-[#85877C]">
                  Your registered account details.
                </p>
              </div>

              {!editing && (
                <button
                  onClick={() => {
                    setMessage('')
                    setEditing(true)
                  }}
                  className="rounded-full bg-[#4A7A24] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#3E631D]"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* STATUS MESSAGE */}
            {message && (
              <div
                role="status"
                className={`mb-7 rounded-xl border p-4 text-sm ${
                  message.toLowerCase().includes('success')
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-[#E9E6DD] bg-[#F9F8F3] text-gray-700'
                }`}
              >
                {message}
              </div>
            )}

            {/* PHOTO EDITING */}
            {editing && (
              <div className="mb-8 rounded-2xl border border-[#E9E6DD] bg-[#F9F8F3] p-6">

                <h4 className="mb-5 font-semibold text-[#10391A]">
                  Profile Photo
                </h4>

                <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">

                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#4A7A24] text-3xl font-semibold text-white shadow-sm">
                    {profile.profilePhoto ? (
                      <img
                        src={profile.profilePhoto}
                        alt="Profile Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      displayInitial
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-3">

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-full bg-[#4A7A24] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#3E631D]"
                      >
                        {profile.profilePhoto ? 'Change Photo' : 'Upload Photo'}
                      </button>

                      {profile.profilePhoto && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                          Remove Photo
                        </button>
                      )}

                    </div>

                    <p className="mt-4 text-xs leading-5 text-gray-500">
                      Select an image file. Maximum file size: 2MB.
                    </p>
                  </div>

                </div>
              </div>
            )}

            {/* INFORMATION FIELDS */}
            <div className="grid gap-6 md:grid-cols-2">

              {/* FULL NAME */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#10391A]">
                  Full Name
                </label>

                <input
                  type="text"
                  value={profile.fullName}
                  disabled={!editing}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      fullName: e.target.value
                    })
                  }
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-[#E5E2D9] bg-[#FDFCF9] p-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#4A7A24] focus:ring-1 focus:ring-[#4A7A24] disabled:cursor-default disabled:bg-[#F9F8F3] disabled:text-[#10391A]"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#10391A]">
                  Email Address
                </label>

                <input
                  type="email"
                  value={profile.email}
                  disabled={!editing}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      email: e.target.value
                    })
                  }
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-[#E5E2D9] bg-[#FDFCF9] p-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#4A7A24] focus:ring-1 focus:ring-[#4A7A24] disabled:cursor-default disabled:bg-[#F9F8F3] disabled:text-[#10391A]"
                />
              </div>

              {/* CONTACT NUMBER */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#10391A]">
                  Contact Number
                </label>

                <input
                  type="tel"
                  value={profile.contactNumber}
                  disabled={!editing}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      contactNumber: e.target.value
                    })
                  }
                  placeholder="Enter your contact number"
                  className="w-full rounded-xl border border-[#E5E2D9] bg-[#FDFCF9] p-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#4A7A24] focus:ring-1 focus:ring-[#4A7A24] disabled:cursor-default disabled:bg-[#F9F8F3] disabled:text-[#10391A]"
                />
              </div>

            </div>

            {/* SAVE AND CANCEL */}
            {editing && (
              <div className="mt-9 flex flex-col gap-3 border-t border-[#E9E6DD] pt-7 sm:flex-row">

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-full bg-[#4A7A24] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#3E631D] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </button>

                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-full border border-[#D8D8D0] px-8 py-3.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>

              </div>
            )}

          </div>
        </div>

        {/* BOTTOM NOTE */}
        <div className="mt-7 rounded-2xl border border-[#E9E6DD] bg-white p-6 md:p-7">
          <p className="mb-2 font-serif text-xl text-[#10391A]">
            Your stay, made personal.
          </p>

          <p className="max-w-2xl text-sm leading-7 text-[#85877C]">
            Keep your account information updated so you can manage your
            bookings and enjoy a smoother experience at Mi Casa De Cagsawa.
          </p>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="mt-12 bg-[#10391A] px-6 py-9 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row">

          <div className="flex items-center gap-3">
            <img
              src="/images/mi-casa-logo.png"
              alt="Mi Casa Logo"
              className="h-10 w-auto"
            />

            <div>
              <p className="font-semibold tracking-wide">
                Mi Casa Express
              </p>
              <p className="text-xs text-white/60">
                Comfort feels like home.
              </p>
            </div>
          </div>

          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Mi Casa De Cagsawa. All rights reserved.
          </p>

        </div>
      </footer>

    </div>
  )
}
