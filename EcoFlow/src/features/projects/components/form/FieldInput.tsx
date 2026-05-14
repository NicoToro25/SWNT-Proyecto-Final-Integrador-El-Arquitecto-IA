import React from 'react'
import { FieldError, UseFormRegisterReturn } from 'react-hook-form'

interface FieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: FieldError | undefined
  helperText?: string
  register?: UseFormRegisterReturn
}

/**
 * Componente reutilizable para inputs.
 * Incluye label, error handling y helper text.
 */
export const FieldInput = React.forwardRef<HTMLInputElement, FieldInputProps>(
  ({ label, error, helperText, register, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input
          ref={ref}
          {...register}
          {...props}
          className={`
            w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
            ${className || ''}
          `}
        />
        {error && <p className="text-sm text-red-600">{error.message}</p>}
        {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
      </div>
    )
  }
)

FieldInput.displayName = 'FieldInput'
