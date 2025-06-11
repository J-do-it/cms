import { createClient } from './supabase/server'
import { User } from '@supabase/supabase-js'

// 사용자 권한 타입 정의
export type UserRole = 'admin' | 'editor' | 'viewer' | null

// 서버 사이드에서 사용자 정보 가져오기
export async function getUser(): Promise<{ user: User | null; role: UserRole }> {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      console.log('No authenticated user:', error?.message || 'User is null')
      return { user: null, role: null }
    }

    console.log('Authenticated user ID:', user.id)

    // users 테이블에서 role 가져오기
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('Error fetching user role:', {
        message: userError.message,
        details: userError.details,
        hint: userError.hint,
        code: userError.code
      })
      
      // users 테이블에 레코드가 없는 경우 자동으로 생성
      if (userError.code === 'PGRST116') {
        console.log('User not found in users table, creating new record...')
        const { error: insertError } = await supabase
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
          return { user, role: 'viewer' }
        }
        
        console.log('User record created successfully')
        return { user, role: 'viewer' }
      }
      
      return { user, role: 'viewer' }
    }

    const role = userData?.role as UserRole || 'viewer'
    console.log('User role fetched successfully:', role)
    
    return { user, role }
  } catch (error) {
    console.error('Auth error:', error)
    return { user: null, role: null }
  }
} 