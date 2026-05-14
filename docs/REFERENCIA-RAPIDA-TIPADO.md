# Tipado Supabase — Referencia Rápida

## Generar tipos

```bash
# Desde BD remota (linked)
npm run db:types

# Desde BD local
supabase gen types typescript --local > src/types/supabase.types.ts
```

## Helpers recomendados

En `src/types/database.types.ts`:

```ts
import type { Database as GeneratedDatabase } from './supabase.types'

export type Database = GeneratedDatabase
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
```

## Patrones comunes

### SELECT

```ts
import type { Tables } from '@/types/database.types'

async function getProjects(): Promise<Tables<'proyectos'>[]> {
  const { data } = await supabase.from('proyectos').select('*')
  return data ?? []
}
```

### INSERT

```ts
import type { TablesInsert } from '@/types/database.types'

async function createProject(input: TablesInsert<'proyectos'>): Promise<Tables<'proyectos'>> {
  const { data } = await supabase.from('proyectos').insert(input).select().single()
  return data
}
```

### UPDATE

```ts
import type { TablesUpdate } from '@/types/database.types'

async function updateProject(
  id: string,
  updates: TablesUpdate<'proyectos'>
): Promise<Tables<'proyectos'>> {
  const { data } = await supabase
    .from('proyectos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return data
}
```

### ENUM

```ts
import type { Enums } from '@/types/database.types'

function getStatusLabel(status: Enums<'estado_proyecto'>): string {
  const labels: Record<Enums<'estado_proyecto'>, string> = {
    'pendiente': 'Pendiente',
    'en_progreso': 'En progreso',
    'completado': 'Completado',
    'cancelado': 'Cancelado',
    'en_revision': 'En revisión',
  }
  return labels[status]
}
```

## En React Hooks

### Query

```ts
import { useQuery } from '@tanstack/react-query'
import type { Tables } from '@/types/database.types'

export function useProjects() {
  return useQuery<Tables<'proyectos'>[]>({
    queryKey: ['projects'],
    queryFn: getProjects,
  })
}
```

### Mutation

```ts
import { useMutation } from '@tanstack/react-query'
import type { Tables, TablesInsert } from '@/types/database.types'

export function useCreateProject() {
  return useMutation<Tables<'proyectos'>, Error, TablesInsert<'proyectos'>>({
    mutationFn: createProject,
  })
}
```

## Evitar `any`

### ❌ MAL

```ts
function updateData(data: any) {
  return data.id // pueden tipar mal
}
```

### ✅ BIEN

```ts
function updateData(data: Tables<'proyectos'>) {
  return data.id // totalmente tipado
}
```

### ✅ MEJOR (con validación)

```ts
import { z } from 'zod'

const ProjectSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
})

function updateData(data: unknown) {
  const validated = ProjectSchema.parse(data) // throw si inválido
  return validated.id
}
```

## Automatizar regeneración

### En package.json

```json
{
  "scripts": {
    "db:types": "supabase gen types typescript --linked > src/types/supabase.types.ts",
    "db:types:watch": "nodemon --exec npm run db:types --watch supabase/migrations"
  }
}
```

### Pre-commit hook (.husky/pre-commit)

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

if git diff --cached --name-only | grep -q "supabase/migrations"; then
  npm run db:types
  git add src/types/supabase.types.ts
fi

npx tsc --noEmit
```

## Mantener sincronizados

1. Modifica schema en Supabase.
2. Ejecuta `npm run db:types`.
3. TypeScript compila sin errores → significa DB y código están alineados.
4. Si hay errores → significa que el código depende de columnas que ya no existen.

## Verificar tipos

```bash
# Compilar sin emitir (solo chequear tipos)
npx tsc --noEmit

# En CI/CD
npx tsc --noEmit
```

## Más información

Ver [`docs/TIPADO-SUPABASE-TYPESCRIPT.md`](TIPADO-SUPABASE-TYPESCRIPT.md) para ejemplos completos.
