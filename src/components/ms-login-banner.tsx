"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { LogIn, LogOut, AlertTriangle, CheckCircle } from "lucide-react";

export default function MsLoginBanner() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (session?.error === "RefreshAccessTokenError") {
    return (
      <div className="flex items-center gap-3 p-3 bg-red-400/10 border border-red-400/30 rounded-xl mb-4">
        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
        <p className="text-sm text-red-300 flex-1">Microsoft-Sitzung abgelaufen</p>
        <button onClick={() => signIn("azure-ad")} className="text-xs text-red-400 hover:underline">
          Neu anmelden
        </button>
      </div>
    );
  }

  if (session?.accessToken) {
    return (
      <div className="flex items-center gap-3 p-3 bg-green-400/5 border border-green-400/20 rounded-xl mb-4">
        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
        <p className="text-sm text-green-300 flex-1">Microsoft verbunden</p>
        <button onClick={() => signOut()} className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1">
          <LogOut className="w-3 h-3" /> Trennen
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-surface-tertiary border border-surface-border rounded-xl mb-4">
      <div className="w-5 h-5 flex-shrink-0">
        <svg viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
          <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
          <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
          <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
        </svg>
      </div>
      <p className="text-sm text-slate-400 flex-1">Microsoft-Konto verbinden für echte Daten</p>
      <button
        onClick={() => signIn("azure-ad")}
        className="text-xs text-brand-400 hover:underline flex items-center gap-1"
      >
        <LogIn className="w-3 h-3" /> Anmelden
      </button>
    </div>
  );
}
