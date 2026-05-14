import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ProjectForm } from '@/features/projects/components/ProjectForm'
import type { Tables } from '@/types/database.types'

/**
 * Página para crear nuevo proyecto.
 */
export default function ProjectNewPage() {
  const navigate = useNavigate()

  const handleSuccess = (proyecto: Tables<'proyectos'>) => {
    navigate(`/projects/${proyecto.id}`)
  }

  const handleCancel = () => {
    navigate('/projects')
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <ProjectForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  )
}
