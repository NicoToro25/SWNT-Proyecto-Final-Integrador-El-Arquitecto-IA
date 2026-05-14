# Mejores Prácticas de Tipado en EcoFlow

Principios y patrones profesionales para mantener un codebase altamente tipado, seguro y mantenible.

## Principio 1: Source of Truth (Fuente Única de Verdad)

### La DB es la fuente única de verdad

```
Supabase Schema
    ↓
npm run db:types (auto-genera supabase.types.ts)
    ↓
database.types.ts (helpers reutilizables)
    ↓
Usados en servicios, hooks, componentes
```

**Nunca** escribas tipos manualmente que reflejen la estructura de la DB.

### Validación es la segunda fuente de verdad

```
Zod Schemas (definen validación)
    ↓
z.infer<T> (tipos derivan automáticamente)
    ↓
Componentes confían en tipos validados
```

**Beneficio:** Si cambias el schema Zod, los tipos cambian automáticamente.

## Principio 2: Jerarquía de Confianza

### Nivel 1: Base de Datos (MÁXIMA CONFIANZA)
- RLS en la DB es tu barrera real.
- TypeScript es solo una capa de seguridad adicional.
- Los datos de la DB nunca pueden ser `any`.

```typescript
// ✅ CORRECTO
async function getProjects(): Promise<Tables<'proyectos'>[]> {
  const { data } = await supabase.from('proyectos').select('*')
  return data ?? []
}
```

### Nivel 2: Frontend validado (CONFIANZA MEDIA)
- Datos que vienen del usuario o de APIs externas DEBEN ser validados con Zod.
- Después de validar, son seguros para usar.

```typescript
// ✅ CORRECTO
async function createInstaller(formData: unknown) {
  const validated = CreateInstallerSchema.parse(formData) // Valida
  return installadoresService.createInstaller(validated)
}
```

### Nivel 3: Frontend sin validar (SIN CONFIANZA)
- Nunca uses datos del usuario sin validar.
- No uses `any`.

```typescript
// ❌ INCORRECTO
async function createInstaller(formData: any) {
  return installadoresService.createInstaller(formData)
}

// ❌ INCORRECTO
async function createInstaller(formData: CreateInstallerInput) {
  // ¿Quién validó que formData cumple CreateInstallerInput?
  // RISgo!
}
```

## Principio 3: Capas de Tipado

### Capa 1: Tipos de Supabase (Auto-generados)

```typescript
// src/types/supabase.types.ts
// AUTO-GENERADO — No edites
export type Database = { /* ... */ }
```

**Responsabilidad:** Reflejar exactamente el schema de Supabase.

### Capa 2: Helpers de tipos (Dominio)

```typescript
// src/types/database.types.ts
// Manual, pero reutilizable
export type Tables<T> = Database['public']['Tables'][T]['Row']
export type Installer = Tables<'instaladores'>
```

**Responsabilidad:** Simplificar acceso a tipos generados.

### Capa 3: Tipos de dominio (Feature-específicos)

```typescript
// src/features/instaladores/types/installer.types.ts
// Manual, contextual para el feature
export type Installer = Tables<'instaladores'> // Hereda del dominio
export type CreateInstallerInput = TablesInsert<'instaladores'>
```

**Responsabilidad:** Semantizar tipos para el contexto del feature.

### Capa 4: Validación en tiempo de ejecución (Zod)

```typescript
// src/features/instaladores/schemas/instalador.schemas.ts
// Manual, pero z.infer los tipos automáticamente
export const CreateInstallerSchema = z.object({
  nombre: z.string().min(2),
  // ...
})
export type CreateInstallerValidated = z.infer<typeof CreateInstallerSchema>
```

**Responsabilidad:** Garantizar que datos del usuario cumplen requisitos.

### Capa 5: Tipos en componentes (React-específicos)

```typescript
// src/features/instaladores/components/InstallerCard.tsx
interface InstallerCardProps {
  installer: Installer // Del dominio
  onSelect?: (selected: Installer) => void
}
```

**Responsabilidad:** Comunicar contrato de props entre componentes.

## Principio 4: Nunca `any`, Siempre `unknown`

### Patrón 1: Type guards

```typescript
// ❌ Evita
function process(data: any) {
  return data.id
}

// ✅ Haz esto
function process(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'id' in data) {
    const id = (data as Record<string, unknown>).id
    if (typeof id === 'string') {
      return id
    }
  }
  throw new TypeError('Invalid data')
}
```

### Patrón 2: Zod para JSON

```typescript
// ✅ Mejor
const DataSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string(),
})

function process(data: unknown): DataSchema {
  return DataSchema.parse(data) // throw si inválido
}
```

### Patrón 3: fetch con validación

