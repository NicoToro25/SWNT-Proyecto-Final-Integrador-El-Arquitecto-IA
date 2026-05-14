# Onboarding — EcoFlow para Nuevos Desarrolladores

Bienvenido a EcoFlow. Este documento te guía en tu **primer día**.

## 🎯 Tu meta hoy

Entender cómo crear un feature completamente tipado de EcoFlow en 2-3 horas.

## ⏱️ Agenda del Día 1

```
09:00 - 09:30  Setup y comandos básicos (30 min)
09:30 - 10:30  Tipado TypeScript + Supabase (60 min)
10:30 - 12:00  Tu primer feature (90 min)
12:00 - 12:30  Preguntas + debugging (30 min)
```

## 🔧 Paso 0: Setup (5 minutos)

```bash
# Clonar y entrar al directorio
git clone <repo>
cd /workspaces/SWNT-Proyecto-Final-Integrador-El-Arquitecto-IA/EcoFlow

# Instalar dependencias (si no están)
npm install

# Generar tipos desde Supabase
npm run db:types

# Verificar que compila
npx tsc --noEmit  # Debe retornar Exit Code: 0 ✅

# Ejecutar app (opcional para ver que funciona)
npm run dev  # Abre en http://localhost:5173
```

## 📚 Hora 1: Tipado TypeScript + Supabase (09:30 - 10:30)

### Lectura recomendada (20 minutos)

1. **[REFERENCIA-RAPIDA-TIPADO.md](../docs/REFERENCIA-RAPIDA-TIPADO.md)** (10 min)
   - Lee: "Generar tipos" hasta "Verificar tipos"
   - Entiende: `Tables<'tabla'>`, `TablesInsert`, `TablesUpdate`

2. **[MEJORES-PRACTICAS-TIPADO.md](../docs/MEJORES-PRACTICAS-TIPADO.md)** (10 min)
   - Lee: "Principio 2: Jerarquía de confianza" (DB es más importante que tipos)
   - Lee: "Principio 3: Capas de tipado" (cómo se organizan los tipos)

### Ejercicio práctico (40 minutos)

**Entender cómo se usan tipos en EcoFlow:**

1. Abre `EcoFlow/src/features/projects/services/projectsService.ts`
   - Nota cómo **cada función retorna tipos explícitos**
   - Nota: `Tables<'proyectos'>`, `TablesInsert<'proyectos'>`, `Enums<'estado_proyecto'>`

2. Abre `EcoFlow/src/types/database.types.ts`
   - Estos son los helpers que importan

3. Abre `EcoFlow/src/features/projects/hooks/useProjects.ts`
   - Nota cómo el hook usa `useQuery<Tables<'proyectos'>[]>`
   - El tipo se infiere del servicio automáticamente

4. Corre `npx tsc --noEmit`
   - Entiende que TypeScript valida TODO antes de ejecutar
   - Sin errores = código seguro en tipos

**Resumen de la hora:**
- Sabes qué es `Tables<'tabla'>`
- Sabes que tipos vienen de Supabase automáticamente
- Sabes que servicios retornan tipos explícitos
- Sabes que hooks usan React Query tipado

---

## 🚀 Hora 2-3: Tu Primer Feature (10:30 - 12:30)

### Objetivo: Crear feature de "Categorías de Materiales" completamente tipado

### Paso 1: Verifica que tabla existe (5 minutos)

En `EcoFlow/supabase/migrations/20260514063118_eco_flow_schema_inicial.sql` busca:

```sql
CREATE TABLE categorias_materiales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

✅ Existe, perfecto.

### Paso 2: Regenera tipos (2 minutos)

```bash
npm run db:types
```

Verifica que en `src/types/supabase.types.ts` aparece `categorias_materiales` con sus tipos.

### Paso 3: Crea tipos de dominio (10 minutos)

Crea `src/features/categorias/types/categoria.types.ts`:

```typescript
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database.types'

export type Categoria = Tables<'categorias_materiales'>
export type CreateCategoriaInput = TablesInsert<'categorias_materiales'>
export type UpdateCategoriaInput = TablesUpdate<'categorias_materiales'>
```

✅ Compilar: `npx tsc --noEmit`

### Paso 4: Crea servicio (15 minutos)

Crea `src/features/categorias/services/categoriasService.ts`:

```typescript
import { supabase } from '@/lib/supabase/client'
import type { Categoria, CreateCategoriaInput } from '../types/categoria.types'

export async function getCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from('categorias_materiales')
    .select('*')
    .order('nombre')

  if (error) throw error
  return data ?? []
}

export async function createCategoria(input: CreateCategoriaInput): Promise<Categoria> {
  const { data, error } = await supabase
    .from('categorias_materiales')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data
}
```

✅ Compilar: `npx tsc --noEmit`

### Paso 5: Crea hook (10 minutos)

Crea `src/features/categorias/hooks/useCategorias.ts`:

```typescript
import { useQuery } from '@tanstack/react-query'
import type { Categoria } from '../types/categoria.types'
import { getCategorias } from '../services/categoriasService'

export function useCategorias() {
  return useQuery<Categoria[]>({
    queryKey: ['categorias'],
    queryFn: getCategorias,
  })
}
```

✅ Compilar: `npx tsc --noEmit`

### Paso 6: Crea componente (15 minutos)

Crea `src/features/categorias/components/CategoriaList.tsx`:

```typescript
import { useCategorias } from '../hooks/useCategorias'
import type { Categoria } from '../types/categoria.types'

