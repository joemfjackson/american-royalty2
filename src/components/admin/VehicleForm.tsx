'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Plus, Trash2, ImageIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { slugify } from '@/lib/utils'
import type { Vehicle } from '@/types'

const vehicleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['Party Bus', 'Sprinter Limo', 'Stretch Limo'], {
    message: 'Type is required',
  }),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  hourly_rate: z.number().min(1, 'Rate must be at least $1'),
  min_hours: z.number().min(1, 'Minimum hours must be at least 1'),
  description: z.string().min(1, 'Description is required'),
  features: z.string().min(1, 'At least one feature is required'),
  is_active: z.boolean(),
  image_url: z.string().optional(),
})

type VehicleFormData = z.infer<typeof vehicleSchema>

interface VehicleFormProps {
  vehicle?: Vehicle | null
  onSubmit: (data: {
    id?: string
    name: string
    slug: string
    type: Vehicle['type']
    capacity: number
    hourly_rate: number
    min_hours: number
    description: string
    features: string[]
    is_active: boolean
    image_url: string | null
    gallery_urls: string[]
  }) => void
  onCancel: () => void
}

export function VehicleForm({ vehicle, onSubmit, onCancel }: VehicleFormProps) {
  const [galleryUrls, setGalleryUrls] = useState<string[]>(vehicle?.gallery_urls || [])
  const [newGalleryUrl, setNewGalleryUrl] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      name: vehicle?.name || '',
      type: vehicle?.type || 'Party Bus',
      capacity: vehicle?.capacity || 20,
      hourly_rate: vehicle?.hourly_rate || 200,
      min_hours: vehicle?.min_hours || 3,
      description: vehicle?.description || '',
      features: vehicle?.features?.join(', ') || '',
      is_active: vehicle?.is_active ?? true,
      image_url: vehicle?.image_url || '',
    },
  })

  const nameValue = watch('name')
  const imageUrlValue = watch('image_url')

  const addGalleryUrl = () => {
    const url = newGalleryUrl.trim()
    if (url && !galleryUrls.includes(url)) {
      setGalleryUrls((prev) => [...prev, url])
      setNewGalleryUrl('')
    }
  }

  const removeGalleryUrl = (index: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const onFormSubmit = (data: VehicleFormData) => {
    onSubmit({
      ...(vehicle?.id ? { id: vehicle.id } : {}),
      name: data.name,
      slug: slugify(data.name),
      type: data.type,
      capacity: data.capacity,
      hourly_rate: data.hourly_rate,
      min_hours: data.min_hours,
      description: data.description,
      features: data.features.split(',').map((f) => f.trim()).filter(Boolean),
      is_active: data.is_active,
      image_url: data.image_url?.trim() || null,
      gallery_urls: galleryUrls,
    })
  }

  const inputClass =
    'w-full rounded-lg border border-dark-border bg-black px-4 py-3 text-white placeholder:text-gray-500 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto rounded-2xl border border-dark-border bg-dark-card p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">
            {vehicle ? 'Edit Vehicle' : 'Add Vehicle'}
          </h2>
          <button
            onClick={onCancel}
            className="rounded-lg p-1 text-gray-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Vehicle Name
            </label>
            <input
              {...register('name')}
              className={inputClass}
              placeholder="e.g., The Sovereign"
            />
            {errors.name && (
              <p className="mt-1.5 text-sm text-red-400">{errors.name.message}</p>
            )}
            {nameValue && (
              <p className="mt-1 text-xs text-gray-500">
                Slug: <code className="text-gray-400">{slugify(nameValue)}</code>
              </p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Vehicle Type
            </label>
            <select
              {...register('type')}
              className={`${inputClass} appearance-none`}
            >
              <option value="Party Bus">Party Bus</option>
              <option value="Sprinter Limo">Sprinter Limo</option>
              <option value="Stretch Limo">Stretch Limo</option>
            </select>
            {errors.type && (
              <p className="mt-1.5 text-sm text-red-400">{errors.type.message}</p>
            )}
          </div>

          {/* Capacity & Rate row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                Capacity
              </label>
              <input
                type="number"
                {...register('capacity', { valueAsNumber: true })}
                className={inputClass}
              />
              {errors.capacity && (
                <p className="mt-1.5 text-sm text-red-400">{errors.capacity.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                $/Hour
              </label>
              <input
                type="number"
                {...register('hourly_rate', { valueAsNumber: true })}
                className={inputClass}
              />
              {errors.hourly_rate && (
                <p className="mt-1.5 text-sm text-red-400">{errors.hourly_rate.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                Min Hours
              </label>
              <input
                type="number"
                {...register('min_hours', { valueAsNumber: true })}
                className={inputClass}
              />
              {errors.min_hours && (
                <p className="mt-1.5 text-sm text-red-400">{errors.min_hours.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className={`${inputClass} resize-y`}
              placeholder="Describe the vehicle..."
            />
            {errors.description && (
              <p className="mt-1.5 text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          {/* Features */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Features <span className="text-gray-500">(comma separated)</span>
            </label>
            <input
              {...register('features')}
              className={inputClass}
              placeholder="LED Lighting, Sound System, Wet Bar..."
            />
            {errors.features && (
              <p className="mt-1.5 text-sm text-red-400">{errors.features.message}</p>
            )}
          </div>

          {/* Main Image URL */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Main Image URL
            </label>
            <input
              {...register('image_url')}
              className={inputClass}
              placeholder="/images/fleet/vehicle.webp or https://..."
            />
            {imageUrlValue && (
              <div className="mt-2 relative h-32 w-full overflow-hidden rounded-lg border border-dark-border bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrlValue}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
            )}
          </div>

          {/* Gallery URLs */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Gallery Images
            </label>

            {/* Existing gallery images */}
            {galleryUrls.length > 0 && (
              <div className="mb-3 grid grid-cols-3 gap-2">
                {galleryUrls.map((url, i) => (
                  <div key={i} className="group relative h-20 overflow-hidden rounded-lg border border-dark-border bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Gallery ${i + 1}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement
                        el.style.display = 'none'
                        el.parentElement!.classList.add('flex', 'items-center', 'justify-center')
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryUrl(i)}
                      className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-red-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <ImageIcon className="absolute inset-0 m-auto h-5 w-5 text-gray-600 -z-10" />
                  </div>
                ))}
              </div>
            )}

            {/* Add new gallery URL */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newGalleryUrl}
                onChange={(e) => setNewGalleryUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addGalleryUrl()
                  }
                }}
                className={`${inputClass} flex-1`}
                placeholder="Paste image URL and click +"
              />
              <button
                type="button"
                onClick={addGalleryUrl}
                disabled={!newGalleryUrl.trim()}
                className="rounded-lg border border-dark-border px-3 py-3 text-gray-400 transition-all hover:border-gold/30 hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {galleryUrls.length} image{galleryUrls.length !== 1 ? 's' : ''} in gallery
            </p>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                {...register('is_active')}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full border border-dark-border bg-black peer-checked:bg-gold/30 peer-focus:ring-2 peer-focus:ring-gold/20 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-dark-border after:bg-dark-card after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-gold/50 peer-checked:after:bg-gold" />
            </label>
            <span className="text-sm text-gray-300">Active (visible on website)</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border border-dark-border px-4 py-3 text-sm font-medium text-gray-400 transition-all hover:bg-white/5 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-black transition-all hover:bg-gold-light disabled:opacity-50"
            >
              {vehicle ? 'Update Vehicle' : 'Save Vehicle'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
