'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

interface ImageItem {
  name: string
  url: string
  size?: number
  lastModified?: string
}

interface ImageStorageModalProps {
  isOpen: boolean
  onClose: () => void
  bucketName?: string
  onImageSelect?: (url: string) => void
}

const ImageStorageModal: React.FC<ImageStorageModalProps> = ({
  isOpen,
  onClose,
  bucketName = 'articles',
  onImageSelect
}) => {
  const [images, setImages] = useState<ImageItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // 이미지 목록 로드
  const loadImages = async () => {
    setIsLoading(true)
    try {
      const { data: files, error } = await supabase.storage
        .from(bucketName)
        .list('', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) {
        console.error('이미지 로드 오류:', error)
        return
      }

      const imageItems: ImageItem[] = []
      
      for (const file of files || []) {
        if (file.name && file.name !== '.emptyFolderPlaceholder') {
          const { data } = supabase.storage
            .from(bucketName)
            .getPublicUrl(file.name)         
          imageItems.push({
            name: file.name,
            url: data.publicUrl,
            size: file.metadata?.size,
            lastModified: file.created_at
          })
        }
      }

      setImages(imageItems)
    } catch (error) {
      console.error('이미지 로드 중 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 이미지 업로드
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileName = `${Date.now()}_${file.name}`

        const { error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error('업로드 오류:', error)
          alert(`파일 "${file.name}" 업로드 실패: ${error.message}`)
          continue
        }

        setUploadProgress(((i + 1) / files.length) * 100)
      }

      // 업로드 완료 후 목록 새로고침
      await loadImages()
      
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('업로드 중 오류:', error)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // URL 복사
  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      alert('URL이 클립보드에 복사되었습니다!')
    } catch (error) {
      console.error('클립보드 복사 실패:', error)
      // 폴백: 텍스트 선택 방식
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('URL이 복사되었습니다!')
    }
  }

  // 이미지 선택 (선택적 기능)
  const handleImageSelect = (url: string) => {
    if (onImageSelect) {
      onImageSelect(url)
      onClose()
    }
  }

  // 모달이 열릴 때 이미지 로드
  useEffect(() => {
    if (isOpen) {
      loadImages()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-2 border-b">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 업로드 섹션 */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-4">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-4 py-2 bg-jj text-white rounded-lg hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? '업로드 중...' : '파일 선택'}
            </button>
          </div>
          
          {isUploading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{Math.round(uploadProgress)}% 완료</p>
            </div>
          )}
        </div>

        {/* 이미지 그리드 */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">이미지 로드 중...</span>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              업로드된 이미지가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div 
                    className="aspect-square bg-gray-100 cursor-pointer"
                    onClick={() => handleImageSelect(image.url)}
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-600 truncate mb-2" title={image.name}>
                      {image.name}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyToClipboard(image.url)}
                        className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        URL 복사
                      </button>
                      {onImageSelect && (
                        <button
                          onClick={() => handleImageSelect(image.url)}
                          className="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          선택
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageStorageModal 