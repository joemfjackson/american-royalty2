'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Upload, Trash2, ImageIcon } from 'lucide-react'
import { PACKAGES } from '@/lib/packages'
import {
  getPackagePhotosAdmin,
  addPackagePhoto,
  deletePackagePhoto,
  type PackagePhotoData,
} from '@/lib/actions/admin'

export default function AdminPackagePhotosPage() {
  const [selectedSlug, setSelectedSlug] = useState(PACKAGES[0].slug)
  const [photos, setPhotos] = useState<PackagePhotoData[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadCount, setUploadCount] = useState(0)
  const [uploadTotal, setUploadTotal] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLoading(true)
    getPackagePhotosAdmin(selectedSlug)
      .then(setPhotos)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [selectedSlug])

  const handleUpload = async (files: FileList) => {
    setUploading(true)
    setUploadCount(0)
    setUploadTotal(files.length)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('packageSlug', selectedSlug)

        const res = await fetch('/api/packages/upload-photo', {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()

        if (data.url) {
          await addPackagePhoto(selectedSlug, data.url)
          setUploadCount((c) => c + 1)
        }
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err)
      }
    }

    // Refresh photos
    const updated = await getPackagePhotosAdmin(selectedSlug)
    setPhotos(updated)
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (photoId: string) => {
    await deletePackagePhoto(photoId)
    setPhotos((prev) => prev.filter((p) => p.id !== photoId))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Package Photos</h1>
          <p className="mt-1 text-sm text-gray-400">
            Upload and manage tour photos for each package
          </p>
        </div>
      </div>

      {/* Package selector */}
      <div>
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Package
        </label>
        <select
          value={selectedSlug}
          onChange={(e) => setSelectedSlug(e.target.value)}
          className="mt-1 w-full max-w-xs rounded-lg border border-dark-border bg-black px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none"
        >
          {PACKAGES.map((pkg) => (
            <option key={pkg.slug} value={pkg.slug}>
              {pkg.name}
            </option>
          ))}
        </select>
      </div>

      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="rounded-2xl border-2 border-dashed border-dark-border bg-dark-card/50 p-8 text-center transition-colors hover:border-gold/30"
      >
        <Upload className="mx-auto h-8 w-8 text-gray-500" />
        <p className="mt-3 text-sm text-gray-400">
          Drag & drop photos here, or{' '}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-gold hover:text-gold-light font-medium"
          >
            browse files
          </button>
        </p>
        <p className="mt-1 text-xs text-gray-500">JPG, PNG, WebP · Multiple files supported</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
        />
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="rounded-lg border border-gold/30 bg-gold/5 p-4">
          <p className="text-sm text-gold">
            Uploading... {uploadCount} / {uploadTotal}
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-dark-border overflow-hidden">
            <div
              className="h-full rounded-full bg-gold transition-all"
              style={{ width: `${(uploadCount / uploadTotal) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Photo count */}
      <p className="text-sm text-gray-400">
        {photos.length} photo{photos.length !== 1 ? 's' : ''}
      </p>

      {/* Photo grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : photos.length === 0 ? (
        <div className="rounded-2xl border border-dark-border bg-dark-card p-12 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-4 text-gray-400">No photos yet</p>
          <p className="mt-1 text-sm text-gray-500">Upload photos to show on the package page</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={photo.url}
                alt={photo.alt_text || 'Package photo'}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
              />
              <button
                onClick={() => handleDelete(photo.id)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
