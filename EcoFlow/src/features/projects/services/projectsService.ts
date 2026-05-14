import { supabase } from '@/lib/supabase/client'
import type { Enums, Tables, TablesInsert, TablesUpdate } from '@/types/database.types'
import { generateProjectCode } from '../utils/projectCodeGenerator'

import type { Project } from '../types/project.types'

/**
 * Obtiene todos los proyectos ordenados por fecha de creación descendente.
 *
 * Uso de tipos:
 * - Tables<'proyectos'> representa una fila completa de la tabla
 * - Los tipos se infieren automáticamente desde Supabase
 *
 * Ver: docs/TIPADO-SUPABASE-TYPESCRIPT.md#42-query-simple-select
 */
export async function getProjects(): Promise<Tables<'proyectos'>[]> {
  const { data, error } = await supabase
    .from('proyectos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`)
  }

  return data ?? []
}

/**
 * Obtiene un proyecto por ID.
 *
 * Returns null si no existe (usando maybeSingle).
 * Throws si hay error de acceso o query inválida.
 */
export async function getProjectById(projectId: string): Promise<Tables<'proyectos'> | null> {
  const { data, error } = await supabase
    .from('proyectos')
    .select('*')
    .eq('id', projectId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to fetch project: ${error.message}`)
  }

  return data
}

/**
 * Crea un nuevo proyecto con validación de tipos.
 *
 * Uso de tipos:
 * - TablesInsert<'proyectos'> incluye solo campos permitidos en INSERT
 * - Campos con defaults (id, created_at, updated_at) son opcionales
 * - Campos NOT NULL sin defaults son obligatorios
 *
 * Ver: docs/TIPADO-SUPABASE-TYPESCRIPT.md#51-insert-simple
 */
export async function createProject(
  input: Omit<TablesInsert<'proyectos'>, 'codigo_proyecto'>
): Promise<Tables<'proyectos'>> {
  // Generar código de proyecto automáticamente
  const projectInput: TablesInsert<'proyectos'> = {
    ...input,
    codigo_proyecto: generateProjectCode(),
  }

  const { data, error } = await supabase
    .from('proyectos')
    .insert(projectInput)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`)
  }

  return data
}

/**
 * Actualiza un proyecto con campos parciales.
 *
 * Uso de tipos:
 * - TablesUpdate<'proyectos'> hace TODAS las columns opcionales
 * - RLS en la DB valida permisos reales (no confiar solo en tipos)
 *
 * Ver: docs/TIPADO-SUPABASE-TYPESCRIPT.md#61-update-simple
 */
export async function updateProject(
  projectId: string,
  updates: TablesUpdate<'proyectos'>
): Promise<Tables<'proyectos'>> {
  const { data, error } = await supabase
    .from('proyectos')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update project: ${error.message}`)
  }

  return data
}

/**
 * Actualiza el estado de un proyecto.
 *
 * Uso de tipos:
 * - Enums<'estado_proyecto'> asegura que solo valores válidos se aceptan
 * - TypeScript previene typos en enums
 *
 * Ver: docs/TIPADO-SUPABASE-TYPESCRIPT.md#52-update-con-validacion-por-rol
 */
export async function updateProjectStatus(
  projectId: string,
  newStatus: Enums<'estado_proyecto'>
): Promise<Tables<'proyectos'>> {
  const { data, error } = await supabase
    .from('proyectos')
    .update({ estado: newStatus })
    .eq('id', projectId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update project status: ${error.message}`)
  }

  return data
}

/**
 * Obtiene proyectos con filtros opcionales.
 *
 * Demuestra:
 * - Uso de enums para filtros tipados
 * - Query builder condicional
 * - Manejo de null/undefined en filtros
 */
interface GetProjectsFiltersInput {
  estado?: Enums<'estado_proyecto'>
  cliente_id?: string
}

export async function getProjectsFiltered(
  filters: GetProjectsFiltersInput
): Promise<Tables<'proyectos'>[]> {
  let query = supabase.from('proyectos').select('*')

  if (filters.estado) {
    query = query.eq('estado', filters.estado)
  }

  if (filters.cliente_id) {
    query = query.eq('cliente_id', filters.cliente_id)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch filtered projects: ${error.message}`)
  }

  return data ?? []
}