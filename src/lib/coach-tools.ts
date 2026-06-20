import { supabase } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";

// ── Tool Definitions ────────────────────────────────────────────────────────

export const TOOLS: Anthropic.Tool[] = [
  {
    name: "get_tasks",
    description: "Holt Aufgaben aus der Datenbank. Nutze dies um den aktuellen Stand zu kennen.",
    input_schema: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          enum: ["todo", "in_progress", "done", "all"],
          description: "Filter nach Status. 'all' für alle.",
        },
        priority: {
          type: "string",
          enum: ["urgent", "high", "medium", "low", "all"],
          description: "Filter nach Priorität.",
        },
        limit: { type: "number", description: "Maximale Anzahl Ergebnisse (Standard: 20)" },
      },
    },
  },
  {
    name: "create_task",
    description: "Erstellt eine neue Aufgabe für den Nutzer.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string", description: "Titel der Aufgabe" },
        description: { type: "string", description: "Optionale Beschreibung" },
        priority: {
          type: "string",
          enum: ["urgent", "high", "medium", "low"],
          description: "Priorität der Aufgabe",
        },
        due_date: {
          type: "string",
          description: "Fälligkeitsdatum im Format YYYY-MM-DD",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Tags für die Aufgabe",
        },
      },
      required: ["title", "priority"],
    },
  },
  {
    name: "update_task_status",
    description: "Aktualisiert den Status einer Aufgabe (z.B. als erledigt markieren).",
    input_schema: {
      type: "object" as const,
      properties: {
        task_id: { type: "string", description: "ID der Aufgabe" },
        status: {
          type: "string",
          enum: ["todo", "in_progress", "done"],
          description: "Neuer Status",
        },
      },
      required: ["task_id", "status"],
    },
  },
  {
    name: "get_routines",
    description: "Holt alle Routinen und zeigt welche heute schon erledigt wurden.",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "log_routine",
    description: "Markiert eine Routine als heute erledigt.",
    input_schema: {
      type: "object" as const,
      properties: {
        routine_id: { type: "string", description: "ID der Routine" },
      },
      required: ["routine_id"],
    },
  },
  {
    name: "get_goals",
    description: "Holt die Ziele des Nutzers.",
    input_schema: {
      type: "object" as const,
      properties: {
        status: {
          type: "string",
          enum: ["active", "completed", "paused", "all"],
        },
      },
    },
  },
  {
    name: "create_goal",
    description: "Erstellt ein neues Ziel.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        category: { type: "string" },
        target_date: { type: "string", description: "Format YYYY-MM-DD" },
      },
      required: ["title"],
    },
  },
  {
    name: "get_analytics",
    description: "Holt Produktivitätsanalysen: Aufgaben-Abschlussrate, Routinen-Streak, Wochenübersicht.",
    input_schema: { type: "object" as const, properties: {} },
  },
];

// ── Tool Execution ──────────────────────────────────────────────────────────

export async function executeTool(
  name: string,
  input: Record<string, unknown>
): Promise<string> {
  const today = new Date().toISOString().split("T")[0];

  switch (name) {
    case "get_tasks": {
      let query = supabase.from("tasks").select("*");
      if (input.status && input.status !== "all") query = query.eq("status", input.status as string);
      if (input.priority && input.priority !== "all") query = query.eq("priority", input.priority as string);
      query = query.order("created_at", { ascending: false }).limit((input.limit as number) || 20);
      const { data, error } = await query;
      if (error) return `Fehler: ${error.message}`;
      return JSON.stringify(data || []);
    }

    case "create_task": {
      const { data, error } = await supabase.from("tasks").insert({
        title: input.title as string,
        description: (input.description as string) || null,
        priority: (input.priority as string) || "medium",
        status: "todo",
        due_date: (input.due_date as string) || null,
        tags: (input.tags as string[]) || [],
        updated_at: new Date().toISOString(),
      }).select().single();
      if (error) return `Fehler beim Erstellen: ${error.message}`;
      return `Aufgabe erstellt: ${JSON.stringify(data)}`;
    }

    case "update_task_status": {
      const { error } = await supabase
        .from("tasks")
        .update({ status: input.status as string, updated_at: new Date().toISOString() })
        .eq("id", input.task_id as string);
      if (error) return `Fehler: ${error.message}`;
      return `Status erfolgreich auf "${input.status}" gesetzt.`;
    }

    case "get_routines": {
      const [{ data: routines }, { data: logs }] = await Promise.all([
        supabase.from("routines").select("*"),
        supabase.from("routine_logs").select("*").eq("date", today),
      ]);
      const result = (routines || []).map((r) => ({
        ...r,
        completed_today: (logs || []).some((l) => l.routine_id === r.id),
      }));
      return JSON.stringify(result);
    }

    case "log_routine": {
      const { error } = await supabase.from("routine_logs").upsert({
        routine_id: input.routine_id as string,
        date: today,
      });
      if (error) return `Fehler: ${error.message}`;
      return "Routine als erledigt markiert.";
    }

    case "get_goals": {
      let query = supabase.from("goals").select("*");
      if (input.status && input.status !== "all") query = query.eq("status", input.status as string);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) return `Fehler: ${error.message}`;
      return JSON.stringify(data || []);
    }

    case "create_goal": {
      const { data, error } = await supabase.from("goals").insert({
        title: input.title as string,
        description: (input.description as string) || null,
        category: (input.category as string) || "persönlich",
        target_date: (input.target_date as string) || null,
        progress: 0,
        status: "active",
      }).select().single();
      if (error) return `Fehler: ${error.message}`;
      return `Ziel erstellt: ${JSON.stringify(data)}`;
    }

    case "get_analytics": {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const [{ data: tasks }, { data: routines }, { data: logs }] = await Promise.all([
        supabase.from("tasks").select("id,status,priority,created_at"),
        supabase.from("routines").select("id,name"),
        supabase.from("routine_logs").select("routine_id,date").gte("date", weekAgo),
      ]);
      const total = tasks?.length || 0;
      const done = tasks?.filter((t) => t.status === "done").length || 0;
      const urgent = tasks?.filter((t) => t.priority === "urgent" && t.status !== "done").length || 0;
      const routineRate = routines?.length
        ? Math.round(((logs?.length || 0) / (routines.length * 7)) * 100)
        : 0;
      return JSON.stringify({
        tasks_total: total,
        tasks_done: done,
        tasks_completion_rate: total > 0 ? Math.round((done / total) * 100) : 0,
        urgent_open: urgent,
        routines_total: routines?.length || 0,
        routine_logs_last_7_days: logs?.length || 0,
        routine_completion_rate_7d: routineRate,
        today: today,
      });
    }

    default:
      return `Unbekanntes Tool: ${name}`;
  }
}
