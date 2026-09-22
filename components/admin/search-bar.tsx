'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, DoorOpen, BookOpen, X } from 'lucide-react'

type SearchResult = {
  id: string
  label: string
  sub: string
  href: string
  type: 'room' | 'booking'
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    setLoading(true)
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`
        )
        const data = await res.json()
        setResults(data.results || [])
        setOpen(true)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && results.length > 0) {
      router.push(results[0].href)
      setOpen(false)
      setQuery('')
    }
    if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
    }
  }

  function handleResultClick(href: string) {
    router.push(href)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} className="flex-1 relative max-w-md">
      <label htmlFor="admin-search" className="sr-only">
        Search bookings, guests, rooms
      </label>
      <Search
        className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#628B35] pointer-events-none"
        aria-hidden="true"
      />
      <input
        id="admin-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search bookings, guests, rooms…"
        autoComplete="off"
        className="w-full pl-9 pr-9 py-2 border border-[#E2DBD0] rounded-md text-sm bg-[#FFFDF5] text-[#103713] focus:outline-none focus:ring-2 focus:ring-[#628B35] placeholder:text-[#103713]/40"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery('')
            setResults([])
            setOpen(false)
          }}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#103713]/40 hover:text-[#103713] focus:outline-none"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#FFFDF5] border border-[#E2DBD0] rounded-md shadow-lg z-50 max-h-[400px] overflow-y-auto">
          {loading && (
            <div className="p-3 text-sm text-[#103713]/60">
              Searching…
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="p-4 text-sm text-[#103713]/60 text-center">
              No results for "{query}"
            </div>
          )}

          {!loading && results.length > 0 && (
            <ul>
              {results.map((r) => {
                const Icon = r.type === 'room' ? DoorOpen : BookOpen
                return (
                  <li key={`${r.type}-${r.id}`}>
                    <button
                      type="button"
                      onClick={() => handleResultClick(r.href)}
                      className="w-full text-left px-3 py-2 hover:bg-[#E2DBD0]/40 focus:outline-none focus:bg-[#E2DBD0]/40 transition-colors flex items-start gap-3"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#628B35]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5 text-[#628B35]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#103713] truncate">
                          {r.label}
                        </p>
                        <p className="text-xs text-[#103713]/60 truncate">
                          {r.sub}
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}