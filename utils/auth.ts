// 사용자 권한 타입 정의
export type UserRole = 'admin' | 'editor' | 'viewer' | null

// 보호된 경로 목록
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/dashboard/article',
  '/dashboard/editor',
  '/api/admin'
]

// 공개 경로 목록 (로그인 없이 접근 가능)
export const PUBLIC_ROUTES = [
  '/',
  '/api/auth',
  '/login'
]

// 클라이언트 사이드에서 사용자 역할 가져오기
export async function getUserRole(supabaseClient: any, userId: string): Promise<UserRole> {
  try {
    console.log('Fetching user role for ID:', userId)
    
    const { data: userData, error } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user role:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      
      // users 테이블에 레코드가 없는 경우 자동으로 생성 시도
      if (error.code === 'PGRST116') {
        console.log('User not found in users table, attempting to create...')
        
        // 현재 인증된 사용자 정보 가져오기
        const { data: { user } } = await supabaseClient.auth.getUser()
        
        if (user) {
          const { error: insertError } = await supabaseClient
            .from('users')
            .insert({ 
              id: user.id, 
              email: user.email || '', 
              role: 'viewer' 
            })
          
          if (insertError) {
            console.error('Error creating user record:', {
              message: insertError.message,
              details: insertError.details,
              hint: insertError.hint,
              code: insertError.code
            })
          } else {
            console.log('User record created successfully on client side')
            return 'viewer'
          }
        }
      }
      
      return 'viewer'
    }

    const role = userData?.role as UserRole || 'viewer'
    console.log('User role fetched successfully:', role)
    return role
    
  } catch (error) {
    console.error('Error fetching user role:', error)
    return 'viewer'
  }
}

// 경로 접근 권한 확인
export function hasRouteAccess(pathname: string, userRole: UserRole): boolean {
  // 공개 경로는 누구나 접근 가능
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route))) {
    return true
  }
  
  // 보호된 경로는 로그인된 사용자만 접근 가능
  if (PROTECTED_ROUTES.some(route => pathname === route || pathname.startsWith(route))) {
    return userRole !== null
  }
  
  // 기본적으로 로그인된 사용자만 접근 허용
  return userRole !== null
}

// 관리자 권한 확인
export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'admin'
}

// 편집자 이상 권한 확인
export function isEditorOrAbove(userRole: UserRole): boolean {
  return userRole === 'admin' || userRole === 'editor'
} 