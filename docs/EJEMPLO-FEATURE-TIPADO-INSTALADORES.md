# Ejemplo End-to-End: Feature de Instaladores Tipado

Guía práctica de cómo crear un feature completo (feature de Instaladores) siguiendo el patrón de tipado profesional establecido en EcoFlow.

## Paso 1: Verifica que el schema existe

En `EcoFlow/supabase/migrations/20260514063118_eco_flow_schema_inicial.sql` ya existe:

```sql
CREATE TABLE instaladores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT NOT NULL,
  especialidad TEXT,
  telefono TEXT,
  disponible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Paso 2: Regenera tipos desde Supabase

```bash
cd EcoFlow
npm run db:types
```

Verifica que en `src/types/supabase.types.ts` aparece:

```typescript
instaladores: {
  Row: {
    id: string
    user_id: string | null
    nombre: string
    apellido: string
    email: string
    especialidad: string | null
    telefono: string | null
    disponible: boolean
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    user_id?: string | null
    nombre: string
    apellido: string
    email: string
    especialidad?: string | null
    telefono?: string | null
    disponible?: boolean
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    user_id?: string | null
    nombre?: string
    apellido?: string
    email?: string
    especialidad?: string | null
    telefono?: string | null
    disponible?: boolean
    created_at?: string
    updated_at?: string
  }
}
```

## Paso 3: Crea tipos de dominio

`src/features/instaladores/types/installer.types.ts`:

```typescript
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database.types'

/**
 * Tipo de dominio para un instalador desde la BD.
 * Hereda todas las propiedades de Tables<'instaladores'>.
 */
export type Installer = Tables<'instaladores'>

/**
 * Tipo para crear un nuevo instalador.
 * Requires: nombre, apellido, email
 * Optional: especialidad, telefono, disponible
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
```

## Paso 4: Crea el servicio

`src/features/instaladores/services/instaladoresService.ts`:

```typescript
import { supabase } from '@/lib/supabase/client'
import type { Installer, CreateInstallerInput, UpdateInstallerInput } from '../types/installer.types'

/**
 * Obtiene todos los instaladores disponibles ordenados alfabéticamente.
 *
 * @returns Array de Installers
 * @throws Error si falla la query
 */
export async function getAvailableInstallers(): Promise<Installer[]> {
  const { data, error } = await supabase
    .from('instaladores')
    .select('*')
    .eq('disponible', true)
    .order('nombre', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch available installers: ${error.message}`)
  }

  return data ?? []
}

/**
 * Obtiene un instalador por ID.
 *
 * @param installerId - UUID del instalador
 * @returns Installer o null si no existe
 */
export async function getInstallerById(installerId: string): Promise<Installer | null> {
  const { data, error } = await supabase
    .from('instaladores')
    .select('*')
    .eq('id', installerId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to fetch installer: ${error.message}`)
  }

  return data
}

/**
 * Crea un nuevo instalador.
 *
 * @param input - Datos del instalador (nombre, apellido, email requeridos)
 * @returns Installer creado
 *
 * @example
 * const newInstaller = await createInstaller({
 *   nombre: 'Juan',
 *   apellido: 'García',
 *   email: 'juan@example.com',
 *   especialidad: 'Paneles solares',
 *   disponible: true,
 * })
 */
export async function createInstaller(input: CreateInstallerInput): Promise<Installer> {
  const { data, error } = await supabase
    .from('instaladores')
    .insert(input)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create installer: ${error.message}`)
  }

  return data
}

/**
 * Actualiza un instalador existente.
 *
 * @param installerId - UUID del instalador
 * @param updates - Campos a actualizar (todos opcionales)
 * @returns Installer actualizado
 */
export async function updateInstaller(
  installerId: string,
  updates: UpdateInstallerInput
): Promise<Installer> {
  const { data, error } = await supabase
    .from('instaladores')
    .update(updates)
    .eq('id', installerId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update installer: ${error.message}`)
  }

  return data
}

