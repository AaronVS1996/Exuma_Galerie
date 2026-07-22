"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Mail,
  Repeat2,
  BrainCircuit,
  BarChart3,
  Target,
  Settings,
  ChevronRight,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tasks", icon: CheckSquare, label: "Aufgaben" },
  { href: "/calendar", icon: Calendar, label: "Kalender" },
  { href: "/inbox", icon: Mail, label: "Posteingang" },
  { href: "/routines", icon: Repeat2, label: "Routinen" },
  { href: "/goals", icon: Target, label: "Ziele" },
  { href: "/coach", icon: BrainCircuit, label: "KI-Coach" },
  { href: "/analytics", icon: BarChart3, label: "Analyse" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-surface-secondary border-r border-surface-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-blue-600 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-100">Personal OS</h1>
            <p className="text-xs text-slate-500">Dein Management Tool</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                active
                  ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-surface-tertiary"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  active ? "text-brand-400" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 text-brand-400/50" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-surface-border">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-surface-tertiary transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Einstellungen</span>
        </Link>
        <div className="mt-3 px-3 py-2.5 rounded-lg bg-surface-tertiary">
          <p className="text-xs text-slate-500">Eingeloggt als</p>
          <p className="text-xs font-medium text-slate-300 truncate">aaron@ahproduktion.de</p>
        </div>
      </div>
    </aside>
  );
}
