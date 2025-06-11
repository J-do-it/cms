'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { UserRole, hasRouteAccess, getUserRole } from '@/utils/auth'

interface ProtectedLayoutProps {
  children: React.ReactNode
  requiredRole?: UserRole
  allowedRoles?: UserRole[]
}

export default function ProtectedLayout({ 
  children, 
  requiredRole,
  allowedRoles 
}: ProtectedLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          console.log('No authenticated user found')
          router.push('/')
          return
        }

        setUser(user)
        
        // users 테이블에서 사용자 역할 확인
        const role = await getUserRole(supabase, user.id)
        setUserRole(role)

        // 권한 확인
        const currentPath = window.location.pathname
        const hasAccess = hasRouteAccess(currentPath, role)
        
        // 특정 역할이 필요한 경우 확인
        if (requiredRole && role !== requiredRole) {
          console.log(`Required role ${requiredRole}, but user has role ${role}`)
          router.push('/dashboard')
          return
        }

        // 허용된 역할 목록이 있는 경우 확인
        if (allowedRoles && !allowedRoles.includes(role!)) {
          console.log(`User role ${role} not in allowed roles:`, allowedRoles)
          router.push('/dashboard')
          return
        }

        if (!hasAccess) {
          console.log(`Access denied to ${currentPath} for role ${role}`)
          router.push('/dashboard')
          return
        }

        setAuthorized(true)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/')
        } else if (event === 'SIGNED_IN') {
          checkAuth()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, supabase, requiredRole, allowedRoles])

  // 로딩 중이거나 권한이 없는 경우
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">인증 확인 중...</span>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600 mb-4">이 페이지에 접근할 권한이 없습니다.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 