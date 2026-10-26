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
