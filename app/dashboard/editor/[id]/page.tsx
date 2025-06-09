'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useParams, useRouter, notFound } from 'next/navigation'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Youtube from '@tiptap/extension-youtube'
import Image from '@tiptap/extension-image'

type Article = {
  id: string;
  title: string | null;
  author: string | null;
  intro: string | null;
  created_at: string | null;
  content: string | null;
  [key: string]: unknown;
}

// ---- tiptap 에디터 + 툴바 컴포넌트 ----
function TiptapEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: 'w-full aspect-video max-w-[640px] mx-auto my-4',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          'w-full min-h-[100px] bg-white text-black border border-gray-300 rounded-md px-4 py-3 focus:outline-none text-sm',
      },
    },
  })

  if (!editor) return null

  return (
    <div>
      {/* 툴바 */}
      <div className="mb-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded ${editor.isActive('bold') ? 'bg-jj text-white' : 'bg-gray-200 text-black'}`}
        >
          <b>b</b>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded ${editor.isActive('italic') ? 'bg-jj text-white' : 'bg-gray-200 text-black'}`}
        >
          <i>i</i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-jj text-white' : 'bg-gray-200 text-black'}`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-2 py-1 rounded bg-gray-200 text-black"
        >
          구분선
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt('링크 주소 입력:')
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
            className={`px-2 py-1 rounded ${editor.isActive('link') ? 'bg-jj text-white' : 'bg-gray-200 text-black'}`}
        >
          링크
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
          className="px-2 py-1 rounded bg-gray-200 text-black"
        >
          링크삭제
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt('YouTube 동영상 주소 입력:')
            if (url) {
              editor.chain().focus().setYoutubeVideo({ src: url }).run()
            }
          }}
          className="px-2 py-1 rounded bg-gray-200 text-black"
        >
          유튜브
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt('이미지 주소 입력:')
            if (url) {
              editor.chain().focus().setImage({ src: url }).run()
            }
          }}
          className="px-2 py-1 rounded bg-gray-200 text-black"
        >
          이미지
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
// ---------------------------------

const EditorPage = () => {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // 안전하게 id 추출
  const id = Array.isArray(params.id) ? params.id[0] : params.id

  useEffect(() => {
    const fetchArticle = async () => {
      setIsLoading(true)
      const { data: articleData, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !articleData) {
        console.error('Error fetching article:', error?.message)
        notFound()
      } else {
        setArticle(articleData as Article)
      }
      setIsLoading(false)
    }

    if (id) fetchArticle()
  }, [id, supabase, router])

  const handleAuthorChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!article) return
    setArticle({
      ...article,
      author: e.target.value,
    })
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!article) return
    setArticle({
      ...article,
      [e.target.name]: e.target.value,
    })
  }

  const handleIntroChange = (value: string) => {
    if (!article) return
    setArticle({
      ...article,
      intro: value,
    })
  }

  const handleContentChange = (value: string) => {
    if (!article) return
    setArticle({
      ...article,
      content: value,
    })
  }

  const handleSave = async () => {
    if (!article) return
    setIsSaving(true)
    const { title, intro, content, author, updated_at } = article
    const { error } = await supabase
      .from('articles')
      .update({ title, intro, content, author, updated_at })
      .eq('id', article.id)

    if (error) {
      alert(`게시물 저장 중 오류 발생: ${error.message}`)
    } else {
      alert('저장되었습니다!')
      router.refresh()
    }
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <main className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div>Loading...</div>
      </main>
    )
  }

  if (!article) {
    return notFound()
  }

  return (
    <main className="flex h-screen w-full bg-black text-white">
      {/* Editor Panel */}
      <div className="flex-1 h-full flex flex-col p-4">
        <div className="bg-black rounded-lg shadow-md p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-xl font-bold text-white">에디터</h1>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-jj hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            > 
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>

          <div className="w-full mb-6">
            <label htmlFor="author" className="block text-sm font-medium text-white mb-2">
              작성자
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={article.author as string || ''}
              onChange={handleAuthorChange}
              className="mt-1 block w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="작성자"
            />
          </div>

          <div className="w-full mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
              제목
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={article.title || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="아티클 제목"
            />
          </div>
          <div className="w-full mb-6">
            <label htmlFor="title" className="w-full block text-sm font-medium text-white mb-2">
              인트로
            </label>
            <TiptapEditor
              value={article.intro || ''}
              onChange={handleIntroChange}
            />
          </div>
          <div className="w-full flex-grow flex flex-col">
            <label htmlFor="content" className="w-full block text-sm font-medium text-white mb-2">
              내용
            </label>
            <TiptapEditor
              value={article.content || ''}
              onChange={handleContentChange}
            />
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-[430px] flex-shrink-0 h-full flex flex-col p-4">
        <div className="bg-gray-100 rounded-lg shadow-md p-6 h-full overflow-y-auto">
          <article className="prose lg:prose-xl max-w-none">
            <h1 dangerouslySetInnerHTML={{ __html: article.title || '' }}></h1>
            <p className="text-sm text-gray-500 mb-2 sm:mb-0">
              {article.author && (
                <span className="font-medium">Written by {article.author}</span>
              )}
              <br />
              {new Date(article.created_at as string).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <div style={{ whiteSpace: 'pre-wrap' }}>
              <div dangerouslySetInnerHTML={{ __html: article.intro || '' }}></div>
              <div dangerouslySetInnerHTML={{ __html: article.content || '' }}></div>
            </div>
          </article>
        </div>
      </div>
    </main>
  )
}

export default EditorPage
