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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alimentos: {
        Row: {
          activo: boolean
          categoria: string
          codigo: number
          created_at: string
          descripcion: string
          fabricante_alimento_id: number
        }
        Insert: {
          activo?: boolean
          categoria?: string
          codigo?: number
          created_at?: string
          descripcion: string
          fabricante_alimento_id: number
        }
        Update: {
          activo?: boolean
          categoria?: string
          codigo?: number
          created_at?: string
          descripcion?: string
          fabricante_alimento_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "alimentos_fabricante_alimento_id_fkey"
            columns: ["fabricante_alimento_id"]
            isOneToOne: false
            referencedRelation: "fabricantes_alimento"
            referencedColumns: ["id"]
          },
        ]
      }
      causas_mortalidad: {
        Row: {
          codigo: string
          descripcion: string
        }
        Insert: {
          codigo: string
          descripcion: string
        }
        Update: {
          codigo?: string
          descripcion?: string
        }
        Relationships: []
      }
      corte_galpones: {
        Row: {
          aves_iniciales: number
          corte_id: number
          created_at: string
          galpon_id: number
          saldo_aves: number
        }
        Insert: {
          aves_iniciales: number
          corte_id: number
          created_at?: string
          galpon_id: number
          saldo_aves: number
        }
        Update: {
          aves_iniciales?: number
          corte_id?: number
          created_at?: string
          galpon_id?: number
          saldo_aves?: number
        }
        Relationships: [
          {
            foreignKeyName: "corte_galpones_corte_id_fkey"
            columns: ["corte_id"]
            isOneToOne: false
            referencedRelation: "cortes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corte_galpones_galpon_id_fkey"
            columns: ["galpon_id"]
            isOneToOne: false
            referencedRelation: "galpones"
            referencedColumns: ["id"]
          },
        ]
      }
      cortes: {
        Row: {
          created_at: string | null
          estado: string
          fecha_final: string | null
          fecha_inicio: string
          id: number
          notas: string | null
          numero_aves_total: number
          raza_ave_id: number
          saldo_aves_total: number
        }
        Insert: {
          created_at?: string | null
          estado?: string
          fecha_final?: string | null
          fecha_inicio: string
          id?: number
          notas?: string | null
          numero_aves_total: number
          raza_ave_id: number
          saldo_aves_total: number
        }
        Update: {
          created_at?: string | null
          estado?: string
          fecha_final?: string | null
          fecha_inicio?: string
          id?: number
          notas?: string | null
          numero_aves_total?: number
          raza_ave_id?: number
          saldo_aves_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "cortes_raza_ave_id_fkey"
            columns: ["raza_ave_id"]
            isOneToOne: false
            referencedRelation: "razas_ave"
            referencedColumns: ["id"]
          },
        ]
      }
      fabricantes_alimento: {
        Row: {
          created_at: string
          id: number
          nombre: string
        }
        Insert: {
          created_at?: string
          id?: number
          nombre: string
        }
        Update: {
          created_at?: string
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      fincas: {
        Row: {
          created_at: string | null
          id: number
          nombre: string
          ubicacion: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          nombre: string
          ubicacion?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          nombre?: string
          ubicacion?: string | null
        }
        Relationships: []
      }
      galpones: {
        Row: {
          capacidad: number | null
          created_at: string | null
          finca_id: number
          id: number
          nombre: string
          saldo_aves: number
        }
        Insert: {
          capacidad?: number | null
          created_at?: string | null
          finca_id: number
          id?: number
          nombre: string
          saldo_aves?: number
        }
        Update: {
          capacidad?: number | null
          created_at?: string | null
          finca_id?: number
          id?: number
          nombre?: string
          saldo_aves?: number
        }
        Relationships: [
          {
            foreignKeyName: "galpones_finca_id_fkey"
            columns: ["finca_id"]
            isOneToOne: false
            referencedRelation: "fincas"
            referencedColumns: ["id"]
          },
        ]
      }
      operario_galpones: {
        Row: {
          galpon_id: number
          operario_id: string
        }
        Insert: {
          galpon_id: number
          operario_id: string
        }
        Update: {
          galpon_id?: number
          operario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "operario_galpones_galpon_id_fkey"
            columns: ["galpon_id"]
            isOneToOne: false
            referencedRelation: "galpones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operario_galpones_operario_id_fkey"
            columns: ["operario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      produccion: {
        Row: {
          cantidad: number
          corte_id: number | null
          fecha: string
          galpon_id: number
          numero_secuencia: number
          producto_codigo: number
        }
        Insert: {
          cantidad: number
          corte_id?: number | null
          fecha: string
          galpon_id: number
          numero_secuencia: number
          producto_codigo: number
        }
        Update: {
          cantidad?: number
          corte_id?: number | null
          fecha?: string
          galpon_id?: number
          numero_secuencia?: number
          producto_codigo?: number
        }
        Relationships: [
          {
            foreignKeyName: "produccion_corte_galpon_fkey"
            columns: ["corte_id", "galpon_id"]
            isOneToOne: false
            referencedRelation: "corte_galpones"
            referencedColumns: ["corte_id", "galpon_id"]
          },
          {
            foreignKeyName: "produccion_corte_id_fkey"
            columns: ["corte_id"]
            isOneToOne: false
            referencedRelation: "cortes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produccion_galpon_id_fkey"
            columns: ["galpon_id"]
            isOneToOne: false
            referencedRelation: "galpones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produccion_producto_codigo_fkey"
            columns: ["producto_codigo"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["codigo"]
          },
        ]
      }
      productos: {
        Row: {
          codigo: number
          descripcion: string | null
          id: string
          unidad_medida_codigo: string
        }
        Insert: {
          codigo?: number
          descripcion?: string | null
          id?: string
          unidad_medida_codigo: string
        }
        Update: {
          codigo?: number
          descripcion?: string | null
          id?: string
          unidad_medida_codigo?: string
        }
        Relationships: [
          {
            foreignKeyName: "productos_unidad_medida_codigo_fkey"
            columns: ["unidad_medida_codigo"]
            isOneToOne: false
            referencedRelation: "unidades_medida"
            referencedColumns: ["codigo"]
          },
        ]
      }
      profiles: {
        Row: {
          email: string | null
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          email?: string | null
          id: string
          role: string
          updated_at?: string | null
        }
        Update: {
          email?: string | null
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      razas_ave: {
        Row: {
          codigo: string
          descripcion: string | null
          id: number
        }
        Insert: {
          codigo: string
          descripcion?: string | null
          id?: number
        }
        Update: {
          codigo?: string
          descripcion?: string | null
          id?: number
        }
        Relationships: []
      }
      recoleccion_huevos: {
        Row: {
          cantidad_huevos: number
          fecha: string
          galpon_id: number
          numero_secuencia: number
        }
        Insert: {
          cantidad_huevos: number
          fecha: string
          galpon_id: number
          numero_secuencia: number
        }
        Update: {
          cantidad_huevos?: number
          fecha?: string
          galpon_id?: number
          numero_secuencia?: number
        }
        Relationships: [
          {
            foreignKeyName: "recoleccion_huevos_galpon_id_fkey"
            columns: ["galpon_id"]
            isOneToOne: false
            referencedRelation: "galpones"
            referencedColumns: ["id"]
          },
        ]
      }
      registro_alimentacion_galpon: {
        Row: {
          cantidad_alimento_bultos: number
          corte_id: number | null
          fecha: string
          galpon_id: number
          producto_alimento_codigo: number
        }
        Insert: {
          cantidad_alimento_bultos: number
          corte_id?: number | null
          fecha: string
          galpon_id: number
          producto_alimento_codigo: number
        }
        Update: {
          cantidad_alimento_bultos?: number
          corte_id?: number | null
          fecha?: string
          galpon_id?: number
          producto_alimento_codigo?: number
        }
        Relationships: [
          {
            foreignKeyName: "reg_alim_corte_galpon_fkey"
            columns: ["corte_id", "galpon_id"]
            isOneToOne: false
            referencedRelation: "corte_galpones"
            referencedColumns: ["corte_id", "galpon_id"]
          },
          {
            foreignKeyName: "reg_alim_galpon_corte_id_fkey"
            columns: ["corte_id"]
            isOneToOne: false
            referencedRelation: "cortes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registro_alimentacion_galpon_galpon_id_fkey"
            columns: ["galpon_id"]
            isOneToOne: false
            referencedRelation: "galpones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registro_alimentacion_galpon_producto_alimento_codigo_fkey"
            columns: ["producto_alimento_codigo"]
            isOneToOne: false
            referencedRelation: "alimentos"
            referencedColumns: ["codigo"]
          },
        ]
      }
      registro_mortalidad: {
        Row: {
          cantidad_aves_muertas: number
          causa_mortalidad_codigo: string
          corte_id: number | null
          created_at: string | null
          fecha: string
          galpon_id: number
          id: number
          numero_secuencia: number
        }
        Insert: {
          cantidad_aves_muertas: number
          causa_mortalidad_codigo: string
          corte_id?: number | null
          created_at?: string | null
          fecha: string
          galpon_id: number
          id?: number
          numero_secuencia: number
        }
        Update: {
          cantidad_aves_muertas?: number
          causa_mortalidad_codigo?: string
          corte_id?: number | null
          created_at?: string | null
          fecha?: string
          galpon_id?: number
          id?: number
          numero_secuencia?: number
        }
        Relationships: [
          {
            foreignKeyName: "reg_mort_corte_galpon_fkey"
            columns: ["corte_id", "galpon_id"]
            isOneToOne: false
            referencedRelation: "corte_galpones"
            referencedColumns: ["corte_id", "galpon_id"]
          },
          {
            foreignKeyName: "registro_mortalidad_causa_mortalidad_codigo_fkey"
            columns: ["causa_mortalidad_codigo"]
            isOneToOne: false
            referencedRelation: "causas_mortalidad"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "registro_mortalidad_corte_id_fkey"
            columns: ["corte_id"]
            isOneToOne: false
            referencedRelation: "cortes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registro_mortalidad_galpon_id_fkey"
            columns: ["galpon_id"]
            isOneToOne: false
            referencedRelation: "galpones"
            referencedColumns: ["id"]
          },
        ]
      }
      unidades_medida: {
        Row: {
          codigo: string
          id: string
          nombre: string
          valor_en_unidad_base: number
        }
        Insert: {
          codigo: string
          id?: string
          nombre: string
          valor_en_unidad_base: number
        }
        Update: {
          codigo?: string
          id?: string
          nombre?: string
          valor_en_unidad_base?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_saldo_delta_from_mortality: {
        Args: { p_delta: number; p_fecha: string; p_galpon_id: number }
        Returns: undefined
      }
      crear_corte_con_galpones: {
        Args: {
          p_fecha_inicio: string
          p_galpones?: Json
          p_notas?: string
          p_numero_aves_total?: number
          p_raza_ave_id?: number
          p_tipo_ave?: string
        }
        Returns: Json
      }
      create_corte_with_galpones: {
        Args: {
          p_fecha_inicio: string
          p_galpones?: Json
          p_notas?: string
          p_numero_aves_total?: number
          p_raza_ave_id?: number
          p_tipo_ave?: string
        }
        Returns: number
      }
      get_user_role: { Args: { user_id: string }; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      rebuild_saldos_from_events: { Args: never; Returns: undefined }
      resolve_corte_for_galpon_date: {
        Args: { p_fecha: string; p_galpon_id: number }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
