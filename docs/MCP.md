# MCP-Server – Personal OS mit Claude & ChatGPT verbinden

Dein Tool stellt einen **MCP-Server** (Model Context Protocol) bereit. Damit
können externe KI-Assistenten – Claude und ChatGPT – direkt auf deine Aufgaben,
Routinen und Ziele zugreifen: lesen **und** schreiben.

## Endpoint

```
URL:   https://<deine-domain>/api/mcp
Auth:  Bearer <MCP_TOKEN>
```

Der Server nutzt die **Streamable-HTTP**-Variante von MCP und spiegelt exakt die
Werkzeuge des KI-Coaches (`src/lib/coach-tools.ts`):

| Tool | Zweck |
|------|-------|
| `get_tasks` | Aufgaben abfragen (Filter: Status, Priorität) |
| `create_task` | Neue Aufgabe anlegen |
| `update_task_status` | Aufgabenstatus ändern (z. B. erledigt) |
| `get_routines` | Routinen inkl. „heute erledigt?" |
| `log_routine` | Routine als heute erledigt markieren |
| `get_goals` | Ziele abfragen |
| `create_goal` | Neues Ziel anlegen |
| `get_analytics` | Produktivitäts-Kennzahlen |

## 1. Token setzen (Vercel)

Der Server ist ohne gesetzten Token **komplett geschlossen** (jede Anfrage → 401).

1. Vercel → Projekt → **Settings → Environment Variables**
2. Neue Variable:
   - Name: `MCP_TOKEN`
   - Value: ein langer, geheimer String (z. B. `mcp_…` aus einem Passwortgenerator)
3. Speichern und **neu deployen**, damit die Variable aktiv wird.

> Behandle den Token wie ein Passwort. Wer ihn hat, kann deine Daten lesen und
> ändern. Zum Zurückziehen einfach den Wert in Vercel ändern → alter Token ist
> sofort ungültig.

## 2. In Claude verbinden

- **claude.ai:** Settings → **Connectors** → *Add custom connector*
  - Name: `Personal OS`
  - URL: `https://<deine-domain>/api/mcp`
  - Authentifizierung: Bearer-Token → deinen `MCP_TOKEN` eintragen
- **Claude Desktop:** Settings → Connectors → gleiche Angaben.

Danach kannst du im Chat z. B. sagen: *„Zeig mir meine offenen Aufgaben"* oder
*„Leg eine Aufgabe an: Rechnung schreiben, Priorität hoch, fällig morgen."*

## 3. In ChatGPT verbinden

ChatGPTs Connector-Formular bietet aktuell nur **OAuth**, **Keine
Authentifizierung** oder **Gemischt** an — alle drei erwarten dabei
OAuth-Endpunkte (Auth-URL/Token-URL), die dieser Server nicht hat. Deshalb hier
den Token stattdessen **als Query-Parameter in der URL** übergeben:

- ChatGPT (Plus/Pro/Team) → **Settings → Connectors / Developer Mode** →
  *Add custom connector*
  - Verbindung: **Server URL**
  - URL: `https://<deine-domain>/api/mcp?key=<dein MCP_TOKEN>`
  - Authentifizierung: **Keine Authentifizierung**

> Der Server akzeptiert den Token wahlweise per `Authorization: Bearer`-Header
> (Claude) oder per `?key=`-Query-Parameter (ChatGPT) — beide prüfen gegen
> denselben `MCP_TOKEN`.

Beide Assistenten sprechen **denselben** Server – ein Token, eine URL.

## Testen (lokal / per curl)

```bash
# Handshake
curl -X POST https://<deine-domain>/api/mcp \
  -H "Authorization: Bearer $MCP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18"}}'

# Tools auflisten
curl -X POST https://<deine-domain>/api/mcp \
  -H "Authorization: Bearer $MCP_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
```

## Sicherheit

- **Bearer-Token** schützt jeden Zugriff; falscher/kein Token → `401`.
- Token-Vergleich ist längen-konstant (kein Timing-Leak).
- Nur die acht definierten Tools sind erreichbar – kein beliebiger DB-Zugriff.
- Für mehrere Nutzer oder öffentliche Freigabe später ggf. auf OAuth umstellen.
