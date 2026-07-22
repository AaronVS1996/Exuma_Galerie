import { NextRequest, NextResponse } from "next/server";
import { TOOLS, executeTool } from "@/lib/coach-tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── MCP Server (Streamable HTTP) ─────────────────────────────────────────────
// Spiegelt die Coach-Tools als Model-Context-Protocol-Server, damit externe
// KI-Clients (Claude Connectors, ChatGPT Custom Connectors) direkt auf Aarons
// Aufgaben, Routinen und Ziele zugreifen können.
//
// Verbinden:
//   URL:   https://<deine-domain>/api/mcp
//   Auth:  Bearer <MCP_TOKEN>  (Header)
//   Oder:  https://<deine-domain>/api/mcp?key=<MCP_TOKEN>  (Query-Param, für
//          Clients ohne Bearer-Token-Option, z. B. ChatGPT "Keine Authentifizierung")
// Der Token wird über die Umgebungsvariable MCP_TOKEN gesetzt.

const SERVER_INFO = { name: "personal-os", version: "1.0.0" };
const DEFAULT_PROTOCOL_VERSION = "2025-06-18";

function unauthorized() {
  return new NextResponse(
    JSON.stringify({ error: "unauthorized" }),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "WWW-Authenticate": 'Bearer realm="personal-os-mcp"',
      },
    }
  );
}

function safeEqual(provided: string, expected: string): boolean {
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < provided.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

function isAuthorized(req: NextRequest): boolean {
  const expected = process.env.MCP_TOKEN;
  if (!expected) return false; // Ohne konfigurierten Token bleibt der Server geschlossen.

  const header = req.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (match && safeEqual(match[1], expected)) return true;

  // Fallback für Clients ohne Bearer-Token-Unterstützung (z. B. ChatGPT
  // "Keine Authentifizierung"): Token als Query-Parameter ?key=...
  const queryToken = req.nextUrl.searchParams.get("key");
  if (queryToken && safeEqual(queryToken, expected)) return true;

  return false;
}

// JSON-RPC Hilfsfunktionen
type JsonRpcId = string | number | null;

function rpcResult(id: JsonRpcId, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}

function rpcError(id: JsonRpcId, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

// Anthropic-Tool-Format (input_schema) → MCP-Format (inputSchema)
function mcpToolList() {
  return TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.input_schema,
  }));
}

async function handleRpc(
  message: { method?: string; id?: JsonRpcId; params?: Record<string, unknown> }
): Promise<object | null> {
  const { method, params } = message;
  const id = message.id ?? null;

  switch (method) {
    case "initialize": {
      const clientVersion = (params?.protocolVersion as string) || DEFAULT_PROTOCOL_VERSION;
      return rpcResult(id, {
        protocolVersion: clientVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
      });
    }

    // Notifications (keine id) → keine Antwort
    case "notifications/initialized":
    case "notifications/cancelled":
      return null;

    case "ping":
      return rpcResult(id, {});

    case "tools/list":
      return rpcResult(id, { tools: mcpToolList() });

    case "tools/call": {
      const toolName = params?.name as string;
      const args = (params?.arguments as Record<string, unknown>) || {};
      const known = TOOLS.some((t) => t.name === toolName);
      if (!known) {
        return rpcError(id, -32602, `Unbekanntes Tool: ${toolName}`);
      }
      try {
        const text = await executeTool(toolName, args);
        const isError = typeof text === "string" && /^Fehler/i.test(text);
        return rpcResult(id, {
          content: [{ type: "text", text }],
          isError,
        });
      } catch (err) {
        return rpcResult(id, {
          content: [
            { type: "text", text: `Fehler bei der Ausführung: ${(err as Error).message}` },
          ],
          isError: true,
        });
      }
    }

    default:
      if (id === null) return null; // unbekannte Notification ignorieren
      return rpcError(id, -32601, `Methode nicht gefunden: ${method}`);
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(rpcError(null, -32700, "Parse error"), { status: 400 });
  }

  // Batch-Requests unterstützen
  if (Array.isArray(body)) {
    const responses = (
      await Promise.all(body.map((m) => handleRpc(m as { method?: string; id?: JsonRpcId })))
    ).filter((r): r is object => r !== null);
    if (responses.length === 0) return new NextResponse(null, { status: 202 });
    return NextResponse.json(responses);
  }

  const response = await handleRpc(body as { method?: string; id?: JsonRpcId });
  if (response === null) return new NextResponse(null, { status: 202 });
  return NextResponse.json(response);
}

// Manche Clients prüfen GET auf einen SSE-Stream — den bieten wir nicht an.
export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 });
}
