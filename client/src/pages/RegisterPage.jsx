
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'

function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const cleanName = fullName.trim()
    const cleanEmail = email.trim()

    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      setError('Please complete all fields.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: cleanName,
          email: cleanEmail,
          password,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.')
      }

      setSuccess('Account created successfully! Redirecting to login...')

      setTimeout(() => {
        navigate('/login')
      }, 1500)

    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Unable to connect to the server. Please try again.'
          : err.message || 'Registration failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9F8F3] px-4 py-8 md:px-8">

      {/* BACK TO HOME */}
      <div className="mx-auto mb-7 max-w-6xl">
        <Link
          to="/"
          className="text-sm font-medium text-[#4A7A24] transition hover:text-[#10391A]"
        >
          ← Back to Home
        </Link>
      </div>

      {/* REGISTER CONTAINER */}
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-[0_15px_50px_rgba(16,57,26,0.08)] lg:grid-cols-2">

        {/* LEFT: BRANDING */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-[#10391A] p-8 text-white md:p-12">

          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full border border-white/10" />
          <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full border border-white/10" />

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src="/images/mi-casa-logo.png"
                alt="Mi Casa Logo"
                className="h-14 w-auto object-contain"
              />

              <div>
                <h1 className="font-semibold tracking-wide">
                  Mi Casa Express
                </h1>

                <p className="text-[10px] tracking-[0.2em] text-white/60">
                  COMFORT FEELS LIKE HOME
                </p>
              </div>
            </Link>
          </div>

          <div className="relative z-10 my-12">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#B8CE9F]">
              Make yourself at home
            </p>

            <h2 className="max-w-md font-serif text-4xl leading-tight md:text-5xl">
              A comfortable stay begins here.
            </h2>

            <p className="mt-6 max-w-md text-sm leading-8 text-white/70">
              Create your Mi Casa account to explore our rooms, manage your
              bookings, and plan your next stay at Mi Casa De Cagsawa.
            </p>
          </div>

          <div className="relative z-10 border-t border-white/15 pt-6">
            <p className="text-xs tracking-wide text-white/50">
              © {new Date().getFullYear()} Mi Casa De Cagsawa
            </p>
          </div>

        </div>

        {/* RIGHT: REGISTER FORM */}
        <div className="flex items-center justify-center px-6 py-12 md:px-12 lg:px-16">

          <div className="w-full max-w-md">

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#638D35]">
              Join Mi Casa
            </p>

            <h2 className="font-serif text-4xl text-[#10391A] md:text-5xl">
              Create Account
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#85877C]">
              Register to start planning your accommodation.
            </p>

            <form onSubmit={handleRegister} className="mt-8 space-y-5">

              {/* FULL NAME */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#10391A]">
                  Full Name
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border border-[#DEDCCF] bg-[#FDFCF9] p-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#4A7A24] focus:ring-1 focus:ring-[#4A7A24]"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#10391A]">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-[#DEDCCF] bg-[#FDFCF9] p-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#4A7A24] focus:ring-1 focus:ring-[#4A7A24]"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#10391A]">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    className="w-full rounded-xl border border-[#DEDCCF] bg-[#FDFCF9] p-4 pr-20 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#4A7A24] focus:ring-1 focus:ring-[#4A7A24]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#4A7A24] hover:text-[#10391A]"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#10391A]">
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    required
                    className="w-full rounded-xl border border-[#DEDCCF] bg-[#FDFCF9] p-4 pr-20 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#4A7A24] focus:ring-1 focus:ring-[#4A7A24]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#4A7A24] hover:text-[#10391A]"
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
                >
                  {error}
                </p>
              )}

              {/* SUCCESS */}
              {success && (
                <p
                  role="status"
                  className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
                >
                  {success}
                </p>
              )}

              {/* REGISTER BUTTON */}
              <button
                type="submit"
                disabled={loading || !!success}
                className="w-full rounded-full bg-[#4A7A24] px-6 py-4 font-semibold text-white transition duration-300 hover:bg-[#3E631D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

            </form>

            {/* LOGIN LINK */}
            <p className="mt-7 text-center text-sm text-[#85877C]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-[#4A7A24] transition hover:text-[#10391A]"
              >
                Log In
              </Link>
            </p>

            <div className="mt-8 border-t border-[#E9E6DD] pt-6 text-center">
              <p className="text-xs leading-6 text-[#9A9B91]">
                Mi Casa De Cagsawa
                <br />
                Comfort feels like home.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default RegisterPage
