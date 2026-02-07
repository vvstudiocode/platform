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
      billing_transactions: {
        Row: {
          amount: number
          fee_amount: number
          id: string
          occurred_at: string | null
          order_id: string | null
          provider: string
          provider_transaction_id: string | null
          tenant_id: string
          transaction_type: string
        }
        Insert: {
          amount: number
          fee_amount: number
          id?: string
          occurred_at?: string | null
          order_id?: string | null
          provider: string
          provider_transaction_id?: string | null
          tenant_id: string
          transaction_type: string
        }
        Update: {
          amount?: number
          fee_amount?: number
          id?: string
          occurred_at?: string | null
          order_id?: string | null
          provider?: string
          provider_transaction_id?: string | null
          tenant_id?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string | null
          id: string
          name: string
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string | null
          sort_order: number | null
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug?: string | null
          sort_order?: number | null
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string | null
          sort_order?: number | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      nav_items: {
        Row: {
          created_at: string | null
          id: string
          page_id: string | null
          parent_id: string | null
          position: number
          tenant_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          page_id?: string | null
          parent_id?: string | null
          position?: number
          tenant_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          page_id?: string | null
          parent_id?: string | null
          position?: number
          tenant_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "nav_items_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nav_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "nav_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nav_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_email: string | null
          customer_line_id: string | null
          customer_name: string
          customer_phone: string
          discount_type: string | null
          discount_value: number | null
          id: string
          items: Json
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          shipping_address: string | null
          shipping_fee: number | null
          shipping_method: string | null
          status: string | null
          store_address: string | null
          store_code: string | null
          store_name: string | null
          subtotal: number | null
          tenant_id: string | null
          total: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_email?: string | null
          customer_line_id?: string | null
          customer_name: string
          customer_phone: string
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          items?: Json
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: string | null
          shipping_fee?: number | null
          shipping_method?: string | null
          status?: string | null
          store_address?: string | null
          store_code?: string | null
          store_name?: string | null
          subtotal?: number | null
          tenant_id?: string | null
          total?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_email?: string | null
          customer_line_id?: string | null
          customer_name?: string
          customer_phone?: string
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: string | null
          shipping_fee?: number | null
          shipping_method?: string | null
          status?: string | null
          store_address?: string | null
          store_code?: string | null
          store_name?: string | null
          subtotal?: number | null
          tenant_id?: string | null
          total?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          background_color: string | null
          content: Json | null
          created_at: string | null
          id: string
          is_homepage: boolean | null
          meta_description: string | null
          meta_title: string | null
          nav_order: number | null
          og_image: string | null
          page_type: string | null
          published: boolean | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          show_in_nav: boolean | null
          slug: string
          tenant_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          background_color?: string | null
          content?: Json | null
          created_at?: string | null
          id?: string
          is_homepage?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          nav_order?: number | null
          og_image?: string | null
          page_type?: string | null
          published?: boolean | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          show_in_nav?: boolean | null
          slug: string
          tenant_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          background_color?: string | null
          content?: Json | null
          created_at?: string | null
          id?: string
          is_homepage?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          nav_order?: number | null
          og_image?: string | null
          page_type?: string | null
          published?: boolean | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          show_in_nav?: boolean | null
          slug?: string
          tenant_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string | null
          features: Json | null
          id: string
          max_products: number | null
          name: string
          price_monthly: number
          storage_limit_mb: number
          transaction_fee_percent: number
        }
        Insert: {
          created_at?: string | null
          features?: Json | null
          id: string
          max_products?: number | null
          name: string
          price_monthly: number
          storage_limit_mb?: number
          transaction_fee_percent: number
        }
        Update: {
          created_at?: string | null
          features?: Json | null
          id?: string
          max_products?: number | null
          name?: string
          price_monthly?: number
          storage_limit_mb?: number
          transaction_fee_percent?: number
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          created_at: string | null
          id: string
          name: string
          options: Json
          price: number | null
          product_id: string | null
          sku: string | null
          stock: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          options: Json
          price?: number | null
          product_id?: string | null
          sku?: string | null
          stock?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          options?: Json
          price?: number | null
          product_id?: string | null
          sku?: string | null
          stock?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category: string | null
          cost: number | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          images: Json | null
          name: string
          options: Json | null
          price: number
          price_krw: number | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          sku: string | null
          sort_order: number | null
          status: string | null
          stock: number | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          brand?: string | null
          category?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: Json | null
          name: string
          options?: Json | null
          price?: number
          price_krw?: number | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          sku?: string | null
          sort_order?: number | null
          status?: string | null
          stock?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          brand?: string | null
          category?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          images?: Json | null
          name?: string
          options?: Json | null
          price?: number
          price_krw?: number | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          sku?: string | null
          sort_order?: number | null
          status?: string | null
          stock?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_secrets: {
        Row: {
          created_at: string | null
          encrypted_value: string
          id: string
          key_id: string | null
          secret_type: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          encrypted_value: string
          id?: string
          key_id?: string | null
          secret_type: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          encrypted_value?: string
          id?: string
          key_id?: string | null
          secret_type?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_secrets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string | null
          custom_domain: string | null
          description: string | null
          ecpay_card_id: string | null
          footer_settings: Json | null
          id: string
          is_hq: boolean | null
          logo_url: string | null
          managed_by: string | null
          name: string
          next_billing_at: string | null
          og_image: string | null
          owner_id: string | null
          plan_id: string | null
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          settings: Json | null
          slug: string
          storage_usage_mb: number | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_domain?: string | null
          description?: string | null
          ecpay_card_id?: string | null
          footer_settings?: Json | null
          id?: string
          is_hq?: boolean | null
          logo_url?: string | null
          managed_by?: string | null
          name: string
          next_billing_at?: string | null
          og_image?: string | null
          owner_id?: string | null
          plan_id?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          settings?: Json | null
          slug: string
          storage_usage_mb?: number | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_domain?: string | null
          description?: string | null
          ecpay_card_id?: string | null
          footer_settings?: Json | null
          id?: string
          is_hq?: boolean | null
          logo_url?: string | null
          managed_by?: string | null
          name?: string
          next_billing_at?: string | null
          og_image?: string | null
          owner_id?: string | null
          plan_id?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          settings?: Json | null
          slug?: string
          storage_usage_mb?: number | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      users_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_tenant: { Args: { tenant_uuid: string }; Returns: boolean }
      decrement_stock: {
        Args: { amount: number; product_uuid: string }
        Returns: undefined
      }
      get_tenant_secret: {
        Args: {
          p_encryption_key: string
          p_secret_type: string
          p_tenant_id: string
        }
        Returns: string
      }
      is_platform_admin: { Args: never; Returns: boolean }
      set_tenant_secret: {
        Args: {
          p_encryption_key: string
          p_raw_value: string
          p_secret_type: string
          p_tenant_id: string
        }
        Returns: undefined
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
