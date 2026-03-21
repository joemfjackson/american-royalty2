'use client'

import { useState, useMemo } from 'react'
import { Plus, Trash2, Send, Save } from 'lucide-react'
import type { Quote, Vehicle } from '@/types'
import { saveQuotePricing, buildAndSendQuote } from '@/lib/actions/admin'
import { formatTime } from '@/lib/utils'

const VEHICLE_RATE_DEFAULTS: Record<string, number> = {
  'the-crown-jewel': 295,
  'the-empire': 350,
  'royal-sprinter': 185,
  'black-diamond': 125,
  'the-monarch': 275,
  'the-sovereign': 245,
}

interface CustomItem {
  id: string
  description: string
  amount: number
}

interface QuoteBuilderProps {
  quote: Quote
  vehicle: Vehicle | null
  onSaved: (updated: Quote) => void
  onCancel: () => void
  adminNotes?: string
}

function fmt(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function QuoteBuilder({ quote, vehicle, onSaved, onCancel, adminNotes }: QuoteBuilderProps) {
  const defaultRate = vehicle
    ? (vehicle.hourly_rate || VEHICLE_RATE_DEFAULTS[vehicle.slug] || 200)
    : 200

  const [rate, setRate] = useState(quote.hourly_rate ?? defaultRate)
  const [duration, setDuration] = useState(quote.duration_hours ?? 3)
  const [fuelSurcharge, setFuelSurcharge] = useState(
    quote.fuel_surcharge ?? (quote.duration_hours ?? 3) * 6
  )
  const [gratuityPercent, setGratuityPercent] = useState(quote.gratuity_percent ?? 20)
  const [depositPercent, setDepositPercent] = useState(quote.deposit_percent ?? 25)
  const [customItems, setCustomItems] = useState<CustomItem[]>(
    quote.custom_items?.map((ci, i) => ({ id: `ci_${i}`, ...ci })) ?? []
  )
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)

  // Auto-calculated values
  const calcs = useMemo(() => {
    const baseFare = rate * duration
    const gratuity = Math.round(baseFare * gratuityPercent / 100 * 100) / 100
    const tax = Math.round(baseFare * 0.03 * 100) / 100
    const customTotal = customItems.reduce((s, i) => s + (i.amount || 0), 0)
    const subtotal = baseFare + fuelSurcharge + customTotal
    const total = subtotal + tax + gratuity
    const deposit = Math.round(total * depositPercent / 100 * 100) / 100
    return { baseFare, gratuity, tax, customTotal, subtotal, total, deposit }
  }, [rate, duration, fuelSurcharge, gratuityPercent, customItems, depositPercent])

  const buildPricingData = () => ({
    hourlyRate: rate,
    durationHours: duration,
    baseFare: calcs.baseFare,
    fuelSurcharge,
    gratuityPercent,
    driverGratuity: calcs.gratuity,
    taxAmount: calcs.tax,
    customItems: customItems.filter(i => i.description.trim()).map(i => ({ description: i.description, amount: i.amount })),
    total: calcs.total,
    depositPercent,
  })

  const handleSaveDraft = async () => {
    setSaving(true)
    try {
      const updated = await saveQuotePricing(quote.id, buildPricingData())
      onSaved(updated)
    } catch (err) {
      console.error('Failed to save draft:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleSendQuote = async () => {
    setSending(true)
    try {
      const updated = await buildAndSendQuote(quote.id, buildPricingData(), adminNotes)
      onSaved(updated)
    } catch (err) {
      console.error('Failed to send quote:', err)
    } finally {
      setSending(false)
    }
  }

  const addCustomItem = () => {
    setCustomItems([...customItems, { id: `ci_${Date.now()}`, description: '', amount: 0 }])
  }

  const updateCustomItem = (id: string, field: 'description' | 'amount', value: string | number) => {
    setCustomItems(customItems.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const removeCustomItem = (id: string) => {
    setCustomItems(customItems.filter(i => i.id !== id))
  }

  // Recalculate fuel surcharge when duration changes
  const handleDurationChange = (newDuration: number) => {
    const oldDefault = duration * 6
    setDuration(newDuration)
    // Only auto-update fuel if it was still at the default
    if (fuelSurcharge === oldDefault) {
      setFuelSurcharge(newDuration * 6)
    }
  }

  return (
    <div className="space-y-4">
      {/* Base Fare */}
      <div className="rounded-lg border border-dark-border bg-black/50 p-3 space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Base Fare</p>
        <div className="grid grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Rate ($/hr)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-dark-border bg-black py-2 pl-7 pr-3 text-sm text-white focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Duration (hrs)</label>
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => handleDurationChange(parseInt(e.target.value) || 1)}
              className="w-full rounded-lg border border-dark-border bg-black px-3 py-2 text-sm text-white focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
            />
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-1">Subtotal</p>
            <p className="text-lg font-bold text-gold">{fmt(calcs.baseFare)}</p>
          </div>
        </div>
      </div>

      {/* NTA Fuel Surcharge */}
      <div className="flex items-center justify-between rounded-lg border border-dark-border bg-black/50 p-3">
        <div>
          <p className="text-sm text-white">NTA Fuel Surcharge</p>
          <p className="text-xs text-gray-500">Default: $6/hr &times; {duration} hrs = {fmt(duration * 6)}</p>
        </div>
        <div className="relative w-28">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
          <input
            type="number"
            step="0.01"
            value={fuelSurcharge}
            onChange={(e) => setFuelSurcharge(parseFloat(e.target.value) || 0)}
            className="w-full rounded-lg border border-dark-border bg-black py-2 pl-7 pr-3 text-sm text-white text-right focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
          />
        </div>
      </div>

      {/* Driver Gratuity */}
      <div className="flex items-center justify-between rounded-lg border border-dark-border bg-black/50 p-3">
        <div>
          <p className="text-sm text-white">Driver Gratuity</p>
          <p className="text-xs text-gray-500">{gratuityPercent}% of base fare = {fmt(calcs.gratuity)}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={100}
            value={gratuityPercent}
            onChange={(e) => setGratuityPercent(parseInt(e.target.value) || 0)}
            className="w-16 rounded-lg border border-dark-border bg-black px-2 py-2 text-sm text-white text-right focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
          />
          <span className="text-sm text-gray-400">%</span>
        </div>
      </div>

      {/* Custom Line Items */}
      <div className="space-y-2">
        {customItems.map((item) => (
          <div key={item.id} className="flex items-center gap-2 rounded-lg border border-dark-border bg-black/50 p-2">
            <input
              type="text"
              value={item.description}
              onChange={(e) => updateCustomItem(item.id, 'description', e.target.value)}
              placeholder="Description (e.g., Airport AVI Fee)"
              className="flex-1 rounded-lg border border-dark-border bg-black px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
            />
            <div className="relative w-24">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                value={item.amount || ''}
                onChange={(e) => updateCustomItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full rounded-lg border border-dark-border bg-black py-2 pl-6 pr-2 text-sm text-white text-right placeholder:text-gray-600 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
              />
            </div>
            <button
              onClick={() => removeCustomItem(item.id)}
              className="rounded-lg p-2 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          onClick={addCustomItem}
          className="flex items-center gap-2 rounded-lg border border-dashed border-dark-border px-3 py-2 text-xs font-medium text-gray-400 transition-all hover:border-gold/30 hover:text-gold w-full justify-center"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Line Item
        </button>
      </div>

      {/* NTA Excise Tax (auto-calculated, read-only) */}
      <div className="flex items-center justify-between rounded-lg border border-dark-border bg-black/30 p-3">
        <div>
          <p className="text-sm text-white">NTA Excise Tax (3%)</p>
          <p className="text-xs text-gray-500">3% of base fare</p>
        </div>
        <p className="text-sm font-medium text-white">{fmt(calcs.tax)}</p>
      </div>

      {/* Totals */}
      <div className="rounded-lg border border-gold/20 bg-gold/5 p-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Subtotal</span>
          <span className="text-white">{fmt(calcs.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">NTA Excise Tax (3%)</span>
          <span className="text-white">{fmt(calcs.tax)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Driver Gratuity ({gratuityPercent}%)</span>
          <span className="text-white">{fmt(calcs.gratuity)}</span>
        </div>
        <div className="border-t border-gold/20 pt-2 flex justify-between">
          <span className="text-sm font-semibold text-white">Total</span>
          <span className="text-lg font-bold text-gold">{fmt(calcs.total)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Deposit</span>
            <input
              type="number"
              min={10}
              max={100}
              value={depositPercent}
              onChange={(e) => setDepositPercent(Math.min(100, Math.max(10, parseInt(e.target.value) || 25)))}
              className="w-14 rounded border border-dark-border bg-black px-2 py-1 text-xs text-white text-right focus:border-gold/50 focus:outline-none"
            />
            <span className="text-xs text-gray-400">%</span>
          </div>
          <span className="text-sm font-semibold text-gold">{fmt(calcs.deposit)}</span>
        </div>
      </div>

      {/* Live Email Preview */}
      <details className="rounded-lg border border-dark-border">
        <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors">
          Email Preview
        </summary>
        <div className="border-t border-dark-border px-3 py-3 text-sm text-gray-300 space-y-2 bg-black/30">
          <p className="text-white font-medium">Hi {quote.name.split(' ')[0]},</p>
          <p>Thank you for reaching out to American Royalty! We&apos;d love to be part of your {quote.event_type.toLowerCase()}.</p>
          <p>Here&apos;s your quote:</p>
          <div className="rounded border border-dark-border p-2 space-y-1 text-xs">
            <p>Date: {quote.event_date}</p>
            {quote.pickup_time && <p>Time: {formatTime(quote.pickup_time)}</p>}
            <p>Duration: {duration} hours</p>
          </div>
          <div className="rounded border border-dark-border p-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Base Fare: {duration} hrs &times; {fmt(rate)}/hr</span>
              <span>{fmt(calcs.baseFare)}</span>
            </div>
            <div className="flex justify-between">
              <span>NTA Fuel Surcharge</span>
              <span>{fmt(fuelSurcharge)}</span>
            </div>
            {customItems.filter(i => i.description.trim()).map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.description}</span>
                <span>{fmt(item.amount)}</span>
              </div>
            ))}
            <div className="border-t border-dark-border pt-1 flex justify-between">
              <span>Subtotal</span>
              <span>{fmt(calcs.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>NTA Excise Tax (3%)</span>
              <span>{fmt(calcs.tax)}</span>
            </div>
            <div className="flex justify-between">
              <span>Driver Gratuity</span>
              <span>{fmt(calcs.gratuity)}</span>
            </div>
            <div className="border-t border-dark-border pt-1 flex justify-between font-bold text-gold">
              <span>Total</span>
              <span>{fmt(calcs.total)}</span>
            </div>
          </div>
          <p>A {depositPercent}% deposit of {fmt(calcs.deposit)} is required to secure your date.</p>
        </div>
      </details>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleSaveDraft}
          disabled={saving || sending}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-dark-border bg-white/5 px-4 py-2.5 text-sm font-semibold text-gray-300 transition-all hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          onClick={handleSendQuote}
          disabled={saving || sending || calcs.total <= 0}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-gold-light disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {sending ? 'Sending...' : 'Send Quote'}
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-dark-border px-4 py-2.5 text-sm font-medium text-gray-400 transition-all hover:bg-white/5 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
