import React, { useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Tables } from '@/types/database.types'
import {
  ProjectFormSchema,
  ProjectFormData,
} from '../schemas/project.form.schemas'
import { FieldInput } from './form/FieldInput'
import { FieldSelect } from './form/FieldSelect'
import { FieldTextarea } from './form/FieldTextarea'
import { useCreateProject, useUpdateProject } from '../hooks/useProjectMutations'
import { LoadingSpinner } from '@/shared/components/LoadingSpinner'

interface ProjectFormProps {
  proyecto?: Tables<'proyectos'>
  onSuccess?: (proyecto: Tables<'proyectos'>) => void
  onCancel?: () => void
}

// Opciones de estado para select
const ESTADO_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_progreso', label: 'En Progreso' },
  { value: 'completado', label: 'Completado' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'en_revision', label: 'En Revisión' },
]

/**
 * Formulario completo de proyectos.
 * Soporta crear y editar con validación Zod.
 */
export function ProjectForm({ proyecto, onSuccess, onCancel }: ProjectFormProps) {
  const isEditMode = !!proyecto
  const createMutation = useCreateProject()
  const updateMutation = useUpdateProject()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(ProjectFormSchema),
    mode: 'onChange',
    ...(proyecto
      ? {
          defaultValues: {
            nombre: proyecto.nombre,
            cliente_id: proyecto.cliente_id,
            direccion_instalacion: proyecto.direccion_instalacion,
            ciudad_instalacion: proyecto.ciudad_instalacion,
            estado: proyecto.estado,
            observaciones: proyecto.notas_internas || undefined,
          },
        }
      : {}),
  })

  // Confirmación de cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = 'Tienes cambios sin guardar'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const onSubmit: SubmitHandler<ProjectFormData> = async (data) => {
    try {
      if (isEditMode && proyecto) {
        const updated = await updateMutation.mutateAsync({
          id: proyecto.id,
          data: {
            nombre: data.nombre,
            cliente_id: data.cliente_id,
            direccion_instalacion: data.direccion_instalacion,
            ciudad_instalacion: data.ciudad_instalacion,
            estado: data.estado,
            notas_internas: data.observaciones || null,
          },
        })
        onSuccess?.(updated)
      } else {
        const created = await createMutation.mutateAsync({
          nombre: data.nombre,
          cliente_id: data.cliente_id,
          direccion_instalacion: data.direccion_instalacion,
          ciudad_instalacion: data.ciudad_instalacion,
          estado: data.estado,
          notas_internas: data.observaciones || null,
        })
        reset()
        onSuccess?.(created)
      }
    } catch (error) {
      console.error('Form submission error:', error)
      // Error handling es responsabilidad del mutation hook
    }
  }

  const isLoading = isSubmitting || createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold">
          {isEditMode ? 'Editar Proyecto' : 'Nuevo Proyecto'}
        </h2>
      </div>

      {/* Errores globales */}
      {(createMutation.isError || updateMutation.isError) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          <p className="font-medium">Error al guardar</p>
          <p className="text-sm mt-1">
            {createMutation.error?.message || updateMutation.error?.message}
          </p>
        </div>
      )}

      {/* Información Básica */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldInput
            label="Nombre del Proyecto"
            placeholder="Ej: Instalación Solar Residencial"
            error={errors.nombre}
            register={register('nombre')}
          />
          <FieldSelect
            label="Estado"
            options={ESTADO_OPTIONS}
            error={errors.estado}
            register={register('estado')}
          />
        </div>
      </div>

      {/* Ubicación */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Ubicación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldInput
            label="Dirección"
            placeholder="Ej: Calle Principal 123"
            error={errors.direccion_instalacion}
            register={register('direccion_instalacion')}
          />
          <FieldInput
            label="Ciudad"
            placeholder="Ej: Medellín"
            error={errors.ciudad_instalacion}
            register={register('ciudad_instalacion')}
          />
        </div>
      </div>

      {/* Cliente */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Cliente</h3>
        <FieldSelect
          label="Selecciona Cliente"
          options={[{ value: '550e8400-e29b-41d4-a716-446655440000', label: 'Cliente Demo' }]}
          placeholder="Selecciona un cliente"
          error={errors.cliente_id}
          register={register('cliente_id')}
        />
      </div>

      {/* Observaciones */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Notas Adicionales</h3>
        <FieldTextarea
          label="Observaciones"
          placeholder="Añade cualquier observación o nota relevante..."
          helperText="Máximo 1000 caracteres"
          error={errors.observaciones}
          register={register('observaciones')}
        />
      </div>

      {/* Botones */}
      <div className="flex gap-4 pt-6 border-t">
        <button
          type="submit"
          disabled={isLoading}
          className="
            flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
            disabled:bg-gray-400 disabled:cursor-not-allowed
            flex items-center justify-center gap-2 transition-colors
          "
        >
          {isLoading && <LoadingSpinner />}
          {isLoading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear Proyecto'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="
            px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300
            disabled:cursor-not-allowed transition-colors
          "
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
