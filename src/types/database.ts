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
      alimentos: {
        Row: {
          activo: boolean
          codigo: number
          created_at: string
          descripcion: string
          fabricante_alimento_id: number
        }
        Insert: {
          activo?: boolean
          codigo?: number
          created_at?: string
          descripcion: string
          fabricante_alimento_id: number
        }
        Update: {
          activo?: boolean
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
      cortes: {
        Row: {
          created_at: string | null
          estado: string
          fecha_final: string | null
          fecha_inicio: string
          galpon_id: number
          id: number
          notas: string | null
          numero_aves: number
          saldo_aves: number
          tipo_ave: string | null
        }
        Insert: {
          created_at?: string | null
          estado?: string
          fecha_final?: string | null
          fecha_inicio: string
          galpon_id: number
          id?: number
          notas?: string | null
          numero_aves: number
          saldo_aves?: number
          tipo_ave?: string | null
        }
        Update: {
          created_at?: string | null
          estado?: string
          fecha_final?: string | null
          fecha_inicio?: string
          galpon_id?: number
          id?: number
          notas?: string | null
          numero_aves?: number
          saldo_aves?: number
          tipo_ave?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cortes_galpon_id_fkey"
            columns: ["galpon_id"]
            isOneToOne: false
            referencedRelation: "galpones"
            referencedColumns: ["id"]
          },
        ]
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
          id: number
          operario_id: string
        }
        Insert: {
          galpon_id: number
          id?: number
          operario_id: string
        }
        Update: {
          galpon_id?: number
          id?: number
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
      recoleccion_huevos: {
        Row: {
          galpon_id: number
          fecha: string
          numero_secuencia: number
          cantidad_huevos: number
        }
        Insert: {
          galpon_id: number
          fecha: string
          numero_secuencia: number
          cantidad_huevos: number
        }
        Update: {
          galpon_id?: number
          fecha?: string
          numero_secuencia?: number
          cantidad_huevos?: number
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
      registro_diario_galpon: {
        Row: {
          galpon_id: number
          fecha: string
          producto_alimento_codigo: number
          cantidad_alimento_bultos: number
          numero_aves_muertas: number
          causa_mortalidad_codigo: string | null
        }
        Insert: {
          galpon_id: number
          fecha: string
          producto_alimento_codigo?: number
          cantidad_alimento_bultos?: number
          numero_aves_muertas?: number
          causa_mortalidad_codigo?: string | null
        }
        Update: {
          galpon_id?: number
          fecha?: string
          producto_alimento_codigo?: number
          cantidad_alimento_bultos?: number
          numero_aves_muertas?: number
          causa_mortalidad_codigo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registro_diario_galpon_galpon_id_fkey"
            columns: ["galpon_id"]
            isOneToOne: false
            referencedRelation: "galpones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registro_diario_galpon_producto_alimento_codigo_fkey"
            columns: ["producto_alimento_codigo"]
            isOneToOne: false
            referencedRelation: "alimentos"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "registro_diario_galpon_causa_mortalidad_codigo_fkey"
            columns: ["causa_mortalidad_codigo"]
            isOneToOne: false
            referencedRelation: "causas_mortalidad"
            referencedColumns: ["codigo"]
          },
        ]
      }
      produccion: {
        Row: {
          cantidad: number
          fecha: string
          galpon_id: number
          numero_secuencia: number
          producto_codigo: number
        }
        Insert: {
          cantidad: number
          fecha: string
          galpon_id: number
          numero_secuencia: number
          producto_codigo: number
        }
        Update: {
          cantidad?: number
          fecha?: string
          galpon_id?: number
          numero_secuencia?: number
          producto_codigo?: number
        }
        Relationships: [
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
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
