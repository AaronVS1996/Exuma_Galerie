# Personal OS – Management Tool für Aaron

## Was ist das?
Eine persönliche Management-App gebaut mit Next.js 15, Supabase und Claude AI.
Entwickelt in Zusammenarbeit mit Claude Code (Web-Session).

## Tech Stack
- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS v3
- **Datenbank:** Supabase (PostgreSQL) – Projekt: `ojckdspmwswoctgjhhcx` (eu-central-1)
- **KI:** Anthropic Claude API (claude-haiku-4-5) mit Tool Use
- **Auth:** NextAuth.js v4 mit Azure AD (Microsoft OAuth)

## Umgebungsvariablen (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://ojckdspmwswoctgjhhcx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qY2tkc3Btd3N3b2N0Z2poaGN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NzQ2NjcsImV4cCI6MjA5NzQ1MDY2N30.LMKgO6vYRDKq5mIBxhQstJbdz5Z43y1-GCe99G5yZJo
ANTHROPIC_API_KEY=<Aaron trägt hier seinen Key ein>
AZURE_AD_CLIENT_ID=<Azure App Client ID>
AZURE_AD_CLIENT_SECRET=<Azure App Client Secret>
NEXTAUTH_SECRET=<beliebiger zufälliger String>
NEXTAUTH_URL=http://localhost:3000
```

## App starten
```bash
npm install
npm run dev
# → http://localhost:3000
```

## Projektstruktur
```
src/
├── app/
│   ├── (dashboard)/         # Alle Seiten mit Sidebar-Layout
│   │   ├── dashboard/       # Übersicht mit KPIs
│   │   ├── tasks/           # Aufgabenverwaltung (CRUD)
│   │   ├── calendar/        # Monatskalender
│   │   ├── inbox/           # Outlook-Mail (Microsoft Graph API)
│   │   ├── routines/        # Tägliche Routinen mit Streak
│   │   ├── goals/           # Ziele mit Fortschrittsbalken
│   │   ├── coach/           # KI-Assistent mit Tool Use
│   │   ├── analytics/       # Produktivitätsanalyse
│   │   └── settings/        # API-Keys & Integrationen
│   └── api/
│       ├── coach/           # Claude API mit Agenten-Loop
│       ├── auth/            # NextAuth (Microsoft OAuth)
│       └── outlook/         # Microsoft Graph API Routen
├── components/
│   ├── sidebar.tsx          # Navigation
│   ├── ms-login-banner.tsx  # Microsoft-Login Status
│   └── session-provider.tsx # NextAuth SessionProvider
└── lib/
    ├── supabase.ts          # Supabase Client
    ├── auth.ts              # NextAuth Konfiguration
    ├── microsoft-graph.ts   # Graph API Helper
    ├── coach-tools.ts       # Claude Tool Use Definitionen & Ausführung
    └── utils.ts             # Hilfsfunktionen
```

## Datenbank-Schema (Supabase)
- `tasks` – Aufgaben (title, priority, status, due_date, tags)
- `routines` – Tägliche Routinen (name, frequency, target_days, color, icon)
- `routine_logs` – Erledigt-Einträge pro Tag (routine_id, date)
- `goals` – Ziele (title, progress, category, target_date, status)

## KI-Coach Features (Tool Use)
Claude kann direkt in die Datenbank greifen:
- `get_tasks` / `create_task` / `update_task_status`
- `get_routines` / `log_routine`
- `get_goals` / `create_goal`
- `get_analytics`

## Microsoft Integration
- OAuth via Azure AD (NextAuth)
- Outlook Mail: `/api/outlook/mail`
- Outlook Kalender: `/api/outlook/calendar`
- Azure-App registrieren unter: portal.azure.com
- Redirect URI: `http://localhost:3000/api/auth/callback/azure-ad`

## Offene TODOs / Nächste Schritte
- [ ] Microsoft-Kalender in Kalender-Seite integrieren (Events von Graph API anzeigen)
- [ ] Persistente Coach-Gesprächshistorie in Supabase speichern
- [ ] Google Calendar Integration (alternativ zu Microsoft)
- [ ] Push-Benachrichtigungen für fällige Aufgaben
- [ ] Tagesplan-Automatisierung (morgens automatisch KI-Briefing)
- [ ] Vercel Deployment einrichten

## Design
- Dark Mode, Farben definiert in tailwind.config.ts
- Hauptfarbe: `brand` (#0ea5e9 sky-blue)
- Hintergrund: `surface` (#0f1117), `surface-secondary` (#1a1d27)
- Komponenten: `.card`, `.btn-primary`, `.btn-ghost`, `.input`, `.badge`

## Git Branch
`claude/personal-management-tool-smi6cx`
