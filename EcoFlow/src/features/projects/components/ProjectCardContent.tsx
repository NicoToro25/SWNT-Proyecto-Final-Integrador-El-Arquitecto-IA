import React from 'react'
import type { Tables } from '@/types/database.types'
import { ProjectStatusBadge } from './ProjectStatusBadge'
import { formatDate } from '@/shared/utils/formatters'

interface ProjectCardContentProps {
  proyecto: Tables<'proyectos'>
}

/**
 * Contenido interno de ProjectCard.
 * Separado para facilitar testing y reutilización.
 */
export const ProjectCardContent = React.memo(function ProjectCardContent({
  proyecto,
}: ProjectCardContentProps) {
  return (
    <div className="p-4">
      {/* Header: Nombre + Status */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{proyecto.nombre}</h3>
          {proyecto.codigo_proyecto && (
            <p className="text-xs text-gray-500 mt-1">#{proyecto.codigo_proyecto}</p>
          )}
        </div>
        <ProjectStatusBadge estado={proyecto.estado} />
      </div>

      {/* Ubicación */}
      {proyecto.ciudad_instalacion && (
        <div className="mb-3 text-sm text-gray-600">
          <p className="truncate">📍 {proyecto.ciudad_instalacion}</p>
        </div>
      )}

      {/* Fecha */}
      {proyecto.created_at && (
        <div className="text-xs text-gray-500 pt-3 border-t border-gray-100">
          Creado: {formatDate(proyecto.created_at)}
        </div>
      )}
    </div>
  )
})
