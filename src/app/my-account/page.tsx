import { redirect } from 'next/navigation'
import PublicShell from '@/components/guest-portal/PublicShell'
import QuickReviewBox from '@/components/guest-portal/QuickReviewBox'
import { getGuestAccountSnapshot, getPublicHotels, getViewerContext } from '@/lib/supabase/guest-portal'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'

export default async function MyAccountPage() {
  const [viewer, hotels] = await Promise.all([getViewerContext(), getPublicHotels()])

  if (!viewer.isAuthenticated) {
    redirect('/login')
  }

  const account = await getGuestAccountSnapshot(viewer.userEmail)

  // ── Display name: use real guest name from DB, fall back to email-derived ──
  const guestFirstName = account.guest?.first_name ?? ''
  const guestLastName  = account.guest?.last_name  ?? ''
  const displayName    = (guestFirstName || guestLastName)
    ? `${guestFirstName} ${guestLastName}`.trim()
    : (viewer.userEmail?.split('@')[0] ?? '')
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (c: string) => c.toUpperCase())

  const initials = (guestFirstName && guestLastName)
    ? `${guestFirstName[0]}${guestLastName[0]}`.toUpperCase()
    : displayName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()

  const stats = [
    { label: 'Total Visits',    value: account.stats.totalVisits,                        color: '#D4722A', bg: '#FFF4ED', border: '#F5C9A8' },
    { label: 'Total Nights',    value: account.stats.totalNights,                        color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
    { label: 'Total Spend',     value: formatCurrency(account.stats.totalSpend),         color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
    { label: 'Upcoming',        value: account.stats.upcomingVisits,                     color: '#9333EA', bg: '#FDF4FF', border: '#E9D5FF' },
    { label: 'Last Stay',       value: account.stats.lastVisitDate ? formatDate(account.stats.lastVisitDate) : '—', color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
  ]

  return (
    <PublicShell isAuthenticated={viewer.isAuthenticated} isStaff={viewer.isStaff}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .acc-pg {
          font-family: 'DM Sans', sans-serif;
          background: #FAFAF7;
          min-height: 100vh;
          padding: 2rem 1.25rem 4rem;
        }
        @media (min-width: 640px)  { .acc-pg { padding: 2.5rem 1.75rem 5rem; } }
        @media (min-width: 1024px) { .acc-pg { padding: 3rem 2.5rem 6rem; } }

        .acc-wrap { max-width: 900px; margin: 0 auto; }

        /* ── Hero banner ── */
        .acc-hero {
          position: relative; border-radius: 20px; overflow: hidden;
          background: #1C1917; padding: 2.25rem 1.75rem 2rem; margin-bottom: 1.75rem;
        }
        @media (min-width: 640px) { .acc-hero { padding: 2.75rem 2.5rem 2.25rem; border-radius: 24px; } }

        .acc-hero-blob1 {
          position: absolute; top: -40px; right: -40px;
          width: 260px; height: 260px; border-radius: 50%;
          background: radial-gradient(circle, rgba(212,114,42,0.25) 0%, transparent 70%);
          pointer-events: none;
        }
        .acc-hero-blob2 {
          position: absolute; bottom: -40px; left: -20px;
          width: 220px; height: 220px; border-radius: 50%;
          background: radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .acc-hero-content {
          position: relative; z-index: 1;
          display: flex; align-items: flex-start; gap: 1.25rem; flex-wrap: wrap;
        }

        .acc-avatar {
          width: 64px; height: 64px; border-radius: 50%;
          background: linear-gradient(135deg, #D4722A 0%, #EA580C 100%);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem; font-weight: 600; color: #fff;
          flex-shrink: 0;
          border: 3px solid rgba(255,255,255,0.15);
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        }
        @media (min-width: 640px) { .acc-avatar { width: 76px; height: 76px; font-size: 1.75rem; } }

        .acc-hero-text { flex: 1; min-width: 0; }

        .acc-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(212,114,42,0.2); border: 1px solid rgba(212,114,42,0.4);
          border-radius: 999px; padding: 3px 12px;
          font-size: 0.62rem; font-weight: 700;
          color: #F5C9A8; letter-spacing: 0.13em; text-transform: uppercase;
          margin-bottom: 0.6rem;
        }

        .acc-name {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.6rem, 5vw, 2.5rem);
          font-weight: 600; line-height: 1.1; color: #FDF8F3; margin: 0 0 0.35rem;
        }

        .acc-email-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .acc-email {
          font-size: 0.82rem; color: #A8A29E;
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px; padding: 3px 10px;
          font-family: 'DM Sans', sans-serif; word-break: break-all;
        }
        .acc-verified {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 0.7rem; color: #86EFAC; font-weight: 600;
        }

        .acc-meta-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 1rem; }
        .acc-meta-pill {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 5px 12px;
          font-size: 0.73rem; color: #D6D3D1; font-weight: 500;
        }
        .acc-meta-pill span { font-weight: 700; color: #FDF8F3; }

        /* ── Stats grid ── */
        .acc-stats {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem; margin-bottom: 1.75rem;
        }
        @media (min-width: 640px) { .acc-stats { grid-template-columns: repeat(3, 1fr); gap: 1rem; } }
        @media (min-width: 900px) { .acc-stats { grid-template-columns: repeat(5, 1fr); } }

        .acc-stat {
          border-radius: 16px; padding: 1.1rem 1rem;
          border-width: 1.5px; border-style: solid;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .acc-stat:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.07); }
        .acc-stat-label {
          font-size: 0.65rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.09em; color: #78716C; margin-bottom: 0.4rem;
        }
        .acc-stat-value {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.3rem, 3vw, 1.7rem); font-weight: 600; line-height: 1.1;
        }

        /* ── Card ── */
        .acc-card {
          background: #fff; border: 1.5px solid #F0EDE8;
          border-radius: 20px; padding: 1.5rem; margin-bottom: 1.25rem;
        }
        @media (min-width: 640px) { .acc-card { padding: 1.75rem 2rem; } }

        .acc-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem; font-weight: 600; color: #1C1917; margin-bottom: 0.35rem;
        }
        .acc-card-sub { font-size: 0.82rem; color: #78716C; line-height: 1.6; }

        /* ── Two-col info cards ── */
        .acc-info-grid {
          display: grid; grid-template-columns: 1fr; gap: 1.25rem; margin-bottom: 1.25rem;
        }
        @media (min-width: 640px) { .acc-info-grid { grid-template-columns: repeat(2, 1fr); } }

        .acc-info-card {
          background: #FAFAF7; border: 1.5px solid #F0EDE8; border-radius: 16px;
          padding: 1.35rem 1.5rem; display: flex; gap: 1rem; align-items: flex-start;
        }
        .acc-info-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; flex-shrink: 0;
        }

        /* ── Review section ── */
        .acc-review-card {
          background: #FFF9F5; border: 1.5px solid #F5C9A8;
          border-radius: 20px; padding: 1.5rem; margin-bottom: 1.25rem;
        }
        @media (min-width: 640px) { .acc-review-card { padding: 1.75rem 2rem; } }

        .acc-review-header { display: flex; align-items: center; gap: 10px; margin-bottom: 0.35rem; }
        .acc-review-dot { width: 8px; height: 8px; border-radius: 50%; background: #D4722A; flex-shrink: 0; }

        /* ── Bookings list ── */
        .acc-booking-row {
          display: flex; flex-wrap: wrap; align-items: center;
          justify-content: space-between; gap: 0.5rem;
          border: 1.5px solid #F0EDE8; border-radius: 12px;
          padding: 0.9rem 1.1rem; background: #FAFAF7;
          transition: border-color 0.2s, box-shadow 0.2s; margin-bottom: 0.6rem;
        }
        .acc-booking-row:last-child { margin-bottom: 0; }
        .acc-booking-row:hover { border-color: #F5C9A8; box-shadow: 0 4px 16px rgba(212,114,42,0.08); }

        .acc-booking-status {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 0.62rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; border-radius: 999px; padding: 2px 9px;
        }

        .acc-section-eyebrow {
          font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.14em; color: #D4722A; margin-bottom: 0.5rem; display: block;
        }

        .acc-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #E7E3DC, transparent);
          margin: 1.5rem 0;
        }
      `}</style>

      <div className="acc-pg">
        <div className="acc-wrap">

          {/* ── HERO BANNER ── */}
          <div className="acc-hero">
            <div className="acc-hero-blob1" />
            <div className="acc-hero-blob2" />
            <div className="acc-hero-content">
              <div className="acc-avatar">{initials || 'G'}</div>
              <div className="acc-hero-text">
                <div className="acc-badge">✦ Grand Azure Member</div>
                <h1 className="acc-name">{displayName || 'Valued Guest'}</h1>
                <div className="acc-email-row">
                  <span className="acc-email">{viewer.userEmail}</span>
                  <span className="acc-verified">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="6" fill="#22C55E" fillOpacity="0.2"/>
                      <path d="M3.5 6l1.75 1.75L8.5 4.5" stroke="#22C55E" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Verified
                  </span>
                </div>
                <div className="acc-meta-pills">
                  <div className="acc-meta-pill">🏨 <span>{account.stats.totalVisits}</span> stays</div>
                  <div className="acc-meta-pill">🌙 <span>{account.stats.totalNights}</span> nights</div>
                  <div className="acc-meta-pill">💳 <span>{formatCurrency(account.stats.totalSpend)}</span> lifetime spend</div>
                  {account.stats.upcomingVisits > 0 && (
                    <div className="acc-meta-pill" style={{ borderColor: 'rgba(34,197,94,0.3)', color: '#86EFAC' }}>
                      ✈️ <span style={{ color: '#86EFAC' }}>{account.stats.upcomingVisits}</span> upcoming
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── STATS GRID ── */}
          <div className="acc-stats">
            {stats.map((s, i) => (
              <div key={i} className="acc-stat" style={{ background: s.bg, borderColor: s.border }}>
                <div className="acc-stat-label">{s.label}</div>
                <div className="acc-stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* ── INFO CARDS ── */}
          <div className="acc-info-grid">
            <div className="acc-info-card">
              <div className="acc-info-icon" style={{ background: '#FFF4ED', border: '1.5px solid #F5C9A8' }}>👤</div>
              <div>
                <div className="acc-card-title" style={{ fontSize: '1rem' }}>Profile</div>
                <div className="acc-card-sub">Manage your personal details and communication preferences.</div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#78716C' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ color: '#A8A29E', fontSize: '0.7rem' }}>NAME</span>
                    <span style={{ fontWeight: 600, color: '#1C1917' }}>{displayName || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#A8A29E', fontSize: '0.7rem' }}>EMAIL</span>
                    <span style={{ fontWeight: 600, color: '#1C1917', wordBreak: 'break-all' }}>{viewer.userEmail}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="acc-info-card">
              <div className="acc-info-icon" style={{ background: '#EFF6FF', border: '1.5px solid #BFDBFE' }}>📋</div>
              <div>
                <div className="acc-card-title" style={{ fontSize: '1rem' }}>My Bookings</div>
                <div className="acc-card-sub">Your upcoming and past stays, invoices, and booking timeline.</div>
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', borderRadius: 6, padding: '2px 8px' }}>
                    {account.stats.upcomingVisits} upcoming
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#16A34A', borderRadius: 6, padding: '2px 8px' }}>
                    {account.stats.totalVisits} total
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── WRITE A REVIEW ── */}
          <div className="acc-review-card" id="write-review">
            <div className="acc-review-header">
              <div className="acc-review-dot" />
              <span className="acc-section-eyebrow" style={{ marginBottom: 0 }}>Share Your Experience</span>
            </div>
            <h2 className="acc-card-title">Write a Review</h2>
            <p className="acc-card-sub" style={{ marginBottom: '1.25rem' }}>
              Submit your stay feedback. Your review will appear in our guest stories section.
            </p>
            <QuickReviewBox hotels={hotels} />
          </div>

          {/* ── RECENT VISITS ── */}
          <div className="acc-card">
            <span className="acc-section-eyebrow">Stay History</span>
            <h2 className="acc-card-title">Recent Visits</h2>
            <p className="acc-card-sub" style={{ marginBottom: '1.25rem' }}>
              Your last {Math.min(account.bookings.length, 5)} stays at Grand Azure properties.
            </p>

            {account.bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', background: '#FAFAF7', borderRadius: 14, border: '1.5px dashed #E7E3DC' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🏨</div>
                <p style={{ fontSize: '0.9rem', color: '#78716C', fontWeight: 500 }}>No visits yet.</p>
                <p style={{ fontSize: '0.8rem', color: '#A8A29E', marginTop: 4 }}>Book your first stay from the Book page.</p>
              </div>
            ) : (
              <div>
                {account.bookings.slice(0, 5).map((booking) => {
                  const hotelName  = (booking.hotels as { hotel_name?: string } | null)?.hotel_name ?? 'Grand Azure'
                  const status     = String(booking.booking_status ?? '').toLowerCase()
                  const statusColor =
                    status === 'confirmed'                           ? { bg: '#F0FDF4', border: '#BBF7D0', text: '#16A34A' } :
                    status === 'checked_out' || status === 'completed' ? { bg: '#EFF6FF', border: '#BFDBFE', text: '#2563EB' } :
                    status === 'cancelled'                           ? { bg: '#FFF1F2', border: '#FECDD3', text: '#E11D48' } :
                    { bg: '#FFF4ED', border: '#F5C9A8', text: '#D4722A' }

                  return (
                    <div key={booking.booking_id} className="acc-booking-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFF4ED', border: '1.5px solid #F5C9A8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>🏨</div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1C1917', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {hotelName}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.7rem', color: '#A8A29E' }}>#{booking.confirmation_no}</span>
                            <span className="acc-booking-status" style={{ background: statusColor.bg, border: `1px solid ${statusColor.border}`, color: statusColor.text }}>
                              {booking.booking_status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: '0.72rem', color: '#A8A29E', marginBottom: 2 }}>
                          {formatDate(String(booking.check_in_date))} → {formatDate(String(booking.check_out_date))}
                        </p>
                        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 600, color: '#D4722A' }}>
                          {formatCurrency(Number(booking.total_amount ?? 0))}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </PublicShell>
  )
}