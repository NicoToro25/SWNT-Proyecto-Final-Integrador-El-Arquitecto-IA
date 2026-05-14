# Arquitectura del Dashboard — EcoFlow

Diseño profesional del dashboard de proyectos con componentes reutilizables, manejo de estados y flujos de datos.

## 1. Visión General

### Propósito
Mostrar resumen visual de todos los proyectos con filtrado por estado, búsqueda, y acciones rápidas.

### Estados Soportados
- **Pendiente** — Proyecto creado, no iniciado
- **En Progreso** — Instalación en curso
- **Completado** — Proyecto finalizado
- **Cancelado** — Proyecto descartado
- **En Revisión** — Pendiente aprobación final

### Flujo de Datos
```
Supabase (BD)
    ↓ fetch via service
ProjectsService.getProjects()
    ↓ useProjects hook (React Query)
DashboardPage component
    ↓
ProjectsGrid
  ├─ ProjectCard (x N)
  │   ├─ ProjectMeta (nombre, código, fecha)
  │   ├─ ProjectStatus (badge con estado)
  │   └─ ProjectActions (buttons)
  ├─ EmptyState (si no hay proyectos)
  └─ LoadingState (durante fetch)
```

## 2. Arquitectura de Componentes

### Estructura de Carpetas
```
src/features/projects/
├── components/
│   ├── ProjectsGrid.tsx          [Layout principal]
│   ├── ProjectCard.tsx           [Card individual]
│   ├── ProjectCardContent.tsx    [Contenido interno]
│   ├── ProjectStatus.tsx         [Badge de estado]
│   ├── ProjectActions.tsx        [Botones de acción]
│   ├── ProjectFilters.tsx        [Barra de filtrado]
│   └── ProjectsSkeleton.tsx      [Loading state]
├── hooks/
│   ├── useProjects.ts            [Query lista de proyectos]
│   ├── useProjectsFiltered.ts    [Query con filtros]
│   └── useProjectActions.ts      [Mutations CRUD]
├── services/
│   └── projectsService.ts        [API calls tipadas]
├── types/
│   └── project.types.ts          [Tipos de dominio]
└── utils/
    ├── projectFilters.ts         [Lógica de filtrado]
    └── projectFormatters.ts      [Formatos para display]
```

### Jerarquía de Componentes

```
DashboardPage (página)
  │
  ├─ ProjectFilters (filtrado)
  │   ├─ SearchInput
  │   ├─ StatusFilter (dropdown)
  │   └─ ClearButton
  │
  ├─ ProjectsSkeleton (loading)
  │   └─ ProjectCardSkeleton (x3)
  │
  ├─ ProjectsGrid (grid principal)
  │   ├─ ProjectCard (x N)
  │   │   ├─ ProjectCardContent
  │   │   │   ├─ ProjectMeta
  │   │   │   ├─ ProjectStatus
  │   │   │   └─ ProjectActions
  │   │   └─ [Click → ProjectDetailPage]
  │   │
  │   ├─ EmptyState (si no hay datos)
  │   └─ ErrorState (si hay error)
  │
  └─ Pagination (si hay muchos)
```

### Responsabilidades por Componente

#### **DashboardPage.tsx** (Página)
- ✅ Orquesta todo el dashboard
- ✅ Maneja filtros globales
- ✅ Muestra loading/error/empty
- ✅ Routing a detalles

#### **ProjectFilters.tsx** (Filtros)
- ✅ Input de búsqueda
- ✅ Dropdown de estado
- ✅ Button de limpiar filtros
- ✅ Callback para actualizar filtros

#### **ProjectsGrid.tsx** (Grid)
- ✅ Layout responsivo (mobile/tablet/desktop)
- ✅ Itera sobre proyectos
- ✅ Renderiza ProjectCard
- ✅ Renderiza EmptyState si aplica

#### **ProjectCard.tsx** (Card)
- ✅ Container principal de cada proyecto
- ✅ Hover effects
- ✅ Click para ir a detalles
- ✅ Pasa props a contenido

#### **ProjectCardContent.tsx** (Contenido)
- ✅ Renderiza ProjectMeta, Status, Actions
- ✅ Sin lógica, puro presentación
- ✅ Totalmente controlado por props

#### **ProjectStatus.tsx** (Badge de estado)
- ✅ Muestra estado visual (color + texto)
- ✅ Mapeo estado → color
- ✅ Reutilizable en cualquier contexto

#### **ProjectActions.tsx** (Botones)
- ✅ Edit, View, Delete buttons
- ✅ Callbacks para acciones
- ✅ Loading states en buttons

#### **ProjectsSkeleton.tsx** (Loading)
- ✅ Shimmer loading (fallback hermoso)
- ✅ Mismo layout que grid real
- ✅ UX profesional

## 3. Manejo de Estados

### Estados Globales (React Query)
```typescript
// En useProjects hook
const { 
  data: proyectos,           // Array<Proyecto>
  isLoading,                 // boolean
  isError,
  error,
  isFetching,                // diferente de isLoading
  refetch,
} = useQuery(...)
```

### Estados Locales (useState)
```typescript
// En DashboardPage
const [filters, setFilters] = useState<ProjectFilters>({
  estado: undefined,
  search: '',
})

const [selectedProject, setSelectedProject] = useState<Proyecto | null>(null)
```

### Flujo de Estados
```
1. isLoading = true        → Renderiza Skeleton
2. isError = true          → Renderiza ErrorBoundary
3. data.length === 0       → Renderiza EmptyState
4. data.length > 0         → Renderiza Grid con ProjectCards
5. isFetching = true       → Muestra refresh indicator
```

## 4. Validación de Datos

