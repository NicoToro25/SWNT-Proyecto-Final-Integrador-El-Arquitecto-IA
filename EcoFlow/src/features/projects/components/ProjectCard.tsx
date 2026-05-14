import React, { useMemo } from 'react'
import type { Tables, Enums } from '@/types/database.types'
import { ProjectCardContent } from './ProjectCardContent'

interface ProjectCardProps {
  proyecto: Tables<'proyectos'>
  onSelect: (id: string) => void
}

// Mapa de colores para estados
const statusColorMap: Record<Enums<'estado_proyecto'>, string> = {
  'pendiente': 'border-l-yellow-500 hover:border-l-yellow-600',
  'en_progreso': 'border-l-blue-500 hover:border-l-blue-600',
  'completado': 'border-l-green-500 hover:border-l-green-600',
  'cancelado': 'border-l-red-500 hover:border-l-red-600',
  'en_revision': 'border-l-purple-500 hover:border-l-purple-600',
}

/**
 * Card individual de proyecto.
 * Mostrado en grid, clickeable para ir a detalles.
 */
export const ProjectCard = React.memo(function ProjectCard({
  proyecto,
  onSelect,
}: ProjectCardProps) {
  const borderColor = useMemo(() => statusColorMap[proyecto.estado], [proyecto.estado])

  return (
    <button
      onClick={() => onSelect(proyecto.id)}
      className={`
        bg-white border-l-4 rounded-lg shadow hover:shadow-lg
        transition-all duration-200 cursor-pointer text-left p-0
        overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500
        ${borderColor}
      `}
      aria-label={`Ver proyecto ${proyecto.nombre}`}
    >
      <ProjectCardContent proyecto={proyecto} />
    </button>
  )
})
