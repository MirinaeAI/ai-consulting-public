export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string | null
        }
        Insert: {
          id: string
          email: string
          created_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tools: {
        Row: {
          id: string
          name: string
          description: string
          url: string
          price_min: number | null
          price_max: number | null
          is_free_tier: boolean | null
          created_at: string | null
          updated_at: string | null
          is_promoted: boolean | null
        }
        Insert: {
          id?: string
          name: string
          description: string
          url: string
          price_min?: number | null
          price_max?: number | null
          is_free_tier?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          is_promoted?: boolean | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          url?: string
          price_min?: number | null
          price_max?: number | null
          is_free_tier?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          is_promoted?: boolean | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
        }
        Relationships: []
      }
      tool_categories: {
        Row: {
          tool_id: string
          category_id: string
        }
        Insert: {
          tool_id: string
          category_id: string
        }
        Update: {
          tool_id?: string
          category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_categories_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_categories_tool_id_fkey"
            columns: ["tool_id"]
            referencedRelation: "tools"
            referencedColumns: ["id"]
          }
        ]
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          tool_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          tool_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          tool_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "favorites_tool_id_fkey"
            columns: ["tool_id"]
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          status: Database["public"]["Enums"]["subscription_status"]
          starts_at: string
          ends_at: string | null
          trial_ends_at: string | null
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["subscription_status"]
          starts_at?: string
          ends_at?: string | null
          trial_ends_at?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["subscription_status"]
          starts_at?: string
          ends_at?: string | null
          trial_ends_at?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      consultations: {
        Row: {
          id: string
          user_id: string | null
          purpose: string
          org_size: string | null
          budget: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          purpose: string
          org_size?: string | null
          budget?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          purpose?: string
          org_size?: string | null
          budget?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      recommendations: {
        Row: {
          id: string
          consultation_id: string
          tool_id: string
          order: number
          created_at: string | null
        }
        Insert: {
          id?: string
          consultation_id: string
          tool_id: string
          order: number
          created_at?: string | null
        }
        Update: {
          id?: string
          consultation_id?: string
          tool_id?: string
          order?: number
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_consultation_id_fkey"
            columns: ["consultation_id"]
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_tool_id_fkey"
            columns: ["tool_id"]
            referencedRelation: "tools"
            referencedColumns: ["id"]
          }
        ]
      }
      feedback: {
        Row: {
          id: string
          user_id: string | null
          consultation_id: string | null
          rating: number | null
          comment: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          consultation_id?: string | null
          rating?: number | null
          comment?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          consultation_id?: string | null
          rating?: number | null
          comment?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_consultation_id_fkey"
            columns: ["consultation_id"]
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tool_submissions: {
        Row: {
          id: string
          name: string
          description: string
          url: string
          submitter_email: string
          price_min: number | null
          price_max: number | null
          is_free_tier: boolean | null
          categories: string[] | null
          status: Database["public"]["Enums"]["submission_status"] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description: string
          url: string
          submitter_email: string
          price_min?: number | null
          price_max?: number | null
          is_free_tier?: boolean | null
          categories?: string[] | null
          status?: Database["public"]["Enums"]["submission_status"] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          url?: string
          submitter_email?: string
          price_min?: number | null
          price_max?: number | null
          is_free_tier?: boolean | null
          categories?: string[] | null
          status?: Database["public"]["Enums"]["submission_status"] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      advertiser_inquiries: {
        Row: {
          id: string
          company_name: string
          contact_name: string
          email: string
          phone: string | null
          budget: number | null
          message: string
          status: Database["public"]["Enums"]["inquiry_status"] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          company_name: string
          contact_name: string
          email: string
          phone?: string | null
          budget?: number | null
          message: string
          status?: Database["public"]["Enums"]["inquiry_status"] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_name?: string
          contact_name?: string
          email?: string
          phone?: string | null
          budget?: number | null
          message?: string
          status?: Database["public"]["Enums"]["inquiry_status"] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      popular_tools: {
        Row: {
          id: string | null
          name: string | null
          description: string | null
          url: string | null
          price_min: number | null
          price_max: number | null
          is_free_tier: boolean | null
          saved_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      has_active_subscription: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      has_active_trial: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      can_use_consultation: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      submission_status: "pending" | "approved" | "rejected"
      inquiry_status: "pending" | "contacted" | "completed" | "rejected"
      subscription_plan: "free" | "premium"
      subscription_status: "active" | "cancelled" | "expired" | "trial"
    }
  }
}