import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST — create new order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { data, error } = await supabaseAdmin
      .from('restaurant_orders')
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PATCH — update order status
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { order_id, status, served_at } = body

    if (!order_id || !status) {
      return NextResponse.json({ error: 'Missing order_id or status' }, { status: 400 })
    }

    const update: any = { status }
    if (served_at) update.served_at = served_at

    const { error } = await supabaseAdmin
      .from('restaurant_orders')
      .update(update)
      .eq('order_id', order_id)

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}