import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          priority: "low" | "medium" | "high" | "urgent";
          status: "todo" | "in_progress" | "done";
          due_date: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["tasks"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
      };
      routines: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          frequency: "daily" | "weekly" | "monthly";
          target_days: number[];
          color: string;
          icon: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["routines"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["routines"]["Insert"]>;
      };
      routine_logs: {
        Row: {
          id: string;
          routine_id: string;
          date: string;
          completed_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["routine_logs"]["Row"],
          "id" | "completed_at"
        >;
        Update: never;
      };
      goals: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          target_date: string | null;
          progress: number;
          status: "active" | "completed" | "paused";
          category: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["goals"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["goals"]["Insert"]>;
      };
    };
  };
};
