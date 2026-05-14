# Arquitectura del Formulario de Proyectos — EcoFlow

Diseño profesional del formulario con validación, manejo de errores y UX optimizada.

## 1. Visión General

### Propósito
Formulario completo para crear/editar proyectos con validación robusta, manejo de dependencias y UX profesional.

### Flujo
```
User abre formulario
    ↓
useForm (React Hook Form)
    ├─ register campos
    ├─ validar con Zod
    └─ watch para dependencias
    
User completa y envía
    ↓
Validar localmente con Zod
    ↓
Enviar a Supabase via mutation
    ↓
Loading state (deshabilitar botón)
    ↓
✅ Éxito: toast + redirect
❌ Error: mostrar error en toast + mantener form
```

## 2. Campos del Formulario

### Estructura de Datos
```typescript
type ProjectFormData = {
  nombre: string              // Requerido
  codigo_proyecto?: string    // Optional (auto-generated)
  cliente_id: string          // Dropdown (Requerido)
  direccion_instalacion: string
  ciudad_instalacion: string
  estado: EstadoProyecto      // Enum
  fecha_inicio?: string       // Date picker
  observaciones?: string      // Textarea
  materiales: MaterialId[]    // Multi-select
  instaladores: InstaladorId[] // Multi-select
}
```

## 3. Validación con Zod

### Schema Principal
```typescript
const ProjectFormSchema = z.object({
  nombre: z
    .string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(100, 'Nombre máximo 100 caracteres'),
    
  cliente_id: z
    .string()
    .uuid('Cliente inválido'),
    
  direccion_instalacion: z
    .string()
    .min(5, 'Dirección debe tener al menos 5 caracteres'),
    
  ciudad_instalacion: z
    .string()
    .min(2, 'Ciudad inválida'),
    
  estado: z.enum([
    'pendiente',
    'en_progreso',
    'completado',
    'cancelado',
    'en_revision'
  ]),
  
  fecha_inicio: z
    .string()
    .date()
    .optional(),
    
  observaciones: z
    .string()
    .max(500, 'Máximo 500 caracteres')
    .optional(),
    
  materiales: z
    .array(z.string().uuid())
    .default([]),
    
  instaladores: z
    .array(z.string().uuid())
    .default([]),
})

export type ProjectFormData = z.infer<typeof ProjectFormSchema>
```

### Validadores Condicionales
```typescript
const ProjectFormSchema = z.object({
  // ...
}).refine(
  (data) => {
    // Si estado es 'en_progreso', debe haber instaladores
    if (data.estado === 'en_progreso' && data.instaladores.length === 0) {
      return false
    }
    return true
  },
  {
    message: 'Se requiere al menos un instalador',
    path: ['instaladores'],
  }
)
```

## 4. Arquitectura de Componentes

### Estructura de Carpetas
```
src/features/projects/
├── components/
│   ├── ProjectForm.tsx              [Form principal]
│   ├── ProjectFormFields/
│   │   ├── BasicInfoSection.tsx     [Nombre, código, cliente]
│   │   ├── LocationSection.tsx      [Dirección, ciudad]
│   │   ├── StatusSection.tsx        [Estado]
│   │   ├── MaterialsSection.tsx     [Selector de materiales]
│   │   ├── InstallersSection.tsx    [Selector de instaladores]
│   │   └── ObservationsSection.tsx  [Notas]
│   ├── ProjectFormActions.tsx        [Botones submit/cancel]
│   └── ProjectFormErrors.tsx         [Mostrar errores globales]
├── hooks/
│   ├── useProjectForm.ts            [Logic del formulario]
│   ├── useProjectMutations.ts       [Create/update mutations]
│   └── useFormOptions.ts            [Opciones de selects]
├── schemas/
│   └── project.schemas.ts           [Zod schemas]
└── types/
    └── project.form.types.ts        [Tipos específicos de form]
```

### Jerarquía de Componentes

