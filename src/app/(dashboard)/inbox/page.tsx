"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Mail, Search, Star, Archive, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import MsLoginBanner from "@/components/ms-login-banner";
import type { OutlookMessage } from "@/lib/microsoft-graph";

export default function InboxPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<OutlookMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  async function fetchMail() {
    if (!session?.accessToken) return;
    setLoading(true);
    try {
      const res = await fetch("/api/outlook/mail");
      const data = await res.json();
      setMessages(data.messages || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session?.accessToken) fetchMail();
  }, [session?.accessToken]);

  const filtered = messages.filter(m =>
    !search ||
    m.subject?.toLowerCase().includes(search.toLowerCase()) ||
    m.from?.emailAddress?.name?.toLowerCase().includes(search.toLowerCase())
  );

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffH = (now.getTime() - d.getTime()) / 3600000;
    if (diffH < 24) return d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    if (diffH < 48) return "Gestern";
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
  }

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Posteingang</h1>
          <p className="text-slate-400 text-sm mt-1">
            {session?.accessToken ? `${messages.filter(m => !m.isRead).length} ungelesen` : "Outlook verbinden"}
          </p>
        </div>
        {session?.accessToken && (
          <button onClick={fetchMail} disabled={loading} className="btn-ghost flex items-center gap-2">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Aktualisieren
          </button>
        )}
      </div>

      <MsLoginBanner />

      {session?.accessToken && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="E-Mails suchen…" className="input pl-9" />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        </div>
      ) : filtered.length === 0 && session?.accessToken ? (
        <div className="text-center py-16 text-slate-500">
          <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Keine E-Mails gefunden</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map(msg => (
            <div
              key={msg.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer group",
                !msg.isRead
                  ? "bg-surface-secondary border border-surface-border hover:border-slate-600"
                  : "hover:bg-surface-secondary/50"
              )}
            >
              <div className={cn("w-2 h-2 rounded-full flex-shrink-0", !msg.isRead ? "bg-brand-400" : "bg-transparent")} />
              <div className="w-9 h-9 rounded-full bg-surface-tertiary flex items-center justify-center flex-shrink-0 text-sm font-medium text-slate-400">
                {msg.from?.emailAddress?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm truncate", !msg.isRead ? "font-semibold text-slate-100" : "text-slate-300")}>
                  {msg.from?.emailAddress?.name || msg.from?.emailAddress?.address}
                </p>
                <p className={cn("text-sm truncate", !msg.isRead ? "text-slate-200" : "text-slate-400")}>
                  {msg.subject || "(Kein Betreff)"}
                </p>
                <p className="text-xs text-slate-500 truncate">{msg.bodyPreview}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <p className="text-xs text-slate-500">{formatTime(msg.receivedDateTime)}</p>
                {msg.importance === "high" && (
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                )}
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Archive className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
