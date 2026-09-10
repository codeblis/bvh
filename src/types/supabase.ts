export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      articles: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image_alt: string | null
          featured_image_path: string | null
          id: string
          published_at: string | null
          slug: string
          status: string | null
          title: string
          type: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_alt?: string | null
          featured_image_path?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string | null
          title: string
          type?: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_alt?: string | null
          featured_image_path?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          metadata: Json
          request_id: string
          resource_id: string | null
          resource_type: string
          result: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          request_id?: string
          resource_id?: string | null
          resource_type: string
          result?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          request_id?: string
          resource_id?: string | null
          resource_type?: string
          result?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          article_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          article_id: string
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          article_id: string
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          article_id?: string
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          description: string | null
          id: string
          logo_url: string | null
          name: string
          registered_at: string | null
          sector: string | null
          slug: string
          status: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          registered_at?: string | null
          sector?: string | null
          slug: string
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          registered_at?: string | null
          sector?: string | null
          slug?: string
          status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      company_applications: {
        Row: {
          accepted_terms_at: string | null
          annual_revenue: string | null
          company_name: string
          corporate_email: string
          created_at: string
          description: string | null
          employee_count: number | null
          founding_year: number | null
          id: string
          legal_representative: string
          notification_attempts: number
          notification_last_error: string | null
          notification_provider_id: string | null
          notification_status: string
          notification_token: string | null
          notified_at: string | null
          phone: string
          reference: string | null
          sector: string
          status: string
          tax_id: string
          updated_at: string
          wants_advisor_contact: boolean
        }
        Insert: {
          accepted_terms_at?: string | null
          annual_revenue?: string | null
          company_name: string
          corporate_email: string
          created_at?: string
          description?: string | null
          employee_count?: number | null
          founding_year?: number | null
          id?: string
          legal_representative: string
          notification_attempts?: number
          notification_last_error?: string | null
          notification_provider_id?: string | null
          notification_status?: string
          notification_token?: string | null
          notified_at?: string | null
          phone: string
          reference?: string | null
          sector: string
          status?: string
          tax_id: string
          updated_at?: string
          wants_advisor_contact?: boolean
        }
        Update: {
          accepted_terms_at?: string | null
          annual_revenue?: string | null
          company_name?: string
          corporate_email?: string
          created_at?: string
          description?: string | null
          employee_count?: number | null
          founding_year?: number | null
          id?: string
          legal_representative?: string
          notification_attempts?: number
          notification_last_error?: string | null
          notification_provider_id?: string | null
          notification_status?: string
          notification_token?: string | null
          notified_at?: string | null
          phone?: string
          reference?: string | null
          sector?: string
          status?: string
          tax_id?: string
          updated_at?: string
          wants_advisor_contact?: boolean
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          notification_attempts: number
          notification_last_error: string | null
          notification_provider_id: string | null
          notification_status: string
          notification_token: string | null
          notified_at: string | null
          reference: string | null
          status: string | null
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          notification_attempts?: number
          notification_last_error?: string | null
          notification_provider_id?: string | null
          notification_status?: string
          notification_token?: string | null
          notified_at?: string | null
          reference?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          notification_attempts?: number
          notification_last_error?: string | null
          notification_provider_id?: string | null
          notification_status?: string
          notification_token?: string | null
          notified_at?: string | null
          reference?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string | null
          id: string
          offering_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string | null
          id?: string
          offering_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string | null
          id?: string
          offering_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "course_offerings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_offerings: {
        Row: {
          capacity: number | null
          course_id: string
          created_at: string
          currency: string
          ends_at: string | null
          id: string
          location: string | null
          modality: string
          price: number | null
          starts_at: string | null
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          course_id: string
          created_at?: string
          currency?: string
          ends_at?: string | null
          id?: string
          location?: string | null
          modality?: string
          price?: number | null
          starts_at?: string | null
          status?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          course_id?: string
          created_at?: string
          currency?: string
          ends_at?: string | null
          id?: string
          location?: string | null
          modality?: string
          price?: number | null
          starts_at?: string | null
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_offerings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          capacity: number | null
          content: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          image: string | null
          instructor: string | null
          price: number | null
          slug: string
          start_date: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image?: string | null
          instructor?: string | null
          price?: number | null
          slug: string
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image?: string | null
          instructor?: string | null
          price?: number | null
          slug?: string
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      indices: {
        Row: {
          change: number | null
          change_percent: number | null
          created_at: string | null
          id: string
          last_updated: string | null
          name: string
          value: number
        }
        Insert: {
          change?: number | null
          change_percent?: number | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          name: string
          value: number
        }
        Update: {
          change?: number | null
          change_percent?: number | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          name?: string
          value?: number
        }
        Relationships: []
      }
      likes: {
        Row: {
          article_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscriptions: {
        Row: {
          consented_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          notification_attempts: number
          notification_last_error: string | null
          notification_provider_id: string | null
          notification_status: string
          notification_token: string | null
          notified_at: string | null
          profile: string | null
          reference: string | null
          source: string | null
          subscribed_at: string | null
          unsubscribe_token: string
          unsubscribed_at: string | null
        }
        Insert: {
          consented_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          notification_attempts?: number
          notification_last_error?: string | null
          notification_provider_id?: string | null
          notification_status?: string
          notification_token?: string | null
          notified_at?: string | null
          profile?: string | null
          reference?: string | null
          source?: string | null
          subscribed_at?: string | null
          unsubscribe_token?: string
          unsubscribed_at?: string | null
        }
        Update: {
          consented_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          notification_attempts?: number
          notification_last_error?: string | null
          notification_provider_id?: string | null
          notification_status?: string
          notification_token?: string | null
          notified_at?: string | null
          profile?: string | null
          reference?: string | null
          source?: string | null
          subscribed_at?: string | null
          unsubscribe_token?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          account_type?: string
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string | null
        }
        Update: {
          account_type?: string
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_course: { Args: { p_course_id: string }; Returns: undefined }
      enroll_in_course: { Args: { p_offering_id: string }; Returns: string }
      get_course_offering_availability: {
        Args: { p_offering_ids: string[] }
        Returns: {
          available_seats: number
          offering_id: string
        }[]
      }
      get_my_course_enrollments: {
        Args: never
        Returns: {
          course_slug: string
          course_status: string
          course_title: string
          enrolled_at: string
          id: string
          modality: string
          offering_status: string
          starts_at: string
          status: string
          timezone: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      record_data_export: {
        Args: { p_resource_type: string; p_rows: number }
        Returns: undefined
      }
      record_form_notification: {
        Args: {
          p_error?: string
          p_notification_token: string
          p_provider_id?: string
          p_resource_id: string
          p_resource_type: string
          p_success: boolean
        }
        Returns: boolean
      }
      save_course_offering: {
        Args: { p_course_id: string; p_offering: Json }
        Returns: string
      }
      set_profile_role: {
        Args: { p_role: string; p_user_id: string }
        Returns: undefined
      }
      submit_company_application: {
        Args: {
          p_accepted_terms: boolean
          p_annual_revenue: string
          p_company_name: string
          p_description: string
          p_email: string
          p_employee_count: number
          p_founding_year: number
          p_legal_representative: string
          p_phone: string
          p_reference: string
          p_sector: string
          p_tax_id: string
          p_wants_advisor: boolean
        }
        Returns: {
          notification_token: string
          submission_id: string
        }[]
      }
      submit_contact_message: {
        Args: {
          p_email: string
          p_message: string
          p_name: string
          p_reference: string
          p_subject: string
        }
        Returns: {
          notification_token: string
          submission_id: string
        }[]
      }
      submit_newsletter_subscription: {
        Args: {
          p_email: string
          p_full_name: string
          p_profile: string
          p_reference: string
          p_source: string
        }
        Returns: {
          notification_token: string
          should_notify: boolean
          submission_id: string
        }[]
      }
      unsubscribe_newsletter: { Args: { p_token: string }; Returns: boolean }
      update_course_enrollment_status: {
        Args: { p_enrollment_id: string; p_status: string }
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

