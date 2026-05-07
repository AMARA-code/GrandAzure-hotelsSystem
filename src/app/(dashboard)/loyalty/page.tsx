import { createClient } from "@/lib/supabase/server";
import LoyaltyClient from "@/components/loyalty/LoyaltyClient";

export const metadata = {
  title: "Loyalty Program | Grand Azure Hotel Group",
};

interface FlatMember {
  loyalty_id: number;
  guest_id: number;
  tier_id: number;
  card_number: string;
  total_points: number;
  lifetime_points: number;
  expiry_date: string | null;
  enrolled_at: string;
  last_activity: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  nationality: string;
  vip_status: string;
}

interface FlatTransaction {
  transaction_id: number;
  loyalty_id: number;
  booking_id: number | null;
  transaction_type: string;
  points: number;
  balance_after: number;
  description: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface RawMember {
  loyalty_id: number;
  guest_id: number;
  tier_id: number;
  card_number: string;
  total_points: number;
  lifetime_points: number;
  expiry_date: string | null;
  enrolled_at: string;
  last_activity: string;
  guests: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    nationality: string;
    vip_status: string;
  } | null;
}

interface RawTransaction {
  transaction_id: number;
  loyalty_id: number;
  booking_id: number | null;
  transaction_type: string;
  points: number;
  balance_after: number;
  description: string;
  created_at: string;
  loyalty_program: {
    guest_id: number;
    guests: {
      first_name: string;
      last_name: string;
      email: string;
    } | null;
  } | null;
}

interface RawTier {
  tier_id: number;
  tier_name: string;
  min_points: number;
  points_multiplier: string;
  benefits: string;
  created_at: string;
}

export default async function LoyaltyPage() {
  const supabase = await createClient();

  // Fetch members with guest info
  const { data: members } = await supabase
    .from("loyalty_program")
    .select(
      `
      loyalty_id,
      guest_id,
      tier_id,
      card_number,
      total_points,
      lifetime_points,
      expiry_date,
      enrolled_at,
      last_activity,
      guests (
        first_name,
        last_name,
        email,
        phone,
        nationality,
        vip_status
      )
    `
    )
    .order("total_points", { ascending: false });

  // Flatten guest fields
  const flatMembers: FlatMember[] = (
    (members ?? []) as unknown as RawMember[]
  ).map((m: RawMember) => ({
    loyalty_id: m.loyalty_id,
    guest_id: m.guest_id,
    tier_id: m.tier_id,
    card_number: m.card_number,
    total_points: m.total_points,
    lifetime_points: m.lifetime_points,
    expiry_date: m.expiry_date,
    enrolled_at: m.enrolled_at,
    last_activity: m.last_activity,
    first_name: m.guests?.first_name ?? "",
    last_name: m.guests?.last_name ?? "",
    email: m.guests?.email ?? "",
    phone: m.guests?.phone ?? "",
    nationality: m.guests?.nationality ?? "",
    vip_status: m.guests?.vip_status ?? "classic",
  }));

  // Fetch transactions with member + guest join
  const { data: rawTransactions } = await supabase
    .from("loyalty_transactions")
    .select(
      `
      transaction_id,
      loyalty_id,
      booking_id,
      transaction_type,
      points,
      balance_after,
      description,
      created_at,
      loyalty_program (
        guest_id,
        guests (
          first_name,
          last_name,
          email
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  const flatTransactions: FlatTransaction[] = (
    (rawTransactions ?? []) as unknown as RawTransaction[]
  ).map((t: RawTransaction) => ({
    transaction_id: t.transaction_id,
    loyalty_id: t.loyalty_id,
    booking_id: t.booking_id,
    transaction_type: t.transaction_type,
    points: t.points,
    balance_after: t.balance_after,
    description: t.description,
    created_at: t.created_at,
    first_name: t.loyalty_program?.guests?.first_name ?? "",
    last_name: t.loyalty_program?.guests?.last_name ?? "",
    email: t.loyalty_program?.guests?.email ?? "",
  }));

  // Fetch tiers
  const { data: tiers } = await supabase
    .from("loyalty_tiers")
    .select("*")
    .order("min_points", { ascending: true });

  // Compute tier counts from flattened members
  const tierCounts = {
    classic: flatMembers.filter((m: FlatMember) => m.vip_status === "classic").length,
    silver: flatMembers.filter((m: FlatMember) => m.vip_status === "silver").length,
    gold: flatMembers.filter((m: FlatMember) => m.vip_status === "gold").length,
    platinum: flatMembers.filter((m: FlatMember) => m.vip_status === "platinum").length,
    diamond: flatMembers.filter((m: FlatMember) => m.vip_status === "diamond").length,
  };

  const totalPointsIssued = flatMembers.reduce(
    (sum: number, m: FlatMember) => sum + (m.total_points ?? 0),
    0
  );
  const totalLifetimePoints = flatMembers.reduce(
    (sum: number, m: FlatMember) => sum + (m.lifetime_points ?? 0),
    0
  );

  // Map tier_name → vip_status key
  const tierStatusMap: Record<string, keyof typeof tierCounts> = {
    Classic: "classic",
    Silver: "silver",
    Gold: "gold",
    Platinum: "platinum",
    Diamond: "diamond",
  };

  const tiersWithCount = ((tiers ?? []) as RawTier[]).map((t: RawTier) => ({
    ...t,
    member_count: tierCounts[tierStatusMap[t.tier_name]] ?? 0,
  }));

  const stats = {
    totalMembers: flatMembers.length,
    totalPointsIssued,
    totalLifetimePoints,
    tierCounts,
  };

  return (
    <LoyaltyClient
      members={flatMembers}
      transactions={flatTransactions}
      tiers={tiersWithCount}
      stats={stats}
    />
  );
}