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
      mas_bp: {
        Row: {
          cd_bp: string
          cd_company: string
          cd_cur: string | null
          cd_user_amd: string | null
          cd_user_reg: string | null
          dc_addr: string | null
          dc_email: string | null
          ext: Json | null
          fl_customer: boolean
          fl_vendor: boolean
          nm_bp: string
          no_tax_id: string | null
          no_tel: string | null
          row_version: number
          tm_amd: string | null
          tm_reg: string
        }
        Insert: {
          cd_bp: string
          cd_company: string
          cd_cur?: string | null
          cd_user_amd?: string | null
          cd_user_reg?: string | null
          dc_addr?: string | null
          dc_email?: string | null
          ext?: Json | null
          fl_customer?: boolean
          fl_vendor?: boolean
          nm_bp: string
          no_tax_id?: string | null
          no_tel?: string | null
          row_version?: number
          tm_amd?: string | null
          tm_reg?: string
        }
        Update: {
          cd_bp?: string
          cd_company?: string
          cd_cur?: string | null
          cd_user_amd?: string | null
          cd_user_reg?: string | null
          dc_addr?: string | null
          dc_email?: string | null
          ext?: Json | null
          fl_customer?: boolean
          fl_vendor?: boolean
          nm_bp?: string
          no_tax_id?: string | null
          no_tel?: string | null
          row_version?: number
          tm_amd?: string | null
          tm_reg?: string
        }
        Relationships: [
          {
            foreignKeyName: "mas_bp_cd_company_fkey"
            columns: ["cd_company"]
            isOneToOne: false
            referencedRelation: "mas_company"
            referencedColumns: ["cd_company"]
          },
          {
            foreignKeyName: "mas_bp_cd_cur_fkey"
            columns: ["cd_cur"]
            isOneToOne: false
            referencedRelation: "mas_cur"
            referencedColumns: ["cd_cur"]
          },
        ]
      }
      mas_company: {
        Row: {
          cd_company: string
          cd_cur_base: string
          dc_address1: string | null
          dc_address2: string | null
          dc_city: string | null
          dc_country: string | null
          dc_email: string | null
          dc_image_url: string | null
          dc_postal_code: string | null
          dc_state: string | null
          dc_website: string | null
          fl_active: boolean
          nm_company: string
          nm_short: string | null
          no_fax: string | null
          no_phone: string | null
          no_reg_no: string | null
          no_tax_id: string | null
          tm_amd: string | null
          tm_reg: string | null
        }
        Insert: {
          cd_company: string
          cd_cur_base?: string
          dc_address1?: string | null
          dc_address2?: string | null
          dc_city?: string | null
          dc_country?: string | null
          dc_email?: string | null
          dc_image_url?: string | null
          dc_postal_code?: string | null
          dc_state?: string | null
          dc_website?: string | null
          fl_active?: boolean
          nm_company: string
          nm_short?: string | null
          no_fax?: string | null
          no_phone?: string | null
          no_reg_no?: string | null
          no_tax_id?: string | null
          tm_amd?: string | null
          tm_reg?: string | null
        }
        Update: {
          cd_company?: string
          cd_cur_base?: string
          dc_address1?: string | null
          dc_address2?: string | null
          dc_city?: string | null
          dc_country?: string | null
          dc_email?: string | null
          dc_image_url?: string | null
          dc_postal_code?: string | null
          dc_state?: string | null
          dc_website?: string | null
          fl_active?: boolean
          nm_company?: string
          nm_short?: string | null
          no_fax?: string | null
          no_phone?: string | null
          no_reg_no?: string | null
          no_tax_id?: string | null
          tm_amd?: string | null
          tm_reg?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mas_company_cd_cur_base_fkey"
            columns: ["cd_cur_base"]
            isOneToOne: false
            referencedRelation: "mas_cur"
            referencedColumns: ["cd_cur"]
          },
        ]
      }
      mas_cur: {
        Row: {
          cd_cur: string
          cd_user_reg: string | null
          fl_active: boolean
          nm_cur: string
          no_dec: number
          row_version: number
          tm_reg: string
        }
        Insert: {
          cd_cur: string
          cd_user_reg?: string | null
          fl_active?: boolean
          nm_cur: string
          no_dec?: number
          row_version?: number
          tm_reg?: string
        }
        Update: {
          cd_cur?: string
          cd_user_reg?: string | null
          fl_active?: boolean
          nm_cur?: string
          no_dec?: number
          row_version?: number
          tm_reg?: string
        }
        Relationships: []
      }
      mas_cur_rate: {
        Row: {
          cd_cur_from: string
          cd_cur_to: string
          cd_user_reg: string | null
          dt_eff: string
          rt_ex: number
          tm_reg: string
        }
        Insert: {
          cd_cur_from: string
          cd_cur_to: string
          cd_user_reg?: string | null
          dt_eff: string
          rt_ex: number
          tm_reg?: string
        }
        Update: {
          cd_cur_from?: string
          cd_cur_to?: string
          cd_user_reg?: string | null
          dt_eff?: string
          rt_ex?: number
          tm_reg?: string
        }
        Relationships: [
          {
            foreignKeyName: "mas_cur_rate_cd_cur_from_fkey"
            columns: ["cd_cur_from"]
            isOneToOne: false
            referencedRelation: "mas_cur"
            referencedColumns: ["cd_cur"]
          },
          {
            foreignKeyName: "mas_cur_rate_cd_cur_to_fkey"
            columns: ["cd_cur_to"]
            isOneToOne: false
            referencedRelation: "mas_cur"
            referencedColumns: ["cd_cur"]
          },
        ]
      }
      mas_io_type: {
        Row: {
          cd_io_type: string
          cd_user_reg: string | null
          fg_slip: number
          fl_active: boolean
          nm_io_type: string
          row_version: number
          tm_reg: string
        }
        Insert: {
          cd_io_type: string
          cd_user_reg?: string | null
          fg_slip: number
          fl_active?: boolean
          nm_io_type: string
          row_version?: number
          tm_reg?: string
        }
        Update: {
          cd_io_type?: string
          cd_user_reg?: string | null
          fg_slip?: number
          fl_active?: boolean
          nm_io_type?: string
          row_version?: number
          tm_reg?: string
        }
        Relationships: []
      }
      mas_item: {
        Row: {
          am_cost: number | null
          cd_category: string | null
          cd_company: string
          cd_item: string
          cd_uom: string
          cd_user_amd: string | null
          cd_user_reg: string | null
          ext: Json | null
          fg_type: number
          fl_active: boolean
          fl_lot: boolean
          nm_item: string
          pr_px: number | null
          row_version: number
          tm_amd: string | null
          tm_reg: string
        }
        Insert: {
          am_cost?: number | null
          cd_category?: string | null
          cd_company: string
          cd_item: string
          cd_uom: string
          cd_user_amd?: string | null
          cd_user_reg?: string | null
          ext?: Json | null
          fg_type?: number
          fl_active?: boolean
          fl_lot?: boolean
          nm_item: string
          pr_px?: number | null
          row_version?: number
          tm_amd?: string | null
          tm_reg?: string
        }
        Update: {
          am_cost?: number | null
          cd_category?: string | null
          cd_company?: string
          cd_item?: string
          cd_uom?: string
          cd_user_amd?: string | null
          cd_user_reg?: string | null
          ext?: Json | null
          fg_type?: number
          fl_active?: boolean
          fl_lot?: boolean
          nm_item?: string
          pr_px?: number | null
          row_version?: number
          tm_amd?: string | null
          tm_reg?: string
        }
        Relationships: [
          {
            foreignKeyName: "mas_item_cd_company_fkey"
            columns: ["cd_company"]
            isOneToOne: false
            referencedRelation: "mas_company"
            referencedColumns: ["cd_company"]
          },
          {
            foreignKeyName: "mas_item_cd_uom_fkey"
            columns: ["cd_uom"]
            isOneToOne: false
            referencedRelation: "mas_uom"
            referencedColumns: ["cd_uom"]
          },
        ]
      }
      mas_src_type: {
        Row: {
          cd_src_table: string | null
          cd_src_type: string
          cd_user_reg: string | null
          fl_active: boolean
          nm_src_type: string
          row_version: number
          tm_reg: string
        }
        Insert: {
          cd_src_table?: string | null
          cd_src_type: string
          cd_user_reg?: string | null
          fl_active?: boolean
          nm_src_type: string
          row_version?: number
          tm_reg?: string
        }
        Update: {
          cd_src_table?: string | null
          cd_src_type?: string
          cd_user_reg?: string | null
          fl_active?: boolean
          nm_src_type?: string
          row_version?: number
          tm_reg?: string
        }
        Relationships: []
      }
      mas_uom: {
        Row: {
          cd_uom: string
          cd_user_reg: string | null
          fl_active: boolean
          nm_uom: string
          row_version: number
          tm_reg: string
        }
        Insert: {
          cd_uom: string
          cd_user_reg?: string | null
          fl_active?: boolean
          nm_uom: string
          row_version?: number
          tm_reg?: string
        }
        Update: {
          cd_uom?: string
          cd_user_reg?: string | null
          fl_active?: boolean
          nm_uom?: string
          row_version?: number
          tm_reg?: string
        }
        Relationships: []
      }
      mas_uom_conv: {
        Row: {
          cd_uom_from: string
          cd_uom_to: string
          rt_factor: number
        }
        Insert: {
          cd_uom_from: string
          cd_uom_to: string
          rt_factor: number
        }
        Update: {
          cd_uom_from?: string
          cd_uom_to?: string
          rt_factor?: number
        }
        Relationships: [
          {
            foreignKeyName: "mas_uom_conv_cd_uom_from_fkey"
            columns: ["cd_uom_from"]
            isOneToOne: false
            referencedRelation: "mas_uom"
            referencedColumns: ["cd_uom"]
          },
          {
            foreignKeyName: "mas_uom_conv_cd_uom_to_fkey"
            columns: ["cd_uom_to"]
            isOneToOne: false
            referencedRelation: "mas_uom"
            referencedColumns: ["cd_uom"]
          },
        ]
      }
      mas_wh: {
        Row: {
          cd_company: string
          cd_user_amd: string | null
          cd_user_reg: string | null
          cd_wh: string
          dc_addr: string | null
          ext: Json | null
          fl_active: boolean
          nm_wh: string
          row_version: number
          tm_amd: string | null
          tm_reg: string
        }
        Insert: {
          cd_company: string
          cd_user_amd?: string | null
          cd_user_reg?: string | null
          cd_wh: string
          dc_addr?: string | null
          ext?: Json | null
          fl_active?: boolean
          nm_wh: string
          row_version?: number
          tm_amd?: string | null
          tm_reg?: string
        }
        Update: {
          cd_company?: string
          cd_user_amd?: string | null
          cd_user_reg?: string | null
          cd_wh?: string
          dc_addr?: string | null
          ext?: Json | null
          fl_active?: boolean
          nm_wh?: string
          row_version?: number
          tm_amd?: string | null
          tm_reg?: string
        }
        Relationships: [
          {
            foreignKeyName: "mas_wh_cd_company_fkey"
            columns: ["cd_company"]
            isOneToOne: false
            referencedRelation: "mas_company"
            referencedColumns: ["cd_company"]
          },
        ]
      }
      sys_companymenu: {
        Row: {
          cd_company: string
          cd_menu: string
          tm_reg: string | null
        }
        Insert: {
          cd_company: string
          cd_menu: string
          tm_reg?: string | null
        }
        Update: {
          cd_company?: string
          cd_menu?: string
          tm_reg?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_companymenu_company"
            columns: ["cd_company"]
            isOneToOne: false
            referencedRelation: "mas_company"
            referencedColumns: ["cd_company"]
          },
          {
            foreignKeyName: "fk_companymenu_menu"
            columns: ["cd_menu"]
            isOneToOne: false
            referencedRelation: "sys_menu"
            referencedColumns: ["cd_menu"]
          },
        ]
      }
      sys_menu: {
        Row: {
          cd_menu: string
          cd_menu_parent: string | null
          cd_module: string | null
          fg_type: string | null
          nm_menu: string
          nm_netwindow: string
          no_pos: string | null
        }
        Insert: {
          cd_menu: string
          cd_menu_parent?: string | null
          cd_module?: string | null
          fg_type?: string | null
          nm_menu: string
          nm_netwindow: string
          no_pos?: string | null
        }
        Update: {
          cd_menu?: string
          cd_menu_parent?: string | null
          cd_module?: string | null
          fg_type?: string | null
          nm_menu?: string
          nm_netwindow?: string
          no_pos?: string | null
        }
        Relationships: []
      }
      sys_rolemenu: {
        Row: {
          cd_menu: string
          fg_role: string
        }
        Insert: {
          cd_menu: string
          fg_role: string
        }
        Update: {
          cd_menu?: string
          fg_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_rolemenu_menu"
            columns: ["cd_menu"]
            isOneToOne: false
            referencedRelation: "sys_menu"
            referencedColumns: ["cd_menu"]
          },
        ]
      }
      sys_user: {
        Row: {
          cd_com: string
          cd_user: string
          cd_user_amd: string | null
          cd_user_reg: string | null
          dc_address1: string | null
          dc_address2: string | null
          dc_email: string | null
          dc_password: string
          dt_reg: string
          fg_role: string
          nm_user: string
          no_tel: string | null
          tm_amd: string | null
          tm_reg: string | null
          yn_active: string
        }
        Insert: {
          cd_com: string
          cd_user: string
          cd_user_amd?: string | null
          cd_user_reg?: string | null
          dc_address1?: string | null
          dc_address2?: string | null
          dc_email?: string | null
          dc_password: string
          dt_reg: string
          fg_role: string
          nm_user: string
          no_tel?: string | null
          tm_amd?: string | null
          tm_reg?: string | null
          yn_active?: string
        }
        Update: {
          cd_com?: string
          cd_user?: string
          cd_user_amd?: string | null
          cd_user_reg?: string | null
          dc_address1?: string | null
          dc_address2?: string | null
          dc_email?: string | null
          dc_password?: string
          dt_reg?: string
          fg_role?: string
          nm_user?: string
          no_tel?: string | null
          tm_amd?: string | null
          tm_reg?: string | null
          yn_active?: string
        }
        Relationships: []
      }
      sys_user_company: {
        Row: {
          cd_company: string
          role: string
          tm_reg: string
          user_id: string
        }
        Insert: {
          cd_company: string
          role?: string
          tm_reg?: string
          user_id: string
        }
        Update: {
          cd_company?: string
          role?: string
          tm_reg?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sys_user_company_cd_company_fkey"
            columns: ["cd_company"]
            isOneToOne: false
            referencedRelation: "mas_company"
            referencedColumns: ["cd_company"]
          },
        ]
      }
      sys_usermenu: {
        Row: {
          cd_company: string
          cd_menu: string
          cd_user: string
          fg_action: string
          tm_reg: string | null
        }
        Insert: {
          cd_company: string
          cd_menu: string
          cd_user: string
          fg_action?: string
          tm_reg?: string | null
        }
        Update: {
          cd_company?: string
          cd_menu?: string
          cd_user?: string
          fg_action?: string
          tm_reg?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_usermenu_menu"
            columns: ["cd_menu"]
            isOneToOne: false
            referencedRelation: "sys_menu"
            referencedColumns: ["cd_menu"]
          },
          {
            foreignKeyName: "fk_usermenu_user"
            columns: ["cd_company", "cd_user"]
            isOneToOne: false
            referencedRelation: "sys_user"
            referencedColumns: ["cd_com", "cd_user"]
          },
        ]
      }
      v_pk_params: {
        Row: {
          string_agg: string | null
        }
        Insert: {
          string_agg?: string | null
        }
        Update: {
          string_agg?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      my_companies: {
        Args: Record<PropertyKey, never>
        Returns: string[]
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
