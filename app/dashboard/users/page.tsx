import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ProtectedLayout from '@/components/ProtectedLayout'
import { getUser } from '@/utils/auth-server'
import { isAdmin } from '@/utils/auth'
import UserManagement from '@/components/UserManagement'

export default async function UsersPage() {
  // 서버 사이드에서 관리자 권한 확인
  const { user, role } = await getUser()
  
  if (!user || !isAdmin(role)) {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  
  // 모든 사용자 목록 가져오기
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email, role, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    return (
      <ProtectedLayout requiredRole="admin">
        <div className="flex justify-center items-center h-screen">
          <p className="text-red-500">사용자 목록을 불러오는 중 오류가 발생했습니다.</p>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout requiredRole="admin">
      <div className="w-full max-w-6xl mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-black">사용자 관리</h1>
            <p className="text-sm text-gray-600 mt-2">
              시스템 사용자들의 권한을 관리할 수 있습니다.
            </p>
          </div>
        </div>

        <UserManagement initialUsers={users || []} />
      </div>
    </ProtectedLayout>
  )
} 