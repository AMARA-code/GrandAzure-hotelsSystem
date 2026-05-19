'use client'

import type { KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { BedDouble, CalendarDays, MapPin, Phone, Star } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatters'
import Image from 'next/image'

type HotelType = {
  hotel_id: number
  hotel_name: string
  city: string
  state_province: string
  star_rating: number
  total_rooms: number
  address_line1: string
  phone: string
  email: string
}

type RoomType = {
  room_type_id: number
  hotel_id: number
  type_name: string
  type_category: string
  description: string
  max_occupancy: number
  base_price: number | string
  area_sqft?: number | string
  view_type?: string | null
  bed_type?: string | null
  bed_count?: number | null
  smoking?: boolean | null
}

const roomImageMap: Record<string, string> = {
  'Standard Room': '/images/rooms/standard-room.jpg',
  'Deluxe Sea View': '/images/rooms/deluxe-sea-view.jpg',
  'Executive Suite': '/images/rooms/executive-suite.jpg',
  'Presidential Suite': '/images/rooms/presidential-suite.jpg',
  'Deluxe Garden View': '/images/rooms/deluxe-garden-view.jpg',
  'Honeymoon Suite': '/images/rooms/honeymoon-suite.jpg',
  'Margalla View Deluxe': '/images/rooms/margalla-view-deluxe.jpg',
}

const heroImageByCity: Record<string, string> = {
  Karachi: '/images/hotels/karachi-hero.jpg',
  Lahore: '/images/hotels/lahore-hero.jpg',
  Islamabad: '/images/hotels/islamabad-hero.jpg',
}

const lobbyImageByCity: Record<string, string> = {
  Karachi: '/images/hotels/karachi-lobby.jpg',
  Lahore: '/images/hotels/lahore-lobby.jpg',
  Islamabad: '/images/hotels/islamabad-lobby.jpg',
}

export default function HotelDetailShowcase({
  hotel,
  roomTypes,
  roomAmenities,
  onRoomBook,
}: {
  hotel: HotelType
  roomTypes: RoomType[]
  roomAmenities: Record<number, string[]>
  onRoomBook?: (room: RoomType) => void
}) {
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl shadow-premium-lg">
        <div className="relative h-[360px] w-full sm:h-[420px]">
          <Image
            src={heroImageByCity[hotel.city] ?? '/images/placeholders/hotel-placeholder.jpg'}
            alt={hotel.hotel_name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <p className="inline-flex items-center gap-1 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-800">
            <Star className="h-3 w-3 text-gold-500" /> {hotel.star_rating}-Star Luxury
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white">{hotel.hotel_name}</h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/90">
            <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4 text-gold-300" /> {hotel.address_line1}, {hotel.state_province}</span>
            <span className="inline-flex items-center gap-1"><Phone className="h-4 w-4 text-emerald-300" /> {hotel.phone}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -6 }}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-premium"
        >
          <div className="relative h-64 w-full">
            <Image
              src={lobbyImageByCity[hotel.city] ?? '/images/placeholders/hotel-placeholder.jpg'}
              alt={`${hotel.hotel_name} lobby`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="p-5">
            <h2 className="font-display text-2xl font-bold text-slate-900">A Signature Arrival Experience</h2>
            <p className="mt-2 text-sm text-slate-600">
              Grand interiors, refined hospitality, and high-touch service designed for elite travelers.
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -6 }}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-premium"
        >
          <div className="relative h-64 w-full">
            <Image
              src="/images/amenities/swimming-pool.jpg"
              alt="pool experience"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="p-5">
            <h2 className="font-display text-2xl font-bold text-slate-900">Wellness and Leisure</h2>
            <p className="mt-2 text-sm text-slate-600">
              Spa rituals, modern fitness zones, premium dining, and curated guest experiences.
            </p>
          </div>
        </motion.div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-3xl font-bold text-slate-900">Available Room Collections</h2>
          <Link href="/book" className="rounded-xl gradient-azure px-4 py-2 text-sm font-semibold text-white shadow-azure">
            Book a Room
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roomTypes.map((room, index) => (
            <motion.article
              key={room.room_type_id}
              role="button"
              tabIndex={0}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ y: -8, rotateX: 2, rotateY: -2 }}
              style={{ transformStyle: 'preserve-3d' }}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-premium transition hover:border-[#D4722A]/40 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4722A]/50"
              onClick={() => onRoomBook?.(room)}
              onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onRoomBook?.(room)
                }
              }}
            >
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={roomImageMap[room.type_name] ?? '/images/placeholders/room-placeholder.jpg'}
                  alt={room.type_name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-110"
                  priority={index < 1}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                <p className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-700">
                  {room.type_category}
                </p>
                <p className="absolute bottom-3 right-3 rounded-full gradient-gold px-3 py-1 text-xs font-semibold text-white">
                  {formatCurrency(Number(room.base_price))}/night
                </p>
              </div>

              <div className="space-y-3 p-5">
                <h3 className="text-xl font-semibold text-slate-900">{room.type_name}</h3>
                <p className="line-clamp-2 text-sm text-slate-600">{room.description}</p>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-azure-50 px-3 py-1 text-xs font-semibold text-azure-700">
                    <BedDouble className="mr-1 inline h-3 w-3" /> {room.max_occupancy} guests
                  </span>
                  {room.view_type && (
                    <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                      {room.view_type} view
                    </span>
                  )}
                  {room.area_sqft && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {Number(room.area_sqft)} sqft
                    </span>
                  )}
                  {typeof room.smoking === 'boolean' && (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      {room.smoking ? 'Smoking' : 'Non-smoking'}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {(roomAmenities[room.room_type_id] ?? []).slice(0, 4).map((amenity) => (
                    <span key={amenity} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">
                      {amenity}
                    </span>
                  ))}
                </div>

                <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#f0c8a8] bg-[#fff2e7] px-4 py-2.5 text-sm font-semibold text-[#D4722A] transition-colors group-hover:bg-[#ffe7d3]">
                  <CalendarDays className="h-4 w-4" />
                  Book This Room
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  )
}
