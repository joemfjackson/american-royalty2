'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  Eye,
  EyeOff,
  X,
  Award,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  getAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '@/lib/actions/admin'
import { EVENT_TYPES } from '@/lib/constants'
import type { Testimonial } from '@/types'

interface TestimonialFormData {
  name: string
  event_type: string
  rating: number
  text: string
  is_featured: boolean
  is_active: boolean
}

function TestimonialFormModal({
  testimonial,
  onSubmit,
  onCancel,
}: {
  testimonial: Testimonial | null
  onSubmit: (data: TestimonialFormData) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(testimonial?.name || '')
  const [eventType, setEventType] = useState(testimonial?.event_type || 'Bachelor Party')
  const [rating, setRating] = useState(testimonial?.rating || 5)
  const [text, setText] = useState(testimonial?.text || '')
  const [isFeatured, setIsFeatured] = useState(testimonial?.is_featured || false)
  const [isActive, setIsActive] = useState(testimonial?.is_active ?? true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !text.trim()) return
    onSubmit({ name, event_type: eventType, rating, text, is_featured: isFeatured, is_active: isActive })
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto rounded-2xl border border-dark-border bg-dark-card p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">
            {testimonial ? 'Edit Testimonial' : 'Add Testimonial'}
          </h2>
          <button
            onClick={onCancel}
            className="rounded-lg p-1 text-gray-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Customer Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-dark-border bg-black px-4 py-3 text-white placeholder:text-gray-500 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
              placeholder="e.g., John D."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Event Type
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full appearance-none rounded-lg border border-dark-border bg-black px-4 py-3 text-white focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Rating
            </label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRating(r)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-7 w-7 ${
                      r <= rating ? 'fill-gold text-gold' : 'text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Review Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              rows={4}
              className="w-full rounded-lg border border-dark-border bg-black px-4 py-3 text-white placeholder:text-gray-500 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20 resize-y"
              placeholder="What did the customer say?"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full border border-dark-border bg-black peer-checked:bg-gold/30 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-dark-border after:bg-dark-card after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-gold/50 peer-checked:after:bg-gold" />
              </label>
              <span className="text-sm text-gray-300">Featured (shown on homepage)</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full border border-dark-border bg-black peer-checked:bg-gold/30 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-dark-border after:bg-dark-card after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-gold/50 peer-checked:after:bg-gold" />
              </label>
              <span className="text-sm text-gray-300">Active (visible on website)</span>
            </div>
          </div>

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
              className="flex-1 rounded-lg bg-gold px-4 py-3 text-sm font-semibold text-black transition-all hover:bg-gold-light"
            >
              {testimonial ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  )
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const t = await getAdminTestimonials()
        setTestimonials(t)
      } catch (err) {
        console.error('Failed to load testimonials:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleAdd = () => {
    setEditingTestimonial(null)
    setFormOpen(true)
  }

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTestimonial(id)
      setTestimonials((prev) => prev.filter((t) => t.id !== id))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Failed to delete testimonial:', err)
    }
  }

  const handleFormSubmit = async (data: TestimonialFormData) => {
    try {
      if (editingTestimonial) {
        const updated = await updateTestimonial(editingTestimonial.id, data)
        setTestimonials((prev) => prev.map((t) => (t.id === editingTestimonial.id ? updated : t)))
      } else {
        const created = await createTestimonial(data)
        setTestimonials((prev) => [created, ...prev])
      }
      setFormOpen(false)
      setEditingTestimonial(null)
    } catch (err) {
      console.error('Failed to save testimonial:', err)
    }
  }

  const toggleFeatured = async (id: string) => {
    const testimonial = testimonials.find((t) => t.id === id)
    if (!testimonial) return
    try {
      const updated = await updateTestimonial(id, { is_featured: !testimonial.is_featured })
      setTestimonials((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (err) {
      console.error('Failed to toggle featured:', err)
    }
  }

  const toggleActive = async (id: string) => {
    const testimonial = testimonials.find((t) => t.id === id)
    if (!testimonial) return
    try {
      const updated = await updateTestimonial(id, { is_active: !testimonial.is_active })
      setTestimonials((prev) => prev.map((t) => (t.id === id ? updated : t)))
    } catch (err) {
      console.error('Failed to toggle active:', err)
    }
  }

  const featuredCount = testimonials.filter((t) => t.is_featured).length
  const activeCount = testimonials.filter((t) => t.is_active).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Testimonials</h1>
          <p className="mt-1 text-sm text-gray-400">
            {testimonials.length} total &middot; {activeCount} active &middot; {featuredCount} featured
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20"
        >
          <Plus className="h-4 w-4" />
          Add Testimonial
        </button>
      </div>

      {/* Testimonial list */}
      <div className="space-y-4">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <Card
              className={`transition-all duration-300 hover:border-gold/20 ${
                !testimonial.is_active ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 text-sm font-bold text-gold">
                  {testimonial.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white">{testimonial.name}</h3>
                    <Badge variant="outline">{testimonial.event_type}</Badge>
                    {testimonial.is_featured && (
                      <Badge variant="gold">
                        <Award className="mr-1 h-3 w-3" />
                        Featured
                      </Badge>
                    )}
                    {!testimonial.is_active && (
                      <Badge variant="red">Hidden</Badge>
                    )}
                  </div>

                  <div className="mt-1 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <Star
                        key={r}
                        className={`h-4 w-4 ${
                          r <= testimonial.rating ? 'fill-gold text-gold' : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="mt-2 text-sm text-gray-300 leading-relaxed">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleFeatured(testimonial.id)}
                    className={`rounded-lg p-2 transition-colors ${
                      testimonial.is_featured
                        ? 'text-gold hover:bg-gold/10'
                        : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                    }`}
                    title={testimonial.is_featured ? 'Remove from featured' : 'Mark as featured'}
                  >
                    <Award className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleActive(testimonial.id)}
                    className={`rounded-lg p-2 transition-colors ${
                      testimonial.is_active
                        ? 'text-emerald-400 hover:bg-emerald-500/10'
                        : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                    }`}
                    title={testimonial.is_active ? 'Hide' : 'Show'}
                  >
                    {testimonial.is_active ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(testimonial)}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gold/10 hover:text-gold"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  {deleteConfirm === testimonial.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="rounded-lg bg-red-500/10 px-2 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="rounded-lg px-2 py-1.5 text-xs text-gray-400 hover:bg-white/5"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(testimonial.id)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {testimonials.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            <p className="font-medium">No testimonials yet</p>
            <p className="mt-1 text-sm">Click &ldquo;Add Testimonial&rdquo; to create one</p>
          </div>
        )}
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {formOpen && (
          <TestimonialFormModal
            testimonial={editingTestimonial}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setFormOpen(false)
              setEditingTestimonial(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
