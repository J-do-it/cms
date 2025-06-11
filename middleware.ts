import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { UserRole, PUBLIC_ROUTES, hasRouteAccess } from './utils/auth'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // 사용자 인증 상태 확인
  const { data: { user }, error } = await supabase.auth.getUser()
  
  const pathname = request.nextUrl.pathname
  
  // 사용자 역할 가져오기 (users 테이블에서)
  let userRole: UserRole = null
  
  if (user) {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('Error fetching user role in middleware:', userError)
        userRole = 'viewer' // 기본값
      } else {
        userRole = userData?.role as UserRole || 'viewer'
      }
    } catch (error) {
      console.error('Error in middleware user role fetch:', error)
      userRole = 'viewer'
    }
  }

  // 공개 경로인지 확인
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route)
  )

  // 로그인이 필요한 페이지에 비로그인 사용자가 접근하는 경우
  if (!isPublicRoute && !user) {
    console.log(`Unauthorized access attempt to ${pathname}`)
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 권한 확인
  if (!hasRouteAccess(pathname, userRole)) {
    console.log(`Access denied for user role ${userRole} to ${pathname}`)
    
    // 로그인되지 않은 사용자는 메인 페이지로
    if (!user) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // 로그인은 되어있지만 권한이 없는 경우 대시보드로
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 로그인된 사용자가 메인 페이지(로그인 페이지)에 접근하는 경우 대시보드로 리디렉션
  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // API 라우트에 대한 추가 보안 검사
  if (pathname.startsWith('/api/admin')) {
    if (userRole !== 'admin') {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth/callback).*)',
  ],
} 