interface CategoriaListProps {
  onSelect?: (cat: Categoria) => void
}

export function CategoriaList({ onSelect }: CategoriaListProps) {
  const { data: categorias, isLoading } = useCategorias()

  if (isLoading) return <div>Cargando categorías...</div>
  if (!categorias?.length) return <div>No hay categorías</div>

  return (
    <ul className="list-item">
      {categorias.map((cat) => (
        <li key={cat.id} onClick={() => onSelect?.(cat)}>
          <strong>{cat.nombre}</strong>
          {cat.descripcion && <p>{cat.descripcion}</p>}
        </li>
      ))}
    </ul>
  )
}
```

✅ Compilar: `npx tsc --noEmit`

### Paso 7: Integra en página (10 minutos)

En `src/pages/` crea `CategoriesPage.tsx`:

```typescript
import { CategoriaList } from '@/features/categorias/components/CategoriaList'

export default function CategoriesPage() {
  return (
    <div className="p-8">
      <h1>Categorías de Materiales</h1>
      <CategoriaList />
    </div>
  )
}
```

### Paso 8: Valida (2 minutos)

```bash
npx tsc --noEmit  # Debe retornar EXIT CODE: 0 ✅
```

**Listo.** Acabas de crear un feature completamente tipado.

---

## ✅ Checklist Hora 2-3

- [ ] Creaste `src/features/categorias/types/categoria.types.ts`
- [ ] Creaste `src/features/categorias/services/categoriasService.ts`
- [ ] Creaste `src/features/categorias/hooks/useCategorias.ts`
- [ ] Creaste `src/features/categorias/components/CategoriaList.tsx`
- [ ] Creaste `src/pages/CategoriesPage.tsx`
- [ ] `npx tsc --noEmit` retorna EXIT CODE: 0 ✅

**Si completaste todo:** ¡Felicidades! Ya sabes cómo crear features en EcoFlow.

---

## ❓ Preguntas Frecuentes (Día 1)

### "¿Por qué todo está tan tipado?"
Por seguridad. Los tipos previenen bugs en compilación, no en runtime.

### "¿Qué pasa si cambio el schema en Supabase?"
1. Ejecutas `npm run db:types`
2. TypeScript te avisa de errores automáticamente
3. Arreglas los tipos
4. ✅ Todo sincronizado

### "¿Cómo hago insert con validación?"
Con Zod. Ver [REFERENCIA-RAPIDA-TIPADO.md](../docs/REFERENCIA-RAPIDA-TIPADO.md#evitar-any).

### "¿Qué es `Tables<'tabla'>`?"
Es un helper que accede a `Database['public']['Tables']['tabla']['Row']` de forma corta.

### "¿Necesito hacer RLS en la DB?"
Sí, la DB es más importante que los tipos. RLS es tu barrera real.

---

## 📖 Próximas Lecturas (Después del Día 1)

### Si quieres profundizar
- [TIPADO-SUPABASE-TYPESCRIPT.md](../docs/TIPADO-SUPABASE-TYPESCRIPT.md) — Guía completa (45 min)

### Si tienes dudas
- [MEJORES-PRACTICAS-TIPADO.md](../docs/MEJORES-PRACTICAS-TIPADO.md) — Principios (25 min)

### Si necesitas referencia rápida
- [REFERENCIA-RAPIDA-TIPADO.md](../docs/REFERENCIA-RAPIDA-TIPADO.md) — Cheat sheet (5 min)

### Si quieres más ejemplos
- [EJEMPLO-FEATURE-TIPADO-INSTALADORES.md](../docs/EJEMPLO-FEATURE-TIPADO-INSTALADORES.md) — Feature real (45 min)

---

## 🤔 Dudas Después del Día 1

Si tienes dudas después de completar esto, consulta:

1. **¿Cómo hago X?** → [INDICE-DOCUMENTACION.md](../docs/INDICE-DOCUMENTACION.md#-búsqueda-por-tema)
2. **¿Cuál es el patrón?** → [REFERENCIA-RAPIDA-TIPADO.md](../docs/REFERENCIA-RAPIDA-TIPADO.md)
3. **¿Por qué se hace así?** → [MEJORES-PRACTICAS-TIPADO.md](../docs/MEJORES-PRACTICAS-TIPADO.md)
4. **¿Quiero verlo en código?** → [EJEMPLO-FEATURE-TIPADO-INSTALADORES.md](../docs/EJEMPLO-FEATURE-TIPADO-INSTALADORES.md)

---

## 📞 Soporte

- Preguntas técnicas: Consulta la documentación en `docs/`
- Errores de compilación: Lee el mensaje de error, identifica la línea, aplica patrón de REFERENCIA-RAPIDA
- Bloqueos: Ver INDICE-DOCUMENTACION.md#-escenarios-comunes

---

## 🎓 Después de una semana

Si sigues desarrollando en EcoFlow:

- Crear features en ~20 minutos (sin pensar)
- Refactorizar sin miedo (TypeScript avisa)
- Entender cualquier código del codebase (es todo tipado)
- Enseñar a otros cómo hacerlo

---

**¡Bienvenido a EcoFlow! 🚀**

Cualquier pregunta, consulta la documentación en `docs/`. Está muy completa.
