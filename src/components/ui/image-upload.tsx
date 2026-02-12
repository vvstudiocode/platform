'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'

interface Props {
    currentUrl?: string
    onUpload: (formData: FormData) => Promise<{ error?: string; url?: string }>
    onRemove?: () => Promise<void>
    maxSize?: number // KB
}

export function ImageUpload({ currentUrl, onUpload, onRemove, maxSize = 200 }: Props) {
    const [preview, setPreview] = useState<string | null>(currentUrl || null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dragOver, setDragOver] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFile = useCallback(async (file: File) => {
        setError(null)

        // 檢查大小
        if (file.size > maxSize * 1024) {
            setError(`圖片大小不能超過 ${maxSize}KB`)
            return
        }

        // 檢查類型
        if (!file.type.startsWith('image/')) {
            setError('請選擇圖片檔案')
            return
        }

        // 預覽
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target?.result as string)
        reader.readAsDataURL(file)

        // 上傳
        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('bucket', 'product-images')

        try {
            const result = await onUpload(formData)

            if (result.error) {
                throw new Error(result.error || 'Upload failed')
            }

            if (result.url) {
                setPreview(result.url)
            }
        } catch (err: any) {
            setError(err.message)
        }
        setUploading(false)
    }, [maxSize, onUpload])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
    }, [handleFile])

    const handleRemove = async () => {
        if (onRemove) {
            await onRemove()
        }
        setPreview(null)
        if (inputRef.current) inputRef.current.value = ''
    }

    return (
        <div className="space-y-2">
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(file)
                }}
            />

            {preview ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-zinc-700">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 text-white animate-spin" />
                        </div>
                    )}
                    {!uploading && (
                        <button
                            onClick={handleRemove}
                            className="absolute top-1 right-1 p-1 bg-red-500 rounded-full hover:bg-red-600"
                        >
                            <X className="h-3 w-3 text-white" />
                        </button>
                    )}
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`w-32 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${dragOver
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-zinc-700 hover:border-zinc-600'
                        }`}
                >
                    {uploading ? (
                        <Loader2 className="h-6 w-6 text-zinc-400 animate-spin" />
                    ) : (
                        <>
                            <Upload className="h-6 w-6 text-zinc-500 mb-1" />
                            <span className="text-xs text-zinc-500">上傳圖片</span>
                        </>
                    )}
                </div>
            )}

            {error && (
                <p className="text-xs text-red-400">{error}</p>
            )}
            <p className="text-xs text-zinc-500">最大 {maxSize}KB，支援 JPG/PNG/WebP</p>
        </div>
    )
}
