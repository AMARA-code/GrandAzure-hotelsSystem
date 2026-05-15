import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fetchHotelContext(): Promise<string> {
  try {
    const [hotelsRes, roomTypesRes, restaurantsRes, roomsRes, menuRes] =
      await Promise.all([
        supabase
          .from("hotels")
          .select(
            "hotel_id, hotel_name, city, address_line1, star_rating, phone, email, check_in_time, check_out_time, total_rooms, status"
          )
          .eq("is_deleted", false),

        supabase
          .from("room_types")
          .select(
            "room_type_id, hotel_id, type_name, type_category, description, max_occupancy, base_price, area_sqft, bed_type, bed_count, view_type, smoking"
          )
          .eq("is_active", true),

        supabase
          .from("restaurants")
          .select(
            "restaurant_id, hotel_id, restaurant_name, cuisine_type, capacity, open_time, close_time"
          )
          .eq("is_active", true),

        supabase
          .from("rooms")
          .select("hotel_id, status")
          .in("status", ["available", "occupied", "maintenance"]),

        supabase
          .from("menu_items")
          .select("category_name, name, description, price, tags, spicy_level")
          .eq("is_available", true)
          .order("category_id"),
      ]);

    const hotels = hotelsRes.data ?? [];
    const roomTypes = roomTypesRes.data ?? [];
    const restaurants = restaurantsRes.data ?? [];
    const rooms = roomsRes.data ?? [];
    const menuItems = menuRes.data ?? [];

    // Compute availability per hotel
    const availabilityMap: Record<number, { available: number; total: number }> = {};
    for (const r of rooms) {
      if (!availabilityMap[r.hotel_id])
        availabilityMap[r.hotel_id] = { available: 0, total: 0 };
      availabilityMap[r.hotel_id].total++;
      if (r.status === "available") availabilityMap[r.hotel_id].available++;
    }

    let context = "=== GRAND AZURE HOTELS — LIVE DATABASE DATA ===\n\n";

    for (const h of hotels) {
      const avail = availabilityMap[h.hotel_id] ?? {
        available: 0,
        total: h.total_rooms,
      };
      context += `## ${h.hotel_name} (${h.city}) ★${h.star_rating}\n`;
      context += `Address: ${h.address_line1}, ${h.city}\n`;
      context += `Phone: ${h.phone} | Email: ${h.email}\n`;
      context += `Check-in: ${h.check_in_time} | Check-out: ${h.check_out_time}\n`;
      context += `Rooms available now: ${avail.available} of ${avail.total}\n`;
      context += `Status: ${h.status}\n\n`;

      const hRoomTypes = roomTypes.filter((rt) => rt.hotel_id === h.hotel_id);
      if (hRoomTypes.length) {
        context += `### Room Types:\n`;
        for (const rt of hRoomTypes) {
          context += `- ${rt.type_name} (${rt.type_category}): PKR ${Number(rt.base_price).toLocaleString()}/night`;
          context += `, ${rt.bed_count}x ${rt.bed_type} bed, max ${rt.max_occupancy} guests`;
          context += `, ${rt.area_sqft} sqft, ${rt.view_type} view`;
          if (rt.smoking) context += `, smoking allowed`;
          if (rt.description) context += `\n  ${rt.description}`;
          context += `\n`;
        }
        context += `\n`;
      }

      const hRestaurants = restaurants.filter((r) => r.hotel_id === h.hotel_id);
      if (hRestaurants.length) {
        context += `### Restaurants:\n`;
        for (const r of hRestaurants) {
          context += `- ${r.restaurant_name} (${r.cuisine_type}): Open ${r.open_time} – ${r.close_time}, capacity ${r.capacity}\n`;
        }
        context += `\n`;
      }

      context += `---\n\n`;
    }

    // Menu section
    if (menuItems.length) {
      context += `## RESTAURANT MENU (All Outlets)\n\n`;
      const grouped: Record<string, typeof menuItems> = {};
      for (const item of menuItems) {
        if (!grouped[item.category_name]) grouped[item.category_name] = [];
        grouped[item.category_name].push(item);
      }
      for (const [category, items] of Object.entries(grouped)) {
        context += `### ${category}:\n`;
        for (const item of items) {
          const spicy =
            item.spicy_level === 1 ? " [Mild]" :
            item.spicy_level === 2 ? " [Medium]" :
            item.spicy_level === 3 ? " [Spicy]" : "";
          const tags = item.tags?.length ? ` (${item.tags.join(", ")})` : "";
          context += `- ${item.name}: PKR ${Number(item.price).toLocaleString()}${spicy}${tags} — ${item.description}\n`;
        }
        context += `\n`;
      }
    }

    return context;
  } catch (err) {
    console.error("Supabase fetch error:", err);
    return "Hotel data temporarily unavailable.";
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const hotelContext = await fetchHotelContext();

    const SYSTEM_PROMPT = `You are the Grand Azure Concierge, a warm and knowledgeable hotel assistant for Grand Azure Hotels — a luxury brand with properties in Karachi, Lahore, and Islamabad.

You have TWO data sources: (1) LIVE database data below, and (2) static knowledge. Always prefer the LIVE data for room availability, pricing, and restaurant info.

${hotelContext}

=== ADDITIONAL STATIC KNOWLEDGE ===

SEASONAL PRICING:
- Eid Peak (Mar 28 – Apr 5): Standard Karachi PKR 20,000; Deluxe Sea View PKR 35,000
- New Year Peak (Dec 25 – Jan 5): Executive Suite Karachi PKR 60,000
- Summer Low (Jun – Aug): Standard Karachi PKR 13,000; Standard Lahore PKR 10,000
- Monsoon (Jul – Sep): Standard Islamabad PKR 9,000

RATE PLANS:
- Bed & Breakfast (BB): Includes breakfast, flexible cancellation — all branches
- Room Only Flexible (ROF): No meals, flexible cancellation — all branches
- Non-Refundable Saver (NRS): Room only, no refund — Karachi only

AMENITIES:
In-room: Free Wi-Fi, Air Conditioning, Flat Screen TV, Mini Bar, In-room Safe, Bathtub, Rain Shower, Balcony
Hotel facilities: Swimming Pool, Fitness Center, Spa, Business Center, Valet Parking
Services: Airport Shuttle, 24-hour Room Service

CONFERENCE & EVENTS:
Karachi — Grand Ballroom: 8,000 sqft | Theatre: 500 | Banquet: 400 | PKR 50,000/hr | PKR 350,000/full day | AV + Wi-Fi included
Karachi — Executive Boardroom: 800 sqft | Theatre: 30 | Boardroom: 20 | PKR 15,000/hr | PKR 80,000/full day
Lahore — Lahori Banquet Hall: 5,000 sqft | Theatre: 300 | Banquet: 250 | PKR 35,000/hr | PKR 250,000/full day
Islamabad — Islamabad Conference: 2,500 sqft | Theatre: 150 | Boardroom: 40 | PKR 20,000/hr | PKR 140,000/full day

LOYALTY PROGRAM:
- Classic (0 pts): Earn 1pt per PKR 100 — standard benefits
- Silver (5,000 pts): 1.25x multiplier — 10% dining discount, late checkout
- Gold (20,000 pts): 1.5x multiplier — 20% dining discount, room upgrade, lounge access
- Platinum (50,000 pts): 2x multiplier — 30% off all services, suite upgrades, butler service
- Diamond (100,000 pts): 3x multiplier — all Platinum benefits + personal concierge + complimentary night

POLICIES:
- Check-in: 2:00 PM | Check-out: 11:00 AM (all properties)
- Flexible rate plans: Free cancellation anytime
- Non-Refundable Saver: No cancellation or refund after booking
- All rooms are non-smoking | Currency: PKR

=== STRICT RESPONSE RULES ===

1. GREETINGS (hi, hello, hey, good morning, salam, etc.):
   - Reply with a warm, SHORT welcome (2–3 sentences max).
   - Mention you can help with rooms, pricing, restaurants, conference halls, and loyalty rewards.
   - End with "What can I help you with today?" — nothing more.
   - Do NOT mention any hotel names, prices, addresses, or data in a greeting reply.

2. SPECIFIC QUESTIONS:
   - Answer ONLY what was asked. Nothing more.
   - If asked about one hotel/city, answer only for that hotel.
   - Keep answers to 3–5 sentences unless the guest explicitly asks for full details.

3. GENERAL RULES:
   - Never dump all hotel data at once unprompted.
   - Always use PKR with commas for prices.
   - For availability, use the "Rooms available now" figures from the live data.
   - If a guest asks about booking, direct them to the website or front desk.
   - If something isn't in the data, offer to connect them with the front desk.
   - Never invent data not present above.
   - For menu questions, use the RESTAURANT MENU section from the live data.`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          max_tokens: 512,
          temperature: 0.5,
          stream: false,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      console.error("Groq API error:", err);
      return NextResponse.json(
        { error: "AI service unavailable" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content ??
      "I'm sorry, I couldn't process that. Please try again.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}