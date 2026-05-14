export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      categorias_materiales: {
        Row: {
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          apellido: string | null
          ciudad: string | null
          created_at: string
          departamento: string | null
          direccion: string | null
          email: string
          empresa: string | null
          id: string
          nit_cedula: string | null
          nombre: string
          pais: string
          telefono: string | null
          updated_at: string
        }
        Insert: {
          apellido?: string | null
          ciudad?: string | null
          created_at?: string
          departamento?: string | null
          direccion?: string | null
          email: string
          empresa?: string | null
          id?: string
          nit_cedula?: string | null
          nombre: string
          pais?: string
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          apellido?: string | null
          ciudad?: string | null
          created_at?: string
          departamento?: string | null
          direccion?: string | null
          email?: string
          empresa?: string | null
          id?: string
          nit_cedula?: string | null
          nombre?: string
          pais?: string
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      historial_estados: {
        Row: {
          cambiado_por: string | null
          created_at: string
          estado_anterior: Database["public"]["Enums"]["estado_proyecto"] | null
          estado_nuevo: Database["public"]["Enums"]["estado_proyecto"]
          id: string
          motivo: string | null
          proyecto_id: string
        }
        Insert: {
          cambiado_por?: string | null
          created_at?: string
          estado_anterior?:
            | Database["public"]["Enums"]["estado_proyecto"]
            | null
          estado_nuevo: Database["public"]["Enums"]["estado_proyecto"]
          id?: string
          motivo?: string | null
          proyecto_id: string
        }
        Update: {
          cambiado_por?: string | null
          created_at?: string
          estado_anterior?:
            | Database["public"]["Enums"]["estado_proyecto"]
            | null
          estado_nuevo?: Database["public"]["Enums"]["estado_proyecto"]
          id?: string
          motivo?: string | null
          proyecto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "historial_estados_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historial_estados_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "v_proyectos_resumen"
            referencedColumns: ["id"]
          },
        ]
      }
      instaladores: {
        Row: {
          activo: boolean
          anos_experiencia: number | null
          apellido: string
          certificaciones: string[] | null
          created_at: string
          documento_id: string
          email: string
          especialidad: Database["public"]["Enums"]["especialidad_instalador"]
          fecha_ingreso: string
          id: string
          nombre: string
          tarifa_diaria: number | null
          telefono: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          activo?: boolean
          anos_experiencia?: number | null
          apellido: string
          certificaciones?: string[] | null
          created_at?: string
          documento_id: string
          email: string
          especialidad?: Database["public"]["Enums"]["especialidad_instalador"]
          fecha_ingreso?: string
          id?: string
          nombre: string
          tarifa_diaria?: number | null
          telefono?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          activo?: boolean
          anos_experiencia?: number | null
          apellido?: string
          certificaciones?: string[] | null
          created_at?: string
          documento_id?: string
          email?: string
          especialidad?: Database["public"]["Enums"]["especialidad_instalador"]
          fecha_ingreso?: string
          id?: string
          nombre?: string
          tarifa_diaria?: number | null
          telefono?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      materiales: {
        Row: {
          activo: boolean
          categoria_id: string
          codigo_sku: string | null
          created_at: string
          descripcion: string | null
          especificaciones: Json | null
          id: string
          marca: string | null
          modelo: string | null
          nombre: string
          precio_mayorista: number | null
          precio_unitario: number
          stock_actual: number
          stock_minimo: number
          unidad: Database["public"]["Enums"]["unidad_material"]
          updated_at: string
        }
        Insert: {
          activo?: boolean
          categoria_id: string
          codigo_sku?: string | null
          created_at?: string
          descripcion?: string | null
          especificaciones?: Json | null
          id?: string
          marca?: string | null
          modelo?: string | null
          nombre: string
          precio_mayorista?: number | null
          precio_unitario: number
          stock_actual?: number
          stock_minimo?: number
          unidad?: Database["public"]["Enums"]["unidad_material"]
          updated_at?: string
        }
        Update: {
          activo?: boolean
          categoria_id?: string
          codigo_sku?: string | null
          created_at?: string
          descripcion?: string | null
          especificaciones?: Json | null
          id?: string
          marca?: string | null
          modelo?: string | null
          nombre?: string
          precio_mayorista?: number | null
          precio_unitario?: number
          stock_actual?: number
          stock_minimo?: number
          unidad?: Database["public"]["Enums"]["unidad_material"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materiales_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_materiales"
            referencedColumns: ["id"]
          },
        ]
      }
      proyecto_instaladores: {
        Row: {
          created_at: string
          fecha_asignacion: string
          fecha_fin: string | null
          horas_trabajadas: number | null
          instalador_id: string
          notas: string | null
          proyecto_id: string
          rol_en_proyecto: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          fecha_asignacion?: string
          fecha_fin?: string | null
          horas_trabajadas?: number | null
          instalador_id: string
          notas?: string | null
          proyecto_id: string
          rol_en_proyecto?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          fecha_asignacion?: string
          fecha_fin?: string | null
          horas_trabajadas?: number | null
          instalador_id?: string
          notas?: string | null
          proyecto_id?: string
          rol_en_proyecto?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proyecto_instaladores_instalador_id_fkey"
            columns: ["instalador_id"]
            isOneToOne: false
            referencedRelation: "instaladores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proyecto_instaladores_instalador_id_fkey"
            columns: ["instalador_id"]
            isOneToOne: false
            referencedRelation: "v_instaladores_carga"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proyecto_instaladores_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proyecto_instaladores_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "v_proyectos_resumen"
            referencedColumns: ["id"]
          },
        ]
      }
      proyecto_materiales: {
        Row: {
          cantidad_estimada: number
          cantidad_real: number | null
          created_at: string
          fecha_instalacion: string | null
          instalado: boolean
          material_id: string
          precio_unitario_snapshot: number
          proyecto_id: string
          unidad: Database["public"]["Enums"]["unidad_material"]
          updated_at: string
        }
        Insert: {
          cantidad_estimada: number
          cantidad_real?: number | null
          created_at?: string
          fecha_instalacion?: string | null
          instalado?: boolean
          material_id: string
          precio_unitario_snapshot: number
          proyecto_id: string
          unidad: Database["public"]["Enums"]["unidad_material"]
          updated_at?: string
        }
        Update: {
          cantidad_estimada?: number
          cantidad_real?: number | null
          created_at?: string
          fecha_instalacion?: string | null
          instalado?: boolean
          material_id?: string
          precio_unitario_snapshot?: number
          proyecto_id?: string
          unidad?: Database["public"]["Enums"]["unidad_material"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proyecto_materiales_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proyecto_materiales_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proyecto_materiales_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "v_proyectos_resumen"
            referencedColumns: ["id"]
          },
        ]
      }
      proyectos: {
        Row: {
          area_m2: number | null
          ciudad_instalacion: string
          cliente_id: string
          codigo_proyecto: string
          coordenadas_lat: number | null
          coordenadas_lng: number | null
          costo_real: number | null
          created_at: string
          created_by: string | null
          departamento_instalacion: string | null
          descripcion: string | null
          direccion_instalacion: string
          documentos_url: string[] | null
          estado: Database["public"]["Enums"]["estado_proyecto"]
          fecha_fin_estimada: string | null
          fecha_fin_real: string | null
          fecha_inicio_estimada: string | null
          fecha_inicio_real: string | null
          id: string
          nombre: string
          notas_cliente: string | null
          notas_internas: string | null
          num_paneles: number | null
          porcentaje_anticipo: number | null
          potencia_kwp: number | null
          presupuesto_estimado: number | null
          prioridad: number
          updated_at: string
        }
        Insert: {
          area_m2?: number | null
          ciudad_instalacion: string
          cliente_id: string
          codigo_proyecto: string
          coordenadas_lat?: number | null
          coordenadas_lng?: number | null
          costo_real?: number | null
          created_at?: string
          created_by?: string | null
          departamento_instalacion?: string | null
          descripcion?: string | null
          direccion_instalacion: string
          documentos_url?: string[] | null
          estado?: Database["public"]["Enums"]["estado_proyecto"]
          fecha_fin_estimada?: string | null
          fecha_fin_real?: string | null
          fecha_inicio_estimada?: string | null
          fecha_inicio_real?: string | null
          id?: string
          nombre: string
          notas_cliente?: string | null
          notas_internas?: string | null
          num_paneles?: number | null
          porcentaje_anticipo?: number | null
          potencia_kwp?: number | null
          presupuesto_estimado?: number | null
          prioridad?: number
          updated_at?: string
        }
        Update: {
          area_m2?: number | null
          ciudad_instalacion?: string
          cliente_id?: string
          codigo_proyecto?: string
          coordenadas_lat?: number | null
          coordenadas_lng?: number | null
          costo_real?: number | null
          created_at?: string
          created_by?: string | null
          departamento_instalacion?: string | null
          descripcion?: string | null
          direccion_instalacion?: string
          documentos_url?: string[] | null
          estado?: Database["public"]["Enums"]["estado_proyecto"]
          fecha_fin_estimada?: string | null
          fecha_fin_real?: string | null
          fecha_inicio_estimada?: string | null
          fecha_inicio_real?: string | null
          id?: string
          nombre?: string
          notas_cliente?: string | null
          notas_internas?: string | null
          num_paneles?: number | null
          porcentaje_anticipo?: number | null
          potencia_kwp?: number | null
          presupuesto_estimado?: number | null
          prioridad?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proyectos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_instaladores_carga: {
        Row: {
          activo: boolean | null
          especialidad:
            | Database["public"]["Enums"]["especialidad_instalador"]
            | null
          id: string | null
          nombre_completo: string | null
          proyectos_activos: number | null
          total_horas: number | null
        }
        Relationships: []
      }
      v_proyectos_resumen: {
        Row: {
          ciudad_instalacion: string | null
          cliente_email: string | null
          cliente_empresa: string | null
          cliente_nombre: string | null
          codigo_proyecto: string | null
          costo_materiales_estimado: number | null
          created_at: string | null
          estado: Database["public"]["Enums"]["estado_proyecto"] | null
          fecha_fin_estimada: string | null
          fecha_inicio_estimada: string | null
          id: string | null
          nombre: string | null
          num_instaladores: number | null
          num_materiales: number | null
          potencia_kwp: number | null
          presupuesto_estimado: number | null
          prioridad: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      especialidad_instalador:
        | "electrico"
        | "estructural"
        | "general"
        | "supervision"
      estado_proyecto:
        | "pendiente"
        | "en_progreso"
        | "completado"
        | "cancelado"
        | "en_revision"
      unidad_material:
        | "unidad"
        | "metro"
        | "metro_cuadrado"
        | "kilogramo"
        | "litro"
        | "rollo"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      especialidad_instalador: [
        "electrico",
        "estructural",
        "general",
        "supervision",
      ],
      estado_proyecto: [
        "pendiente",
        "en_progreso",
        "completado",
        "cancelado",
        "en_revision",
      ],
      unidad_material: [
        "unidad",
        "metro",
        "metro_cuadrado",
        "kilogramo",
        "litro",
        "rollo",
      ],
    },
  },
} as const
