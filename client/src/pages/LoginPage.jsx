
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../App.css'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password.')
      }

      if (!data.token || !data.user) {
        throw new Error('Invalid response from server. Please try again.')
      }

      // Save login information
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Redirect based on account role
      if (data.user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }

    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Unable to connect to the server. Please try again.'
          : err.message || 'Login failed. Please try again.'
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

      {/* LOGIN CONTAINER */}
      <div className="mx-auto grid min-h-[620px] max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-[0_15px_50px_rgba(16,57,26,0.08)] lg:grid-cols-2">

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
              Welcome to Mi Casa
            </p>

            <h2 className="max-w-md font-serif text-4xl leading-tight md:text-5xl">
              Your home away from home.
            </h2>

            <p className="mt-6 max-w-md text-sm leading-8 text-white/70">
              Enjoy a comfortable and welcoming stay at Mi Casa De Cagsawa.
              Sign in to manage your account and accommodation bookings.
            </p>
          </div>

          <div className="relative z-10 border-t border-white/15 pt-6">
            <p className="text-xs tracking-wide text-white/50">
              © {new Date().getFullYear()} Mi Casa De Cagsawa
            </p>
          </div>

        </div>

        {/* RIGHT: LOGIN FORM */}
        <div className="flex items-center justify-center px-6 py-12 md:px-12 lg:px-16">

          <div className="w-full max-w-md">

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#638D35]">
              Your account
            </p>

            <h2 className="font-serif text-4xl text-[#10391A] md:text-5xl">
              Welcome Back
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#85877C]">
              Sign in to continue to your Mi Casa account.
            </p>

            <form onSubmit={handleLogin} className="mt-9 space-y-6">

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
                    placeholder="Enter your password"
                    autoComplete="current-password"
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

              {/* ERROR */}
              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
                >
                  {error}
                </p>
              )}

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#4A7A24] px-6 py-4 font-semibold text-white transition duration-300 hover:bg-[#3E631D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>

            </form>

            {/* REGISTER LINK */}
            <p className="mt-8 text-center text-sm text-[#85877C]">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-[#4A7A24] transition hover:text-[#10391A]"
              >
                Create an account
              </Link>
            </p>

            <div className="mt-10 border-t border-[#E9E6DD] pt-6 text-center">
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

export default LoginPage
