import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Fetch context from DB
    const today = new Date().toISOString().split("T")[0];
    const [{ data: tasks }, { data: routines }, { data: logs }] = await Promise.all([
      supabase.from("tasks").select("title,priority,status,due_date").neq("status", "done").limit(10),
      supabase.from("routines").select("name,frequency"),
      supabase.from("routine_logs").select("routine_id").eq("date", today),
    ]);

    const context = `
Aktueller Kontext des Nutzers (Aaron):
- Offene Aufgaben: ${tasks?.length || 0}
- Dringende Aufgaben: ${tasks?.filter(t => t.priority === "urgent").length || 0}
- Heute fällig: ${tasks?.filter(t => t.due_date === today).length || 0}
- Routinen heute erledigt: ${logs?.length || 0} von ${routines?.length || 0}
- Aufgabenliste: ${tasks?.slice(0, 5).map(t => `${t.title} (${t.priority})`).join(", ") || "keine"}
`;

    const systemPrompt = `Du bist ein persönlicher KI-Coach und Produktivitätsberater für Aaron.
Du hast Zugriff auf seinen aktuellen Kontext und hilfst ihm dabei, seinen Tag zu optimieren, Aufgaben zu priorisieren und persönliche Ziele zu erreichen.

${context}

Deine Persönlichkeit: Motivierend, direkt, professionell aber freundlich. Du sprichst Deutsch.
Du gibst konkrete, umsetzbare Ratschläge. Du kennst Aarons Situation und passt deine Antworten entsprechend an.
Nutze gelegentlich Markdown (fett, Listen) für Übersichtlichkeit.`;

    const formattedMessages = messages
      .filter((m: { role: string }) => m.role === "user" || m.role === "assistant")
      .map((m: { role: string; content: string }) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: formattedMessages,
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ message: text });
  } catch (error) {
    console.error("Coach API error:", error);
    return NextResponse.json({ message: "Es tut mir leid, ich konnte deine Anfrage nicht verarbeiten. Bitte überprüfe ob der API-Key konfiguriert ist." }, { status: 200 });
  }
}
