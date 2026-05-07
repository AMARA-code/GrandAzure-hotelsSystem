'use client'

import { motion } from 'framer-motion'
import { MapPin, Phone, Star, ArrowRight, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type HotelType = {
  hotel_id: number
  hotel_name: string
  city: string
  state_province: string
  star_rating: number
  address_line1: string
  phone: string
  total_rooms: number
}

const cityImageMap: Record<string, string> = {
  Karachi: '/images/hotels/karachi-hero.jpg',
  Lahore: '/images/hotels/lahore-hero.jpg',
  Islamabad: '/images/hotels/islamabad-hero.jpg',
}

export default function HotelsShowcase({ hotels }: { hotels: HotelType[] }) {
  const experienceCards = [
    {
      label: 'Private Butler Service',
      image: '/images/hotels/karachi-lobby.jpg',
      color: 'from-orange-100 to-orange-50 text-orange-700 border-orange-200',
    },
    {
      label: 'Skyline Rooftop Evenings',
      image: '/images/hotels/lahore-hero.jpg',
      color: 'from-sky-100 to-sky-50 text-sky-700 border-sky-200',
    },
    {
      label: 'Chef-Curated Dining',
      image: '/images/amenities/swimming-pool.jpg',
      color: 'from-violet-100 to-violet-50 text-violet-700 border-violet-200',
    },
    {
      label: 'Holistic Spa Rituals',
      image: '/images/hotels/islamabad-lobby.jpg',
      color: 'from-emerald-100 to-emerald-50 text-emerald-700 border-emerald-200',
    },
  ]

  const tickerItems = [
    'Concierge on Demand',
    'Signature Suites',
    'Award-Winning Hospitality',
    'Personalized City Tours',
    'Fine Dining Experiences',
    'Wellness & Serenity',
  ]

  return (
    <div className="mt-10 space-y-10">
      <div className="overflow-hidden rounded-2xl border border-[#ead8c4] bg-[#fff6ed] py-2 shadow-sm">
        <motion.div
          className="flex w-max whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 24, ease: 'linear', repeat: Infinity }}
        >
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <span
              key={`${item}-${idx}`}
              className="inline-flex items-center gap-2 px-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b5a3c]"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#d4722a]" />
              {item}
            </span>
          ))}
        </motion.div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {experienceCards.map((perk, index) => (
          <motion.div
            key={perk.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            whileHover={{ y: -8, rotateX: 6, rotateY: -6, scale: 1.02 }}
            className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br px-4 py-3 ${perk.color}`}
            style={{ transformStyle: 'preserve-3d', perspective: 900 }}
          >
            <div className="absolute inset-y-0 right-0 w-16 overflow-hidden">
              <Image
                src={perk.image}
                alt={perk.label}
                fill
                sizes="80px"
                className="object-cover opacity-45"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#fff6ed]/70" />
            </div>
            <div className="relative inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em]">
              <Sparkles className="h-3.5 w-3.5" />
              Curated Experience
            </div>
            <p className="relative mt-2 pr-14 text-sm font-semibold">{perk.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {hotels.map((hotel, index) => (
          <motion.article
            key={hotel.hotel_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            whileHover={{ y: -10, rotateX: 2, rotateY: -2 }}
            className="group overflow-hidden rounded-3xl border border-[#efdecb] bg-gradient-to-b from-white to-[#fdf8f2] shadow-premium-lg"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="relative h-60">
              <Image
                src={cityImageMap[hotel.city] ?? '/images/placeholders/hotel-placeholder.jpg'}
                alt={hotel.hotel_name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="object-cover transition duration-700 group-hover:scale-110"
                priority={index < 2}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/65 via-stone-900/10 to-transparent" />

              <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/85 px-3 py-1 text-xs font-semibold text-stone-700">
                <Star className="h-3 w-3 text-gold-500" /> {hotel.star_rating}.0 Rating
              </div>
              <div className="absolute right-4 top-4 rounded-full border border-orange-200 bg-orange-100/90 px-3 py-1 text-xs font-bold text-orange-700">
                {hotel.total_rooms} Rooms
              </div>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-stone-900">{hotel.hotel_name}</h2>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-orange-700">{hotel.city}</p>
              </div>

              <p className="flex items-start gap-2 text-sm text-stone-600">
                <MapPin className="mt-0.5 h-4 w-4 text-azure-600" />
                {hotel.address_line1}, {hotel.state_province}
              </p>
              <p className="flex items-center gap-2 text-sm text-stone-600">
                <Phone className="h-4 w-4 text-emerald-600" />
                {hotel.phone}
              </p>

              <div className="flex items-center justify-between border-t border-[#ead8c4] pt-4">
                <span className="rounded-full bg-[#fff2e6] px-3 py-1 text-xs font-semibold text-orange-700">
                  Luxury Collection
                </span>
                <Link
                  href={`/hotels/${hotel.hotel_id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-azure-200 bg-azure-50 px-3 py-1.5 text-xs font-semibold text-azure-700 transition-all hover:-translate-y-px hover:bg-azure-100"
                >
                  Explore <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  )
}
