"use client";

import { useState, useRef, useEffect } from "react";
import {
  BrainCircuit, Send, Loader2, Sparkles, RefreshCw,
  Database, CheckSquare, Repeat2, Target, BarChart3, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  tools_used?: string[];
}

const TOOL_META: Record<string, { icon: React.ReactNode; label: string }> = {
  get_tasks:          { icon: <CheckSquare className="w-3 h-3" />, label: "Aufgaben geladen" },
  create_task:        { icon: <Plus className="w-3 h-3" />, label: "Aufgabe erstellt" },
  update_task_status: { icon: <CheckSquare className="w-3 h-3" />, label: "Aufgabe aktualisiert" },
  get_routines:       { icon: <Repeat2 className="w-3 h-3" />, label: "Routinen geladen" },
  log_routine:        { icon: <Repeat2 className="w-3 h-3" />, label: "Routine eingetragen" },
  get_goals:          { icon: <Target className="w-3 h-3" />, label: "Ziele geladen" },
  create_goal:        { icon: <Target className="w-3 h-3" />, label: "Ziel erstellt" },
  get_analytics:      { icon: <BarChart3 className="w-3 h-3" />, label: "Analyse geladen" },
};

const STARTER_PROMPTS = [
  "Was soll ich heute zuerst tun?",
  "Erstelle eine Aufgabe: Kunde anrufen, morgen, dringend",
  "Wie ist meine Produktivität diese Woche?",
  "Analysiere meine offenen Aufgaben",
  "Welche Routinen habe ich heute noch nicht erledigt?",
  "Setze ein neues Ziel: Fitness verbessern",
];

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: `Hallo Aaron! 👋 Ich bin dein persönlicher KI-Assistent.

Ich habe **direkten Zugriff** auf deine Daten und kann aktiv handeln:

- 📋 **Aufgaben** lesen, erstellen und aktualisieren
- 🔄 **Routinen** einsehen und abhaken
- 🎯 **Ziele** verwalten und neue setzen
- 📊 **Analysen** abrufen und auswerten

Sag mir einfach was du brauchst – ich hole mir die aktuellen Daten direkt aus deiner Datenbank.`,
};

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTools]);

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return;
    const userMsg: Message = { role: "user", content };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);
    setActiveTools([]);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history
            .filter((m, i) => i > 0) // skip initial greeting
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message, tools_used: data.tools_used },
      ]);
      setActiveTools([]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Verbindungsfehler. Bitte erneut versuchen." },
      ]);
    }
    setLoading(false);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function renderMarkdown(text: string) {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^### (.*$)/gm, '<p class="font-semibold text-slate-200 mt-3 mb-1">$1</p>')
      .replace(/^## (.*$)/gm, '<p class="font-bold text-slate-100 mt-4 mb-1 text-base">$1</p>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-slate-300">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-slate-300">$2</li>')
      .replace(/\n\n/g, '</p><p class="mt-2">')
      .replace(/\n/g, "<br />");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 py-5 border-b border-surface-border bg-surface-secondary">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-100">KI-Assistent</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <p className="text-xs text-slate-500">Verbunden mit deiner Datenbank</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setMessages([INITIAL_MESSAGE])}
            className="btn-ghost flex items-center gap-2 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Neu
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn("flex gap-3 animate-slide-up", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="max-w-[85%] space-y-1.5">
                {/* Tool badges */}
                {msg.tools_used && msg.tools_used.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {[...new Set(msg.tools_used)].map((tool) => {
                      const meta = TOOL_META[tool];
                      if (!meta) return null;
                      return (
                        <span
                          key={tool}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs rounded-full"
                        >
                          {meta.icon}
                          {meta.label}
                        </span>
                      );
                    })}
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-brand-500 text-white rounded-br-sm"
                      : "bg-surface-secondary border border-surface-border text-slate-200 rounded-bl-sm"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading with tool activity */}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="space-y-2">
                <div className="bg-surface-secondary border border-surface-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                  <span className="text-xs text-slate-500">Denkt nach…</span>
                </div>
                <div className="flex items-center gap-1.5 px-1">
                  <Database className="w-3 h-3 text-brand-400 animate-pulse" />
                  <span className="text-xs text-slate-600">Greift auf deine Daten zu…</span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Starter Prompts */}
      {messages.length <= 1 && (
        <div className="px-8 py-3 border-t border-surface-border/50">
          <div className="max-w-3xl mx-auto flex flex-wrap gap-2">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-xs px-3 py-1.5 bg-surface-tertiary border border-surface-border text-slate-400 hover:text-slate-200 hover:border-slate-600 rounded-full transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-8 py-4 border-t border-surface-border bg-surface-secondary">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Frag mich alles… ich habe Zugriff auf deine Daten (Enter zum Senden)"
            rows={1}
            className="input flex-1 resize-none py-3 max-h-32"
            style={{ minHeight: "48px" }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-11 h-11 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
