import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import ProtectedLayout from '@/components/ProtectedLayout'
import { getUser } from '@/utils/auth-server'
import { isAdmin } from '@/utils/auth'

// 'articles' 테이블의 스키마에 맞게 이 타입을 수정해야 합니다.
// 현재는 id, title 필드만 사용합니다.
type Article = {
  id: string;
  title: string | null;
  status: boolean | null;
}

const createNewArticle = async () => {
  'use server'

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('articles')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching max id:', error.message)
    // 실제 앱에서는 사용자에게 오류를 표시하는 것이 좋습니다.
    return
  }

  const newId = data ? (data.id as number) + 1 : 1

  const { error: insertError } = await supabase
    .from('articles')
    .insert({ id: newId, title: '제목을 입력해주세요' })

  if (insertError) {
    console.error('Error creating article:', insertError.message)
    // 실제 앱에서는 사용자에게 오류를 표시하는 것이 좋습니다.
    return
  }

  redirect(`/dashboard/editor/${newId}`)
}

// 로그아웃 처리
const handleLogout = async () => {
  'use server'
  
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export default async function AdminPage() {
  // 서버 사이드에서 인증 확인
  const { user, role } = await getUser()
  
  if (!user) {
    redirect('/')
  }

  const supabase = await createClient()
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, status')
    .order('created_at', { ascending: false }) // 최신 글이 위로 오도록 정렬

  if (error) {
    return (
      <ProtectedLayout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-red-500">게시글 불러오는 중 오류가 발생했습니다: {error.message}</p>
        </div>
      </ProtectedLayout>
    )
  }

  return (
    <ProtectedLayout>
      <div className="w-full max-w-4xl mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-black">CMS 대시보드</h1>
            <p className="text-sm text-gray-600 mt-2">
              사용자: {user.email} | 권한: {role || 'viewer'}
            </p>
          </div>
          <div className="flex gap-2">
            <form action={createNewArticle}>
              <button
                type="submit"
                className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                + 새 기사 작성
              </button>
            </form>
            {isAdmin(role) && (
              <Link href="/dashboard/users">
                <button className="bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-purple-700">
                  사용자 관리
                </button>
              </Link>
            )}
            <form action={handleLogout}>
              <button
                type="submit"
                className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-900">기사 목록</h2>
            <p className="text-sm text-gray-600">작성된 기사들을 관리할 수 있습니다.</p>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {articles && articles.length > 0 ? (
              articles.map((article: Article) => (
                <li key={article.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">ID: {article.id}</p>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          article.status ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        <span className={`text-xs font-medium ${
                          article.status ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {article.status ? '발행중' : '보류중'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">{article.title || '제목 없음'}</p>
                  </div>
                  <div className="flex-shrink-0 flex gap-2">
                    <Link href={`https://foodbusinesskorea.com/article/${article.id}`} passHref>
                      <button className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                        바로가기
                      </button>
                    </Link>
                    <Link href={`/dashboard/editor/${article.id}`} passHref>
                      <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        편집
                      </button>
                    </Link>
                  </div>
                </li>
              ))
            ) : (
              <li className="p-6 text-center text-gray-500 dark:text-gray-400">
                작성된 기사가 없습니다. 새 기사를 작성해보세요.
              </li>
            )}
          </ul>
        </div>
      </div>
    </ProtectedLayout>
  )
}