/**
 * Cambia la disponibilidad de un instalador.
 *
 * @param installerId - UUID del instalador
 * @param disponible - true si disponible, false si no
 * @returns Installer actualizado
 */
export async function updateInstallerAvailability(
  installerId: string,
  disponible: boolean
): Promise<Installer> {
  return updateInstaller(installerId, { disponible })
}

/**
 * Obtiene instaladores filtrados por especialidad.
 *
 * @param especialidad - Especialidad a filtrar
 * @returns Array de Installers con esa especialidad
 */
export async function getInstallersBySpecialty(especialidad: string): Promise<Installer[]> {
  const { data, error } = await supabase
    .from('instaladores')
    .select('*')
    .eq('especialidad', especialidad)
    .eq('disponible', true)
    .order('nombre')

  if (error) {
    throw new Error(`Failed to fetch installers by specialty: ${error.message}`)
  }

  return data ?? []
}

/**
 * Elimina un instalador (lógico — marca disponible como false).
 *
 * @param installerId - UUID del instalador
 * @returns Installer desactivado
 */
export async function deactivateInstaller(installerId: string): Promise<Installer> {
  return updateInstaller(installerId, { disponible: false })
}
```

## Paso 5: Crea hooks tipados

`src/features/instaladores/hooks/useInstallers.ts`:

```typescript
import { useQuery } from '@tanstack/react-query'
import type { Installer } from '../types/installer.types'
import { getAvailableInstallers } from '../services/instaladoresService'

/**
 * Hook para obtener todos los instaladores disponibles.
 *
 * @returns Query result con array de Installers
 *
 * @example
 * function InstallerList() {
 *   const { data: installers, isLoading, error } = useInstallers()
 *   // ...
 * }
 */
export function useInstallers() {
  return useQuery<Installer[]>({
    queryKey: ['instaladores', 'available'],
    queryFn: getAvailableInstallers,
    staleTime: 60 * 1000, // 1 minuto
  })
}
```

`src/features/instaladores/hooks/useInstallerById.ts`:

```typescript
import { useQuery } from '@tanstack/react-query'
import type { Installer } from '../types/installer.types'
import { getInstallerById } from '../services/instaladoresService'

/**
 * Hook para obtener un instalador por ID.
 *
 * @param installerId - UUID del instalador (undefined para deshabilitar query)
 * @returns Query result con Installer o null
 */
export function useInstallerById(installerId?: string) {
  return useQuery<Installer | null>({
    queryKey: ['instaladores', installerId],
    queryFn: () => getInstallerById(installerId!),
    enabled: !!installerId,
    staleTime: 60 * 1000,
  })
}
```

`src/features/instaladores/hooks/useUpdateInstaller.ts`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Installer, UpdateInstallerInput } from '../types/installer.types'
import { updateInstaller } from '../services/instaladoresService'

/**
 * Hook para actualizar un instalador.
 *
 * @returns Mutation para actualizar instalador
 *
 * @example
 * function InstallerForm() {
 *   const { mutate, isPending } = useUpdateInstaller()
 *
 *   const handleSubmit = (data) => {
 *     mutate({
 *       id: installerId,
 *       updates: data,
 *     })
 *   }
 * }
 */
export function useUpdateInstaller() {
  const queryClient = useQueryClient()

  return useMutation<
    Installer, // return type
    Error, // error type
    { id: string; updates: UpdateInstallerInput } // variables
  >({
    mutationFn: async ({ id, updates }) => updateInstaller(id, updates),
    onSuccess: (data) => {
      // Actualizar caché
      queryClient.setQueryData(['instaladores', data.id], data)
      // Invalidar listado
      queryClient.invalidateQueries({ queryKey: ['instaladores'] })
    },
  })
}
```

## Paso 6: Crea componente tipado

`src/features/instaladores/components/InstallerCard.tsx`:

