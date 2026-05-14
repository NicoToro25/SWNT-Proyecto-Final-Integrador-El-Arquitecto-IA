import React, { useMemo } from 'react'
import type { Enums } from '@/types/database.types'

interface ProjectStatusBadgeProps {
  estado: Enums<'estado_proyecto'>
  className?: string
}

// Mapeo estado → color y etiqueta
const statusStyles: Record<
  Enums<'estado_proyecto'>,
  { bg: string; text: string; label: string }
> = {
  'pendiente': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
  'en_progreso': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En Progreso' },
  'completado': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completado' },
  'cancelado': { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
  'en_revision': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'En Revisión' },
}

/**
 * Badge de estado reutilizable.
 * Muestra estado con color y etiqueta legible.
 */
export const ProjectStatusBadge = React.memo(function ProjectStatusBadge({
  estado,
  className = '',
}: ProjectStatusBadgeProps) {
  const style = useMemo(() => statusStyles[estado], [estado])

  return (
    <span
      className={`
        px-2 py-1 rounded text-xs font-medium whitespace-nowrap
        ${style.bg} ${style.text}
        ${className}
      `}
    >
      {style.label}
    </span>
  )
})
