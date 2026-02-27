'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Users, DollarSign, Clock, GripVertical } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { VehicleForm } from '@/components/admin/VehicleForm'
import { getAdminVehicles, createVehicle, updateVehicle, deleteVehicle } from '@/lib/actions/admin'
import { formatCurrency } from '@/lib/utils'
import type { Vehicle } from '@/types'

export default function AdminFleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const v = await getAdminVehicles()
        setVehicles(v)
      } catch (err) {
        console.error('Failed to load vehicles:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleAdd = () => {
    setEditingVehicle(null)
    setFormOpen(true)
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteVehicle(id)
      setVehicles((prev) => prev.filter((v) => v.id !== id))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Failed to delete vehicle:', err)
    }
  }

  const handleFormSubmit = async (
    data: Omit<Vehicle, 'id' | 'created_at' | 'updated_at' | 'display_order'> & { id?: string }
  ) => {
    try {
      if (data.id) {
        const updated = await updateVehicle(data.id, {
          name: data.name,
          slug: data.slug,
          type: data.type,
          capacity: data.capacity,
          hourly_rate: data.hourly_rate,
          min_hours: data.min_hours,
          description: data.description,
          features: data.features,
          is_active: data.is_active,
          image_url: data.image_url,
          gallery_urls: data.gallery_urls,
        })
        setVehicles((prev) => prev.map((v) => (v.id === data.id ? updated : v)))
      } else {
        const created = await createVehicle({
          name: data.name,
          slug: data.slug,
          type: data.type,
          capacity: data.capacity,
          hourly_rate: data.hourly_rate,
          min_hours: data.min_hours,
          description: data.description,
          features: data.features,
          is_active: data.is_active,
          image_url: data.image_url,
          gallery_urls: data.gallery_urls,
        })
        setVehicles((prev) => [...prev, created])
      }
      setFormOpen(false)
      setEditingVehicle(null)
    } catch (err) {
      console.error('Failed to save vehicle:', err)
    }
  }

  const typeColor: Record<string, string> = {
    'Party Bus': 'gold',
    'Sprinter Limo': 'purple',
    'Stretch Limo': 'green',
  }

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
          <h1 className="text-2xl font-bold text-white">Fleet Management</h1>
          <p className="mt-1 text-sm text-gray-400">{vehicles.length} vehicles</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </button>
      </div>

      {/* Vehicle list */}
      <div className="space-y-4">
        {vehicles.map((vehicle, index) => (
          <motion.div
            key={vehicle.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="transition-all duration-300 hover:border-gold/20">
              <div className="flex items-start gap-4">
                {/* Order number / grip */}
                <div className="flex flex-col items-center gap-1 pt-1">
                  <GripVertical className="h-4 w-4 text-gray-600 cursor-grab" />
                  <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                </div>

                {/* Vehicle image placeholder */}
                <div className="hidden sm:flex h-20 w-28 shrink-0 items-center justify-center rounded-lg border border-dark-border bg-black/50">
                  <span className="text-2xl">
                    {vehicle.type === 'Party Bus' ? '🚌' : vehicle.type === 'Sprinter Limo' ? '🚐' : '🚗'}
                  </span>
                </div>

                {/* Vehicle info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-white">{vehicle.name}</h3>
                    <Badge variant={(typeColor[vehicle.type] as 'gold' | 'purple' | 'green') || 'outline'}>
                      {vehicle.type}
                    </Badge>
                    {!vehicle.is_active && (
                      <Badge variant="red">Inactive</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-400 line-clamp-2">{vehicle.description}</p>

                  {/* Stats */}
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-300">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-gray-500" />
                      {vehicle.capacity} passengers
                    </span>
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      {formatCurrency(vehicle.hourly_rate)}/hr
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-gray-500" />
                      {vehicle.min_hours}hr min
                    </span>
                  </div>

                  {/* Features */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {vehicle.features.slice(0, 4).map((feature) => (
                      <span
                        key={feature}
                        className="rounded-md border border-dark-border bg-black/50 px-2 py-0.5 text-xs text-gray-400"
                      >
                        {feature}
                      </span>
                    ))}
                    {vehicle.features.length > 4 && (
                      <span className="rounded-md border border-dark-border bg-black/50 px-2 py-0.5 text-xs text-gray-500">
                        +{vehicle.features.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(vehicle)}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gold/10 hover:text-gold"
                    title="Edit vehicle"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  {deleteConfirm === vehicle.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 transition-all hover:bg-red-500/20"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-400 transition-all hover:bg-white/5"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(vehicle.id)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      title="Delete vehicle"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Vehicle form modal */}
      <AnimatePresence>
        {formOpen && (
          <VehicleForm
            vehicle={editingVehicle}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setFormOpen(false)
              setEditingVehicle(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
