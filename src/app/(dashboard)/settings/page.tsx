"use client";

import { useState } from "react";
import { Settings, Key, Database, Bell, User, ExternalLink, Check, Copy } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [copied, setCopied] = useState(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ojckdspmwswoctgjhhcx.supabase.co";

  function copyUrl() {
    navigator.clipboard.writeText(supabaseUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Kopiert!");
  }

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Einstellungen</h1>
        <p className="text-slate-400 text-sm mt-1">App konfigurieren und Integrationen verwalten</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <div className="card">
          <h2 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-400" /> Profil
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Name</label>
              <input defaultValue="Aaron" className="input" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">E-Mail</label>
              <input defaultValue="aaron@ahproduktion.de" className="input" />
            </div>
          </div>
        </div>

        {/* KI Coach */}
        <div className="card">
          <h2 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Key className="w-4 h-4 text-purple-400" /> KI-Coach (Anthropic)
          </h2>
          <p className="text-sm text-slate-400 mb-3">
            Für den KI-Coach benötigst du einen Anthropic API-Key. Diesen kannst du unter{" "}
            <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline inline-flex items-center gap-1">
              console.anthropic.com <ExternalLink className="w-3 h-3" />
            </a>{" "}
            erstellen.
          </p>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">ANTHROPIC_API_KEY</label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-ant-…"
                className="input"
              />
              <button
                onClick={() => { toast.success("In .env.local eintragen und App neu starten"); }}
                className="btn-primary whitespace-nowrap"
              >
                Speichern
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Trage den Key in die Datei <code className="bg-surface-tertiary px-1 rounded">.env.local</code> als <code className="bg-surface-tertiary px-1 rounded">ANTHROPIC_API_KEY</code> ein.
            </p>
          </div>
        </div>

        {/* Supabase */}
        <div className="card">
          <h2 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-green-400" /> Datenbank (Supabase)
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Supabase URL</label>
              <div className="flex gap-2">
                <input value={supabaseUrl} readOnly className="input font-mono text-xs" />
                <button onClick={copyUrl} className="btn-ghost flex-shrink-0">
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-green-400/5 border border-green-400/20 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400">Verbunden · Personal Management Tool (eu-central-1)</span>
            </div>
          </div>
        </div>

        {/* Gmail Integration */}
        <div className="card">
          <h2 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-orange-400" /> Gmail Integration
          </h2>
          <p className="text-sm text-slate-400 mb-3">
            Verbinde dein Gmail-Konto, um E-Mails direkt in der App zu verwalten.
          </p>
          <div className="p-3 bg-surface-tertiary rounded-lg">
            <p className="text-xs text-slate-400 mb-2">Konfiguration in <code className="bg-surface-border px-1 rounded">.env.local</code>:</p>
            <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
{`GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
