import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ADMIN_EMAIL } from '@/lib/constants/admin'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  let user: { email?: string | null } | null = null
  try {
    const result = await supabase.auth.getUser()
    user = result.data.user
  } catch {
    // If auth provider is temporarily unreachable, keep public routes functional.
    user = null
  }

  const protectedRoutes = [
    '/dashboard', '/bookings', '/rooms', '/guests',
    '/housekeeping', '/maintenance', '/finance', '/staff',
    '/loyalty', '/inventory', '/reviews', '/analytics',
    '/restaurants', '/conference', '/my-account',
  ]

  const isProtected = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Not logged in trying to access protected route
  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Already logged in trying to access auth pages
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && user) {
    let staff: { staff_id: number } | null = null
    try {
      const staffRes = await supabase
        .from('staff')
        .select('staff_id')
        .eq('email', user.email ?? '')
        .eq('is_active', true)
        .maybeSingle()
      staff = staffRes.data
    } catch {
      staff = null
    }

    const isAdminEmail = (user.email ?? '').toLowerCase() === ADMIN_EMAIL.toLowerCase()
    const redirectUrl = new URL(staff || isAdminEmail ? '/dashboard' : '/', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}