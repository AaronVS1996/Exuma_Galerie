import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { TOOLS, executeTool } from "@/lib/coach-tools";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `Du bist der persönliche KI-Assistent und Coach von Aaron.
Du hast direkten Zugriff auf seine Aufgaben, Routinen, Ziele und Analysen über deine Werkzeuge.

Verhalten:
- Nutze IMMER zuerst ein Werkzeug, wenn eine Frage Daten betrifft (Aufgaben, Routinen, Ziele, Analysen)
- Handle proaktiv: Wenn Aaron sagt "Erstell eine Aufgabe", tue es sofort
- Bestätige ausgeführte Aktionen klar und präzise
- Gib konkrete, umsetzbare Empfehlungen basierend auf echten Daten
- Sprich Deutsch, sei motivierend aber direkt
- Nutze Markdown für Übersichtlichkeit (fett, Listen)
- Das heutige Datum ist: ${new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Format messages for Anthropic API
    const formattedMessages: Anthropic.MessageParam[] = messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })
    );

    // Agentic loop – Claude may call tools multiple times
    let response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: SYSTEM,
      tools: TOOLS,
      messages: formattedMessages,
    });

    const toolsUsed: string[] = [];

    // Keep looping while Claude wants to use tools
    while (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );

      // Execute all tool calls in parallel
      const toolResults = await Promise.all(
        toolUseBlocks.map(async (block) => {
          toolsUsed.push(block.name);
          const result = await executeTool(block.name, block.input as Record<string, unknown>);
          return {
            type: "tool_result" as const,
            tool_use_id: block.id,
            content: result,
          };
        })
      );

      // Send tool results back to Claude
      response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2048,
        system: SYSTEM,
        tools: TOOLS,
        messages: [
          ...formattedMessages,
          { role: "assistant", content: response.content },
          { role: "user", content: toolResults },
        ],
      });
    }

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return NextResponse.json({ message: text, tools_used: toolsUsed });
  } catch (error) {
    console.error("Coach API error:", error);
    return NextResponse.json(
      { message: "Fehler beim Verarbeiten. Bitte überprüfe den API-Key in den Einstellungen." },
      { status: 200 }
    );
  }
}
