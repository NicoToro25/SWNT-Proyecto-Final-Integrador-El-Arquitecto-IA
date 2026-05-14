# Tipado con Supabase y TypeScript en EcoFlow

Guía completa sobre cómo generar, mantener y usar tipos TypeScript desde Supabase, con integración en React y automatización.

## 1. Generar tipos desde Supabase

### 1.1 Comando básico

```bash
npx supabase gen types typescript --linked > src/types/supabase.types.ts
```

**Explicación:**
- `supabase gen types typescript`: Conecta con el proyecto Supabase y extrae el esquema.
- `--linked`: Usa las credenciales del proyecto Supabase vinculado (requiere `supabase login`).
- `> src/types/supabase.types.ts`: Redirige el output a un archivo.

### 1.2 Estructura del archivo generado

El archivo `supabase.types.ts` contiene:

- **`Json`**: Tipo para valores JSON.
- **`Database`**: Tipo raíz con todos los esquemas (public, graphql_public, etc.).
- **Para cada tabla, tres tipos:**
  - **`Row`**: El tipo completo de una fila leída desde la DB.
  - **`Insert`**: El tipo requerido para insertar (columns sin defaults son obligatorios).
  - **`Update`**: El tipo para actualizar (todas las columns son opcionales).

**Ejemplo real de EcoFlow (proyectos):**

```typescript
export type Database = {
  public: {
    Tables: {
      proyectos: {
        Row: {
          id: string
          nombre: string
          codigo_proyecto: string
          estado: Database["public"]["Enums"]["estado_proyecto"]
          cliente_id: string
          created_at: string
          updated_at: string
          // ... más columns
        }
        Insert: {
          id?: string  // UUID, opcional (generado)
          nombre: string  // obligatorio
          codigo_proyecto?: string  // opcional (trigger lo genera)
          estado?: Database["public"]["Enums"]["estado_proyecto"]
          cliente_id: string  // obligatorio (FK)
          created_at?: string  // opcional (NOW())
          updated_at?: string  // opcional (NOW())
          // ... más columns
        }
        Update: {
          id?: string
          nombre?: string
          codigo_proyecto?: string
          estado?: Database["public"]["Enums"]["estado_proyecto"]
          // ... todas opcionales
        }
      }
    },
    Enums: {
      estado_proyecto: "pendiente" | "en_progreso" | "completado" | "cancelado" | "en_revision"
    }
  }
}
```

## 2. Helpers de tipos reutilizables

### 2.1 Capa de tipos de dominio

En `src/types/database.types.ts`:

```typescript
import type { Database as GeneratedDatabase } from './supabase.types'

// Re-export del tipo generado
export type Database = GeneratedDatabase

// Helpers para acceder a tipos de tabla
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
```

### 2.2 Uso de helpers

En lugar de escribir tipos larguísimos:

```typescript
// ❌ Evita esto
type Proyecto = Database['public']['Tables']['proyectos']['Row']

// ✅ Haz esto
type Proyecto = Tables<'proyectos'>
type NuevoProyecto = TablesInsert<'proyectos'>
type ActualizarProyecto = TablesUpdate<'proyectos'>
type EstadoProyecto = Enums<'estado_proyecto'>
```

## 3. Automatizar la generación de tipos

### 3.1 Agregar script en package.json

```json
{
  "scripts": {
    "db:types": "supabase gen types typescript --linked > src/types/supabase.types.ts",
    "db:types:watch": "nodemon --exec npm run db:types --watch supabase/migrations"
  }
}
```

### 3.2 Git hooks automáticos

Crea `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run db:types
git add src/types/supabase.types.ts
```

Instala husky:

```bash
npm install -D husky
npx husky install
chmod +x .husky/pre-commit
```

### 3.3 Integración con CI/CD (GitHub Actions)

Crea `.github/workflows/sync-types.yml`:

```yaml
name: Sync Supabase Types

on:
  push:
    branches:
      - main
    paths:
      - "supabase/migrations/**"
  workflow_dispatch:

jobs:
  sync-types:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: "20"

      - name: Install dependencies
        run: npm ci

      - name: Generate types
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
        run: npm run db:types

      - name: Commit and push types if changed
        run: |
          if [[ `git status src/types/supabase.types.ts --porcelain` ]]; then
            git config user.name "Supabase Types Bot"
            git config user.email "bot@example.com"
            git add src/types/supabase.types.ts
            git commit -m "chore: sync Supabase types"
            git push
          fi
```

## 4. Usar tipos en queries

### 4.1 Query simple (SELECT)

