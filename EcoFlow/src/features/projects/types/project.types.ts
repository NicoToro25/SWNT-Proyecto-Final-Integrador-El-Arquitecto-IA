import type { Enums, Tables } from '@/types/database.types'

export type ProjectStatus = Enums<'estado_proyecto'>

export type Project = Tables<'proyectos'>

export interface ProjectSummary {
  id: string
  nombre: string
  estado: ProjectStatus
  createdAt: string
}