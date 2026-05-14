import { z } from 'zod'

/**
 * Schema para crear/editar un proyecto.
 * Validación robusta con mensajes en español.
 *
 * Nota: Este schema mapea campos del formulario a la tabla:
 * - fecha_inicio (form) → fecha_inicio_estimada (tabla)
 * - observaciones (form) → notas_internas (tabla)
 * - materiales e instaladores se manejan en tablas de asociación
 */
export const ProjectFormSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),

  cliente_id: z
    .string()
    .uuid('Selecciona un cliente válido'),

  direccion_instalacion: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(255, 'La dirección es muy larga'),

  ciudad_instalacion: z
    .string()
    .min(2, 'Ingresa una ciudad válida')
    .max(100, 'La ciudad es muy larga'),

  estado: z.enum(['pendiente', 'en_progreso', 'completado', 'cancelado', 'en_revision'] as const, {
    message: 'Selecciona un estado válido',
  }),

  observaciones: z
    .string()
    .max(1000, 'Las observaciones no pueden exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
})

export type ProjectFormData = z.infer<typeof ProjectFormSchema>

/**
 * Extraer errores de validación de forma legible.
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
