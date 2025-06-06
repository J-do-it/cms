import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

// 'articles' 테이블의 스키마에 맞게 이 타입을 수정해야 합니다.
// 현재는 id, title 필드만 사용합니다.
type Article = {
  id: string;
  title: string | null;
}

export default async function AdminPage() {
  const supabase = createClient()
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title')
    .order('created_at', { ascending: false }) // 최신 글이 위로 오도록 정렬

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">게시글 불러오는 중 오류가 발생했습니다: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">관리자 페이지</h1>
        {/* '새 글 작성' 기능이 필요하다면 아래 버튼을 활용할 수 있습니다. */}
        {/* 
        <Link href="/admin/editor/new">
          <a className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">
            새 아티클 작성
          </a>
        </Link>
        */}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {articles && articles.length > 0 ? (
            articles.map((article: Article) => (
              <li key={article.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm text-gray-500 dark:text-gray-400">ID: {article.id}</p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">{article.title || '제목 없음'}</p>
                </div>
                <div className="flex-shrink-0 flex gap-2">
                  <Link href={`/article/${article.id}`} passHref>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                      바로가기
                    </button>
                  </Link>
                  <Link href={`/admin/editor/${article.id}`} passHref>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      편집하기
                    </button>
                  </Link>
                </div>
              </li>
            ))
          ) : (
            <li className="p-6 text-center text-gray-500 dark:text-gray-400">
              작성된 아티클이 없습니다.
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
