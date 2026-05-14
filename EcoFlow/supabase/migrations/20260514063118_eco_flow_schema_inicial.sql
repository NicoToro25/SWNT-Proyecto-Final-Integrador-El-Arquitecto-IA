-- ============================================================
-- ECOFLOW — Schema PostgreSQL para Supabase
-- Versión: 1.0.0
-- Descripción: Plataforma de gestión de instalaciones solares
-- ============================================================

-- ============================================================
-- EXTENSIONES REQUERIDAS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TIPOS ENUMERADOS (ENUMS)
-- ============================================================

-- Estado del ciclo de vida de un proyecto
CREATE TYPE estado_proyecto AS ENUM (
  'pendiente',
  'en_progreso',
  'completado',
  'cancelado',    -- estado adicional recomendado para proyectos abortados
  'en_revision'   -- estado adicional para proyectos que requieren aprobación
);

-- Especialidad del instalador
CREATE TYPE especialidad_instalador AS ENUM (
  'electrico',
  'estructural',
  'general',
  'supervision'
);

-- Unidad de medida de materiales
CREATE TYPE unidad_material AS ENUM (
  'unidad',
  'metro',
  'metro_cuadrado',
  'kilogramo',
  'litro',
  'rollo'
);

-- ============================================================
-- TABLA: clientes
-- Justificación: Los proyectos pertenecen a clientes. Separar
-- la entidad cliente evita duplicación de datos de contacto
-- y permite el historial de proyectos por cliente.
-- ============================================================
CREATE TABLE clientes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Datos personales/empresariales
  nombre         VARCHAR(150) NOT NULL,
  apellido       VARCHAR(150),                      -- NULL si es empresa
  empresa        VARCHAR(200),                      -- NULL si es persona natural
  nit_cedula     VARCHAR(20) UNIQUE,                -- Documento de identidad o NIT

  -- Datos de contacto
  email          VARCHAR(255) NOT NULL,
  telefono       VARCHAR(20),
  direccion      TEXT,
  ciudad         VARCHAR(100),
  departamento   VARCHAR(100),
  pais           VARCHAR(100) NOT NULL DEFAULT 'Colombia',

  -- Auditoría
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT clientes_email_formato CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT clientes_nombre_no_vacio CHECK (LENGTH(TRIM(nombre)) > 0)
);

COMMENT ON TABLE clientes IS 'Clientes finales de instalaciones solares';
COMMENT ON COLUMN clientes.nit_cedula IS 'NIT para empresas, cédula para personas naturales';

-- ============================================================
-- TABLA: instaladores
-- Justificación: Entidad independiente que representa al
-- recurso humano técnico. Separada de auth.users para evitar
-- acoplamiento con el sistema de autenticación.
-- ============================================================
CREATE TABLE instaladores (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
                    -- Vínculo opcional con cuenta de autenticación Supabase

  -- Datos personales
  nombre            VARCHAR(100) NOT NULL,
  apellido          VARCHAR(100) NOT NULL,
  email             VARCHAR(255) NOT NULL UNIQUE,
  telefono          VARCHAR(20),
  documento_id      VARCHAR(20) UNIQUE NOT NULL,     -- Cédula / identificación

  -- Datos profesionales
  especialidad      especialidad_instalador NOT NULL DEFAULT 'general',
  anos_experiencia  SMALLINT DEFAULT 0,
  certificaciones   TEXT[],                           -- Array de certificaciones
  tarifa_diaria     NUMERIC(10, 2),                  -- Tarifa de referencia (COP)

  -- Estado laboral
  activo            BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_ingreso     DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Auditoría
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT instaladores_anos_exp_positivos CHECK (anos_experiencia >= 0),
  CONSTRAINT instaladores_tarifa_positiva CHECK (tarifa_diaria IS NULL OR tarifa_diaria > 0),
  CONSTRAINT instaladores_email_formato CHECK (
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  ),
  CONSTRAINT instaladores_nombre_no_vacio CHECK (
    LENGTH(TRIM(nombre)) > 0 AND LENGTH(TRIM(apellido)) > 0
  )
);

