import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { getUser } from '@/utils/auth-server'
import { isAdmin } from '@/utils/auth'

export async function GET(request: NextRequest) {
  try {
    // 인증 및 권한 확인
    const { user, role } = await getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Please login' },
        { status: 401 }
      )
    }

    if (!isAdmin(role)) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }

    // 관리자 전용 로직 - 사용자 목록 조회
    const supabase = await createClient()
    
    // 예시: 사용자 통계 조회
    const { data: userStats, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error('Admin API error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Admin access granted',
      userCount: userStats.users.length,
      requestedBy: user.email,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST 요청도 관리자만 접근 가능
export async function POST(request: NextRequest) {
  try {
    const { user, role } = await getUser()
    
    if (!user || !isAdmin(role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // 관리자 전용 POST 로직
    return NextResponse.json({
      message: 'Admin POST operation completed',
      data: body,
      processedBy: user.email
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 