import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '@/lib/query/queryKeys'

import { getProjectById } from '../services/projectsService'

export function useProjectById(projectId: string) {
  return useQuery({
    queryKey: queryKeys.project(projectId),
    queryFn: () => getProjectById(projectId),
    enabled: Boolean(projectId),
  })
}