COMMENT ON TABLE instaladores IS 'Técnicos e instaladores de paneles solares';
COMMENT ON COLUMN instaladores.user_id IS 'Referencia a auth.users — permite que el instalador acceda a la plataforma';
COMMENT ON COLUMN instaladores.certificaciones IS 'Array de nombres o IDs de certificaciones técnicas';
COMMENT ON COLUMN instaladores.tarifa_diaria IS 'Tarifa de referencia en COP para cálculo de presupuesto';

-- ============================================================
-- TABLA: categorias_materiales
-- Justificación: Normalización de la categoría de materiales.
-- Evita duplicación de strings y facilita filtros y reportes.
-- ============================================================
CREATE TABLE categorias_materiales (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE categorias_materiales IS 'Catálogo de categorías de materiales (paneles, inversores, cableado, etc.)';

-- ============================================================
-- TABLA: materiales
-- Justificación: Catálogo maestro de materiales disponibles.
-- Separado del uso en proyectos para gestionar inventario
-- y precios de forma independiente.
-- ============================================================
CREATE TABLE materiales (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id       UUID NOT NULL REFERENCES categorias_materiales(id) ON DELETE RESTRICT,

  -- Identificación del producto
  codigo_sku         VARCHAR(50) UNIQUE,              -- Código interno del producto
  nombre             VARCHAR(200) NOT NULL,
  descripcion        TEXT,
  marca              VARCHAR(100),
  modelo             VARCHAR(100),

  -- Especificaciones técnicas
  especificaciones   JSONB DEFAULT '{}',              -- Flexibilidad para specs variables por tipo
  unidad             unidad_material NOT NULL DEFAULT 'unidad',

  -- Precios (en COP)
  precio_unitario    NUMERIC(12, 2) NOT NULL,
  precio_mayorista   NUMERIC(12, 2),                 -- Precio para proyectos grandes

  -- Inventario básico
  stock_actual       INTEGER NOT NULL DEFAULT 0,
  stock_minimo       INTEGER NOT NULL DEFAULT 0,      -- Para alertas de reabastecimiento
  activo             BOOLEAN NOT NULL DEFAULT TRUE,

  -- Auditoría
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT materiales_precio_positivo CHECK (precio_unitario > 0),
  CONSTRAINT materiales_precio_mayorista_positivo CHECK (
    precio_mayorista IS NULL OR precio_mayorista > 0
  ),
  CONSTRAINT materiales_stock_no_negativo CHECK (stock_actual >= 0),
  CONSTRAINT materiales_stock_minimo_no_negativo CHECK (stock_minimo >= 0),
  CONSTRAINT materiales_nombre_no_vacio CHECK (LENGTH(TRIM(nombre)) > 0)
);

COMMENT ON TABLE materiales IS 'Catálogo maestro de materiales para instalaciones solares';
COMMENT ON COLUMN materiales.especificaciones IS 'JSON flexible: potencia_wp, voltaje_v, eficiencia_pct, garantia_anos, etc.';
COMMENT ON COLUMN materiales.codigo_sku IS 'Stock Keeping Unit — código único de referencia interna';

-- ============================================================
-- TABLA: proyectos
-- Justificación: Entidad central del sistema. Referencia al
-- cliente dueño del proyecto. El estado usa ENUM para
-- garantizar integridad sin tablas adicionales.
-- ============================================================
CREATE TABLE proyectos (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id           UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
                       -- RESTRICT: no se puede eliminar un cliente con proyectos activos

  -- Identificación del proyecto
  codigo_proyecto      VARCHAR(20) UNIQUE NOT NULL,   -- Ej: ECO-2024-0001
  nombre               VARCHAR(200) NOT NULL,
  descripcion          TEXT,

  -- Estado y ciclo de vida
  estado               estado_proyecto NOT NULL DEFAULT 'pendiente',
  prioridad            SMALLINT NOT NULL DEFAULT 3
                       CHECK (prioridad BETWEEN 1 AND 5), -- 1=crítica, 5=baja

  -- Ubicación de la instalación
  direccion_instalacion TEXT NOT NULL,
  ciudad_instalacion    VARCHAR(100) NOT NULL,
  departamento_instalacion VARCHAR(100),
  coordenadas_lat       DECIMAL(10, 8),               -- Latitud GPS
  coordenadas_lng       DECIMAL(11, 8),               -- Longitud GPS

  -- Especificaciones técnicas del proyecto
  potencia_kwp         DECIMAL(8, 3),                 -- Potencia en kilovatios pico
  area_m2              DECIMAL(8, 2),                 -- Área requerida en m²
  num_paneles          SMALLINT,                      -- Número de paneles estimados

  -- Financiero (en COP)
  presupuesto_estimado NUMERIC(15, 2),
  costo_real           NUMERIC(15, 2),
  porcentaje_anticipo  DECIMAL(5, 2) DEFAULT 30.00,  -- % de anticipo del cliente

  -- Fechas del proyecto
  fecha_inicio_estimada DATE,
  fecha_fin_estimada    DATE,
  fecha_inicio_real     DATE,
  fecha_fin_real        DATE,

  -- Documentación
  notas_internas       TEXT,
  notas_cliente        TEXT,                          -- Visible para el cliente
  documentos_url       TEXT[],                        -- URLs a Storage

  -- Auditoría
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by           UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Constraints de lógica de negocio
  CONSTRAINT proyectos_fechas_coherentes CHECK (
    fecha_fin_estimada IS NULL OR
    fecha_inicio_estimada IS NULL OR
    fecha_fin_estimada >= fecha_inicio_estimada
  ),
  CONSTRAINT proyectos_fechas_reales_coherentes CHECK (
    fecha_fin_real IS NULL OR
    fecha_inicio_real IS NULL OR
    fecha_fin_real >= fecha_inicio_real
  ),
  CONSTRAINT proyectos_presupuesto_positivo CHECK (
    presupuesto_estimado IS NULL OR presupuesto_estimado > 0
  ),
  CONSTRAINT proyectos_potencia_positiva CHECK (
    potencia_kwp IS NULL OR potencia_kwp > 0
  ),
  CONSTRAINT proyectos_anticipo_rango CHECK (
    porcentaje_anticipo BETWEEN 0 AND 100
  ),
  CONSTRAINT proyectos_nombre_no_vacio CHECK (LENGTH(TRIM(nombre)) > 0)
);

COMMENT ON TABLE proyectos IS 'Proyectos de instalación solar — entidad central del sistema';
COMMENT ON COLUMN proyectos.codigo_proyecto IS 'Código legible por humanos: ECO-AAAA-NNNN';
COMMENT ON COLUMN proyectos.prioridad IS '1=Crítica, 2=Alta, 3=Normal, 4=Baja, 5=Mínima';
COMMENT ON COLUMN proyectos.potencia_kwp IS 'Potencia pico del sistema en kWp (kilovatios pico)';
COMMENT ON COLUMN proyectos.coordenadas_lat IS 'Latitud WGS84 para geolocalización';
COMMENT ON COLUMN proyectos.coordenadas_lng IS 'Longitud WGS84 para geolocalización';

-- ============================================================
-- TABLA UNIÓN: proyecto_instaladores
-- Justificación: Relación N:M entre proyectos e instaladores.
-- Un proyecto requiere múltiples técnicos con distintos roles.
-- Un instalador trabaja en múltiples proyectos. La tabla de
-- unión es la única solución normalizada (3NF) para este caso.
-- ============================================================
CREATE TABLE proyecto_instaladores (
  -- La PK compuesta garantiza unicidad de la asignación
  proyecto_id    UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  instalador_id  UUID NOT NULL REFERENCES instaladores(id) ON DELETE RESTRICT,

  -- Metadata de la asignación
  rol_en_proyecto VARCHAR(100) DEFAULT 'instalador',  -- ej: líder, asistente
  fecha_asignacion DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin        DATE,
  horas_trabajadas DECIMAL(6, 2) DEFAULT 0,
  notas            TEXT,

  -- Auditoría
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- PK compuesta: un instalador aparece una vez por proyecto
  PRIMARY KEY (proyecto_id, instalador_id),

  CONSTRAINT pi_horas_no_negativas CHECK (horas_trabajadas >= 0),
  CONSTRAINT pi_fechas_coherentes CHECK (
    fecha_fin IS NULL OR fecha_fin >= fecha_asignacion
  )
);

COMMENT ON TABLE proyecto_instaladores IS 'Tabla de unión N:M entre proyectos e instaladores. Registra la asignación de personal';
COMMENT ON COLUMN proyecto_instaladores.horas_trabajadas IS 'Horas acumuladas del instalador en este proyecto';

-- ============================================================
-- TABLA UNIÓN: proyecto_materiales
-- Justificación: Relación N:M con atributo. No solo registra
-- qué materiales usa cada proyecto, sino cuántos y a qué
-- precio (precio snapshot al momento de asignación, ya que
-- el precio del catálogo puede cambiar).
-- ============================================================
CREATE TABLE proyecto_materiales (
  proyecto_id         UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  material_id         UUID NOT NULL REFERENCES materiales(id) ON DELETE RESTRICT,

  -- Cantidades
  cantidad_estimada   DECIMAL(10, 3) NOT NULL,         -- Estimación inicial
  cantidad_real       DECIMAL(10, 3),                  -- Cantidad realmente usada
  unidad              unidad_material NOT NULL,

  -- Precio snapshot (importante: captura el precio al momento de asignación)
  precio_unitario_snapshot NUMERIC(12, 2) NOT NULL,    -- Precio al momento de asignar

  -- Estado del material en el proyecto
  instalado           BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_instalacion   DATE,

  -- Auditoría
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (proyecto_id, material_id),

  CONSTRAINT pm_cantidad_estimada_positiva CHECK (cantidad_estimada > 0),
  CONSTRAINT pm_cantidad_real_no_negativa CHECK (
    cantidad_real IS NULL OR cantidad_real >= 0
  ),
  CONSTRAINT pm_precio_snapshot_positivo CHECK (precio_unitario_snapshot > 0)
);

COMMENT ON TABLE proyecto_materiales IS 'Materiales asignados a cada proyecto con cantidad y precio histórico';
COMMENT ON COLUMN proyecto_materiales.precio_unitario_snapshot IS 'Precio capturado al momento de asignación — inmune a cambios futuros del catálogo';
COMMENT ON COLUMN proyecto_materiales.cantidad_real IS 'Se actualiza al finalizar la instalación con la cantidad real consumida';

-- ============================================================
-- TABLA: historial_estados
-- Justificación: Auditoría completa de cambios de estado.
-- Permite rastrear cuándo y quién cambió el estado del proyecto,
-- fundamental para análisis de tiempos y SLAs.
-- ============================================================
CREATE TABLE historial_estados (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id     UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  estado_anterior estado_proyecto,                    -- NULL en la creación inicial
  estado_nuevo    estado_proyecto NOT NULL,
  motivo          TEXT,                               -- Justificación del cambio
  cambiado_por    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE historial_estados IS 'Registro inmutable de todos los cambios de estado de un proyecto';

-- ============================================================
-- ÍNDICES
-- Justificación por índice:
-- ============================================================

-- proyectos: búsquedas frecuentes por cliente, estado y código
CREATE INDEX idx_proyectos_cliente_id ON proyectos(cliente_id);
CREATE INDEX idx_proyectos_estado ON proyectos(estado);
CREATE INDEX idx_proyectos_codigo ON proyectos(codigo_proyecto);
CREATE INDEX idx_proyectos_created_at ON proyectos(created_at DESC);

-- Índice compuesto para el dashboard principal (filtra estado + ordena por fecha)
CREATE INDEX idx_proyectos_estado_fecha ON proyectos(estado, fecha_inicio_estimada);

-- instaladores: búsquedas por especialidad y estado activo
CREATE INDEX idx_instaladores_especialidad ON instaladores(especialidad);
CREATE INDEX idx_instaladores_activo ON instaladores(activo) WHERE activo = TRUE;
CREATE INDEX idx_instaladores_user_id ON instaladores(user_id);

-- materiales: búsquedas por categoría, SKU y stock bajo
CREATE INDEX idx_materiales_categoria_id ON materiales(categoria_id);
CREATE INDEX idx_materiales_codigo_sku ON materiales(codigo_sku) WHERE codigo_sku IS NOT NULL;
CREATE INDEX idx_materiales_activo ON materiales(activo) WHERE activo = TRUE;
-- Índice para alertas de stock mínimo
CREATE INDEX idx_materiales_stock_bajo ON materiales(stock_actual)
  WHERE stock_actual <= stock_minimo;

-- proyecto_instaladores: búsquedas inversas (qué proyectos tiene un instalador)
CREATE INDEX idx_pi_instalador_id ON proyecto_instaladores(instalador_id);

-- proyecto_materiales: búsquedas inversas (en qué proyectos se usa un material)
CREATE INDEX idx_pm_material_id ON proyecto_materiales(material_id);

-- historial_estados: consulta del historial de un proyecto
CREATE INDEX idx_historial_proyecto_id ON historial_estados(proyecto_id, created_at DESC);

-- JSONB: índice GIN para búsquedas en especificaciones de materiales
CREATE INDEX idx_materiales_especificaciones ON materiales USING GIN(especificaciones);

-- ============================================================
-- FUNCIÓN: actualizar updated_at automáticamente
-- Justificación: DRY — un trigger reutilizable para todas las
-- tablas en lugar de lógica duplicada en la aplicación.
-- ============================================================
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar el trigger a todas las tablas con updated_at
CREATE TRIGGER trg_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trg_instaladores_updated_at
  BEFORE UPDATE ON instaladores
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trg_materiales_updated_at
  BEFORE UPDATE ON materiales
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trg_proyectos_updated_at
  BEFORE UPDATE ON proyectos
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trg_pi_updated_at
  BEFORE UPDATE ON proyecto_instaladores
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

CREATE TRIGGER trg_pm_updated_at
  BEFORE UPDATE ON proyecto_materiales
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

-- ============================================================
-- FUNCIÓN + TRIGGER: registrar cambios de estado automáticamente
-- Justificación: Garantiza que NINGÚN cambio de estado se
-- pierda, independientemente de cómo se actualice el registro
-- (API, SQL directo, Edge Function).
-- ============================================================
CREATE OR REPLACE FUNCTION registrar_cambio_estado()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.estado IS DISTINCT FROM NEW.estado) THEN
    INSERT INTO historial_estados (
      proyecto_id,
      estado_anterior,
      estado_nuevo,
      cambiado_por
    ) VALUES (
      NEW.id,
      OLD.estado,
      NEW.estado,
      auth.uid()  -- Función nativa de Supabase que retorna el UUID del usuario autenticado
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_proyectos_estado_historial
  AFTER UPDATE ON proyectos
  FOR EACH ROW EXECUTE FUNCTION registrar_cambio_estado();

-- ============================================================
-- FUNCIÓN: generar código de proyecto automáticamente
-- Justificación: Formato legible ECO-AAAA-NNNN sin depender
-- de la aplicación para la generación del código.
-- ============================================================
CREATE OR REPLACE FUNCTION generar_codigo_proyecto()
RETURNS TRIGGER AS $$
DECLARE
  anio TEXT;
  secuencia INTEGER;
BEGIN
  IF NEW.codigo_proyecto IS NULL THEN
    anio := TO_CHAR(NOW(), 'YYYY');
    SELECT COALESCE(MAX(
      CAST(SPLIT_PART(codigo_proyecto, '-', 3) AS INTEGER)
    ), 0) + 1
    INTO secuencia
    FROM proyectos
    WHERE codigo_proyecto LIKE 'ECO-' || anio || '-%';

    NEW.codigo_proyecto := 'ECO-' || anio || '-' || LPAD(secuencia::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_proyectos_codigo
  BEFORE INSERT ON proyectos
  FOR EACH ROW EXECUTE FUNCTION generar_codigo_proyecto();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Estrategia básica — expandir según roles definidos en Auth
-- ============================================================

-- Helpers de seguridad: centralizan la lectura del rol y la
-- verificación de asignación entre auth.users e instaladores.
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(auth.jwt() ->> 'role', '')
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT public.current_user_role() = 'admin'
$$;

CREATE OR REPLACE FUNCTION public.is_project_manager()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT public.current_user_role() = 'project_manager'
$$;

CREATE OR REPLACE FUNCTION public.is_assigned_installer(project_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM instaladores i
    JOIN proyecto_instaladores pi ON pi.instalador_id = i.id
    WHERE i.user_id = auth.uid()
      AND pi.proyecto_id = project_uuid
  )
$$;

CREATE OR REPLACE FUNCTION public.enforce_project_update_scope()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF public.is_assigned_installer(OLD.id) THEN
    IF NEW.estado IS DISTINCT FROM OLD.estado
      AND NEW.nombre IS NOT DISTINCT FROM OLD.nombre
      AND NEW.cliente_id IS NOT DISTINCT FROM OLD.cliente_id
      AND NEW.codigo_proyecto IS NOT DISTINCT FROM OLD.codigo_proyecto
      AND NEW.direccion_instalacion IS NOT DISTINCT FROM OLD.direccion_instalacion
      AND NEW.ciudad_instalacion IS NOT DISTINCT FROM OLD.ciudad_instalacion
      AND NEW.departamento_instalacion IS NOT DISTINCT FROM OLD.departamento_instalacion
      AND NEW.descripcion IS NOT DISTINCT FROM OLD.descripcion
      AND NEW.area_m2 IS NOT DISTINCT FROM OLD.area_m2
      AND NEW.potencia_kwp IS NOT DISTINCT FROM OLD.potencia_kwp
      AND NEW.coordenadas_lat IS NOT DISTINCT FROM OLD.coordenadas_lat
      AND NEW.coordenadas_lng IS NOT DISTINCT FROM OLD.coordenadas_lng
      AND NEW.num_paneles IS NOT DISTINCT FROM OLD.num_paneles
      AND NEW.presupuesto_estimado IS NOT DISTINCT FROM OLD.presupuesto_estimado
      AND NEW.costo_real IS NOT DISTINCT FROM OLD.costo_real
      AND NEW.porcentaje_anticipo IS NOT DISTINCT FROM OLD.porcentaje_anticipo
      AND NEW.fecha_inicio_estimada IS NOT DISTINCT FROM OLD.fecha_inicio_estimada
      AND NEW.fecha_fin_estimada IS NOT DISTINCT FROM OLD.fecha_fin_estimada
      AND NEW.fecha_inicio_real IS NOT DISTINCT FROM OLD.fecha_inicio_real
      AND NEW.fecha_fin_real IS NOT DISTINCT FROM OLD.fecha_fin_real
      AND NEW.notas_internas IS NOT DISTINCT FROM OLD.notas_internas
      AND NEW.notas_cliente IS NOT DISTINCT FROM OLD.notas_cliente
      AND NEW.documentos_url IS NOT DISTINCT FROM OLD.documentos_url
      AND NEW.created_by IS NOT DISTINCT FROM OLD.created_by
      AND NEW.prioridad IS NOT DISTINCT FROM OLD.prioridad
    THEN
      RETURN NEW;
    END IF;

    RAISE EXCEPTION 'Solo se permite actualizar el estado de proyectos asignados'
      USING ERRCODE = '42501';
  END IF;

  RAISE EXCEPTION 'No tiene permisos para actualizar este proyecto'
    USING ERRCODE = '42501';
END;
$$;

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE instaladores ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyecto_instaladores ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyecto_materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_materiales ENABLE ROW LEVEL SECURITY;

-- Limpieza de políticas por si la migración se reaplica en un entorno de desarrollo.
DROP POLICY IF EXISTS "usuarios_autenticados_pueden_leer_proyectos" ON proyectos;
DROP POLICY IF EXISTS "usuarios_autenticados_pueden_leer_clientes" ON clientes;
DROP POLICY IF EXISTS "usuarios_autenticados_pueden_leer_instaladores" ON instaladores;
DROP POLICY IF EXISTS "usuarios_autenticados_pueden_leer_materiales" ON materiales;
DROP POLICY IF EXISTS "usuarios_autenticados_pueden_leer_categorias" ON categorias_materiales;
DROP POLICY IF EXISTS "usuarios_autenticados_pueden_leer_pi" ON proyecto_instaladores;
DROP POLICY IF EXISTS "usuarios_autenticados_pueden_leer_pm" ON proyecto_materiales;
DROP POLICY IF EXISTS "usuarios_autenticados_pueden_leer_historial" ON historial_estados;
DROP POLICY IF EXISTS "project_managers_pueden_crear_proyectos" ON proyectos;
DROP POLICY IF EXISTS "project_managers_pueden_actualizar_proyectos" ON proyectos;
DROP POLICY IF EXISTS "admin_lee_todos_los_proyectos" ON proyectos;
DROP POLICY IF EXISTS "instalador_ve_sus_proyectos" ON proyectos;
DROP POLICY IF EXISTS "admin_crea_proyectos" ON proyectos;
DROP POLICY IF EXISTS "admin_actualiza_proyectos" ON proyectos;
DROP POLICY IF EXISTS "instalador_actualiza_estado_sus_proyectos" ON proyectos;

-- Lectura controlada de proyectos:
-- Admin ve todo.
-- Instalador ve solo proyectos en los que está asignado.
CREATE POLICY "admin_lee_todos_los_proyectos"
  ON proyectos FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "instalador_ve_sus_proyectos"
  ON proyectos FOR SELECT
  TO authenticated
  USING (public.is_assigned_installer(id));

-- Creación de proyectos: solo admin.
CREATE POLICY "admin_crea_proyectos"
  ON proyectos FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Actualización completa: solo admin.
CREATE POLICY "admin_actualiza_proyectos"
  ON proyectos FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Actualización de instalador: la política deja pasar únicamente filas
-- asignadas; el trigger restringe realmente qué columnas pueden cambiar.
CREATE POLICY "instalador_actualiza_estado_sus_proyectos"
  ON proyectos FOR UPDATE
  TO authenticated
  USING (public.is_assigned_installer(id))
  WITH CHECK (public.is_assigned_installer(id));

CREATE TRIGGER trg_proyectos_restringir_cambio_de_campos
  BEFORE UPDATE ON proyectos
  FOR EACH ROW EXECUTE FUNCTION public.enforce_project_update_scope();

-- Lecturas auxiliares: materiales y categorías solo para usuarios autenticados.
CREATE POLICY "usuarios_autenticados_pueden_leer_materiales"
  ON materiales FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "usuarios_autenticados_pueden_leer_categorias"
  ON categorias_materiales FOR SELECT
  TO authenticated
  USING (true);

-- La tabla puente debe seguir la visibilidad del proyecto al que pertenece.
CREATE POLICY "admin_lee_proyecto_instaladores"
  ON proyecto_instaladores FOR SELECT
  TO authenticated
  USING (public.is_admin() OR public.is_assigned_installer(proyecto_id));

CREATE POLICY "admin_lee_proyecto_materiales"
  ON proyecto_materiales FOR SELECT
  TO authenticated
  USING (public.is_admin() OR public.is_assigned_installer(proyecto_id));

-- Historial solo visible para admin y para instaladores asignados al proyecto.
CREATE POLICY "admin_lee_historial"
  ON historial_estados FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "instalador_lee_historial_de_sus_proyectos"
  ON historial_estados FOR SELECT
  TO authenticated
  USING (public.is_assigned_installer(proyecto_id));

-- Permisos de mantenimiento de tablas de soporte: admin controla la escritura.
CREATE POLICY "admin_gestiona_instaladores"
  ON instaladores FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "instalador_lee_su_fila"
  ON instaladores FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "admin_gestiona_materiales"
  ON materiales FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_gestiona_categorias_materiales"
  ON categorias_materiales FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_gestiona_proyecto_instaladores"
  ON proyecto_instaladores FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_gestiona_proyecto_materiales"
  ON proyecto_materiales FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_gestiona_historial"
  ON historial_estados FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- VISTAS ÚTILES
-- Justificación: Simplifican queries comunes en la aplicación
-- sin exponer joins complejos al frontend.
-- ============================================================

-- Vista: Proyectos con información básica del cliente
CREATE OR REPLACE VIEW v_proyectos_resumen AS
SELECT
  p.id,
  p.codigo_proyecto,
  p.nombre,
  p.estado,
  p.prioridad,
  p.ciudad_instalacion,
  p.potencia_kwp,
  p.presupuesto_estimado,
  p.fecha_inicio_estimada,
  p.fecha_fin_estimada,
  p.created_at,
  -- Cliente
  c.nombre || ' ' || COALESCE(c.apellido, '') AS cliente_nombre,
  c.empresa AS cliente_empresa,
  c.email AS cliente_email,
  -- Conteos
  (SELECT COUNT(*) FROM proyecto_instaladores pi WHERE pi.proyecto_id = p.id) AS num_instaladores,
  (SELECT COUNT(*) FROM proyecto_materiales pm WHERE pm.proyecto_id = p.id) AS num_materiales,
  -- Costo estimado de materiales
  (SELECT SUM(pm.cantidad_estimada * pm.precio_unitario_snapshot)
   FROM proyecto_materiales pm WHERE pm.proyecto_id = p.id) AS costo_materiales_estimado
FROM proyectos p
JOIN clientes c ON c.id = p.cliente_id;

COMMENT ON VIEW v_proyectos_resumen IS 'Vista desnormalizada para el listado de proyectos en el dashboard';

-- Vista: Instaladores con proyectos activos
CREATE OR REPLACE VIEW v_instaladores_carga AS
SELECT
  i.id,
  i.nombre || ' ' || i.apellido AS nombre_completo,
  i.especialidad,
  i.activo,
  COUNT(pi.proyecto_id) FILTER (
    WHERE p.estado IN ('en_progreso', 'en_revision')
  ) AS proyectos_activos,
  SUM(pi.horas_trabajadas) AS total_horas
FROM instaladores i
LEFT JOIN proyecto_instaladores pi ON pi.instalador_id = i.id
LEFT JOIN proyectos p ON p.id = pi.proyecto_id
GROUP BY i.id, i.nombre, i.apellido, i.especialidad, i.activo;

COMMENT ON VIEW v_instaladores_carga IS 'Carga de trabajo actual por instalador';

-- ============================================================
-- CATEGORÍAS SEMILLA (datos base del sistema)
-- Solo categorías, no datos mock de proyectos/clientes
-- ============================================================
INSERT INTO categorias_materiales (nombre, descripcion) VALUES
  ('Paneles Solares',       'Módulos fotovoltaicos de distintas potencias y tecnologías'),
  ('Inversores',            'Inversores string, microinversores y optimizadores'),
  ('Estructura y Montaje',  'Rieles, grapas, perfiles y anclajes para instalación'),
  ('Cableado Eléctrico',    'Cables solares, conectores MC4 y accesorios'),
  ('Protecciones',          'Fusibles, breakers, descargadores de sobretensión'),
  ('Baterías y Almacenamiento', 'Baterías de litio, plomo-ácido y sistemas BESS'),
  ('Monitorización',        'Dataloggers, medidores de energía y plataformas IoT'),
  ('Herramientas',          'Herramientas especializadas para instalación solar');