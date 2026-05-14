import { z } from 'zod'

/**
 * Schemas Zod para validación en tiempo de ejecución.
 *
 * Estos schemas definen la validación UNA SOLA VEZ.
 * Los tipos se infieren automáticamente con z.infer.
 *
 * Ver: docs/TIPADO-SUPABASE-TYPESCRIPT.md#74-evitar-duplicacion--infer-de-zod
 */

/**
 * Schema base para validar datos de instalador (reusable).
 */
const InstallerBaseSchema = z.object({
  nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres'),
  apellido: z.string().min(2, 'Apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  especialidad: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  disponible: z.boolean().default(true),
})

/**
 * Schema para crear un instalador.
 *
 * Requiere: nombre, apellido, email
 * Opcional: especialidad, telefono, disponible
 *
 * @example
 * const data = { nombre: 'Juan', apellido: 'Pérez', email: 'juan@test.com' }
 * const validated = CreateInstallerSchema.parse(data)
 */
export const CreateInstallerSchema = InstallerBaseSchema.strict()

/**
 * Infiere el tipo automáticamente desde el schema.
 * Garantiza que el tipo coincide exactamente con la validación.
 */
export type CreateInstallerValidated = z.infer<typeof CreateInstallerSchema>

/**
 * Schema para actualizar un instalador (todos campos opcionales).
 *
 * @example
 * const updates = { disponible: false }
 * const validated = UpdateInstallerSchema.parse(updates)
 */
export const UpdateInstallerSchema = InstallerBaseSchema.partial().strict()

export type UpdateInstallerValidated = z.infer<typeof UpdateInstallerSchema>

/**
 * Schema para filtros de búsqueda de instaladores.
 */
export const InstallerFiltersSchema = z.object({
  especialidad: z.string().optional(),
  disponible: z.boolean().optional(),
  nombre: z.string().optional(),
})

export type InstallerFilters = z.infer<typeof InstallerFiltersSchema>

/**
 * Validadores individuales para campos específicos.
 */
export const InstallerFieldSchemas = {
  nombre: z.string().min(2).max(100),
  apellido: z.string().min(2).max(100),
  email: z.string().email(),
  especialidad: z.string().min(1).max(200).optional().nullable(),
  telefono: z.string().regex(/^\+?[\d\s()-]{10,}$/, 'Teléfono inválido').optional().nullable(),
  disponible: z.boolean(),
  id: z.string().uuid(),
}

/**
 * Ejemplo: Validar un campo individual en un form
 *
 * @example
 * function validateEmail(email: string) {
 *   try {
 *     InstallerFieldSchemas.email.parse(email)
 *     return null // válido
 *   } catch (error) {
 *     return error.message // error
 *   }
 * }
 */

/**
 * Helper para validar datos de formulario.
 *
 * @example
 * function handleFormSubmit(formData: unknown) {
 *   try {
 *     const validated = CreateInstallerSchema.parse(formData)
 *     // Proceder con datos validados
 *     return createInstaller(validated)
 *   } catch (error) {
 *     // Mostrar errores a usuario
 *     return handleValidationErrors(error)
 *   }
 * }
 */
export function validateCreateInstaller(data: unknown): CreateInstallerValidated {
  return CreateInstallerSchema.parse(data)
}

export function validateUpdateInstaller(data: unknown): UpdateInstallerValidated {
  return UpdateInstallerSchema.parse(data)
}

export function validateInstallerFilters(data: unknown): InstallerFilters {
  return InstallerFiltersSchema.parse(data)
}

/**
 * Función helper para extraer mensajes de error de forma legible.
 *
 * @example
 * try {
 *   CreateInstallerSchema.parse(formData)
 * } catch (error) {
 *   const messages = getValidationErrors(error)
 *   // { nombre: ['Nombre debe tener al menos 2 caracteres'] }
 * }
 */
export function getValidationErrors(error: unknown): Record<string, string[]> {
  if (error instanceof z.ZodError) {
    const errors: Record<string, string[]> = {}
    error.issues.forEach((issue) => {
      const path = issue.path.join('.')
      if (!errors[path]) {
        errors[path] = []
      }
      errors[path].push(issue.message)
    })
    return errors
  }
  return {}
}