```
ProjectForm (formulario principal)
  │
  ├─ BasicInfoSection
  │   ├─ FieldInput (nombre)
  │   ├─ FieldInput (código - readonly/auto)
  │   └─ FieldSelect (cliente) → useClientsOptions
  │
  ├─ LocationSection
  │   ├─ FieldInput (dirección)
  │   └─ FieldInput (ciudad)
  │
  ├─ StatusSection
  │   └─ FieldSelect (estado)
  │
  ├─ MaterialsSection
  │   └─ FieldMultiSelect (materiales)
  │       └─ Con búsqueda y filtrado
  │
  ├─ InstallersSection
  │   └─ FieldMultiSelect (instaladores)
  │       └─ Condicional: visible si estado === 'en_progreso'
  │
  ├─ ObservationsSection
  │   └─ FieldTextarea (observaciones)
  │
  ├─ FormErrors (errores globales)
  │
  └─ ProjectFormActions
      ├─ SubmitButton (loading state)
      └─ CancelButton
```

## 5. Componentes Reutilizables

### FieldInput.tsx
```typescript
interface FieldInputProps {
  label: string
  placeholder?: string
  type?: 'text' | 'email' | 'date' | 'number'
  error?: string
  {...register props}
}
```

### FieldSelect.tsx
```typescript
interface FieldSelectProps {
  label: string
  options: Array<{ value: string; label: string }>
  error?: string
  {...register props}
}
```

### FieldMultiSelect.tsx
```typescript
interface FieldMultiSelectProps {
  label: string
  options: Array<{ value: string; label: string }>
  selected: string[]
  onChange: (selected: string[]) => void
  searchable?: boolean
  error?: string
}
```

## 6. Manejo de Estados

### Estados del Formulario (React Hook Form)
```typescript
const {
  register,          // Registrar inputs
  watch,             // Observar cambios
  formState: {
    errors,          // Errores de validación
    isSubmitting,    // Durante submit
    isDirty,         // Si tiene cambios
    isValid,         // Si pasa validación
  },
  handleSubmit,      // Handler del submit
  reset,             // Reset a valores iniciales
} = useForm({
  resolver: zodResolver(ProjectFormSchema),
  mode: 'onChange',  // Validar mientras se escribe
  defaultValues: proyecto || {} // Pre-fill en edit
})
```

### Estados del Servidor (React Query)
```typescript
const createMutation = useMutation({
  mutationFn: (data) => createProject(data),
  onSuccess: (newProject) => {
    // Invalidar lista de proyectos
    queryClient.invalidateQueries({ queryKey: ['projects'] })
    // Navegar a detalles
    navigate(`/projects/${newProject.id}`)
    // Toast de éxito
    toast.success('Proyecto creado')
  },
  onError: (error) => {
    // Toast de error
    toast.error(error.message)
  },
})
```

## 7. Validación en Múltiples Niveles

### Nivel 1: Cliente (Zod)
```typescript
// Validación antes de enviar
const validationResult = ProjectFormSchema.safeParse(formData)
if (!validationResult.success) {
  // Mostrar errores en form
  return
}
```

### Nivel 2: Servidor (Supabase RLS)
```typescript
// RLS en BD valida:
// - Usuario es admin o project_manager
// - Cliente existe
// - Materiales existen
```

### Nivel 3: Backend (SQL Constraints)
```sql
-- Validaciones en triggers
CHECK (estado IN ('pendiente', 'en_progreso', '...'))
FOREIGN KEY cliente_id REFERENCES clientes(id)
```

## 8. Manejo de Errores

### Errores de Validación (Zod)
```typescript
// Mostrados en los campos
<FieldInput
  error={errors.nombre?.message}
  {...register('nombre')}
/>
```

### Errores del Servidor
```typescript
// Mostrados en toast global
try {
  await createProject(validData)
} catch (error) {
  if (error.message.includes('cliente')) {
    toast.error('Cliente no encontrado')
  } else if (error.message.includes('instalador')) {
    toast.error('Instalador no disponible')
  }
}
```

