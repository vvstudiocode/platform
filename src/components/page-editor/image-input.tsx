'use client'

import { useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Upload, X, Loader2 } from 'lucide-react'
import { uploadImage } from '@/lib/upload-utils'
import { deleteImage } from '@/app/actions/image-actions'

interface ImageInputProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export function ImageInput({ value, onChange, placeholder = '圖片網址' }: ImageInputProps) {
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            // Auto-cleanup: if there was a previous supabase image, delete it
            if (value && value.includes('supabase')) {
                await deleteImage(value)
            }

            // Upload to 'product-images' bucket which is general purpose
            const url = await uploadImage(file, { bucket: 'product-images', folder: 'content' })
            onChange(url)
        } catch (err) {
            console.error(err)
            alert('上傳失敗')
        } finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleRemove = async () => {
        if (value && value.includes('supabase')) {
            await deleteImage(value)
        }
        onChange('')
    }

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <Input
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 bg-background border-input text-foreground placeholder:text-muted-foreground"
                />
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleUpload}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    title="上傳圖片"
                    className="bg-background border-input hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
                <span className="text-xs text-muted-foreground self-center whitespace-nowrap">建議大小: 500kb</span>
            </div>
            {value && (
                <div className="relative group w-full h-40 bg-muted/20 rounded-lg overflow-hidden border border-border">
                    <img src={value} alt="Preview" className="w-full h-full object-contain bg-background" />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-destructive/90 rounded-full text-foreground hover:text-destructive-foreground transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    )
}
