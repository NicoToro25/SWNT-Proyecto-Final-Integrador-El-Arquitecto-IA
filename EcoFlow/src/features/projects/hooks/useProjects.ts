import { useQuery } from '@tanstack/react-query'
import type { Tables } from '@/types/database.types'
import { queryKeys } from '@/lib/query/queryKeys'
import { getProjects } from '../services/projectsService'

/**
 * Hook para obtener todos los proyectos.
 * Cachea por 30 segundos.
 * Permite refetch manual.
 *
 * @returns Query result con array de proyectos
 *
 * @example
 * const { data: proyectos, isLoading } = useProjects()
 */
export function useProjects() {
  return useQuery<Tables<'proyectos'>[]>({
    queryKey: queryKeys.projects(),
    queryFn: getProjects,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
}