'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type HotelOption = { hotel_id: number; hotel_name: string }

export default function QuickReviewBox({ hotels }: { hotels: HotelOption[] }) {
  const [loading, setLoading] = useState(false)
  const [rating, setRating]   = useState(0)
  const [hovered, setHovered] = useState(0)
  const [hotelId, setHotelId] = useState('')
  const [text, setText]       = useState('')

  const submit = async () => {
    if (!hotelId)     { toast.error('Please select a hotel.'); return }
    if (rating === 0) { toast.error('Please select a star rating.'); return }
    if (!text.trim()) { toast.error('Please write your review.'); return }

    setLoading(true)
    const supabase = createClient()
    try {
      // Resolve logged-in user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) { toast.error('You must be logged in.'); return }

      // Resolve guest_id from guests table
      const { data: guest } = await supabase
        .from('guests')
        .select('guest_id, first_name, last_name')
        .eq('email', user.email)
        .maybeSingle()

      if (!guest) { toast.error('Guest profile not found for your account.'); return }

      // Find most recent booking for this guest + hotel (nullable link)
      const { data: booking } = await supabase
        .from('bookings')
        .select('booking_id')
        .eq('guest_id', guest.guest_id)
        .eq('hotel_id', Number(hotelId))
        .order('check_in_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      // Multiply star rating × 2 before saving:
      // Guest picks 1–5 stars → stored as 2–10 in DB
      // This keeps the admin panel's /10 scale correct.
      const dbRating = rating * 2

      const { error } = await supabase.from('reviews').insert({
        hotel_id:           Number(hotelId),
        guest_id:           guest.guest_id,
        booking_id:         booking?.booking_id ?? null,
        overall_rating:     dbRating,
        cleanliness_rating: dbRating,
        service_rating:     dbRating,
        location_rating:    dbRating,
        value_rating:       dbRating,
        title:              text.trim().slice(0, 80),
        review_text:        text.trim(),
        platform:           'direct',
        is_verified:        false,
        is_published:       true,
      })

      if (error) throw error

      toast.success(`Review submitted, ${guest.first_name}! Thank you.`)
      setRating(0); setHotelId(''); setText('')
    } catch (err: any) {
      toast.error(err.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const displayRating = hovered || rating
  const ratingLabel   = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][displayRating] ?? ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

      {/* Property selector */}
      <select
        value={hotelId}
        onChange={e => setHotelId(e.target.value)}
        style={{
          width: '100%', padding: '0.6rem 0.9rem',
          borderRadius: 10, border: '1.5px solid #F0EDE8',
          background: '#fff', fontSize: '0.82rem',
          color: hotelId ? '#1C1917' : '#A8A29E',
          outline: 'none', cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <option value="">Select a property…</option>
        {hotels.map(h => (
          <option key={h.hotel_id} value={h.hotel_id}>{h.hotel_name}</option>
        ))}
      </select>

      {/* Star rating */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{
          fontSize: '0.68rem', color: '#78716C', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          Rating
        </span>
        <div style={{ display: 'flex', gap: 2 }}>
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(s)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '2px 3px', fontSize: '1.45rem', lineHeight: 1,
                color: s <= displayRating ? '#D4722A' : '#E7E3DC',
                transition: 'color 0.12s, transform 0.1s',
                transform: s <= displayRating ? 'scale(1.15)' : 'scale(1)',
              }}
            >
              ★
            </button>
          ))}
        </div>
        {displayRating > 0 && (
          <span style={{ fontSize: '0.75rem', color: '#D4722A', fontWeight: 700 }}>
            {ratingLabel}
          </span>
        )}
      </div>

      {/* Review text */}
      <textarea
        rows={4}
        placeholder="Share your experience — what did you love? What could be better?"
        value={text}
        onChange={e => setText(e.target.value)}
        style={{
          width: '100%', padding: '0.75rem 1rem',
          borderRadius: 12, border: '1.5px solid #F0EDE8',
          background: '#fff', fontSize: '0.85rem',
          color: '#1C1917', resize: 'vertical', outline: 'none',
          fontFamily: "'DM Sans', sans-serif", lineHeight: 1.65,
          transition: 'border-color 0.2s',
        }}
        onFocus={e => (e.target.style.borderColor = '#F5C9A8')}
        onBlur={e  => (e.target.style.borderColor = '#F0EDE8')}
      />

      {/* Submit */}
      <button
        type="button"
        onClick={submit}
        disabled={loading}
        style={{
          alignSelf: 'flex-start',
          padding: '0.6rem 1.6rem',
          borderRadius: 10, border: 'none',
          background: 'linear-gradient(135deg, #D4722A 0%, #EA580C 100%)',
          color: '#fff', fontWeight: 700, fontSize: '0.82rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          boxShadow: '0 4px 14px rgba(212,114,42,0.3)',
          transition: 'opacity 0.2s',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {loading ? 'Submitting…' : 'Submit Review'}
      </button>
    </div>
  )
}