import type { Tables, TablesInsert, TablesUpdate } from '@/types/database.types'

/**
 * Tipo de dominio para un instalador desde la BD.
 * Hereda todas las propiedades de Tables<'instaladores'>.
 */
export type Installer = Tables<'instaladores'>

/**
 * Tipo para crear un nuevo instalador.
 * Requiere: nombre, apellido, email
 * Opcional: especialidad, telefono, disponible
 */
export type CreateInstallerInput = TablesInsert<'instaladores'>

/**
 * Tipo para actualizar un instalador.
 * Todos los campos son opcionales.
 */
export type UpdateInstallerInput = TablesUpdate<'instaladores'>

/**
 * DTO para la respuesta con información del usuario autenticado.
 */
export type InstallerWithUser = Installer & {
  user?: {
    id: string
    email: string
  }
}
