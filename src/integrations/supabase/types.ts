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
      admin_audit_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          id: string
          ip_address: string | null
          resource_count: number | null
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          resource_count?: number | null
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          resource_count?: number | null
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
      entity_interactions: {
        Row: {
          created_at: string
          duration_seconds: number | null
          entity_id: string | null
          feature_used: string | null
          id: string
          input_summary: string | null
          interaction_category: string | null
          interaction_type: string
          mode: string | null
          output_type: string | null
          satisfaction_signal: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          entity_id?: string | null
          feature_used?: string | null
          id?: string
          input_summary?: string | null
          interaction_category?: string | null
          interaction_type: string
          mode?: string | null
          output_type?: string | null
          satisfaction_signal?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          entity_id?: string | null
          feature_used?: string | null
          id?: string
          input_summary?: string | null
          interaction_category?: string | null
          interaction_type?: string
          mode?: string | null
          output_type?: string | null
          satisfaction_signal?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entity_interactions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "wellness_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_interactions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "wellness_entities_ml_view"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_helpful: boolean
          like_count: number
          moderation_status: Database["public"]["Enums"]["moderation_status"]
          parent_comment_id: string | null
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_helpful?: boolean
          like_count?: number
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_helpful?: boolean
          like_count?: number
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "feed_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_likes: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "feed_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_posts: {
        Row: {
          author_id: string | null
          comment_count: number
          content: string
          created_at: string
          id: string
          is_featured: boolean
          like_count: number
          link_summary: string | null
          link_url: string | null
          moderation_status: Database["public"]["Enums"]["moderation_status"]
          post_type: Database["public"]["Enums"]["feed_post_type"]
          quality_score: number
          source_article_id: string | null
          source_blog_id: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          comment_count?: number
          content: string
          created_at?: string
          id?: string
          is_featured?: boolean
          like_count?: number
          link_summary?: string | null
          link_url?: string | null
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          post_type?: Database["public"]["Enums"]["feed_post_type"]
          quality_score?: number
          source_article_id?: string | null
          source_blog_id?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          comment_count?: number
          content?: string
          created_at?: string
          id?: string
          is_featured?: boolean
          like_count?: number
          link_summary?: string | null
          link_url?: string | null
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          post_type?: Database["public"]["Enums"]["feed_post_type"]
          quality_score?: number
          source_article_id?: string | null
          source_blog_id?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      feed_reports: {
        Row: {
          comment_id: string | null
          created_at: string
          details: string | null
          id: string
          post_id: string | null
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          post_id?: string | null
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          details?: string | null
          id?: string
          post_id?: string | null
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "feed_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string
          feature_area: string
          feedback_type: string
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
          feedback_type?: string
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
          feedback_type?: string
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
      free_tier_access: {
        Row: {
          created_at: string
          credits_remaining: number
          feature: string
          id: string
          trial_expires_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_remaining?: number
          feature: string
          id?: string
          trial_expires_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_remaining?: number
          feature?: string
          id?: string
          trial_expires_at?: string
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
      knowledge_base: {
        Row: {
          category: string
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          priority: number
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          priority?: number
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          priority?: number
          tags?: string[] | null
          title?: string
          updated_at?: string
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
          bounce_type: string | null
          bounced: boolean | null
          bounced_at: string | null
          coupon_code: string | null
          coupon_product_id: string | null
          coupon_used_at: string | null
          delivery_count: number | null
          email: string
          id: string
          ip_address: string | null
          is_active: boolean
          last_delivered_at: string | null
          name: string | null
          source: string | null
          subscribed_at: string
        }
        Insert: {
          bounce_type?: string | null
          bounced?: boolean | null
          bounced_at?: string | null
          coupon_code?: string | null
          coupon_product_id?: string | null
          coupon_used_at?: string | null
          delivery_count?: number | null
          email: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_delivered_at?: string | null
          name?: string | null
          source?: string | null
          subscribed_at?: string
        }
        Update: {
          bounce_type?: string | null
          bounced?: boolean | null
          bounced_at?: string | null
          coupon_code?: string | null
          coupon_product_id?: string | null
          coupon_used_at?: string | null
          delivery_count?: number | null
          email?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_delivered_at?: string | null
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
      professional_score_log: {
        Row: {
          change_amount: number
          created_at: string
          id: string
          reason: string
          related_comment_id: string | null
          related_post_id: string | null
          user_id: string
        }
        Insert: {
          change_amount: number
          created_at?: string
          id?: string
          reason: string
          related_comment_id?: string | null
          related_post_id?: string | null
          user_id: string
        }
        Update: {
          change_amount?: number
          created_at?: string
          id?: string
          reason?: string
          related_comment_id?: string | null
          related_post_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      professional_scores: {
        Row: {
          created_at: string
          id: string
          last_activity_at: string | null
          last_moderation_action_at: string | null
          linkedin_url: string | null
          linkedin_url_added: boolean
          organisation: string | null
          posting_suspended_until: string | null
          profile_photo_added: boolean
          role: string | null
          score: number
          total_comments: number
          total_helpful_marks: number
          total_likes_received: number
          total_posts: number
          updated_at: string
          user_id: string
          weeks_without_reports: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_activity_at?: string | null
          last_moderation_action_at?: string | null
          linkedin_url?: string | null
          linkedin_url_added?: boolean
          organisation?: string | null
          posting_suspended_until?: string | null
          profile_photo_added?: boolean
          role?: string | null
          score?: number
          total_comments?: number
          total_helpful_marks?: number
          total_likes_received?: number
          total_posts?: number
          updated_at?: string
          user_id: string
          weeks_without_reports?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_activity_at?: string | null
          last_moderation_action_at?: string | null
          linkedin_url?: string | null
          linkedin_url_added?: boolean
          organisation?: string | null
          posting_suspended_until?: string | null
          profile_photo_added?: boolean
          role?: string | null
          score?: number
          total_comments?: number
          total_helpful_marks?: number
          total_likes_received?: number
          total_posts?: number
          updated_at?: string
          user_id?: string
          weeks_without_reports?: number
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
      revenue_bands: {
        Row: {
          id: string
          label: string
          max_value: number | null
          min_value: number | null
          sort_order: number | null
        }
        Insert: {
          id: string
          label: string
          max_value?: number | null
          min_value?: number | null
          sort_order?: number | null
        }
        Update: {
          id?: string
          label?: string
          max_value?: number | null
          min_value?: number | null
          sort_order?: number | null
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
      subscriber_groups: {
        Row: {
          created_at: string
          emails: string[]
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          emails?: string[]
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          emails?: string[]
          id?: string
          name?: string
          updated_at?: string
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
      team_size_bands: {
        Row: {
          id: string
          label: string
          max_size: number | null
          min_size: number | null
          sort_order: number | null
        }
        Insert: {
          id: string
          label: string
          max_size?: number | null
          min_size?: number | null
          sort_order?: number | null
        }
        Update: {
          id?: string
          label?: string
          max_size?: number | null
          min_size?: number | null
          sort_order?: number | null
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
      wellness_business_types: {
        Row: {
          category: string
          description: string | null
          id: string
          label: string
          parent_type: string | null
          sort_order: number | null
        }
        Insert: {
          category: string
          description?: string | null
          id: string
          label: string
          parent_type?: string | null
          sort_order?: number | null
        }
        Update: {
          category?: string
          description?: string | null
          id?: string
          label?: string
          parent_type?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wellness_business_types_parent_type_fkey"
            columns: ["parent_type"]
            isOneToOne: false
            referencedRelation: "wellness_business_types"
            referencedColumns: ["id"]
          },
        ]
      }
      wellness_entities: {
        Row: {
          ai_readiness_assessed_at: string | null
          ai_readiness_band: string | null
          ai_readiness_score: number | null
          business_description: string | null
          business_name: string
          business_type_id: string | null
          certifications: string[] | null
          city: string | null
          communication_preference: string | null
          country_code: string | null
          created_at: string
          customer_segments: string[] | null
          data_source: string | null
          decision_style: string | null
          email: string | null
          embedding: string | null
          first_interaction_at: string | null
          id: string
          key_challenges: string[] | null
          last_interaction_at: string | null
          legal_name: string | null
          location_count: number | null
          member_count: number | null
          pillar_scores: Json | null
          primary_goals: string[] | null
          profile_completeness_score: number | null
          region: string | null
          revenue_band_id: string | null
          services_offered: string[] | null
          team_size_band_id: string | null
          technology_stack: string[] | null
          total_interactions: number | null
          updated_at: string
          user_id: string | null
          verified_at: string | null
          years_in_business: number | null
        }
        Insert: {
          ai_readiness_assessed_at?: string | null
          ai_readiness_band?: string | null
          ai_readiness_score?: number | null
          business_description?: string | null
          business_name: string
          business_type_id?: string | null
          certifications?: string[] | null
          city?: string | null
          communication_preference?: string | null
          country_code?: string | null
          created_at?: string
          customer_segments?: string[] | null
          data_source?: string | null
          decision_style?: string | null
          email?: string | null
          embedding?: string | null
          first_interaction_at?: string | null
          id?: string
          key_challenges?: string[] | null
          last_interaction_at?: string | null
          legal_name?: string | null
          location_count?: number | null
          member_count?: number | null
          pillar_scores?: Json | null
          primary_goals?: string[] | null
          profile_completeness_score?: number | null
          region?: string | null
          revenue_band_id?: string | null
          services_offered?: string[] | null
          team_size_band_id?: string | null
          technology_stack?: string[] | null
          total_interactions?: number | null
          updated_at?: string
          user_id?: string | null
          verified_at?: string | null
          years_in_business?: number | null
        }
        Update: {
          ai_readiness_assessed_at?: string | null
          ai_readiness_band?: string | null
          ai_readiness_score?: number | null
          business_description?: string | null
          business_name?: string
          business_type_id?: string | null
          certifications?: string[] | null
          city?: string | null
          communication_preference?: string | null
          country_code?: string | null
          created_at?: string
          customer_segments?: string[] | null
          data_source?: string | null
          decision_style?: string | null
          email?: string | null
          embedding?: string | null
          first_interaction_at?: string | null
          id?: string
          key_challenges?: string[] | null
          last_interaction_at?: string | null
          legal_name?: string | null
          location_count?: number | null
          member_count?: number | null
          pillar_scores?: Json | null
          primary_goals?: string[] | null
          profile_completeness_score?: number | null
          region?: string | null
          revenue_band_id?: string | null
          services_offered?: string[] | null
          team_size_band_id?: string | null
          technology_stack?: string[] | null
          total_interactions?: number | null
          updated_at?: string
          user_id?: string | null
          verified_at?: string | null
          years_in_business?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wellness_entities_business_type_id_fkey"
            columns: ["business_type_id"]
            isOneToOne: false
            referencedRelation: "wellness_business_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wellness_entities_revenue_band_id_fkey"
            columns: ["revenue_band_id"]
            isOneToOne: false
            referencedRelation: "revenue_bands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wellness_entities_team_size_band_id_fkey"
            columns: ["team_size_band_id"]
            isOneToOne: false
            referencedRelation: "team_size_bands"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      wellness_entities_ml_view: {
        Row: {
          ai_readiness_band: string | null
          ai_readiness_score: number | null
          business_category: string | null
          business_description: string | null
          business_name: string | null
          business_type: string | null
          city: string | null
          communication_preference: string | null
          country_code: string | null
          created_at: string | null
          customer_segments: string[] | null
          decision_style: string | null
          id: string | null
          key_challenges: string[] | null
          last_interaction_at: string | null
          location_count: number | null
          member_count: number | null
          pillar_scores: Json | null
          primary_goals: string[] | null
          profile_completeness_score: number | null
          region: string | null
          revenue_band: string | null
          revenue_max_k: number | null
          revenue_min_k: number | null
          services_offered: string[] | null
          team_max: number | null
          team_min: number | null
          team_size: string | null
          technology_stack: string[] | null
          total_interactions: number | null
          years_in_business: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_entity_completeness: {
        Args: { entity_id: string }
        Returns: number
      }
      can_user_comment: { Args: { p_user_id: string }; Returns: boolean }
      can_user_post: { Args: { p_user_id: string }; Returns: boolean }
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
      get_user_rate_limits: {
        Args: { p_user_id: string }
        Returns: {
          comments_per_day: number
          posts_per_day: number
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
      feed_post_type:
        | "user_post"
        | "shared_article"
        | "system_article"
        | "blog_post"
      moderation_status:
        | "pending"
        | "approved"
        | "flagged"
        | "hidden"
        | "removed"
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
      feed_post_type: [
        "user_post",
        "shared_article",
        "system_article",
        "blog_post",
      ],
      moderation_status: [
        "pending",
        "approved",
        "flagged",
        "hidden",
        "removed",
      ],
    },
  },
} as const
