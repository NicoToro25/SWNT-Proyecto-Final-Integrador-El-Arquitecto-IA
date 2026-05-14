import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Tables } from '@/types/database.types'
import { ProjectCard } from './ProjectCard'
import { EmptyState } from '@/shared/components/EmptyState'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'

interface ProjectsGridProps {
  proyectos: Tables<'proyectos'>[] | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  onRetry?: () => void
  searchQuery?: string
  statusFilter?: string | undefined
}

/**
 * Grid responsivo de proyectos.
 * Maneja loading, error y empty states.
 * Layout: 1 columna (mobile) → 2 (tablet) → 3 (desktop)
 */
export const ProjectsGrid = React.memo(function ProjectsGrid({
  proyectos,
  isLoading,
  isError,
  error,
  onRetry,
  searchQuery = '',
  statusFilter,
}: ProjectsGridProps) {
  const navigate = useNavigate()

  // Filtrar y buscar localmente (post-fetch)
  const filteredProyectos = useMemo(() => {
    if (!proyectos) return []

    return proyectos.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.codigo_proyecto?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = !statusFilter || p.estado === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [proyectos, searchQuery, statusFilter])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg text-center">
        <h3 className="font-bold text-red-900 mb-2">Error al cargar proyectos</h3>
        <p className="text-red-700 mb-4">{error?.message || 'Ocurrió un error desconocido'}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        )}
      </div>
    )
  }

  // Empty state
  if (!filteredProyectos.length) {
    return (
      <EmptyState
        title="No hay proyectos"
        description={
          searchQuery || statusFilter
            ? 'No se encontraron proyectos con los filtros aplicados'
            : 'Comienza creando tu primer proyecto'
        }
        action={
          <button
            onClick={() => navigate('/projects/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Nuevo Proyecto
          </button>
        }
      />
    )
  }

  // Grid de proyectos
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredProyectos.map((proyecto) => (
        <ProjectCard
          key={proyecto.id}
          proyecto={proyecto}
          onSelect={(id) => navigate(`/projects/${id}`)}
        />
      ))}
    </div>
  )
})
