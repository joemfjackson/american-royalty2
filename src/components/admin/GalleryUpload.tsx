'use client'

import { useState, useRef } from 'react'
import { Plus, X, Loader2, ImageIcon } from 'lucide-react'

interface GalleryUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
}

export function GalleryUpload({ value, onChange, maxImages = 10 }: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      const { url } = await res.json()
      onChange([...value, url])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="grid grid-cols-3 gap-2">
        {value.map((url, i) => (
          <div
            key={i}
            className="group relative h-24 overflow-hidden rounded-lg border border-dark-border bg-black"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Gallery ${i + 1}`}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-red-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/20"
            >
              <X className="h-3 w-3" />
            </button>
            <ImageIcon className="absolute inset-0 m-auto h-5 w-5 text-gray-600 -z-10" />
          </div>
        ))}

        {value.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-dark-border bg-black/50 text-gray-400 transition-all hover:border-gold/30 hover:text-gold disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Plus className="h-5 w-5" />
                <span className="text-xs">Add</span>
              </>
            )}
          </button>
        )}
      </div>

      <p className="mt-1 text-xs text-gray-500">
        {value.length} image{value.length !== 1 ? 's' : ''} in gallery
      </p>

      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}