```typescript
// ✅ Patrón seguro
async function fetchExternalData(url: string) {
  const response = await fetch(url)
  const json: unknown = await response.json()
  
  // Valida ANTES de usar
  return ExternalDataSchema.parse(json)
}
```

## Principio 5: Automatizar lo que puedas

### Regenerar tipos en pre-commit

```bash
# .husky/pre-commit
if git diff --cached --name-only | grep -q "supabase/migrations"; then
  npm run db:types
  git add src/types/supabase.types.ts
fi
npx tsc --noEmit # Compilar antes de commitear
```

### Integrar en CI/CD

```yaml
# .github/workflows/typecheck.yml
- run: npm run db:types
- run: npx tsc --noEmit
```

### Watch mode en desarrollo

```bash
npm run db:types:watch  # Regenera cuando cambien migraciones
```

## Principio 6: Patrones en servicios

### ✅ CORRECTO: Tipos explícitos

```typescript
export async function getProjects(): Promise<Tables<'proyectos'>[]> {
  const { data, error } = await supabase
    .from('proyectos')
    .select('*')

  if (error) throw error
  return data ?? []
}
```

### ✅ CORRECTO: Con parámetros tipados

```typescript
interface GetProjectsFilters {
  estado?: Enums<'estado_proyecto'>
  clienteId?: string
}

export async function getProjectsFiltered(
  filters: GetProjectsFilters
): Promise<Tables<'proyectos'>[]> {
  let query = supabase.from('proyectos').select('*')
  
  if (filters.estado) {
    query = query.eq('estado', filters.estado)
  }
  
  const { data } = await query
  return data ?? []
}
```

### ❌ INCORRECTO: Sin tipos explícitos

```typescript
export async function getProjects() {
  // ¿Retorna qué?
  const { data } = await supabase.from('proyectos').select('*')
  return data
}
```

## Principio 7: Patrones en React Hooks

### ✅ CORRECTO: Tipos explícitos en useQuery

```typescript
import type { Tables } from '@/types/database.types'

export function useProjects() {
  return useQuery<Tables<'proyectos'>[]>({
    queryKey: ['projects'],
    queryFn: getProjects, // infiere return type de la función
  })
}
```

### ✅ CORRECTO: Tipado completo en useMutation

```typescript
export function useCreateProject() {
  return useMutation<
    Tables<'proyectos'>,           // retorno
    Error,                         // error
    TablesInsert<'proyectos'>      // variables
  >({
    mutationFn: createProject,
    onSuccess: (newProject) => {
      // newProject está completamente tipado
    },
  })
}
```

### ❌ INCORRECTO: Sin tipos explícitos

```typescript
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    // React Query intenta inferir, pero TypeScript duda
  })
}
```

## Principio 8: Patrones en formularios

### ✅ CORRECTO: Validación antes de mutar

```typescript
function InstallerForm() {
  const { mutate } = useCreateInstaller()
  
  const handleSubmit = (formData: unknown) => {
    try {
      const validated = CreateInstallerSchema.parse(formData)
      mutate(validated) // Garantizado que es válido
    } catch (error) {
      // Mostrar errores de validación
    }
  }
}
```

### ✅ CORRECTO: Con react-hook-form + Zod

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function InstallerForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(CreateInstallerSchema),
    mode: 'onChange',
  })

  const onSubmit = (data: CreateInstallerValidated) => {
    // data ya está validado y tipado
    mutate(data)
  }

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>
}
```

## Checklist de Profesionalismo

- [ ] **Sin `any`**: Búsqueda global de `any` retorna 0 resultados.
- [ ] **Tipos generados**: Ejecutas `npm run db:types` después de cambios de schema.
- [ ] **Servicios tipados**: Todos retornan tipos explícitos `Tables<'tabla'>`.
- [ ] **Hooks tipados**: Todos los `useQuery` y `useMutation` tienen tipos genéricos explícitos.
- [ ] **Validación Zod**: Datos del usuario se validan ANTES de usarlos.
- [ ] **RLS en BD**: La BD no confía en tipos, tiene RLS efectivo.
- [ ] **TypeScript strict**: `tsconfig.json` tiene `strict: true`.
- [ ] **Pre-commit hooks**: Se regeneran tipos automáticamente antes de commit.
- [ ] **CI/CD typecheck**: `npx tsc --noEmit` pasa en cada push.

## Referencias

- [Tipado con Supabase y TypeScript](TIPADO-SUPABASE-TYPESCRIPT.md) — Guía completa.
- [Referencia Rápida](REFERENCIA-RAPIDA-TIPADO.md) — Cheat sheet.
- [Ejemplo Feature](EJEMPLO-FEATURE-TIPADO-INSTALADORES.md) — Implementación real.
