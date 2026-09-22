'use client'

import { MapPin, ExternalLink, Navigation } from 'lucide-react'

const MAP_EMBED_URL =
  'https://maps.google.com/maps?q=Mi+Casa+De+Cagsawa+Daraga+Albay&t=&z=14&ie=UTF8&iwloc=&output=embed'

const MAP_LINK_URL =
  'https://www.google.com/maps/dir/?api=1&destination=Mi+Casa+De+Cagsawa+Daraga+Albay'

const NEARBY = [
  {
    name: 'Cagsawa Ruins',
    query: 'Cagsawa+Ruins+Daraga+Albay',
    distance: '~5 min drive',
  },
  {
    name: 'Mayon Volcano Viewpoint',
    query: 'Mayon+Volcano+Viewpoint+Albay',
    distance: '~10 min drive',
  },
  {
    name: 'Daraga Church',
    query: 'Daraga+Church+Albay',
    distance: '~7 min drive',
  },
]

export function MapCard() {
  return (
    <div className="bg-[#FFFDF5] rounded-lg border border-[#E2DBD0] overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#E2DBD0] flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-serif text-lg font-bold text-[#103713]">
            Location
          </h2>
          <p className="text-xs text-[#628B35] mt-0.5 truncate">
            Mi Casa De Cagsawa — Daraga, Albay
          </p>
        </div>
        <a
          href={MAP_LINK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#FFFDF5] bg-[#628B35] hover:bg-[#4f7029] px-3 py-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#628B35] focus:ring-offset-2 flex-shrink-0"
          aria-label="Get directions to Mi Casa De Cagsawa on Google Maps"
        >
          <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
          Directions
        </a>
      </div>

      {/* Map iframe */}
      <div className="relative flex-1 min-h-[280px] bg-[#E2DBD0]">
        <iframe
          title="Map showing Mi Casa De Cagsawa location in Daraga, Albay"
          src={MAP_EMBED_URL}
          className="absolute inset-0 w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      {/* Nearby landmarks footer */}
      <div className="p-3 bg-[#FFFDF5] border-t border-[#E2DBD0]">
        <p className="text-[10px] font-semibold text-[#628B35] uppercase tracking-wider mb-2 flex items-center gap-1">
          <MapPin className="w-3 h-3" aria-hidden="true" />
          Nearby Landmarks
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {NEARBY.map((place) => (
            <li key={place.name}>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${place.query}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 rounded-md hover:bg-[#E2DBD0]/40 transition-colors focus:outline-none focus:ring-2 focus:ring-[#628B35]"
              >
                <p className="text-xs font-medium text-[#103713] leading-tight">
                  {place.name}
                </p>
                <p className="text-[10px] text-[#628B35] mt-0.5 flex items-center gap-0.5">
                  {place.distance}
                  <ExternalLink className="w-2.5 h-2.5" aria-hidden="true" />
                </p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}