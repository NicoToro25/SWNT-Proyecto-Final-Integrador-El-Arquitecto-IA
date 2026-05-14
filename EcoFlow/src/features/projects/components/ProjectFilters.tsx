import React, { useState, useCallback } from 'react'
import type { Enums } from '@/types/database.types'

const ESTADO_OPTIONS: Array<{ value: Enums<'estado_proyecto'>; label: string }> = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_progreso', label: 'En Progreso' },
  { value: 'completado', label: 'Completado' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'en_revision', label: 'En Revisión' },
]

interface ProjectFiltersProps {
  onFiltersChange: (filters: { search: string; estado?: Enums<'estado_proyecto'> | undefined }) => void
}

/**
 * Barra de filtrado para proyectos.
 * Incluye búsqueda por texto y filtro por estado.
 */
export const ProjectFilters = React.memo(function ProjectFilters({
  onFiltersChange,
}: ProjectFiltersProps) {
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<Enums<'estado_proyecto'> | undefined>()

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value)
      onFiltersChange({ search: value, estado: selectedStatus })
    },
    [selectedStatus, onFiltersChange]
  )

  const handleStatusChange = useCallback(
    (value: Enums<'estado_proyecto'> | undefined) => {
      setSelectedStatus(value)
      onFiltersChange({ search, estado: value })
    },
    [search, onFiltersChange]
  )

  const handleClear = useCallback(() => {
    setSearch('')
    setSelectedStatus(undefined)
    onFiltersChange({ search: '', estado: undefined })
  }, [onFiltersChange])

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={selectedStatus || ''}
          onChange={(e) =>
            handleStatusChange((e.target.value as Enums<'estado_proyecto'>) || undefined)
          }
          className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          {ESTADO_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Button */}
      {(search || selectedStatus) && (
        <div className="flex justify-end">
          <button
            onClick={handleClear}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  )
})
