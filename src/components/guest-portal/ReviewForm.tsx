'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const reviewSchema = z.object({
  confirmationNo: z.string().min(4, 'Confirmation number is required'),
  email: z.string().email('Valid email is required'),
  hotelId: z.coerce.number().min(1, 'Please select a hotel'),
  title: z.string().min(4, 'Title is required').max(80, 'Keep title under 80 characters'),
  reviewText: z.string().min(20, 'Please write at least 20 characters'),
  overallRating: z.coerce.number().min(1).max(10),
})

type ReviewSchema = z.infer<typeof reviewSchema>
type ReviewInput = z.input<typeof reviewSchema>

type HotelOption = { hotel_id: number; hotel_name: string }

export default function ReviewForm({ hotels }: { hotels: HotelOption[] }) {
  const [submitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewInput, unknown, ReviewSchema>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { overallRating: 9 },
  })

  const onSubmit = async (values: ReviewSchema) => {
    setSubmitting(true)
    const supabase = createClient()

    try {
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('booking_id, guest_id, hotel_id')
        .eq('confirmation_no', values.confirmationNo)
        .eq('hotel_id', values.hotelId)
        .maybeSingle()

      if (bookingError || !booking) {
        toast.error('Booking not found for this hotel and confirmation number.')
        return
      }

      const { data: guest, error: guestError } = await supabase
        .from('guests')
        .select('guest_id, email')
        .eq('guest_id', booking.guest_id)
        .maybeSingle()

      if (guestError || !guest || guest.email?.toLowerCase() !== values.email.toLowerCase()) {
        toast.error('Email does not match the booking guest.')
        return
      }

      const { error: insertError } = await supabase.from('reviews').insert({
        hotel_id: booking.hotel_id,
        guest_id: booking.guest_id,
        booking_id: booking.booking_id,
        overall_rating: values.overallRating,
        cleanliness_rating: values.overallRating,
        service_rating: values.overallRating,
        location_rating: values.overallRating,
        value_rating: values.overallRating,
        title: values.title,
        review_text: values.reviewText,
        platform: 'direct',
        is_verified: false,
        is_published: true,
      })

      if (insertError) {
        toast.error(insertError.message)
        return
      }

      toast.success('Review submitted successfully.')
      reset({ overallRating: 9 })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid gap-4 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-premium glass md:grid-cols-2"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Confirmation No</label>
        <input {...register('confirmationNo')} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-azure-500 focus:outline-none" />
        {errors.confirmationNo && <p className="text-xs text-rose-600">{errors.confirmationNo.message}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Email</label>
        <input {...register('email')} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-azure-500 focus:outline-none" />
        {errors.email && <p className="text-xs text-rose-600">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Hotel</label>
        <select {...register('hotelId')} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-azure-500 focus:outline-none">
          <option value="">Select hotel</option>
          {hotels.map((hotel) => (
            <option key={hotel.hotel_id} value={hotel.hotel_id}>
              {hotel.hotel_name}
            </option>
          ))}
        </select>
        {errors.hotelId && <p className="text-xs text-rose-600">{errors.hotelId.message}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Overall Rating (1-10)</label>
        <input type="number" min={1} max={10} {...register('overallRating')} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-azure-500 focus:outline-none" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-medium text-slate-700">Review Title</label>
        <input {...register('title')} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-azure-500 focus:outline-none" />
        {errors.title && <p className="text-xs text-rose-600">{errors.title.message}</p>}
      </div>
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-medium text-slate-700">Your Experience</label>
        <textarea rows={5} {...register('reviewText')} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-azure-500 focus:outline-none" />
        {errors.reviewText && <p className="text-xs text-rose-600">{errors.reviewText.message}</p>}
      </div>
      <button disabled={submitting} className="md:col-span-2 rounded-xl gradient-azure px-4 py-3 text-sm font-semibold text-white shadow-azure disabled:opacity-70">
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </motion.form>
  )
}
