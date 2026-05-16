import { redirect } from 'next/navigation'
import PublicShell from '@/components/guest-portal/PublicShell'
import QuickReviewBox from '@/components/guest-portal/QuickReviewBox'
import { getGuestAccountSnapshot, getPublicHotels, getViewerContext } from '@/lib/supabase/guest-portal'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import LogoutButton from '@/components/guest-portal/LogoutButton'

export default async function MyAccountPage() {
  const [viewer, hotels] = await Promise.all([getViewerContext(), getPublicHotels()])

  if (!viewer.isAuthenticated) {
    redirect('/login')
  }

  const account = await getGuestAccountSnapshot(viewer.userEmail)

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
    { label: 'Total Visits',  value: account.stats.totalVisits,                                                        color: '#D4722A', bg: '#FFF4ED', border: '#F5C9A8' },
    { label: 'Total Nights',  value: account.stats.totalNights,                                                        color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
    { label: 'Total Spend',   value: formatCurrency(account.stats.totalSpend),                                         color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
    { label: 'Upcoming',      value: account.stats.upcomingVisits,                                                     color: '#9333EA', bg: '#FDF4FF', border: '#E9D5FF' },
    { label: 'Last Stay',     value: account.stats.lastVisitDate ? formatDate(account.stats.lastVisitDate) : '—',      color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
  ]

  return (
    <PublicShell isAuthenticated={viewer.isAuthenticated} isStaff={viewer.isStaff}>
      <style>{`html,body,#__next,[data-nextjs-scroll-focus-boundary]{overflow-x:hidden!important;max-width:100%!important;}`}</style>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        /* ─────────────────────────────────────────
           PAGE SHELL
        ───────────────────────────────────────── */
        /* GLOBAL OVERFLOW FIX */
        html, body { overflow-x: hidden; max-width: 100%; }

        .acc-pg {
          font-family: 'DM Sans', sans-serif;
          background: #FAFAF7;
          min-height: 100vh;
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          padding: 1.25rem 1rem 3rem;
        }
        @media (min-width: 480px)  { .acc-pg { padding: 1.75rem 1.25rem 4rem; } }
        @media (min-width: 640px)  { .acc-pg { padding: 2rem 1.5rem 4.5rem; } }
        @media (min-width: 1024px) { .acc-pg { padding: 3rem 2.5rem 6rem; } }

        .acc-wrap { max-width: 900px; width: 100%; margin: 0 auto; overflow-x: hidden; }

        /* ─────────────────────────────────────────
           HERO BANNER
        ───────────────────────────────────────── */
        .acc-hero {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background: #1C1917;
          width: 100%;
          padding: 1.5rem 1.25rem 1.35rem;
          margin-bottom: 1.25rem;
        }
        @media (min-width: 480px) { .acc-hero { padding: 1.75rem 1.5rem 1.6rem; border-radius: 18px; } }
        @media (min-width: 640px) { .acc-hero { padding: 2.25rem 2rem 2rem; border-radius: 20px; margin-bottom: 1.5rem; } }
        @media (min-width: 900px) { .acc-hero { padding: 2.75rem 2.5rem 2.25rem; border-radius: 24px; margin-bottom: 1.75rem; } }

        .acc-hero-blob1 {
          position: absolute; top: -40px; right: -40px;
          width: 200px; height: 200px; border-radius: 50%;
          background: radial-gradient(circle, rgba(212,114,42,0.25) 0%, transparent 70%);
          pointer-events: none;
        }
        @media (min-width: 640px) { .acc-hero-blob1 { width: 260px; height: 260px; } }

        .acc-hero-blob2 {
          position: absolute; bottom: -40px; left: -20px;
          width: 160px; height: 160px; border-radius: 50%;
          background: radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        @media (min-width: 640px) { .acc-hero-blob2 { width: 220px; height: 220px; } }

        .acc-hero-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          flex-wrap: nowrap;
        }
        @media (max-width: 359px) { .acc-hero-content { flex-wrap: wrap; } }

        /* ─────────────────────────────────────────
           AVATAR
        ───────────────────────────────────────── */
        .acc-avatar {
          width: 52px; height: 52px; border-radius: 50%;
          background: linear-gradient(135deg, #D4722A 0%, #EA580C 100%);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem; font-weight: 600; color: #fff;
          flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.15);
          box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        }
        @media (min-width: 480px) { .acc-avatar { width: 60px; height: 60px; font-size: 1.4rem; } }
        @media (min-width: 640px) { .acc-avatar { width: 68px; height: 68px; font-size: 1.6rem; border-width: 3px; } }
        @media (min-width: 900px) { .acc-avatar { width: 76px; height: 76px; font-size: 1.75rem; } }

        .acc-hero-text { flex: 1; min-width: 0; }

        /* ─────────────────────────────────────────
           BADGE / NAME / EMAIL
        ───────────────────────────────────────── */
        .acc-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(212,114,42,0.2); border: 1px solid rgba(212,114,42,0.4);
          border-radius: 999px; padding: 3px 10px;
          font-size: 0.58rem; font-weight: 700;
          color: #F5C9A8; letter-spacing: 0.13em; text-transform: uppercase;
          margin-bottom: 0.5rem;
        }
        @media (min-width: 640px) { .acc-badge { font-size: 0.62rem; padding: 3px 12px; margin-bottom: 0.6rem; } }

        .acc-name {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.25rem, 5.5vw, 2.5rem);
          font-weight: 600; line-height: 1.1; color: #FDF8F3; margin: 0 0 0.3rem;
        }

        .acc-email-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .acc-email {
          font-size: 0.75rem; color: #A8A29E;
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px; padding: 2px 8px;
          font-family: 'DM Sans', sans-serif; word-break: break-all;
          max-width: 100%;
        }
        @media (min-width: 480px) { .acc-email { font-size: 0.8rem; padding: 3px 10px; } }

        .acc-verified {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 0.68rem; color: #86EFAC; font-weight: 600;
          white-space: nowrap;
        }

        .acc-meta-pills {
          display: flex; flex-wrap: wrap; gap: 6px; margin-top: 0.75rem;
        }
        @media (min-width: 640px) { .acc-meta-pills { gap: 8px; margin-top: 1rem; } }

        .acc-meta-pill {
          display: inline-flex; align-items: center; gap: 4px;
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 4px 9px;
          font-size: 0.68rem; color: #D6D3D1; font-weight: 500;
        }
        @media (min-width: 480px) { .acc-meta-pill { font-size: 0.72rem; padding: 5px 11px; gap: 5px; } }
        .acc-meta-pill span { font-weight: 700; color: #FDF8F3; }

        /* ─────────────────────────────────────────
           STATS GRID
        ───────────────────────────────────────── */
        .acc-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.6rem;
          margin-bottom: 1.25rem;
        }
        @media (min-width: 480px) { .acc-stats { gap: 0.75rem; } }
        @media (min-width: 640px) { .acc-stats { grid-template-columns: repeat(3, 1fr); gap: 0.875rem; margin-bottom: 1.5rem; } }
        @media (min-width: 640px) { .acc-stats > *:last-child { grid-column: auto !important; } }
        @media (min-width: 900px) { .acc-stats { grid-template-columns: repeat(5, 1fr); gap: 1rem; margin-bottom: 1.75rem; } }

        .acc-stat {
          border-radius: 14px; padding: 0.9rem 0.85rem;
          border-width: 1.5px; border-style: solid;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        @media (min-width: 640px) { .acc-stat { border-radius: 16px; padding: 1rem 1rem; } }
        .acc-stat:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.07); }

        .acc-stat-label {
          font-size: 0.6rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: #78716C; margin-bottom: 0.35rem;
        }
        @media (min-width: 480px) { .acc-stat-label { font-size: 0.63rem; } }

        .acc-stat-value {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.1rem, 3.5vw, 1.7rem); font-weight: 600; line-height: 1.1;
        }

        /* ─────────────────────────────────────────
           CARDS (generic)
        ───────────────────────────────────────── */
        .acc-card {
          background: #fff; border: 1.5px solid #F0EDE8;
          border-radius: 16px; padding: 1.25rem 1.25rem; margin-bottom: 1rem;
        }
        @media (min-width: 480px) { .acc-card { padding: 1.35rem 1.5rem; border-radius: 18px; } }
        @media (min-width: 640px) { .acc-card { padding: 1.75rem 2rem; border-radius: 20px; margin-bottom: 1.25rem; } }

        .acc-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.15rem; font-weight: 600; color: #1C1917; margin-bottom: 0.3rem;
        }
        @media (min-width: 640px) { .acc-card-title { font-size: 1.2rem; } }

        .acc-card-sub { font-size: 0.8rem; color: #78716C; line-height: 1.6; }
        @media (min-width: 480px) { .acc-card-sub { font-size: 0.82rem; } }

        /* ─────────────────────────────────────────
           INFO CARDS (2-col grid)
        ───────────────────────────────────────── */
        .acc-info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.85rem;
          margin-bottom: 1rem;
        }
        @media (min-width: 560px) { .acc-info-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; } }
        @media (min-width: 640px) { .acc-info-grid { margin-bottom: 1.25rem; } }

        .acc-info-card {
          background: #FAFAF7; border: 1.5px solid #F0EDE8; border-radius: 14px;
          padding: 1.1rem 1.25rem; display: flex; gap: 0.875rem; align-items: flex-start;
        }
        @media (min-width: 640px) { .acc-info-card { border-radius: 16px; padding: 1.35rem 1.5rem; gap: 1rem; } }

        .acc-info-icon {
          width: 36px; height: 36px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; flex-shrink: 0;
        }
        @media (min-width: 640px) { .acc-info-icon { width: 40px; height: 40px; border-radius: 10px; font-size: 1.1rem; } }

        /* ─────────────────────────────────────────
           REVIEW CARD
        ───────────────────────────────────────── */
        .acc-review-card {
          background: #FFF9F5; border: 1.5px solid #F5C9A8;
          border-radius: 16px; padding: 1.25rem 1.25rem; margin-bottom: 1rem;
        }
        @media (min-width: 480px) { .acc-review-card { padding: 1.35rem 1.5rem; border-radius: 18px; } }
        @media (min-width: 640px) { .acc-review-card { padding: 1.75rem 2rem; border-radius: 20px; margin-bottom: 1.25rem; } }

        .acc-review-header { display: flex; align-items: center; gap: 10px; margin-bottom: 0.3rem; }
        .acc-review-dot { width: 8px; height: 8px; border-radius: 50%; background: #D4722A; flex-shrink: 0; }

        /* ─────────────────────────────────────────
           BOOKING ROWS
        ───────────────────────────────────────── */
        .acc-booking-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          border: 1.5px solid #F0EDE8; border-radius: 12px;
          padding: 0.75rem 0.9rem; background: #FAFAF7;
          transition: border-color 0.2s, box-shadow 0.2s;
          margin-bottom: 0.5rem;
        }
        @media (min-width: 480px) { .acc-booking-row { padding: 0.85rem 1rem; } }
        @media (min-width: 640px) { .acc-booking-row { padding: 0.9rem 1.1rem; margin-bottom: 0.6rem; } }
        .acc-booking-row:last-child { margin-bottom: 0; }
        .acc-booking-row:hover { border-color: #F5C9A8; box-shadow: 0 4px 16px rgba(212,114,42,0.08); }

        /* Booking left side */
        .acc-booking-left {
          display: flex; align-items: center; gap: 0.625rem; min-width: 0; flex: 1;
        }

        .acc-booking-icon {
          width: 32px; height: 32px; border-radius: 9px;
          background: #FFF4ED; border: 1.5px solid #F5C9A8;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.9rem; flex-shrink: 0;
        }
        @media (min-width: 480px) { .acc-booking-icon { width: 36px; height: 36px; font-size: 1rem; } }

        .acc-booking-name {
          font-weight: 600; font-size: 0.82rem; color: #1C1917;
          margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        @media (min-width: 480px) { .acc-booking-name { font-size: 0.88rem; } }

        .acc-booking-meta { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }

        .acc-booking-status {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 0.58rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; border-radius: 999px; padding: 2px 8px;
        }
        @media (min-width: 480px) { .acc-booking-status { font-size: 0.62rem; } }

        /* Booking right side — stacks on tiny screens */
        .acc-booking-right {
          text-align: right; flex-shrink: 0;
          display: flex; flex-direction: column; align-items: flex-end; gap: 1px;
        }

        .acc-booking-dates {
          font-size: 0.65rem; color: #A8A29E;
        }
        @media (min-width: 480px) { .acc-booking-dates { font-size: 0.7rem; } }
        /* On very small screens hide the date arrow to save space */
        @media (max-width: 359px) { .acc-booking-arrow { display: none; } }

        .acc-booking-amount {
          font-family: 'Playfair Display', serif;
          font-size: 0.95rem; font-weight: 600; color: #D4722A;
        }
        @media (min-width: 480px) { .acc-booking-amount { font-size: 1rem; } }

        /* ─────────────────────────────────────────
           MISC
        ───────────────────────────────────────── */
        .acc-section-eyebrow {
          font-size: 0.63rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.14em; color: #D4722A; margin-bottom: 0.45rem; display: block;
        }

        .acc-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #E7E3DC, transparent);
          margin: 1.25rem 0;
        }
        @media (min-width: 640px) { .acc-divider { margin: 1.5rem 0; } }

        /* ─────────────────────────────────────────
           LOGOUT BLOCK
        ───────────────────────────────────────── */
        .acc-logout-block {
          margin-top: 1.5rem;
          padding: 1.25rem 1.25rem;
          background: #FFF9F5;
          border: 1.5px solid #F5C9A8;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.875rem;
        }
        @media (min-width: 480px) { .acc-logout-block { padding: 1.35rem 1.5rem; } }
        @media (min-width: 640px) { .acc-logout-block { padding: 1.5rem 2rem; border-radius: 20px; margin-top: 2rem; } }

        .acc-logout-btn {
          display: inline-flex !important;
          align-items: center !important;
          gap: 7px !important;
          padding: 9px 18px !important;
          border-radius: 10px !important;
          border: 1.5px solid #F5C9A8 !important;
          background: #FFF4ED !important;
          color: #B85E1E !important;
          font-size: 0.8rem !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: background 0.2s, border-color 0.2s, box-shadow 0.2s !important;
          backdrop-filter: none !important;
          opacity: 1 !important;
          white-space: nowrap !important;
        }
        @media (min-width: 640px) { .acc-logout-btn { padding: 10px 22px !important; font-size: 0.82rem !important; } }
        .acc-logout-btn:hover {
          background: #FDEBD8 !important;
          border-color: #D4722A !important;
          box-shadow: 0 4px 16px rgba(212,114,42,0.15) !important;
          color: #944A15 !important;
        }
        .acc-logout-btn:disabled { opacity: 0.55 !important; cursor: not-allowed !important; }

        /* ─────────────────────────────────────────
           EMPTY STATE
        ───────────────────────────────────────── */
        .acc-empty {
          text-align: center; padding: 2rem 1rem;
          background: #FAFAF7; border-radius: 12px; border: 1.5px dashed #E7E3DC;
        }
        @media (min-width: 640px) { .acc-empty { padding: 2.5rem 1rem; border-radius: 14px; } }
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
                  <div className="acc-meta-pill">💳 <span>{formatCurrency(account.stats.totalSpend)}</span> lifetime</div>
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
              <div
                key={i}
                className="acc-stat"
                style={{
                  background: s.bg,
                  borderColor: s.border,
                  // On 2-col mobile, the 5th card is alone — span it across both columns
                  gridColumn: i === stats.length - 1 && stats.length % 2 !== 0 ? 'span 2' : undefined,
                }}
              >
                <div className="acc-stat-label">{s.label}</div>
                <div className="acc-stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* ── INFO CARDS ── */}
          <div className="acc-info-grid">
            <div className="acc-info-card">
              <div className="acc-info-icon" style={{ background: '#FFF4ED', border: '1.5px solid #F5C9A8' }}>👤</div>
              <div style={{ minWidth: 0 }}>
                <div className="acc-card-title" style={{ fontSize: '0.97rem' }}>Profile</div>
                <div className="acc-card-sub">Manage your personal details and communication preferences.</div>
                <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: '#78716C' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
                    <span style={{ color: '#A8A29E', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Name</span>
                    <span style={{ fontWeight: 600, color: '#1C1917' }}>{displayName || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ color: '#A8A29E', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, paddingTop: 1 }}>Email</span>
                    <span style={{ fontWeight: 600, color: '#1C1917', wordBreak: 'break-all', flex: 1 }}>{viewer.userEmail}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="acc-info-card">
              <div className="acc-info-icon" style={{ background: '#EFF6FF', border: '1.5px solid #BFDBFE' }}>📋</div>
              <div style={{ minWidth: 0 }}>
                <div className="acc-card-title" style={{ fontSize: '0.97rem' }}>My Bookings</div>
                <div className="acc-card-sub">Your upcoming and past stays and booking timeline.</div>
                <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', borderRadius: 6, padding: '2px 8px' }}>
                    {account.stats.upcomingVisits} upcoming
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#16A34A', borderRadius: 6, padding: '2px 8px' }}>
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
            <p className="acc-card-sub" style={{ marginBottom: '1.1rem' }}>
              Submit your stay feedback. Your review will appear in our guest stories section.
            </p>
            <QuickReviewBox hotels={hotels} />
          </div>

          {/* ── RECENT VISITS ── */}
          <div className="acc-card">
            <span className="acc-section-eyebrow">Stay History</span>
            <h2 className="acc-card-title">Recent Visits</h2>
            <p className="acc-card-sub" style={{ marginBottom: '1.1rem' }}>
              Your last {Math.min(account.bookings.length, 5)} stays at Grand Azure properties.
            </p>

            {account.bookings.length === 0 ? (
              <div className="acc-empty">
                <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>🏨</div>
                <p style={{ fontSize: '0.88rem', color: '#78716C', fontWeight: 500 }}>No visits yet.</p>
                <p style={{ fontSize: '0.78rem', color: '#A8A29E', marginTop: 3 }}>Book your first stay from the Book page.</p>
              </div>
            ) : (
              <div>
                {account.bookings.slice(0, 5).map((booking) => {
                  const hotelName  = (booking.hotels as { hotel_name?: string } | null)?.hotel_name ?? 'Grand Azure'
                  const status     = String(booking.booking_status ?? '').toLowerCase()
                  const statusColor =
                    status === 'confirmed'                              ? { bg: '#F0FDF4', border: '#BBF7D0', text: '#16A34A' } :
                    status === 'checked_out' || status === 'completed' ? { bg: '#EFF6FF', border: '#BFDBFE', text: '#2563EB' } :
                    status === 'cancelled'                              ? { bg: '#FFF1F2', border: '#FECDD3', text: '#E11D48' } :
                    { bg: '#FFF4ED', border: '#F5C9A8', text: '#D4722A' }

                  return (
                    <div key={booking.booking_id} className="acc-booking-row">
                      <div className="acc-booking-left">
                        <div className="acc-booking-icon">🏨</div>
                        <div style={{ minWidth: 0 }}>
                          <p className="acc-booking-name">{hotelName}</p>
                          <div className="acc-booking-meta">
                            <span style={{ fontSize: '0.65rem', color: '#A8A29E' }}>#{booking.confirmation_no}</span>
                            <span className="acc-booking-status" style={{ background: statusColor.bg, border: `1px solid ${statusColor.border}`, color: statusColor.text }}>
                              {booking.booking_status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="acc-booking-right">
                        <p className="acc-booking-dates">
                          {formatDate(String(booking.check_in_date))}<span className="acc-booking-arrow"> → </span>{formatDate(String(booking.check_out_date))}
                        </p>
                        <p className="acc-booking-amount">
                          {formatCurrency(Number(booking.total_amount ?? 0))}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── LOGOUT ── */}
          <div className="acc-logout-block">
            <div>
              <p style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '0.97rem',
                fontWeight: 600,
                color: '#1C1917',
                margin: '0 0 2px',
              }}>
                Sign Out
              </p>
              <p style={{ fontSize: '0.76rem', color: '#A8A29E', margin: 0 }}>
                You'll be returned to the login page.
              </p>
            </div>
            <LogoutButton className="acc-logout-btn" />
          </div>

        </div>
      </div>
    </PublicShell>
  )
}