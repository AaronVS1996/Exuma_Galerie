"use client";

import { useState } from "react";
import { Mail, Search, Star, Archive, Trash2, RefreshCw, ExternalLink, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function InboxPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Posteingang</h1>
          <p className="text-slate-400 text-sm mt-1">Gmail-Integration</p>
        </div>
        <button className="btn-ghost flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Aktualisieren
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="E-Mails suchen…" className="input pl-9" />
      </div>

      {/* Info Banner */}
      <div className="card mb-6 border-brand-500/30 bg-brand-500/5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-slate-200 text-sm">Gmail-Integration einrichten</h3>
            <p className="text-xs text-slate-400 mt-1">
              Um deine E-Mails hier anzuzeigen, musst du die Gmail API verbinden.
              Öffne die Einstellungen und füge deine Google OAuth-Zugangsdaten hinzu.
            </p>
            <button className="mt-3 text-xs text-brand-400 hover:underline flex items-center gap-1">
              Zu den Einstellungen <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Mock Emails */}
      <div className="space-y-1">
        {[
          { from: "team@slack.com", subject: "Aaron, du hast 3 neue Nachrichten", preview: "Du hast neue Aktivitäten in deinem Workspace…", time: "09:42", unread: true, starred: false },
          { from: "github@github.com", subject: "[PR] Feature: Dashboard updates", preview: "A pull request has been opened in your repository…", time: "08:15", unread: true, starred: true },
          { from: "noreply@notion.so", subject: "Deine Wochenübersicht", preview: "Hier ist deine wöchentliche Zusammenfassung…", time: "Gestern", unread: false, starred: false },
          { from: "kontakt@example.de", subject: "Angebot: Webseitenprojekt", preview: "Sehr geehrter Herr Schmidt, wir haben Ihr Angebot geprüft…", time: "Gestern", unread: false, starred: true },
          { from: "info@digitalocean.com", subject: "Rechnung #12345", preview: "Ihre monatliche Rechnung von DigitalOcean…", time: "Mo", unread: false, starred: false },
        ].map((email, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer group",
              email.unread
                ? "bg-surface-secondary border border-surface-border hover:border-slate-600"
                : "hover:bg-surface-secondary/50"
            )}
          >
            <div className={cn("w-2 h-2 rounded-full flex-shrink-0", email.unread ? "bg-brand-400" : "bg-transparent")} />
            <div className="w-9 h-9 rounded-full bg-surface-tertiary flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={cn("text-sm truncate", email.unread ? "font-semibold text-slate-100" : "text-slate-300")}>{email.from}</p>
              </div>
              <p className={cn("text-sm truncate", email.unread ? "text-slate-200" : "text-slate-400")}>{email.subject}</p>
              <p className="text-xs text-slate-500 truncate">{email.preview}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <p className="text-xs text-slate-500">{email.time}</p>
              <button className={cn("opacity-0 group-hover:opacity-100 transition-opacity", email.starred ? "opacity-100" : "")}>
                <Star className={cn("w-4 h-4", email.starred ? "text-yellow-400 fill-yellow-400" : "text-slate-600")} />
              </button>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Archive className="w-4 h-4 text-slate-600 hover:text-slate-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
