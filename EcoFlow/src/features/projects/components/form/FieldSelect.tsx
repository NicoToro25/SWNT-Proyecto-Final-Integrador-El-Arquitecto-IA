import React from 'react'
import { FieldError, UseFormRegisterReturn } from 'react-hook-form'

interface FieldSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: FieldError | undefined
  options: Array<{ value: string; label: string }>
  placeholder?: string
  register?: UseFormRegisterReturn
}

/**
 * Componente reutilizable para selects.
 * Incluye label, error handling y opciones tipadas.
 */
export const FieldSelect = React.forwardRef<HTMLSelectElement, FieldSelectProps>(
  ({ label, error, options, placeholder, register, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <select
          ref={ref}
          {...register}
          {...props}
          className={`
            w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
            ${className || ''}
          `}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-600">{error.message}</p>}
      </div>
    )
  }
)

FieldSelect.displayName = 'FieldSelect'
