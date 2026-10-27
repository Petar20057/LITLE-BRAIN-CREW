// Generated from the live database by npm run db:types. Do not edit by hand: change the schema in
// supabase/migrations/, apply it, then regenerate.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      cancel_feedback: {
        Row: {
          comment: string | null;
          created_at: string;
          id: string;
          member_id: string;
          offer_accepted: boolean | null;
          offer_shown: Database["public"]["Enums"]["save_offer"] | null;
          reason: Database["public"]["Enums"]["cancel_reason"];
          subscription_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          member_id: string;
          offer_accepted?: boolean | null;
          offer_shown?: Database["public"]["Enums"]["save_offer"] | null;
          reason: Database["public"]["Enums"]["cancel_reason"];
          subscription_id?: string | null;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          member_id?: string;
          offer_accepted?: boolean | null;
          offer_shown?: Database["public"]["Enums"]["save_offer"] | null;
          reason?: Database["public"]["Enums"]["cancel_reason"];
          subscription_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "cancel_feedback_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cancel_feedback_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          },
        ];
      };
      members: {
        Row: {
          age_groups: Database["public"]["Enums"]["age_group"][];
          created_at: string;
          creem_customer_id: string | null;
          display_name: string | null;
          email: string;
          id: string;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          age_groups?: Database["public"]["Enums"]["age_group"][];
          created_at?: string;
          creem_customer_id?: string | null;
          display_name?: string | null;
          email: string;
          id: string;
          updated_at?: string;
        };
        Update: {
          age_groups?: Database["public"]["Enums"]["age_group"][];
          created_at?: string;
          creem_customer_id?: string | null;
          display_name?: string | null;
          email?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      page_views: {
        Row: {
          country: string | null;
          created_at: string;
          device: string | null;
          id: number;
          path: string;
          referrer: string | null;
          session_id: string;
          utm_campaign: string | null;
          utm_medium: string | null;
          utm_source: string | null;
          visitor_id: string;
        };
        ComputedFields: never;
        Insert: {
          country?: string | null;
          created_at?: string;
          device?: string | null;
          id?: never;
          path: string;
          referrer?: string | null;
          session_id: string;
          utm_campaign?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
          visitor_id: string;
        };
        Update: {
          country?: string | null;
          created_at?: string;
          device?: string | null;
          id?: never;
          path?: string;
          referrer?: string | null;
          session_id?: string;
          utm_campaign?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
          visitor_id?: string;
        };
        Relationships: [];
      };
      quiz_events: {
        Row: {
          created_at: string;
          event: string;
          id: number;
          ms: number | null;
          session_id: string;
          step: string;
          value: Json | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          event: string;
          id?: never;
          ms?: number | null;
          session_id: string;
          step: string;
          value?: Json | null;
        };
        Update: {
          created_at?: string;
          event?: string;
          id?: never;
          ms?: number | null;
          session_id?: string;
          step?: string;
          value?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_events_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "quiz_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_leads: {
        Row: {
          consent_at: string | null;
          created_at: string;
          email: string;
          id: string;
          result_emailed_at: string | null;
          session_id: string | null;
          tips_consent: boolean;
          tips_requested_at: string | null;
          token: string;
          unsubscribed_at: string | null;
        };
        ComputedFields: never;
        Insert: {
          consent_at?: string | null;
          created_at?: string;
          email: string;
          id?: string;
          result_emailed_at?: string | null;
          session_id?: string | null;
          tips_consent?: boolean;
          tips_requested_at?: string | null;
          token?: string;
          unsubscribed_at?: string | null;
        };
        Update: {
          consent_at?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          result_emailed_at?: string | null;
          session_id?: string | null;
          tips_consent?: boolean;
          tips_requested_at?: string | null;
          token?: string;
          unsubscribed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_leads_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "quiz_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_sessions: {
        Row: {
          age: string | null;
          checkout_at: string | null;
          checkout_product: string | null;
          device: string | null;
          duo: string | null;
          emailed_at: string | null;
          id: string;
          keyword: string | null;
          last_step: string;
          moments: string[];
          purchase_order: string | null;
          purchased_at: string | null;
          referrer: string | null;
          result_at: string | null;
          started_at: string;
          updated_at: string;
          utm_campaign: string | null;
          utm_medium: string | null;
          utm_source: string | null;
          variant: string;
        };
        ComputedFields: never;
        Insert: {
          age?: string | null;
          checkout_at?: string | null;
          checkout_product?: string | null;
          device?: string | null;
          duo?: string | null;
          emailed_at?: string | null;
          id: string;
          keyword?: string | null;
          last_step?: string;
          moments?: string[];
          purchase_order?: string | null;
          purchased_at?: string | null;
          referrer?: string | null;
          result_at?: string | null;
          started_at?: string;
          updated_at?: string;
          utm_campaign?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
          variant: string;
        };
        Update: {
          age?: string | null;
          checkout_at?: string | null;
          checkout_product?: string | null;
          device?: string | null;
          duo?: string | null;
          emailed_at?: string | null;
          id?: string;
          keyword?: string | null;
          last_step?: string;
          moments?: string[];
          purchase_order?: string | null;
          purchased_at?: string | null;
          referrer?: string | null;
          result_at?: string | null;
          started_at?: string;
          updated_at?: string;
          utm_campaign?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
          variant?: string;
        };
        Relationships: [];
      };
      rate_limits: {
        Row: {
          hits: number;
          key: string;
          window_start: string;
        };
        ComputedFields: never;
        Insert: {
          hits?: number;
          key: string;
          window_start?: string;
        };
        Update: {
          hits?: number;
          key?: string;
          window_start?: string;
        };
        Relationships: [];
      };
      signups: {
        Row: {
          confirm_sent_at: string | null;
          confirm_token: string;
          confirmed_at: string | null;
          created_at: string;
          details: Json | null;
          email: string;
          form: string;
          id: string;
          page: string | null;
          unsubscribed_at: string | null;
          utm_source: string | null;
          visitor_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          confirm_sent_at?: string | null;
          confirm_token?: string;
          confirmed_at?: string | null;
          created_at?: string;
          details?: Json | null;
          email: string;
          form: string;
          id?: string;
          page?: string | null;
          unsubscribed_at?: string | null;
          utm_source?: string | null;
          visitor_id?: string | null;
        };
        Update: {
          confirm_sent_at?: string | null;
          confirm_token?: string;
          confirmed_at?: string | null;
          created_at?: string;
          details?: Json | null;
          email?: string;
          form?: string;
          id?: string;
          page?: string | null;
          unsubscribed_at?: string | null;
          utm_source?: string | null;
          visitor_id?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          billing_interval: string;
          cancel_at_period_end: boolean;
          canceled_at: string | null;
          created_at: string;
          currency: string;
          current_period_end: string | null;
          current_period_start: string | null;
          id: string;
          member_id: string;
          paused_until: string | null;
          plan: Database["public"]["Enums"]["club_plan"];
          price_cents: number;
          provider: Database["public"]["Enums"]["payment_provider"];
          provider_event_at: string | null;
          provider_subscription_id: string;
          renewal_consent_at: string;
          status: Database["public"]["Enums"]["subscription_status"];
          trial_ends_at: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          billing_interval: string;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          created_at?: string;
          currency?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          member_id: string;
          paused_until?: string | null;
          plan: Database["public"]["Enums"]["club_plan"];
          price_cents: number;
          provider: Database["public"]["Enums"]["payment_provider"];
          provider_event_at?: string | null;
          provider_subscription_id: string;
          renewal_consent_at: string;
          status: Database["public"]["Enums"]["subscription_status"];
          trial_ends_at?: string | null;
          updated_at?: string;
        };
        Update: {
          billing_interval?: string;
          cancel_at_period_end?: boolean;
          canceled_at?: string | null;
          created_at?: string;
          currency?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          member_id?: string;
          paused_until?: string | null;
          plan?: Database["public"]["Enums"]["club_plan"];
          price_cents?: number;
          provider?: Database["public"]["Enums"]["payment_provider"];
          provider_event_at?: string | null;
          provider_subscription_id?: string;
          renewal_consent_at?: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          trial_ends_at?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_club_access: { Args: Record<PropertyKey, never>; Returns: boolean };
      newsletter_subscribers: { Args: { forms: string[] }; Returns: number };
      prune_old_data: { Args: Record<PropertyKey, never>; Returns: undefined };
      quiz_answers: {
        Args: { since: string };
        Returns: {
          answer: string;
          question: string;
          sessions: number;
        }[];
      };
      quiz_funnel: {
        Args: { since: string; src?: string };
        Returns: {
          median_ms: number;
          sessions: number;
          step: string;
          variant: string;
        }[];
      };
      quiz_totals: {
        Args: { since: string };
        Returns: {
          checkouts: number;
          emailed: number;
          purchases: number;
          results: number;
          source: string;
          started: number;
          variant: string;
        }[];
      };
      rate_limit_hit: {
        Args: { p_key: string; p_max: number; p_window_seconds: number };
        Returns: boolean;
      };
      signups_daily: {
        Args: { since: string };
        Returns: {
          day: string;
          form: string;
          signups: number;
        }[];
      };
      signups_summary: {
        Args: { since: string };
        Returns: {
          form: string;
          in_period: number;
          subscribed: number;
          total: number;
        }[];
      };
      traffic_daily: {
        Args: { since: string };
        Returns: {
          day: string;
          sessions: number;
          views: number;
          visitors: number;
        }[];
      };
      traffic_top: {
        Args: { since: string };
        Returns: {
          kind: string;
          label: string;
          views: number;
          visitors: number;
        }[];
      };
      traffic_totals: {
        Args: { since: string };
        Returns: {
          bounced: number;
          returning_visitors: number;
          sessions: number;
          views: number;
          visitors: number;
        }[];
      };
    };
    Enums: {
      age_group: "whyzi" | "skuli" | "ruli" | "tweeni" | "sprouti" | "seki";
      cancel_reason:
        | "too_expensive"
        | "no_time"
        | "got_what_we_needed"
        | "wrong_age"
        | "something_broken"
        | "other";
      club_plan: "club_monthly" | "club_yearly";
      payment_provider: "creem";
      save_offer:
        | "half_price_3_months"
        | "pause"
        | "pause_instead_of_done"
        | "change_age_free_month"
        | "fix_free_month";
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "unpaid"
        | "paused"
        | "scheduled_cancel"
        | "expired"
        | "canceled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      age_group: ["whyzi", "skuli", "ruli", "tweeni", "sprouti", "seki"],
      cancel_reason: [
        "too_expensive",
        "no_time",
        "got_what_we_needed",
        "wrong_age",
        "something_broken",
        "other",
      ],
      club_plan: ["club_monthly", "club_yearly"],
      payment_provider: ["creem"],
      save_offer: [
        "half_price_3_months",
        "pause",
        "pause_instead_of_done",
        "change_age_free_month",
        "fix_free_month",
      ],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "unpaid",
        "paused",
        "scheduled_cancel",
        "expired",
        "canceled",
      ],
    },
  },
} as const;
