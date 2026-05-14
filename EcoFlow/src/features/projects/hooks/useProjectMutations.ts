import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database.types'
import { createProject, updateProject } from '../services/projectsService'

/**
 * Hook para crear un nuevo proyecto.
 * Invalida el caché de proyectos en éxito.
 */
export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation<
    Tables<'proyectos'>,
    Error,
    Omit<TablesInsert<'proyectos'>, 'codigo_proyecto'>
  >({
    mutationFn: createProject,
    onSuccess: (newProject) => {
      // Invalidar lista de proyectos
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      // Setear el proyecto nuevo en caché
      queryClient.setQueryData(['projects', newProject.id], newProject)
    },
  })
}

/**
 * Hook para actualizar un proyecto.
 * Invalida el caché en éxito.
 */
export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation<
    Tables<'proyectos'>,
    Error,
    { id: string; data: TablesUpdate<'proyectos'> }
  >({
    mutationFn: async ({ id, data }) => updateProject(id, data),
    onSuccess: (updatedProject) => {
      // Actualizar en caché
      queryClient.setQueryData(['projects', updatedProject.id], updatedProject)
      // Invalidar lista (por si hay cambios en orden)
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
