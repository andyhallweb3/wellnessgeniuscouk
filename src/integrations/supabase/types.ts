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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          ai_commercial_angle: string | null
          ai_summary: string | null
          ai_why_it_matters: string[] | null
          category: string
          content: string | null
          created_at: string
          excerpt: string | null
          id: string
          processed: boolean
          published_at: string
          source: string
          title: string
          url: string
        }
        Insert: {
          ai_commercial_angle?: string | null
          ai_summary?: string | null
          ai_why_it_matters?: string[] | null
          category?: string
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          processed?: boolean
          published_at?: string
          source: string
          title: string
          url: string
        }
        Update: {
          ai_commercial_angle?: string | null
          ai_summary?: string | null
          ai_why_it_matters?: string[] | null
          category?: string
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          processed?: boolean
          published_at?: string
          source?: string
          title?: string
          url?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          category: string
          content: string
          created_at: string
          excerpt: string
          featured: boolean
          id: string
          keywords: string[] | null
          meta_description: string | null
          meta_title: string | null
          published: boolean
          read_time: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          excerpt: string
          featured?: boolean
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean
          read_time?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          featured?: boolean
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean
          read_time?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      curated_news: {
        Row: {
          category: string
          created_at: string
          id: string
          image_url: string | null
          is_featured: boolean
          published_date: string
          source_name: string
          source_url: string
          summary: string
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean
          published_date?: string
          source_name: string
          source_url: string
          summary: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean
          published_date?: string
          source_name?: string
          source_url?: string
          summary?: string
          title?: string
        }
        Relationships: []
      }
      newsletter_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          link_url: string | null
          send_id: string
          subscriber_email: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          link_url?: string | null
          send_id: string
          subscriber_email: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          link_url?: string | null
          send_id?: string
          subscriber_email?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_events_send_id_fkey"
            columns: ["send_id"]
            isOneToOne: false
            referencedRelation: "newsletter_sends"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_send_recipients: {
        Row: {
          created_at: string
          email: string
          error_message: string | null
          id: string
          send_id: string
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          error_message?: string | null
          id?: string
          send_id: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          error_message?: string | null
          id?: string
          send_id?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_send_recipients_send_id_fkey"
            columns: ["send_id"]
            isOneToOne: false
            referencedRelation: "newsletter_sends"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_sends: {
        Row: {
          article_count: number
          article_ids: string[] | null
          email_html: string | null
          error_message: string | null
          id: string
          recipient_count: number
          sent_at: string
          status: string
          total_clicks: number | null
          total_opens: number | null
          unique_clicks: number | null
          unique_opens: number | null
        }
        Insert: {
          article_count?: number
          article_ids?: string[] | null
          email_html?: string | null
          error_message?: string | null
          id?: string
          recipient_count?: number
          sent_at?: string
          status?: string
          total_clicks?: number | null
          total_opens?: number | null
          unique_clicks?: number | null
          unique_opens?: number | null
        }
        Update: {
          article_count?: number
          article_ids?: string[] | null
          email_html?: string | null
          error_message?: string | null
          id?: string
          recipient_count?: number
          sent_at?: string
          status?: string
          total_clicks?: number | null
          total_opens?: number | null
          unique_clicks?: number | null
          unique_opens?: number | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          name: string | null
          source: string | null
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          name?: string | null
          source?: string | null
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          name?: string | null
          source?: string | null
          subscribed_at?: string
        }
        Relationships: []
      }
      rss_cache_metadata: {
        Row: {
          id: string
          items_count: number
          last_refresh: string
        }
        Insert: {
          id?: string
          items_count?: number
          last_refresh?: string
        }
        Update: {
          id?: string
          items_count?: number
          last_refresh?: string
        }
        Relationships: []
      }
      rss_news_cache: {
        Row: {
          category: string
          created_at: string
          fetched_at: string
          id: string
          image_url: string | null
          news_id: string
          published_date: string
          source_name: string
          source_url: string
          summary: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          fetched_at?: string
          id?: string
          image_url?: string | null
          news_id: string
          published_date: string
          source_name: string
          source_url: string
          summary: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          fetched_at?: string
          id?: string
          image_url?: string | null
          news_id?: string
          published_date?: string
          source_name?: string
          source_url?: string
          summary?: string
          title?: string
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
  public: {
    Enums: {},
  },
} as const
