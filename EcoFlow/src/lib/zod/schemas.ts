import { z } from 'zod'

export const uuidSchema = z.string().uuid()

export const projectStatusSchema = z.enum(['Pendiente', 'En Progreso', 'Completado'])

export const maybeEmptyStringSchema = z.string().trim().min(1).optional()