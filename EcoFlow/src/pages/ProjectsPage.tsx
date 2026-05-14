import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Enums } from '@/types/database.types'
import { useProjects } from '@/features/projects/hooks/useProjects'
import { ProjectFilters } from '@/features/projects/components/ProjectFilters'
import { ProjectsGrid } from '@/features/projects/components/ProjectsGrid'

/**
 * Página principal del dashboard de proyectos.
 * Muestra grid de proyectos con filtrado y búsqueda.
 */
export default function ProjectsPage() {
  const navigate = useNavigate()
  const { data: proyectos, isLoading, isError, error, refetch } = useProjects()

  // Filtros locales
  const [filters, setFilters] = useState<{
    search: string
    estado?: Enums<'estado_proyecto'> | undefined
  }>({
    search: '',
    estado: undefined,
  })

  const handleFiltersChange = useCallback(
    (newFilters: { search: string; estado?: Enums<'estado_proyecto'> | undefined }) => {
    setFilters(newFilters)
    },
    []
  )

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proyectos</h1>
          <p className="text-gray-600 mt-2">Gestiona todos tus proyectos de instalación</p>
        </div>
        <button
          onClick={() => navigate('/projects/new')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nuevo Proyecto
        </button>
      </div>

      {/* Filtros */}
      <ProjectFilters onFiltersChange={handleFiltersChange} />

      {/* Grid de Proyectos */}
      <ProjectsGrid
        proyectos={proyectos}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        searchQuery={filters.search}
        statusFilter={filters.estado}
      />
    </div>
  )
}