'use client'

import { useEffect, useState } from 'react'

const defaultQuips = [
  'Good things take time. Great things take slightly longer.',
  'Straightening the gold frames on your data…',
  'Almost there — just ironing the tablecloth.',
  'Summoning your finest experience from the vault…',
]

type GrandAzureLoaderProps = {
  subtitle?: string
  quips?: string[]
  variant?: 'full' | 'inline'
}

export default function GrandAzureLoader({
  subtitle = 'Polishing the gold, brewing your experience…',
  quips = defaultQuips,
  variant = 'full',
}: GrandAzureLoaderProps) {
  const [quipIndex, setQuipIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setQuipIndex(i => (i + 1) % quips.length), 6000)
    return () => clearInterval(t)
  }, [quips])

  const isFull = variant === 'full'

  return (
    <div
      style={{
        ...(isFull
          ? {
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }
          : { position: 'relative', padding: '48px 0' }),
        background: '#FAF6EF',
        width: '100%',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            left: '-10%',
            bottom: '-10%',
            background: 'radial-gradient(circle, rgba(212,114,42,0.08) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            right: '-5%',
            top: '-10%',
            background: 'radial-gradient(circle, rgba(212,114,42,0.06) 0%, transparent 70%)',
          }}
        />
      </div>

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 24px',
          margin: isFull ? undefined : '0 auto',
        }}
      >
        <div style={{ position: 'relative', width: 128, height: 128, marginBottom: 24 }}>
          <div
            style={{
              position: 'absolute',
              top: -20,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 6,
            }}
          >
            {[
              { h: 14, delay: '0ms' },
              { h: 20, delay: '300ms' },
              { h: 14, delay: '600ms' },
            ].map((s, i) => (
              <span
                key={i}
                style={{
                  display: 'block',
                  width: 3,
                  height: s.h,
                  borderRadius: 4,
                  background: 'rgba(212,114,42,0.4)',
                  animation: `grandSteam 1.8s ease-in-out ${s.delay} infinite`,
                  transformOrigin: 'bottom center',
                }}
              />
            ))}
          </div>

          <div style={{ position: 'absolute', inset: 0, animation: 'grandSpin 3s linear infinite' }}>
            <div
              style={{
                position: 'absolute',
                top: 4,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#D4722A',
                boxShadow: '0 0 0 4px rgba(212,114,42,0.18)',
              }}
            />
          </div>

          <div style={{ position: 'absolute', inset: 12, animation: 'grandSpin 2s linear infinite reverse' }}>
            <div
              style={{
                position: 'absolute',
                top: 2,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#E8A96A',
              }}
            />
          </div>

          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
              userSelect: 'none',
              animation: 'grandBob 2s ease-in-out infinite',
            }}
          >
            ☕
          </div>
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 28,
            fontWeight: 500,
            color: '#3D2B1A',
            letterSpacing: '-0.3px',
            margin: '0 0 6px',
          }}
        >
          Grand <em style={{ fontStyle: 'italic', color: '#D4722A' }}>Azure</em>
        </h1>

        <p style={{ fontSize: 13, letterSpacing: '0.05em', color: '#9B7A5A', margin: '0 0 28px' }}>
          {subtitle}
        </p>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20 }}>
          {(['#D4722A', '#E8A96A', '#C4B89A'] as const).map((color, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: color,
                animation: `grandBounce 1.2s ease-in-out ${i * 200}ms infinite`,
              }}
            />
          ))}
        </div>

        <p
          key={quipIndex}
          style={{
            fontSize: 12,
            color: '#B8946A',
            fontStyle: 'italic',
            maxWidth: 280,
            margin: 0,
            animation: 'grandFade 0.5s ease-in-out',
          }}
        >
          &ldquo;{quips[quipIndex]}&rdquo;
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;1,400&display=swap');
        @keyframes grandSpin   { to { transform: rotate(360deg); } }
        @keyframes grandBob    { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        @keyframes grandSteam  { 0%,100% { transform: scaleX(1) translateY(0); opacity:.4; } 50% { transform: scaleX(1.5) translateY(-7px); opacity:.7; } }
        @keyframes grandBounce { 0%,100% { transform: translateY(0); opacity:.7; } 50% { transform: translateY(-9px); opacity:1; } }
        @keyframes grandFade   { from { opacity:0; transform: translateY(4px); } to { opacity:1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