```typescript
import type { Installer } from '../types/installer.types'

interface InstallerCardProps {
  installer: Installer // Completamente tipado
  onSelect?: (installer: Installer) => void
  showAvailability?: boolean
}

export function InstallerCard({
  installer,
  onSelect,
  showAvailability = true,
}: InstallerCardProps) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-bold">
        {installer.nombre} {installer.apellido}
      </h3>

      <p className="text-sm text-gray-600">{installer.email}</p>

      {installer.especialidad && (
        <p className="text-sm">
          <strong>Especialidad:</strong> {installer.especialidad}
        </p>
      )}

      {showAvailability && (
        <p className="text-sm">
          Estado:{' '}
          <span className={installer.disponible ? 'text-green-600' : 'text-red-600'}>
            {installer.disponible ? 'Disponible' : 'No disponible'}
          </span>
        </p>
      )}

      {onSelect && (
        <button
          onClick={() => onSelect(installer)}
          className="mt-3 px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Seleccionar
        </button>
      )}
    </div>
  )
}
```

`src/features/instaladores/components/InstallerList.tsx`:

```typescript
import { useInstallers } from '../hooks/useInstallers'
import { InstallerCard } from './InstallerCard'
import type { Installer } from '../types/installer.types'

interface InstallerListProps {
  onSelectInstaller?: (installer: Installer) => void
}

export function InstallerList({ onSelectInstaller }: InstallerListProps) {
  const { data: installers, isLoading, error } = useInstallers()

  if (isLoading) return <div>Cargando instaladores...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!installers?.length) return <div>No hay instaladores disponibles</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {installers.map((installer) => (
        <InstallerCard
          key={installer.id}
          installer={installer}
          onSelect={onSelectInstaller}
          showAvailability
        />
      ))}
    </div>
  )
}
```

## Paso 7: Usa en una página

`src/pages/InstallersPage.tsx`:

```typescript
import { useState } from 'react'
import { InstallerList } from '@/features/instaladores/components/InstallerList'
import type { Installer } from '@/features/instaladores/types/installer.types'

export default function InstallersPage() {
  const [selected, setSelected] = useState<Installer | null>(null)

  return (
    <div className="p-8">
      <h1>Gestión de Instaladores</h1>

      <InstallerList onSelectInstaller={setSelected} />

      {selected && (
        <div className="mt-8 p-4 bg-blue-50 rounded">
          <h2>Instalador seleccionado</h2>
          <p>
            <strong>{selected.nombre} {selected.apellido}</strong>
          </p>
          <p>{selected.email}</p>
          {selected.especialidad && <p>Especialidad: {selected.especialidad}</p>}
        </div>
      )}
    </div>
  )
}
```

## Paso 8: Valida tipos

```bash
cd EcoFlow
npx tsc --noEmit
```

**Resultado esperado:** Compila sin errores ✅

## Checklist

- [x] Schema existe en migraciones.
- [x] `npm run db:types` regenera tipos desde Supabase.
- [x] Tipos de dominio en `installer.types.ts`.
- [x] Servicio con funciones tipadas en `instaladoresService.ts`.
- [x] Hooks con React Query tipados.
- [x] Componentes que usan tipos del dominio.
- [x] Página integra el feature.
- [x] TypeScript compila sin errores.

## Flujo de cambios

Si en el futuro se agrega una columna a `instaladores`:

1. Actualiza schema en Supabase.
2. Ejecuta `npm run db:types`.
3. TypeScript automáticamente te notificará si cambios en servicios/componentes.
4. **Todos los tipos están sincronizados.**

## Referencias

- [Guía completa: TIPADO-SUPABASE-TYPESCRIPT.md](TIPADO-SUPABASE-TYPESCRIPT.md)
- [Referencia rápida: REFERENCIA-RAPIDA-TIPADO.md](REFERENCIA-RAPIDA-TIPADO.md)
- [Feature-Sliced Design](ARQUITECTURA-GENERAL-md)
