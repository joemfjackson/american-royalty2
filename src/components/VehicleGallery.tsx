'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

const FALLBACK_IMAGE = '/images/fleet/white-bus-casino.webp'

interface VehicleGalleryProps {
  imageUrl: string | null
  galleryUrls: string[]
  vehicleName: string
  vehicleType: string
}

export function VehicleGallery({ imageUrl, galleryUrls, vehicleName, vehicleType }: VehicleGalleryProps) {
  const allImages = [imageUrl || FALLBACK_IMAGE, ...galleryUrls]
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const goTo = useCallback(
    (dir: 'prev' | 'next') => {
      setSelectedIndex((i) =>
        dir === 'next'
          ? (i + 1) % allImages.length
          : (i - 1 + allImages.length) % allImages.length
      )
    },
    [allImages.length]
  )

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight') goTo('next')
      if (e.key === 'ArrowLeft') goTo('prev')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxOpen, goTo])

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [lightboxOpen])

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div
        className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl border border-dark-border"
        onClick={() => setLightboxOpen(true)}
      >
        <Image
          src={allImages[selectedIndex]}
          alt={`${vehicleName} - ${vehicleType} in Las Vegas`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          priority
          quality={80}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        <div className="absolute left-4 top-4">
          <Badge variant="gold">{vehicleType}</Badge>
        </div>
        <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg bg-black/60 px-3 py-2 text-sm text-white/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <Expand className="h-4 w-4" />
          Click to expand
        </div>
        {/* Nav arrows on main image when multiple images */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goTo('prev') }}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goTo('next') }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white/80 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                i === selectedIndex
                  ? 'border-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                  : 'border-dark-border hover:border-white/30'
              }`}
            >
              <Image
                src={img}
                alt={`${vehicleName} photo ${i + 1}`}
                fill
                sizes="80px"
                className="object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Image counter */}
            {allImages.length > 1 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                {selectedIndex + 1} / {allImages.length}
              </div>
            )}

            {/* Main lightbox image */}
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative h-[85vh] w-[90vw] max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={allImages[selectedIndex]}
                alt={`${vehicleName} photo ${selectedIndex + 1}`}
                fill
                sizes="90vw"
                className="object-contain"
                quality={90}
              />
            </motion.div>

            {/* Nav arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goTo('prev') }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goTo('next') }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