### Errores de Permiso
```typescript
// Supabase RLS retorna 403
// Mostrado en ErrorBoundary
if (error.status === 403) {
  return <ErrorBoundary error="No tienes permiso para crear proyectos" />
}
```

## 9. UX Optimizada

### Indicadores Visuales
```typescript
// Botón submit muestra loading
<button
  type="submit"
  disabled={isSubmitting || !isValid}
  className="flex items-center gap-2"
>
  {isSubmitting ? <Spinner /> : null}
  {isSubmitting ? 'Guardando...' : 'Guardar Proyecto'}
</button>
```

### Validación en Tiempo Real
```typescript
// watch en campo problema
const estado = watch('estado')

// Si cambiar estado a 'en_progreso'
// mostrar campo de instaladores
useEffect(() => {
  if (estado === 'en_progreso') {
    // campo instaladores visible
  }
}, [estado])
```

### Confirmación de Cambios No Guardados
```typescript
const isDirty = watch() // Observe all changes
useEffect(() => {
  window.addEventListener('beforeunload', (e) => {
    if (isDirty) {
      e.preventDefault()
      e.returnValue = 'Tienes cambios sin guardar'
    }
  })
}, [isDirty])
```

## 10. Flujo Completo de Envío

```
1. User llena form
   └─ useForm valida en tiempo real
   
2. User clica "Guardar"
   └─ handleSubmit triggered
   
3. Validar localmente
   └─ ProjectFormSchema.parse(data)
   └─ Si error: mostrar en campos
   
4. isSubmitting = true
   └─ Deshabilitar botón
   └─ Mostrar spinner
   
5. useMutation.mutate(data)
   └─ createProject(data)
   
6. Supabase recibe
   └─ Validar RLS
   └─ Validar constraints
   
7. Respuesta:
   ✅ Éxito:
      - isSubmitting = false
      - Invalidate 'projects' query
      - Navigate a detalles
      - Toast success
      - Reset form
      
   ❌ Error:
      - isSubmitting = false
      - Toast error
      - Mantener form con datos
      - Focus al campo problemático
```

## 11. Integración con Dashboard

```
DashboardPage
  └─ Button "Nuevo Proyecto"
      └─ Navigate a /projects/new
      
ProjectNewPage
  └─ ProjectForm (modo create)
      └─ onSuccess → Navigate to /projects/:id
      
DashboardPage
  └─ useProjects() refetch automático
      └─ Grid actualizado con nuevo proyecto
```

## 12. Consideraciones de Mobile

### Responsive
```typescript
// Campos en una columna en mobile, dos en desktop
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <FieldInput />
  <FieldInput />
</div>
```

### Mobile-friendly Selects
```typescript
// En mobile, usar nativo select
// En desktop, usar combobox con búsqueda
<FieldMultiSelect
  className="md:hidden"  // Nativo en mobile
/>
<FieldCombobox
  className="hidden md:block"  // Combobox en desktop
/>
```

## Checklist de Implementación

- [ ] Crear ProjectFormSchema con Zod
- [ ] Crear componentes de secciones
- [ ] Crear componentes reutilizables (FieldInput, etc)
- [ ] Implementar useProjectForm hook
- [ ] Implementar validaciones condicionales
- [ ] Manejo de errores en todos los niveles
- [ ] Loading states (botón, spinner)
- [ ] Confirmación de cambios sin guardar
- [ ] Integración con React Query mutations
- [ ] Toast notifications (éxito/error)
- [ ] Responsive design (mobile/desktop)
- [ ] Accesibilidad (ARIA labels, focus management)
- [ ] Tests (validaciones, submit, errores)

## Referencias de Código

- Schemas: `src/features/projects/schemas/`
- Formularios: `src/features/projects/components/`
- Hooks: `src/features/projects/hooks/`
- Tipos: `src/features/projects/types/`
