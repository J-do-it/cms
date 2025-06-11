'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface LogoutButtonProps {
  className?: string
  children?: React.ReactNode
}

export default function LogoutButton({ className = '', children }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Logout error:', error)
        alert('로그아웃 중 오류가 발생했습니다.')
        return
      }
      
      // 로그아웃 성공
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      alert('로그아웃 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? '로그아웃 중...' : (children || '로그아웃')}
    </button>
  )
} 