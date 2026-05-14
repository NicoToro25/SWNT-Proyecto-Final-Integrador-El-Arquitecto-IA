# Índice de Documentación — EcoFlow

Guía completa de navegación para toda la documentación del proyecto.

## 🚀 Inicio Rápido

**Primer día en EcoFlow?** Comienza aquí:

1. [Instalación y Setup](../README.md#ecoflow) — Comandos para ejecutar el proyecto localmente.
2. [Tipado 101 — Referencia Rápida](REFERENCIA-RAPIDA-TIPADO.md) — Los 5 patrones más comunes.
3. [Ejemplo Feature Instaladores](EJEMPLO-FEATURE-TIPADO-INSTALADORES.md) — Ver un feature completo funcionando.

**Resultado esperado:** Entiendas cómo generar tipos, cómo usarlos en servicios/hooks, y cómo crear un feature.

---

## 📚 Documentación Completa

### 1. **TypeScript y Tipos**

| Documento | Para | Tiempo | Nivel |
|-----------|------|--------|-------|
| [TIPADO-SUPABASE-TYPESCRIPT.md](TIPADO-SUPABASE-TYPESCRIPT.md) | Entender completamente cómo usar tipos con Supabase | 30-45 min | Intermedio |
| [MEJORES-PRACTICAS-TIPADO.md](MEJORES-PRACTICAS-TIPADO.md) | Aprender principios profesionales y patrones | 20-30 min | Intermedio |
| [REFERENCIA-RAPIDA-TIPADO.md](REFERENCIA-RAPIDA-TIPADO.md) | Buscar rápidamente un patrón específico | 5-10 min | Todos |

**Orden de lectura recomendado:**
1. REFERENCIA-RAPIDA-TIPADO.md (5 min)
2. MEJORES-PRACTICAS-TIPADO.md (20 min)
3. TIPADO-SUPABASE-TYPESCRIPT.md (30 min)

### 2. **Desarrollo de Features**

| Documento | Para | Tiempo | Nivel |
|-----------|------|--------|-------|
| [EJEMPLO-FEATURE-TIPADO-INSTALADORES.md](EJEMPLO-FEATURE-TIPADO-INSTALADORES.md) | Ver implementación real paso a paso | 45 min | Intermedio |
| [ARQUITECTURA-GENERAL-md](ARQUITECTURA-GENERAL-md) | Entender estructura general del proyecto | 25 min | Principiante |

**Workflow típico:**
- Necesito crear feature X → Leer ARQUITECTURA-GENERAL.md
- Necesito ver cómo se hace → Leer EJEMPLO-FEATURE-TIPADO-INSTALADORES.md
- Necesito patrones específicos → REFERENCIA-RAPIDA-TIPADO.md

### 3. **Base de Datos y Seguridad**

| Documento | Para | Tiempo | Nivel |
|-----------|------|--------|-------|
| [20260514063118_eco_flow_schema_inicial.sql](../EcoFlow/supabase/migrations/20260514063118_eco_flow_schema_inicial.sql) | Ver schema completo con RLS | 30 min | Avanzado |

### 4. **Configuración del Proyecto**

| Archivo | Propósito |
|---------|-----------|
| [../README.md](../README.md) | Setup inicial, instalación, comandos |
| [../tsconfig.json](../tsconfig.json) | Configuración TypeScript |
| [../vite.config.js](../vite.config.js) | Configuración Vite y alias |
| [../EcoFlow/package.json](../EcoFlow/package.json) | Scripts y dependencias |

---

## 🎯 Escenarios Comunes

### "Necesito crear un nuevo feature con tipos"

1. Asegúrate que la tabla existe en Supabase.
2. Ejecuta `npm run db:types`.
3. Sigue [EJEMPLO-FEATURE-TIPADO-INSTALADORES.md](EJEMPLO-FEATURE-TIPADO-INSTALADORES.md) paso a paso.
4. Valida con `npx tsc --noEmit`.

**Documentos relevantes:**
- [REFERENCIA-RAPIDA-TIPADO.md](REFERENCIA-RAPIDA-TIPADO.md)
- [EJEMPLO-FEATURE-TIPADO-INSTALADORES.md](EJEMPLO-FEATURE-TIPADO-INSTALADORES.md)

### "¿Cómo valido datos con Zod?"

Lee la sección **Patrones en formularios** en [MEJORES-PRACTICAS-TIPADO.md](MEJORES-PRACTICAS-TIPADO.md).

Luego, consulta el ejemplo en [EJEMPLO-FEATURE-TIPADO-INSTALADORES.md](EJEMPLO-FEATURE-TIPADO-INSTALADORES.md#paso-5-crea-hooks-tipados).

### "¿Cómo uso tipos en React Query?"

Lee la sección **8. Integración con React** en [TIPADO-SUPABASE-TYPESCRIPT.md](TIPADO-SUPABASE-TYPESCRIPT.md).

Ejemplo concreto en [EJEMPLO-FEATURE-TIPADO-INSTALADORES.md](EJEMPLO-FEATURE-TIPADO-INSTALADORES.md#paso-5-crea-hooks-tipados).

### "¿Qué patrones usa EcoFlow?"

Lee [ARQUITECTURA-GENERAL-md](ARQUITECTURA-GENERAL-md) (estructura general) y luego [EJEMPLO-FEATURE-TIPADO-INSTALADORES.md](EJEMPLO-FEATURE-TIPADO-INSTALADORES.md) (ejemplo real).

### "¿Cómo automatizo la regeneración de tipos?"

Read sección **3. Automatizar la generación de tipos** en [TIPADO-SUPABASE-TYPESCRIPT.md](TIPADO-SUPABASE-TYPESCRIPT.md).

### "¿Cómo hago RLS en Supabase?"

Read el archivo de migraciones [20260514063118_eco_flow_schema_inicial.sql](../EcoFlow/supabase/migrations/20260514063118_eco_flow_schema_inicial.sql).

---

## 📊 Matriz de Documentación

```
┌─────────────────────────────────────────────────────────────┐
│  Nivel Principiante                                         │
│  ├─ Leer: REFERENCIA-RAPIDA-TIPADO.md                     │
│  ├─ Leer: ARQUITECTURA-GENERAL.md                         │
│  └─ Ver: EJEMPLO-FEATURE-TIPADO-INSTALADORES.md           │
├─────────────────────────────────────────────────────────────┤
│  Nivel Intermedio                                           │
│  ├─ Leer: TIPADO-SUPABASE-TYPESCRIPT.md (completo)        │
│  ├─ Leer: MEJORES-PRACTICAS-TIPADO.md                     │
│  └─ Implementar: Feature propio basado en EJEMPLO           │
├─────────────────────────────────────────────────────────────┤
│  Nivel Avanzado                                             │
│  ├─ Estudiar: Schema SQL con RLS                          │
│  ├─ Revisar: Configuración de CI/CD                       │
│  └─ Leer: Puntos 10-11 en TIPADO-SUPABASE-TYPESCRIPT.md  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 Búsqueda por Tema

### TypeScript, Tipos y Supabase

- ¿Cómo genero tipos? → [TIPADO-SUPABASE-TYPESCRIPT.md#1](TIPADO-SUPABASE-TYPESCRIPT.md#1-generar-tipos-desde-supabase)
- ¿Qué son helpers de tipos? → [TIPADO-SUPABASE-TYPESCRIPT.md#2](TIPADO-SUPABASE-TYPESCRIPT.md#2-helpers-de-tipos-reutilizables)
- ¿Cómo automatizo? → [TIPADO-SUPABASE-TYPESCRIPT.md#3](TIPADO-SUPABASE-TYPESCRIPT.md#3-automatizar-la-generación-de-tipos)
- Patrón SELECT → [REFERENCIA-RAPIDA-TIPADO.md](REFERENCIA-RAPIDA-TIPADO.md#select)
- Patrón INSERT → [REFERENCIA-RAPIDA-TIPADO.md](REFERENCIA-RAPIDA-TIPADO.md#insert)
- Patrón UPDATE → [REFERENCIA-RAPIDA-TIPADO.md](REFERENCIA-RAPIDA-TIPADO.md#update)
- Patrón ENUM → [REFERENCIA-RAPIDA-TIPADO.md](REFERENCIA-RAPIDA-TIPADO.md#enum)

### React

- React Query + tipos → [TIPADO-SUPABASE-TYPESCRIPT.md#8](TIPADO-SUPABASE-TYPESCRIPT.md#8-integración-con-react)
- Hook useQuery tipado → [REFERENCIA-RAPIDA-TIPADO.md](REFERENCIA-RAPIDA-TIPADO.md#query)
- Hook useMutation tipado → [REFERENCIA-RAPIDA-TIPADO.md](REFERENCIA-RAPIDA-TIPADO.md#mutation)
- Componente tipado → [EJEMPLO-FEATURE-TIPADO-INSTALADORES.md#paso-6](EJEMPLO-FEATURE-TIPADO-INSTALADORES.md#paso-6-crea-componente-tipado)

### Validación y Zod

- Validación Zod → [TIPADO-SUPABASE-TYPESCRIPT.md#51](TIPADO-SUPABASE-TYPESCRIPT.md#51-insert-simple)
- Patrón no-any → [MEJORES-PRACTICAS-TIPADO.md#principio-4](MEJORES-PRACTICAS-TIPADO.md#principio-4-nunca-any-siempre-unknown)
- Schemas reutilizables → [EJEMPLO-FEATURE-TIPADO-INSTALADORES.md#paso-5](EJEMPLO-FEATURE-TIPADO-INSTALADORES.md#paso-5-crea-hooks-tipados)

### Arquitectura y Patrones

- Estructura de carpetas → [ARQUITECTURA-GENERAL-md](ARQUITECTURA-GENERAL-md)
- Feature-Sliced Design → [ARQUITECTURA-GENERAL-md](ARQUITECTURA-GENERAL-md)
- Jerarquía de confianza → [MEJORES-PRACTICAS-TIPADO.md#principio-2](MEJORES-PRACTICAS-TIPADO.md#principio-2-jerarquía-de-confianza)
- Capas de tipado → [MEJORES-PRACTICAS-TIPADO.md#principio-3](MEJORES-PRACTICAS-TIPADO.md#principio-3-capas-de-tipado)

### RLS y Seguridad

- Implementación RLS → [20260514063118_eco_flow_schema_inicial.sql](../EcoFlow/supabase/migrations/20260514063118_eco_flow_schema_inicial.sql)
- Políticas por rol → [ARQUITECTURA-GENERAL-md](ARQUITECTURA-GENERAL-md)

### Configuración

- Setup inicial → [../README.md](../README.md)
- Comandos disponibles → [../EcoFlow/package.json](../EcoFlow/package.json)
- TypeScript strict → [../EcoFlow/tsconfig.json](../EcoFlow/tsconfig.json)
- Vite config → [../EcoFlow/vite.config.ts](../EcoFlow/vite.config.ts)

---

## 📖 Cómo Leer la Documentación

### Para aprender de cero

```
Semana 1:
- Día 1: REFERENCIA-RAPIDA-TIPADO.md (15 min)
- Día 2: ARQUITECTURA-GENERAL.md (25 min)
- Día 3-4: EJEMPLO-FEATURE-TIPADO-INSTALADORES.md (45 min)
- Día 5: MEJORES-PRACTICAS-TIPADO.md (25 min)

Semana 2:
- Día 1-2: TIPADO-SUPABASE-TYPESCRIPT.md (45 min)
- Día 3-5: Crear tu primer feature

Semana 3:
- Implementar 2-3 features independientes
- Consultar TIPADO-SUPABASE-TYPESCRIPT.md para casos específicos
```

### Para referencia rápida

- Patrón específico → REFERENCIA-RAPIDA-TIPADO.md
- Principio profesional → MEJORES-PRACTICAS-TIPADO.md
- Caso de uso completo → EJEMPLO-FEATURE-TIPADO-INSTALADORES.md

### Para deep dive

- Supabase + TypeScript → TIPADO-SUPABASE-TYPESCRIPT.md
- Arquitectura completa → ARQUITECTURA-GENERAL.md
- SQL + RLS → migrations/*.sql

---

## ✅ Validar tu Comprensión

### Checklist: Entiendes lo básico

- [ ] Puedo ejecutar `npm run db:types` y entiendo qué hace.
- [ ] Sé la diferencia entre `Tables<'tabla'>`, `TablesInsert<'tabla'>` y `TablesUpdate<'tabla'>`.
- [ ] Puedo crear un servicio tipado que retorna `Promise<Tables<'tabla'>[]>`.
- [ ] Sé cómo crear un hook `useQuery` tipado.
- [ ] Entiendo por qué no se debe usar `any`.

### Checklist: Puedes crear un feature

- [ ] Puedo crear un tipo de dominio para una tabla.
- [ ] Puedo crear un servicio con funciones CRUD tipadas.
- [ ] Puedo crear hooks con React Query tipados.
- [ ] Puedo crear un componente que usa el hook.
- [ ] Puedo crear un schema Zod para validación.
- [ ] `npx tsc --noEmit` pasa sin errores.

### Checklist: Eres profesional

- [ ] No hay `any` en mi código.
- [ ] Todos los servicios retornan tipos explícitos.
- [ ] Todos los hooks de React Query tienen tipos genéricos.
- [ ] Datos del usuario se validan con Zod antes de usarlos.
- [ ] Entiendo y aplico la jerarquía de confianza.
- [ ] Puedo explicar por qué RLS en la BD es más importante que tipos.

---

## 🔗 Enlaces Rápidos

```
Generación de tipos:
  npm run db:types

Validación de tipos:
  npx tsc --noEmit

Watch migraciones:
  npm run db:types:watch

Ver tipos generados:
  cat src/types/supabase.types.ts

Ver helpers:
  cat src/types/database.types.ts
```

---

## 📝 Historial de Cambios

Documentación creada: 2024-05-14

**Documentos incluidos:**
1. TIPADO-SUPABASE-TYPESCRIPT.md — Guía completa de tipado
2. MEJORES-PRACTICAS-TIPADO.md — Principios profesionales
3. REFERENCIA-RAPIDA-TIPADO.md — Cheat sheet
4. EJEMPLO-FEATURE-TIPADO-INSTALADORES.md — Implementación real
5. INDICE-DOCUMENTACION.md — Este archivo

---

## ¿Preguntas?

- **Patrón específico no documentado?** → Crear issue con ejemplo.
- **Documento confuso?** → Revisar sección de "Cómo Leer la Documentación".
- **Quiero contribuir?** → Ver ARQUITECTURA-GENERAL.md para contribuir.