```typescript
// src/features/projects/services/projectsService.ts
import { supabase } from '@/lib/supabase/client'
import type { Tables } from '@/types/database.types'

// Tipo inferido explícitamente
export async function getProjects(): Promise<Tables<'proyectos'>[]> {
  const { data, error } = await supabase
    .from('proyectos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch projects: ${error.message}`)
  }

  // data ya está tipado como Tables<'proyectos'>[] automáticamente
  return data ?? []
}

// Por ID
export async function getProjectById(id: string): Promise<Tables<'proyectos'> | null> {
  const { data, error } = await supabase
    .from('proyectos')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

// Query con filtros tipados
interface GetProjectsFilters {
  estado?: Tables<'proyectos'>['estado']
  cliente_id?: string
}

export async function getProjectsFiltered(
  filters: GetProjectsFilters
): Promise<Tables<'proyectos'>[]> {
  let query = supabase.from('proyectos').select('*')

  if (filters.estado) {
    query = query.eq('estado', filters.estado)
  }
  if (filters.cliente_id) {
    query = query.eq('cliente_id', filters.cliente_id)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data ?? []
}
```

### 4.2 Query con joins tipados

```typescript
// Retorna tipo anónimo tipado para la composición
export async function getProjectsWithClientInfo() {
  const { data, error } = await supabase
    .from('proyectos')
    .select(`
      id,
      nombre,
      estado,
      clientes (
        id,
        nombre,
        email
      )
    `)

  if (error) {
    throw error
  }

  // Tipos inline para avoid verbosity
  type ProjectWithClient = Tables<'proyectos'> & {
    clientes: Tables<'clientes'>
  }

  return data as ProjectWithClient[]
}
```

## 5. Usar tipos en inserts

### 5.1 Insert simple

```typescript
export async function createProject(
  input: TablesInsert<'proyectos'>
): Promise<Tables<'proyectos'>> {
  const { data, error } = await supabase
    .from('proyectos')
    .insert(input)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`)
  }

  return data
}

// Uso con validación Zod
import { z } from 'zod'

const CreateProjectSchema = z.object({
  nombre: z.string().min(3),
  cliente_id: z.string().uuid(),
  direccion_instalacion: z.string(),
  ciudad_instalacion: z.string(),
  estado: z.enum(['pendiente', 'en_progreso', 'completado', 'cancelado', 'en_revision']),
})

type CreateProjectInput = z.infer<typeof CreateProjectSchema>

export async function createProjectFromForm(
  formData: CreateProjectInput
): Promise<Tables<'proyectos'>> {
  const validated = CreateProjectSchema.parse(formData)
  return createProject(validated)
}
```

### 5.2 Insert con transformación

```typescript
// Si necesitas llenar campos derivados antes de insertar
export async function createProjectWithDefaults(
  input: Omit<TablesInsert<'proyectos'>, 'created_by'>
): Promise<Tables<'proyectos'>> {
  const user = await getCurrentUser()

  const fullInput: TablesInsert<'proyectos'> = {
    ...input,
    created_by: user.id,
  }

  return createProject(fullInput)
}
```

## 6. Usar tipos en updates

### 6.1 Update simple

```typescript
export async function updateProjectStatus(
  projectId: string,
  newStatus: Enums<'estado_proyecto'>
): Promise<Tables<'proyectos'>> {
  const { data, error } = await supabase
    .from('proyectos')
    .update({ estado: newStatus })
    .eq('id', projectId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

// O permitir actualizaciones parciales completas
export async function updateProject(
  projectId: string,
  updates: TablesUpdate<'proyectos'>
): Promise<Tables<'proyectos'>> {
  const { data, error } = await supabase
    .from('proyectos')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
```

### 6.2 Updates con validación por rol

```typescript
// Solo instaladores pueden actualizar estado
// El RLS lo restringe en DB, aquí lo explicitamos en tipos
export async function updateProjectStatusAsInstaller(
  projectId: string,
  newStatus: Enums<'estado_proyecto'>
): Promise<Tables<'proyectos'>> {
  // Validar que el estado cambio es válido (opcional)
  const validTransitions: Record<Enums<'estado_proyecto'>, Enums<'estado_proyecto'>[]> = {
    'pendiente': ['en_progreso'],
    'en_progreso': ['completado', 'cancelado'],
    'completado': [],
    'cancelado': [],
    'en_revision': ['en_progreso'],
  }

  const project = await getProjectById(projectId)
  if (!project) throw new Error('Project not found')

  const allowed = validTransitions[project.estado]
  if (!allowed.includes(newStatus)) {
    throw new Error(`Cannot transition from ${project.estado} to ${newStatus}`)
  }

  return updateProjectStatus(projectId, newStatus)
}
```

## 7. Buenas prácticas de tipado

### 7.1 Evitar `any` — Usar `unknown` con type guards

```typescript
// ❌ Evita
function processData(data: any) {
  return data.nombre.toUpperCase()
}

// ✅ Haz esto
function processData(data: unknown): string {
  if (
    typeof data === 'object' &&
    data !== null &&
    'nombre' in data &&
    typeof data.nombre === 'string'
  ) {
    return data.nombre.toUpperCase()
  }
  throw new TypeError('Invalid data structure')
}

// O mejor aún, usa Zod
const DataSchema = z.object({
  nombre: z.string(),
})

function processData(data: unknown): string {
  const validated = DataSchema.parse(data)
  return validated.nombre.toUpperCase()
}
```

### 7.2 Helpers para transformar tipos generados

```typescript
// Si el tipo de Supabase es muy verboso, crea un alias de dominio
export type Project = Tables<'proyectos'>
export type NewProject = TablesInsert<'proyectos'>
export type ProjectUpdate = TablesUpdate<'proyectos'>
export type ProjectStatus = Enums<'estado_proyecto'>

// Luego úsalos siempre en tu código
function updateProject(id: string, updates: ProjectUpdate): Promise<Project> {
  // ...
}
```

### 7.3 Tipos derivados de funciones

```typescript
// Infiere el tipo del retorno automáticamente
export const getProjects = async () => {
  const { data } = await supabase.from('proyectos').select('*')
  return data ?? []
}

type ProjectsData = Awaited<ReturnType<typeof getProjects>>
```

### 7.4 Evitar duplicación — Infer de Zod

```typescript
// Define el schema UNA sola vez
const ProjectFilterSchema = z.object({
  estado: z.enum(['pendiente', 'en_progreso', 'completado']).optional(),
  clienteId: z.string().uuid().optional(),
})

// Infiere el tipo automáticamente
type ProjectFilters = z.infer<typeof ProjectFilterSchema>

// Usa en funciones
export function getProjectsFiltered(filters: ProjectFilters) {
  // ...
}
```

## 8. Integración con React

### 8.1 Hook de query tipado

```typescript
// src/features/projects/hooks/useProjects.ts
import { useQuery } from '@tanstack/react-query'
import type { Tables } from '@/types/database.types'
import { getProjects } from '../services/projectsService'

export function useProjects() {
  return useQuery<Tables<'proyectos'>[]>({
    queryKey: ['projects'],
    queryFn: getProjects,
  })
}

// Uso en componentes
function ProjectList() {
  const { data: projects, isLoading, error } = useProjects()

  if (isLoading) return <div>Cargando...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {projects?.map((project) => (
        // project está completamente tipado
        <li key={project.id}>{project.nombre} ({project.estado})</li>
      ))}
    </ul>
  )
}
```

### 8.2 Hook de mutación tipado

```typescript
// src/features/projects/hooks/useUpdateProject.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Tables, TablesUpdate } from '@/types/database.types'
import { updateProject } from '../services/projectsService'

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation<
    Tables<'proyectos'>,  // return type
    Error,               // error type
    { id: string; updates: TablesUpdate<'proyectos'> }  // variables type
  >({
    mutationFn: async ({ id, updates }) => updateProject(id, updates),
    onSuccess: (data) => {
      // data está tipado como Tables<'proyectos'>
      queryClient.setQueryData(['projects', data.id], data)
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

// Uso en formulario
function ProjectForm() {
  const { mutate, isPending } = useUpdateProject()

  const handleSubmit = (formData: Record<string, unknown>) => {
    mutate({
      id: projectId,
      updates: {
        nombre: formData.nombre as string,
        estado: formData.estado as Enums<'estado_proyecto'>,
      },
    })
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### 8.3 Componente tipado con datos de Supabase

```typescript
interface ProjectCardProps {
  project: Tables<'proyectos'>
  onStatusChange: (newStatus: Enums<'estado_proyecto'>) => void
}

export function ProjectCard({ project, onStatusChange }: ProjectCardProps) {
  return (
    <div>
      <h3>{project.nombre}</h3>
      <p>Código: {project.codigo_proyecto}</p>
      <p>Estado: {project.estado}</p>
      <button
        onClick={() => onStatusChange('en_progreso')}
        disabled={project.estado !== 'pendiente'}
      >
        Iniciar
      </button>
    </div>
  )
}
```

## 9. Mantener sincronizados los tipos con la DB

### 9.1 Flujo de sincronización recomendado

1. **Modifica esquema en Supabase** (via Dashboard o migraciones).
2. **Ejecuta** `npm run db:types`.
3. **Los tipos se actualizan automáticamente** en `supabase.types.ts`.
4. **TypeScript te alerta** si cambios en la DB rompieron el código.

**Ejemplo:**
Si agregas una columna NOT NULL a `proyectos`, el tipo `Insert` la hace obligatoria automáticamente. El linter avisará si no la proporciona en `createProject()`.

### 9.2 Pre-commit hook de validación

Crea `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Regenerar tipos si hay cambios en migraciones
if git diff --cached --name-only | grep -q "supabase/migrations"; then
  npm run db:types
  git add src/types/supabase.types.ts
fi

# Compilar TypeScript para validar tipos antes de commit
npx tsc --noEmit

exit $?
```

### 9.3 Monitorear cambios de tipo

Usa un script que compare versiones:

```bash
# Detectar cambios en supabase.types.ts
git diff src/types/supabase.types.ts | head -50
```

### 9.4 Integración con DB local (Supabase CLI)

```bash
# Inicia una BD local
supabase start

# Genera tipos contra la BD local
supabase gen types typescript --local > src/types/supabase.types.ts

# Detén la BD
supabase stop
```

## 10. Flujo end-to-end de un cambio en la DB

### Escenario: Agregar campo `prioridad` a `proyectos`

**Paso 1: Migración en Supabase**

```sql
-- supabase/migrations/20260515000000_add_prioridad_to_proyectos.sql
ALTER TABLE proyectos
ADD COLUMN prioridad INTEGER DEFAULT 3 NOT NULL
CHECK (prioridad BETWEEN 1 AND 5);
```

**Paso 2: Deploy a Supabase**

```bash
supabase db push
```

**Paso 3: Regenerar tipos**

```bash
npm run db:types
```

**Paso 4: TypeScript avisa**

El compilador nota que `prioridad` es ahora obligatorio en `Insert`:

```typescript
// ❌ Error: Property 'prioridad' is missing
createProject({
  nombre: 'Proyecto',
  cliente_id: '...',
})

// ✅ Funciona
createProject({
  nombre: 'Proyecto',
  cliente_id: '...',
  prioridad: 3,
})
```

**Paso 5: Tests fallan gracefully**

Tus tests unitarios fuerzan actualizar datos mock con el nuevo campo.

## 11. Patrones avanzados

### 11.1 Computed types para relaciones N:M

```typescript
// Tipo compuesto para proyectos con instaladores asignados
type ProjectWithInstallers = Tables<'proyectos'> & {
  proyecto_instaladores: Array<
    Tables<'proyecto_instaladores'> & {
      instaladores: Tables<'instaladores'>
    }
  >
}

// Query tipada
export async function getProjectWithInstallers(
  projectId: string
): Promise<ProjectWithInstallers | null> {
  const { data } = await supabase
    .from('proyectos')
    .select(`
      *,
      proyecto_instaladores (
        *,
        instaladores (*)
      )
    `)
    .eq('id', projectId)
    .maybeSingle()

  return data as ProjectWithInstallers | null
}
```

### 11.2 Types en handlers de eventos

```typescript
// Garantiza que el handler respeta la estructura
const handleProjectUpdate: React.ChangeEventHandler<HTMLInputElement> = (e) => {
  const updates: TablesUpdate<'proyectos'> = {
    nombre: e.currentTarget.value,
  }
  // TypeScript valida que updates tiene estructura correcta
}
```

### 11.3 Genéricos reutilizables

```typescript
// Service helper genérico para obtener por ID
async function getById<T extends keyof Database['public']['Tables']>(
  table: T,
  id: string
): Promise<Tables<T> | null> {
  const { data } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .maybeSingle()

  return data as Tables<T> | null
}

// Uso
const project = await getById('proyectos', '123')
// project es Tables<'proyectos'>
```

## 12. Checklist de tipado profesional

- [ ] Se ejecuta `npm run db:types` después de cada cambio de schema.
- [ ] No hay `any` en el código; usa `unknown` con type guards o Zod.
- [ ] Los servicios retornan tipos explícitos (`Tables<'proyectos'>`, etc.).
- [ ] Los hooks de React Query infieres tipos desde servicios.
- [ ] Zod schemas definen validación una sola vez; tipos se infieren.
- [ ] RLS en la DB es la barrera real, tipos son una capa de confianza.
- [ ] `tsconfig.json` tiene `strict: true`.
- [ ] CI/CD regenera y valida tipos en cada push.
