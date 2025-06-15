'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useParams, useRouter, notFound } from 'next/navigation'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Youtube from '@tiptap/extension-youtube'
import { Node, type Command } from '@tiptap/core'
import ImageStorageModal from '@/components/ImageStorageModal'
import Image from 'next/image'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setImageWithCaption: (options: { src: string; alt: string | null }) => ReturnType;
  }
}

const ImageWithCaption = Node.create({
  name: 'imageWithCaption',
  group: 'block',
  content: 'inline*',
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => element.querySelector('img')?.getAttribute('src'),
      },
      alt: {
        default: null,
        parseHTML: element => element.querySelector('img')?.getAttribute('alt'),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'figure',
        contentElement: 'figcaption',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'figure',
      { class: 'm-0' },
      ['img', { ...node.attrs, ...HTMLAttributes, 'data-mce-selected': '1' }],
      ['figcaption', { class: 'text-center text-sm text-gray-500' }, 0],
    ]
  },

  addCommands(): any {
    return {
      setImageWithCaption: (options: { src: string; alt: string | null }) => ({ commands }: any) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        })
      },
    }
  },
})

type Article = {
  id: string;
  title: string | null;
  author: string | null;
  intro: string | null;
  created_at: string | null;
  content: string | null;
  type: string | null;
  image: string | null;
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
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageWithCaption,
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
      }),
      Youtube.configure({
        width: undefined,
        height: undefined,
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
          'w-full min-h-[100px] max-h-[500px] bg-white text-black border border-gray-300 rounded-md px-4 py-3 focus:outline-none text-sm overflow-y-auto',
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
              const alt = window.prompt('이미지 설명 (alt text) 입력:', '')
                ; (editor.commands as any).setImageWithCaption({ src: url, alt: alt || '' })
            }
          }}
          className="px-2 py-1 rounded bg-gray-200 text-black"
        >
          Image
        </button>
        <button
          type="button"
          onClick={() => {
            const oldAlt = editor.getAttributes('imageWithCaption').alt
            const alt = window.prompt('이미지 설명 (alt text) 수정:', oldAlt)
            if (alt !== null) {
              editor.chain().focus().updateAttributes('imageWithCaption', { alt }).run()
            }
          }}
          disabled={!editor.isActive('imageWithCaption')}
          className={`px-2 py-1 rounded ${editor.isActive('imageWithCaption') ? 'bg-jj text-white' : 'bg-gray-200 text-black'}`}
        >
          Alt수정
        </button>
        <button
          type="button"
          onClick={() => setIsImageModalOpen(true)}
          className="px-2 py-1 rounded bg-gray-200 text-black"
        >
          Image Storage
        </button>
      </div>
      <EditorContent editor={editor} />

      {/* 이미지 저장소 모달 */}
      <ImageStorageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onImageSelect={(url) => {
          const alt = window.prompt('이미지 설명 (alt text) 입력:', '')
            ; (editor.commands as any).setImageWithCaption({ src: url, alt: alt || '' })
        }}
      />
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
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
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

  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (!article) return
    setArticle({
      ...article,
      type: e.target.value || null,
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

  const handleImageSelect = (imageUrl: string) => {
    if (!article) return
    setArticle({
      ...article,
      image: imageUrl,
    })
    setIsImageModalOpen(false)
  }

  const handleSave = async () => {
    if (!article) return
    setIsSaving(true)
    const { title, intro, content, author, type, image, updated_at } = article
    const { error } = await supabase
      .from('articles')
      .update({ title, intro, content, author, type, image, updated_at })
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

          {/* 대표 이미지 관리 섹션 */}
          <div className="w-full mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              대표 이미지
            </label>
            <div className="bg-white border border-gray-300 rounded-md p-4">
              {article.image ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                      <Image
                        src={article.image}
                        alt="대표 이미지"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        현재 이미지
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">
                        {article.image}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(true)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    변경
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-md mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">대표 이미지가 설정되지 않았습니다</p>
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(true)}
                    className="px-4 py-2 bg-jj text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    이미지 선택
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1">
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
            <div className="w-40">
              <label htmlFor="type" className="block text-sm font-medium text-white mb-2">
                분류
              </label>
              <select
                id="type"
                name="type"
                value={article.type || ''}
                onChange={handleTypeChange}
                className="mt-1 block w-full px-4 py-3 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="">선택하세요</option>
                <option value="interview">인터뷰</option>
                <option value="global">글로벌</option>
                <option value="insight">인사이트</option>
              </select>
            </div>
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
      <div className="w-[430px] h-[1000px] p-4 overflow-y-auto flex-shrink-0 h-full flex flex-col min-h-screen">
        <div className="max-w-5xl mx-auto">
          <article className="bg-white rounded-none sm:rounded-lg shadow-lg overflow-hidden">
            {/* 헤더 이미지 */}
            <div className="relative w-full h-48">
              <Image
                src={article.image as string}
                alt={article.title as string}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>

            <div className="pt-8 pb-8 pl-4 pr-4">
              {/* 제목 */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight tracking-tight">
                {article.title}
              </h1>

              {/* 메타 정보 */}
              <div className="flex flex-col mb-8 pb-6 border-b border-gray-300">
                <div className="text-sm text-gray-900 mb-2">
                  {article.author && (
                    <span className="font-medium">에디터 {article.author}</span>
                  )}
                </div>
                <div className="text-sm text-gray-900">
                  <span className="font-medium">작성일: </span>
                  {new Date(article.created_at as string).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-sm text-gray-900">
                  <span className="font-medium">수정일: </span>
                  {new Date(article.updated_at as string).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              {/* 요약 */}
              {article.intro && (
                <div className="mb-8 p-3 border-l-4 border-jj">
                  <p className="text-gray-700 font-medium">
                    <div dangerouslySetInnerHTML={{
                      __html: article.intro || ''
                    }} />
                  </p>
                </div>
              )}

              {/* 본문 내용 */}
              <div
                className="prose prose-lg max-w-none prose-gray
                  prose-h1:text-gray-900 prose-h1:font-bold
                  prose-h2:text-gray-900 prose-h2:font-bold prose-h2:p-3 prose-h2:rounded-lg prose-h2:border-l-4 prose-h2:border-t-4 prose-h2:border-jj prose-h2:tracking-tighter
                  prose-p:text-gray-700 prose-p:leading-relaxed
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-gray-900
                  prose-ul:text-gray-700
                  prose-ol:text-gray-700
                  prose-li:text-gray-700
                  prose-blockquote:text-gray-600 prose-blockquote:border-l-blue-500               
                  prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto
                  prose-figcaption:text-center prose-figcaption:text-gray-500 prose-figcaption:text-sm
                  prose-hr:border-gray-300 prose-hr:my-4"
                dangerouslySetInnerHTML={{
                  __html: article.content || ''
                }}
              />
            </div>
          </article>
        </div>
      </div>

      {/* 대표 이미지 선택 모달 */}
      <ImageStorageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onImageSelect={handleImageSelect}
      />
    </main >
  )
}

export default EditorPage
