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
      activities: {
        Row: {
          created_at: string
          description: string
          id: string
          project_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          project_id: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          project_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_item_photos: {
        Row: {
          created_at: string
          id: string
          item_id: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          storage_path: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_item_photos_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          checked: boolean
          checklist_id: string
          created_at: string
          due_date: string | null
          id: string
          responsible_name: string | null
          sort_order: number
          text: string
        }
        Insert: {
          checked?: boolean
          checklist_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          responsible_name?: string | null
          sort_order?: number
          text: string
        }
        Update: {
          checked?: boolean
          checklist_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          responsible_name?: string | null
          sort_order?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          name: string
          project_id: string
          responsible_name: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          name: string
          project_id: string
          responsible_name?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          name?: string
          project_id?: string
          responsible_name?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklists_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type?: string
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: string
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          address: string | null
          created_at: string
          end_date: string | null
          id: string
          name: string
          owner_id: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          owner_id: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          owner_id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      rdo_photos: {
        Row: {
          annotations_json: Json | null
          caption: string | null
          id: string
          rdo_id: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          annotations_json?: Json | null
          caption?: string | null
          id?: string
          rdo_id: string
          sort_order?: number
          storage_path: string
        }
        Update: {
          annotations_json?: Json | null
          caption?: string | null
          id?: string
          rdo_id?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "rdo_photos_rdo_id_fkey"
            columns: ["rdo_id"]
            isOneToOne: false
            referencedRelation: "rdos"
            referencedColumns: ["id"]
          },
        ]
      }
      rdo_team_members: {
        Row: {
          hours_worked: number
          id: string
          name: string
          rdo_id: string
          role: string | null
        }
        Insert: {
          hours_worked?: number
          id?: string
          name: string
          rdo_id: string
          role?: string | null
        }
        Update: {
          hours_worked?: number
          id?: string
          name?: string
          rdo_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rdo_team_members_rdo_id_fkey"
            columns: ["rdo_id"]
            isOneToOne: false
            referencedRelation: "rdos"
            referencedColumns: ["id"]
          },
        ]
      }
      rdos: {
        Row: {
          activities: string | null
          created_at: string
          date: string
          id: string
          observations: string | null
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activities?: string | null
          created_at?: string
          date: string
          id?: string
          observations?: string | null
          project_id: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          activities?: string | null
          created_at?: string
          date?: string
          id?: string
          observations?: string | null
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rdos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      stages: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          environment: string | null
          id: string
          predecessor_id: string | null
          progress: number
          project_id: string
          responsible_name: string | null
          service_type: string
          start_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          environment?: string | null
          id?: string
          predecessor_id?: string | null
          progress?: number
          project_id: string
          responsible_name?: string | null
          service_type?: string
          start_date: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          environment?: string | null
          id?: string
          predecessor_id?: string | null
          progress?: number
          project_id?: string
          responsible_name?: string | null
          service_type?: string
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stages_predecessor_id_fkey"
            columns: ["predecessor_id"]
            isOneToOne: false
            referencedRelation: "stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
  public: {
    Enums: {},
  },
} as const
