'use client'

import { useState, useCallback } from 'react'
import {
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Send,
  Save,
  Package,
} from 'lucide-react'
import type { Quote, QuoteLineItem, Vehicle } from '@/types'
import { QUOTE_PRESETS } from '@/lib/quote-presets'
import { saveQuoteLineItems, buildAndSendQuote } from '@/lib/actions/admin'
import { formatCurrency } from '@/lib/utils'

interface LineItemDraft {
  id: string
  description: string
  quantity: number
  unitPrice: number
  sortOrder: number
  isPreset: boolean
  presetKey: string | null
}

interface QuoteBuilderProps {
  quote: Quote
  vehicle: Vehicle | null
  existingItems?: QuoteLineItem[]
  onSaved: (updatedQuote: Quote) => void
  onCancel: () => void
}

let nextId = 0
function tempId() {
  return `temp_${++nextId}_${Date.now()}`
}

export function QuoteBuilder({ quote, vehicle, existingItems, onSaved, onCancel }: QuoteBuilderProps) {
  const [items, setItems] = useState<LineItemDraft[]>(() => {
    if (existingItems && existingItems.length > 0) {
      return existingItems.map((li) => ({
        id: li.id,
        description: li.description,
        quantity: li.quantity,
        unitPrice: li.unit_price,
        sortOrder: li.sort_order,
        isPreset: li.is_preset,
        presetKey: li.preset_key,
      }))
    }
    return []
  })
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)

  const usedPresetKeys = items.filter((i) => i.isPreset).map((i) => i.presetKey)

  const subtotal = items
    .filter((i) => i.presetKey !== 'gratuity')
    .reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)

  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)

  const addPreset = useCallback((presetKey: string) => {
    const preset = QUOTE_PRESETS.find((p) => p.key === presetKey)
    if (!preset) return

    let defaultPrice = preset.defaultPrice || 0

    if (presetKey === 'vehicle_rental' && vehicle) {
      const hours = quote.duration_hours || vehicle.min_hours
      defaultPrice = vehicle.hourly_rate
      setItems((prev) => [
        ...prev,
        {
          id: tempId(),
          description: `${vehicle.name} — ${hours} hr${hours > 1 ? 's' : ''}`,
          quantity: hours,
          unitPrice: vehicle.hourly_rate,
          sortOrder: prev.length,
          isPreset: true,
          presetKey: 'vehicle_rental',
        },
      ])
      return
    }

    if (presetKey === 'overtime' && vehicle) {
      defaultPrice = vehicle.hourly_rate
    }

    if (preset.isPercentage && preset.percentOf === 'subtotal') {
      const currentSubtotal = items
        .filter((i) => i.presetKey !== 'gratuity')
        .reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
      defaultPrice = Math.round(currentSubtotal * (preset.percentValue || 20) / 100)
    }

    setItems((prev) => [
      ...prev,
      {
        id: tempId(),
        description: preset.description,
        quantity: 1,
        unitPrice: defaultPrice,
        sortOrder: prev.length,
        isPreset: true,
        presetKey: preset.key,
      },
    ])
  }, [items, vehicle, quote.duration_hours])

  const addCustomItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      {
        id: tempId(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        sortOrder: prev.length,
        isPreset: false,
        presetKey: null,
      },
    ])
  }, [])

  const updateItem = useCallback((id: string, field: keyof LineItemDraft, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.filter((item) => item.id !== id).map((item, i) => ({ ...item, sortOrder: i }))
    )
  }, [])

  const moveItem = useCallback((id: string, direction: 'up' | 'down') => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id)
      if (idx < 0) return prev
      const newIdx = direction === 'up' ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= prev.length) return prev
      const copy = [...prev]
      ;[copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]]
      return copy.map((item, i) => ({ ...item, sortOrder: i }))
    })
  }, [])

  const recalcGratuity = useCallback(() => {
    setItems((prev) => {
      const gratIdx = prev.findIndex((i) => i.presetKey === 'gratuity')
      if (gratIdx < 0) return prev
      const subWithoutGrat = prev
        .filter((i) => i.presetKey !== 'gratuity')
        .reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
      const gratAmount = Math.round(subWithoutGrat * 20 / 100)
      return prev.map((item, i) =>
        i === gratIdx ? { ...item, unitPrice: gratAmount } : item
      )
    })
  }, [])

  const serializeItems = () =>
    items.map((i) => ({
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      sortOrder: i.sortOrder,
      isPreset: i.isPreset,
      presetKey: i.presetKey,
    }))

  const handleSaveDraft = async () => {
    setSaving(true)
    try {
      const updated = await saveQuoteLineItems(quote.id, serializeItems())
      onSaved(updated)
    } catch (err) {
      console.error('Failed to save draft:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleSendQuote = async () => {
    if (items.length === 0) return
    setSending(true)
    try {
      const updated = await buildAndSendQuote(quote.id, serializeItems())
      onSaved(updated)
    } catch (err) {
      console.error('Failed to send quote:', err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gold flex items-center gap-2">
          <Package className="h-4 w-4" />
          Build Quote
        </h3>
        <button
          onClick={onCancel}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Preset chips */}
      <div>
        <p className="mb-2 text-xs text-gray-500">Quick add presets:</p>
        <div className="flex flex-wrap gap-1.5">
          {QUOTE_PRESETS.map((preset) => {
            const isUsed = usedPresetKeys.includes(preset.key)
            return (
              <button
                key={preset.key}
                onClick={() => {
                  addPreset(preset.key)
                  // Auto-recalc gratuity when adding items
                  if (preset.key !== 'gratuity') {
                    setTimeout(recalcGratuity, 0)
                  }
                }}
                disabled={isUsed}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                  isUsed
                    ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                    : 'bg-gold/10 text-gold hover:bg-gold/20'
                }`}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Line items */}
      {items.length > 0 && (
        <div className="rounded-lg border border-dark-border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_60px_80px_60px_32px] gap-1 bg-black/50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            <span>Description</span>
            <span className="text-center">Qty</span>
            <span className="text-right">Price</span>
            <span className="text-right">Total</span>
            <span></span>
          </div>

          {/* Rows */}
          {items.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_60px_80px_60px_32px] gap-1 items-center border-t border-dark-border px-3 py-2"
            >
              <input
                type="text"
                value={item.description}
                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                placeholder="Description"
                className="rounded border-0 bg-transparent px-1 py-0.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-gold/30"
              />
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => {
                  updateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))
                  setTimeout(recalcGratuity, 0)
                }}
                className="w-full rounded border-0 bg-transparent px-1 py-0.5 text-center text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold/30"
              />
              <div className="relative">
                <span className="absolute left-1 top-1/2 -translate-y-1/2 text-xs text-gray-500">$</span>
                <input
                  type="number"
                  min={0}
                  value={item.unitPrice}
                  onChange={(e) => {
                    updateItem(item.id, 'unitPrice', Math.max(0, parseFloat(e.target.value) || 0))
                    setTimeout(recalcGratuity, 0)
                  }}
                  className="w-full rounded border-0 bg-transparent py-0.5 pl-4 pr-1 text-right text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold/30"
                />
              </div>
              <span className="text-right text-sm font-medium text-gray-300">
                ${(item.quantity * item.unitPrice).toLocaleString()}
              </span>
              <div className="flex flex-col items-center gap-0.5">
                {index > 0 && (
                  <button
                    onClick={() => moveItem(item.id, 'up')}
                    className="text-gray-500 hover:text-white"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                )}
                {index < items.length - 1 && (
                  <button
                    onClick={() => moveItem(item.id, 'down')}
                    className="text-gray-500 hover:text-white"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                )}
                <button
                  onClick={() => {
                    removeItem(item.id)
                    setTimeout(recalcGratuity, 0)
                  }}
                  className="text-gray-500 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add custom item */}
      <button
        onClick={addCustomItem}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-dark-border py-2 text-xs font-medium text-gray-400 transition-all hover:border-gold/30 hover:text-gold"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Custom Item
      </button>

      {/* Totals */}
      {items.length > 0 && (
        <div className="rounded-lg border border-dark-border bg-black/50 p-3 space-y-2">
          {items.some((i) => i.presetKey === 'gratuity') && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal (before gratuity)</span>
              <span className="text-white">{formatCurrency(subtotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-base">
            <span className="font-semibold text-white">Total</span>
            <span className="font-bold text-gold">{formatCurrency(total)}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleSaveDraft}
          disabled={saving || sending || items.length === 0}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-dark-border px-4 py-2.5 text-sm font-medium text-gray-300 transition-all hover:bg-white/5 hover:text-white disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          onClick={handleSendQuote}
          disabled={saving || sending || items.length === 0}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-gold-light disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {sending ? 'Sending...' : 'Send Quote'}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Quote will be emailed to <span className="text-gray-300">{quote.email}</span>
      </p>
    </div>
  )
}