### Tipos Entrada (Props)
```typescript
// ProjectCard.tsx
interface ProjectCardProps {
  proyecto: Tables<'proyectos'>  // Tipado desde Supabase
  onSelect: (id: string) => void
  isSelecting?: boolean
}
```

### Tipos Salida (Hooks)
```typescript
// useProjects.ts
function useProjects(): UseQueryResult<Proyecto[], Error> {
  return useQuery<Proyecto[]>({
    queryKey: ['projects'],
    queryFn: getProjects,
  })
}
```

## 5. Estrategia de Carga

### Lazy Loading
```typescript
// Al hacer scroll cerca del final
const { fetchNextPage, hasNextPage } = useInfiniteQuery(...)

// En componente observamos el último elemento
const lastElement = useRef<HTMLDivElement>(null)
const observer = useIntersectionObserver(lastElement, {
  onVisible: () => fetchNextPage()
})
```

### Precarga (Prefetch)
```typescript
// Al hover en ProjectCard, precarga detalles
const queryClient = useQueryClient()

const handleHover = (projectId: string) => {
  queryClient.prefetchQuery({
    queryKey: ['projects', projectId],
    queryFn: () => getProjectById(projectId),
  })
}
```

## 6. Buenas Prácticas Implementadas

### 1. Separation of Concerns
```
- Components: Solo presentación
- Hooks: Lógica de datos y efectos
- Services: API calls
- Utils: Funciones puras reutilizables
```

### 2. DRY (Don't Repeat Yourself)
```typescript
// En ProjectStatus, mapeo estado → color es reusable
const statusColorMap = {
  'pendiente': 'bg-yellow-100 text-yellow-800',
  'en_progreso': 'bg-blue-100 text-blue-800',
  'completado': 'bg-green-100 text-green-800',
} // Usado en Card, Badge, Filters, etc.
```

### 3. Responsividad
```typescript
// Tailwind: mobile first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Automáticamente adapta de 1 a 3 columnas */}
</div>
```

### 4. Accesibilidad
```typescript
// Cada ProjectCard es navegable por teclado
<button
  onClick={() => onSelect(proyecto.id)}
  aria-label={`Ver proyecto ${proyecto.nombre}`}
  className="focus:ring-2 focus:ring-blue-500"
>
  {/* ... */}
</button>
```

### 5. Performance
- **Memoization:** `React.memo(ProjectCard)` para evitar re-renders
- **Code splitting:** Lazy load ProjectDetailPage en Router
- **Virtual scrolling:** Si hay 1000+ proyectos, usar react-window

## 7. Manejo de Errores

### Niveles de Error

#### 1. **Query Error** (nivel Hook)
```typescript
if (isError) {
  return <ErrorBoundary error={error} onRetry={refetch} />
}
```

#### 2. **Servidor Error** (nivel Service)
```typescript
if (response.status === 403) {
  throw new ForbiddenError('No tienes permiso')
}
```

#### 3. **Validación Error** (nivel Component)
```typescript
if (!proyecto || !proyecto.nombre) {
  return <ErrorBoundary error="Datos inválidos" />
}
```

## 8. Diagrama de Renderizado

```
┌─ DashboardPage
│  ├─ useProjects() → { isLoading, isError, data }
│  │
│  ├─ IF isLoading
│  │  └─ ProjectsSkeleton
│  │
│  ├─ ELSE IF isError
│  │  └─ ErrorBoundary
│  │
│  ├─ ELSE IF data.length === 0
│  │  └─ EmptyState
│  │
│  ├─ ELSE
│  │  ├─ ProjectFilters
│  │  │   └─ setFilters() → refetch with filters
│  │  │
│  │  └─ ProjectsGrid
│  │     └─ data.map(proyecto => 
│  │        <ProjectCard
│  │          proyecto={proyecto}
│  │          onSelect={handleSelectProject}
│  │        />
│  │      )
│  │
│  └─ Pagination (si aplica)
│
└─ [Click on card] → Navigate to ProjectDetailPage
```

## 9. Consideraciones de Performance

### Re-renders Evitados
```typescript
// ❌ Sin memo: ProjectCard se re-renderiza cuando parent cambia
export function ProjectCard(props) { ... }

// ✅ Con memo: Solo se re-renderiza si props cambian
export const ProjectCard = React.memo(({ proyecto, onSelect }) => {
  return ...
})
```

### Query Caching
```typescript
// React Query cachea por 30 segundos (staleTime)
// Si user vuelve al dashboard en < 30s, no refetch
const { data } = useQuery({
  queryKey: ['projects'],
  queryFn: getProjects,
  staleTime: 30 * 1000,  // 30 segundos
})
```

## 10. Integración con Formulario

```
[Dashboard Grid]
      │
      └─ Click en "Editar" → ProjectEditPage
      │
      └─ ProjectForm component
            ├─ useForm (React Hook Form)
            ├─ Zod validación
            └─ useUpdateProject mutation
                  │
                  └─ Éxito: invalidate 'projects' query
                  └─ Error: mostrar toast
```

## Checklist de Implementación

- [ ] Crear componentes (Grid, Card, Status, Actions, Filters)
- [ ] Crear hooks (useProjects, useProjectsFiltered, useProjectActions)
- [ ] Crear servicios (getProjects con filtros)
- [ ] Crear tipos (ProjectFilters, ProjectCard props)
- [ ] Manejar loading, error, empty states
- [ ] Implementar filtrado y búsqueda
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Accesibilidad (ARIA, keyboard navigation)
- [ ] Performance (memoization, lazy loading)
- [ ] Tests (unit tests de hooks, componentes)

## Referencias de Código

- Servicios: `src/features/projects/services/`
- Hooks: `src/features/projects/hooks/`
- Componentes: `src/features/projects/components/`
- Tipos: `src/features/projects/types/`
