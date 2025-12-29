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
      agent_sessions: {
        Row: {
          created_at: string
          credit_cost: number
          id: string
          mode: string
          output_text: string | null
          prompt_input: string
          saved: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          credit_cost?: number
          id?: string
          mode: string
          output_text?: string | null
          prompt_input: string
          saved?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          credit_cost?: number
          id?: string
          mode?: string
          output_text?: string | null
          prompt_input?: string
          saved?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      ai_readiness_completions: {
        Row: {
          company: string | null
          company_size: string | null
          completed_at: string
          data_score: number | null
          email: string
          id: string
          industry: string | null
          ip_address: string | null
          leadership_score: number | null
          name: string | null
          overall_score: number
          people_score: number | null
          process_score: number | null
          risk_score: number | null
          role: string | null
          score_band: string | null
          user_agent: string | null
        }
        Insert: {
          company?: string | null
          company_size?: string | null
          completed_at?: string
          data_score?: number | null
          email: string
          id?: string
          industry?: string | null
          ip_address?: string | null
          leadership_score?: number | null
          name?: string | null
          overall_score: number
          people_score?: number | null
          process_score?: number | null
          risk_score?: number | null
          role?: string | null
          score_band?: string | null
          user_agent?: string | null
        }
        Update: {
          company?: string | null
          company_size?: string | null
          completed_at?: string
          data_score?: number | null
          email?: string
          id?: string
          industry?: string | null
          ip_address?: string | null
          leadership_score?: number | null
          name?: string | null
          overall_score?: number
          people_score?: number | null
          process_score?: number | null
          risk_score?: number | null
          role?: string | null
          score_band?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      articles: {
        Row: {
          ai_commercial_angle: string | null
          ai_summary: string | null
          ai_why_it_matters: string[] | null
          business_lens: string | null
          category: string
          content: string | null
          created_at: string
          excerpt: string | null
          id: string
          processed: boolean
          published_at: string
          score_commercial_impact: number | null
          score_novelty: number | null
          score_operator_relevance: number | null
          score_reasoning: string | null
          score_source_authority: number | null
          score_timeliness: number | null
          score_total: number | null
          score_wg_fit: number | null
          scored_at: string | null
          source: string
          title: string
          url: string
        }
        Insert: {
          ai_commercial_angle?: string | null
          ai_summary?: string | null
          ai_why_it_matters?: string[] | null
          business_lens?: string | null
          category?: string
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          processed?: boolean
          published_at?: string
          score_commercial_impact?: number | null
          score_novelty?: number | null
          score_operator_relevance?: number | null
          score_reasoning?: string | null
          score_source_authority?: number | null
          score_timeliness?: number | null
          score_total?: number | null
          score_wg_fit?: number | null
          scored_at?: string | null
          source: string
          title: string
          url: string
        }
        Update: {
          ai_commercial_angle?: string | null
          ai_summary?: string | null
          ai_why_it_matters?: string[] | null
          business_lens?: string | null
          category?: string
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          processed?: boolean
          published_at?: string
          score_commercial_impact?: number | null
          score_novelty?: number | null
          score_operator_relevance?: number | null
          score_reasoning?: string | null
          score_source_authority?: number | null
          score_timeliness?: number | null
          score_total?: number | null
          score_wg_fit?: number | null
          scored_at?: string | null
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
          image_url: string | null
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
          image_url?: string | null
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
          image_url?: string | null
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
      business_memory: {
        Row: {
          annual_revenue_band: string | null
          biggest_challenge: string | null
          business_name: string | null
          business_type: string | null
          communication_style: string | null
          created_at: string
          decision_style: string | null
          id: string
          key_metrics: string[] | null
          known_weak_spots: string[] | null
          primary_goal: string | null
          revenue_model: string | null
          team_size: string | null
          trust_display_mode: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          annual_revenue_band?: string | null
          biggest_challenge?: string | null
          business_name?: string | null
          business_type?: string | null
          communication_style?: string | null
          created_at?: string
          decision_style?: string | null
          id?: string
          key_metrics?: string[] | null
          known_weak_spots?: string[] | null
          primary_goal?: string | null
          revenue_model?: string | null
          team_size?: string | null
          trust_display_mode?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          annual_revenue_band?: string | null
          biggest_challenge?: string | null
          business_name?: string | null
          business_type?: string | null
          communication_style?: string | null
          created_at?: string
          decision_style?: string | null
          id?: string
          key_metrics?: string[] | null
          known_weak_spots?: string[] | null
          primary_goal?: string | null
          revenue_model?: string | null
          team_size?: string | null
          trust_display_mode?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      business_profiles: {
        Row: {
          business_name: string
          created_at: string
          current_goal: string | null
          id: string
          industry: string | null
          preferred_perspective: string | null
          preferred_perspectives: string[] | null
          target_audience: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_name: string
          created_at?: string
          current_goal?: string | null
          id?: string
          industry?: string | null
          preferred_perspective?: string | null
          preferred_perspectives?: string[] | null
          target_audience?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_name?: string
          created_at?: string
          current_goal?: string | null
          id?: string
          industry?: string | null
          preferred_perspective?: string | null
          preferred_perspectives?: string[] | null
          target_audience?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coach_credits: {
        Row: {
          balance: number
          created_at: string
          id: string
          last_reset_at: string
          monthly_allowance: number
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          last_reset_at?: string
          monthly_allowance?: number
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          last_reset_at?: string
          monthly_allowance?: number
          user_id?: string
        }
        Relationships: []
      }
      coach_documents: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          extracted_text: string | null
          file_name: string
          file_size: number
          file_type: string
          id: string
          storage_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          extracted_text?: string | null
          file_name: string
          file_size: number
          file_type: string
          id?: string
          storage_path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          extracted_text?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          storage_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coach_profiles: {
        Row: {
          ai_experience: string | null
          biggest_win: string | null
          business_name: string | null
          business_size_band: string | null
          business_type: string | null
          created_at: string
          current_tech: string | null
          decision_style: string | null
          frustration: string | null
          id: string
          onboarding_completed: boolean | null
          primary_goal: string | null
          role: string | null
          team_size: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_experience?: string | null
          biggest_win?: string | null
          business_name?: string | null
          business_size_band?: string | null
          business_type?: string | null
          created_at?: string
          current_tech?: string | null
          decision_style?: string | null
          frustration?: string | null
          id?: string
          onboarding_completed?: boolean | null
          primary_goal?: string | null
          role?: string | null
          team_size?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_experience?: string | null
          biggest_win?: string | null
          business_name?: string | null
          business_size_band?: string | null
          business_type?: string | null
          created_at?: string
          current_tech?: string | null
          decision_style?: string | null
          frustration?: string | null
          id?: string
          onboarding_completed?: boolean | null
          primary_goal?: string | null
          role?: string | null
          team_size?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          change_amount: number
          created_at: string
          id: string
          mode: string | null
          reason: string
          user_id: string
        }
        Insert: {
          change_amount: number
          created_at?: string
          id?: string
          mode?: string | null
          reason: string
          user_id: string
        }
        Update: {
          change_amount?: number
          created_at?: string
          id?: string
          mode?: string | null
          reason?: string
          user_id?: string
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
      email_templates: {
        Row: {
          created_at: string
          html_content: string
          id: string
          is_active: boolean
          name: string
          preview_text: string | null
          sequence_order: number
          slug: string
          subject: string
          template_type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          created_at?: string
          html_content: string
          id?: string
          is_active?: boolean
          name: string
          preview_text?: string | null
          sequence_order?: number
          slug: string
          subject: string
          template_type?: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          created_at?: string
          html_content?: string
          id?: string
          is_active?: boolean
          name?: string
          preview_text?: string | null
          sequence_order?: number
          slug?: string
          subject?: string
          template_type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      feedback_reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string
          feature_area: string
          id: string
          severity: string
          status: string
          updated_at: string
          upvote_count: number
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description: string
          feature_area: string
          id?: string
          severity?: string
          status?: string
          updated_at?: string
          upvote_count?: number
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string
          feature_area?: string
          id?: string
          severity?: string
          status?: string
          updated_at?: string
          upvote_count?: number
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      feedback_upvotes: {
        Row: {
          created_at: string
          feedback_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_upvotes_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedback_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_guardrails: {
        Row: {
          created_at: string
          id: string
          items: string[]
          section_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          items?: string[]
          section_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          items?: string[]
          section_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      founder_journal: {
        Row: {
          content: string
          created_at: string
          embedding: string | null
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      founder_partnership_contacts: {
        Row: {
          contacted_at: string
          created_at: string
          id: string
          notes: string | null
          partnership_id: string
          user_id: string
        }
        Insert: {
          contacted_at?: string
          created_at?: string
          id?: string
          notes?: string | null
          partnership_id: string
          user_id: string
        }
        Update: {
          contacted_at?: string
          created_at?: string
          id?: string
          notes?: string | null
          partnership_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "founder_partnership_contacts_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "founder_partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_partnerships: {
        Row: {
          created_at: string
          fit_score: number
          id: string
          insight: string | null
          last_contact: string | null
          name: string
          next_move: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fit_score?: number
          id?: string
          insight?: string | null
          last_contact?: string | null
          name: string
          next_move?: string | null
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fit_score?: number
          id?: string
          insight?: string | null
          last_contact?: string | null
          name?: string
          next_move?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      genie_decisions: {
        Row: {
          context: string | null
          created_at: string
          decision_summary: string
          id: string
          mode: string | null
          outcome: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          decision_summary: string
          id?: string
          mode?: string | null
          outcome?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string
          decision_summary?: string
          id?: string
          mode?: string | null
          outcome?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      genie_insights: {
        Row: {
          content: string
          created_at: string
          expires_at: string | null
          id: string
          insight_type: string
          relevance_score: number | null
          source: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          insight_type: string
          relevance_score?: number | null
          source?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          insight_type?: string
          relevance_score?: number | null
          source?: string | null
          user_id?: string
        }
        Relationships: []
      }
      genie_notifications: {
        Row: {
          created_at: string
          dismissed: boolean
          email_sent: boolean
          email_sent_at: string | null
          expires_at: string | null
          id: string
          message: string
          priority: string
          read: boolean
          title: string
          trigger_reason: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dismissed?: boolean
          email_sent?: boolean
          email_sent_at?: string | null
          expires_at?: string | null
          id?: string
          message: string
          priority?: string
          read?: boolean
          title: string
          trigger_reason?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          dismissed?: boolean
          email_sent?: boolean
          email_sent_at?: string | null
          expires_at?: string | null
          id?: string
          message?: string
          priority?: string
          read?: boolean
          title?: string
          trigger_reason?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      genie_sessions: {
        Row: {
          ended_at: string | null
          id: string
          messages: Json
          mode: string
          started_at: string
          summary: string | null
          tags: string[] | null
          user_id: string
        }
        Insert: {
          ended_at?: string | null
          id?: string
          messages?: Json
          mode: string
          started_at?: string
          summary?: string | null
          tags?: string[] | null
          user_id: string
        }
        Update: {
          ended_at?: string | null
          id?: string
          messages?: Json
          mode?: string
          started_at?: string
          summary?: string | null
          tags?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      leaderboard_entries: {
        Row: {
          business_type: string | null
          created_at: string
          id: string
          last_updated: string
          opted_in: boolean
          score_band: string
          size_band: string | null
          streak_weeks: number | null
          user_id: string
        }
        Insert: {
          business_type?: string | null
          created_at?: string
          id?: string
          last_updated?: string
          opted_in?: boolean
          score_band?: string
          size_band?: string | null
          streak_weeks?: number | null
          user_id: string
        }
        Update: {
          business_type?: string | null
          created_at?: string
          id?: string
          last_updated?: string
          opted_in?: boolean
          score_band?: string
          size_band?: string | null
          streak_weeks?: number | null
          user_id?: string
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
          ip_address: string | null
          is_active: boolean
          name: string | null
          source: string | null
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          name?: string | null
          source?: string | null
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          name?: string | null
          source?: string | null
          subscribed_at?: string
        }
        Relationships: []
      }
      newsletter_templates: {
        Row: {
          article_ids: string[]
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          article_ids: string[]
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          article_ids?: string[]
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean
          email_frequency: string
          email_priority_threshold: string
          id: string
          push_enabled: boolean
          push_subscription: Json | null
          quiet_days: string[] | null
          quiet_hours_enabled: boolean
          quiet_hours_end: string
          quiet_hours_start: string
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          email_frequency?: string
          email_priority_threshold?: string
          id?: string
          push_enabled?: boolean
          push_subscription?: Json | null
          quiet_days?: string[] | null
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string
          quiet_hours_start?: string
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          email_frequency?: string
          email_priority_threshold?: string
          id?: string
          push_enabled?: boolean
          push_subscription?: Json | null
          quiet_days?: string[] | null
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string
          quiet_hours_start?: string
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_downloads: {
        Row: {
          ab_subject_line: string | null
          ab_variant: string | null
          conversion_product: string | null
          conversion_value: number | null
          converted: boolean | null
          converted_at: string | null
          created_at: string
          download_type: string
          email: string
          email_clicked: boolean | null
          email_clicked_at: string | null
          email_opened: boolean | null
          email_opened_at: string | null
          id: string
          ip_address: string | null
          name: string | null
          product_id: string
          product_name: string
          product_type: string
          upsell_email_sent: boolean | null
          upsell_email_sent_at: string | null
          user_agent: string | null
        }
        Insert: {
          ab_subject_line?: string | null
          ab_variant?: string | null
          conversion_product?: string | null
          conversion_value?: number | null
          converted?: boolean | null
          converted_at?: string | null
          created_at?: string
          download_type?: string
          email: string
          email_clicked?: boolean | null
          email_clicked_at?: string | null
          email_opened?: boolean | null
          email_opened_at?: string | null
          id?: string
          ip_address?: string | null
          name?: string | null
          product_id: string
          product_name: string
          product_type?: string
          upsell_email_sent?: boolean | null
          upsell_email_sent_at?: string | null
          user_agent?: string | null
        }
        Update: {
          ab_subject_line?: string | null
          ab_variant?: string | null
          conversion_product?: string | null
          conversion_value?: number | null
          converted?: boolean | null
          converted_at?: string | null
          created_at?: string
          download_type?: string
          email?: string
          email_clicked?: boolean | null
          email_clicked_at?: string | null
          email_opened?: boolean | null
          email_opened_at?: string | null
          id?: string
          ip_address?: string | null
          name?: string | null
          product_id?: string
          product_name?: string
          product_type?: string
          upsell_email_sent?: boolean | null
          upsell_email_sent_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      report_shares: {
        Row: {
          completion_id: string
          created_at: string
          expires_at: string | null
          id: string
          share_token: string
          view_count: number
        }
        Insert: {
          completion_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          share_token?: string
          view_count?: number
        }
        Update: {
          completion_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          share_token?: string
          view_count?: number
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
          business_lens: string | null
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
          business_lens?: string | null
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
          business_lens?: string | null
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
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          product_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_purchases: {
        Row: {
          currency: string
          id: string
          price_paid: number
          product_id: string
          product_name: string
          purchased_at: string
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          currency?: string
          id?: string
          price_paid: number
          product_id: string
          product_name: string
          purchased_at?: string
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          currency?: string
          id?: string
          price_paid?: number
          product_id?: string
          product_name?: string
          purchased_at?: string
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_saved_outputs: {
        Row: {
          created_at: string
          data: Json
          id: string
          output_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          output_type: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          output_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_email: { Args: never; Returns: string }
      get_leaderboard_stats: {
        Args: { p_business_type?: string; p_size_band?: string }
        Returns: {
          avg_streak: number
          business_type: string
          score_band: string
          size_band: string
          user_count: number
        }[]
      }
      get_share_by_token: {
        Args: { p_share_token: string }
        Returns: {
          completion_id: string
          created_at: string
          expires_at: string
          id: string
          share_token: string
          view_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      search_journal_entries: {
        Args: {
          match_count?: number
          match_user_id: string
          query_embedding: string
        }
        Returns: {
          content: string
          created_at: string
          id: string
          similarity: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
