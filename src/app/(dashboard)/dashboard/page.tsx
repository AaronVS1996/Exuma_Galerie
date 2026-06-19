"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Task, Routine, RoutineLog } from "@/types";
import { PRIORITY_COLORS, PRIORITY_LABELS, formatRelative } from "@/lib/utils";
import {
  CheckSquare, Clock, Flame, TrendingUp, Plus,
  ArrowRight, AlertCircle, Zap, Calendar, BrainCircuit,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [logs, setLogs] = useState<RoutineLog[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Guten Morgen" : hour < 17 ? "Guten Tag" : "Guten Abend";

  useEffect(() => {
    async function load() {
      const [{ data: t }, { data: r }, { data: l }] = await Promise.all([
        supabase.from("tasks").select("*").neq("status", "done").order("priority"),
        supabase.from("routines").select("*"),
        supabase.from("routine_logs").select("*").eq("date", today),
      ]);
      setTasks((t as Task[]) || []);
      setRoutines((r as Routine[]) || []);
      setLogs((l as RoutineLog[]) || []);
      setLoading(false);
    }
    load();
  }, [today]);

  const urgent = tasks.filter((t) => t.priority === "urgent");
  const dueToday = tasks.filter((t) => t.due_date === today);
  const routinesCompleted = logs.length;
  const completionRate =
    routines.length > 0
      ? Math.round((routinesCompleted / routines.length) * 100)
      : 0;

  const stats = [
    {
      icon: AlertCircle,
      label: "Dringend",
      value: urgent.length,
      color: "text-red-400",
      bg: "bg-red-400/10",
      sub: "Aufgaben",
    },
    {
      icon: Clock,
      label: "Heute fällig",
      value: dueToday.length,
      color: "text-orange-400",
      bg: "bg-orange-400/10",
      sub: "Aufgaben",
    },
    {
      icon: CheckSquare,
      label: "Offen",
      value: tasks.length,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      sub: "Aufgaben",
    },
    {
      icon: Flame,
      label: "Routinen",
      value: `${completionRate}%`,
      color: "text-green-400",
      bg: "bg-green-400/10",
      sub: "Heute erledigt",
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">
          {greeting}, Aaron! 👋
        </h1>
        <p className="text-slate-400 mt-1">
          {new Date().toLocaleDateString("de-DE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, color, bg, sub }) => (
          <div key={label} className="card hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <TrendingUp className="w-3 h-3 text-slate-600" />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{loading ? "—" : value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
            <p className="text-xs text-slate-600">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Tasks */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              Prioritäten heute
            </h2>
            <Link href="/tasks" className="text-xs text-brand-400 hover:underline flex items-center gap-1">
              Alle <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-14 bg-surface-tertiary rounded-lg animate-pulse" />
              ))
            ) : tasks.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Keine offenen Aufgaben</p>
              </div>
            ) : (
              tasks.slice(0, 6).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-surface-tertiary rounded-lg hover:bg-surface-border/30 transition-colors group"
                >
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    task.priority === "urgent" ? "bg-red-400" :
                    task.priority === "high" ? "bg-orange-400" :
                    task.priority === "medium" ? "bg-blue-400" : "bg-slate-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{task.title}</p>
                    {task.due_date && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatRelative(task.due_date)}
                      </p>
                    )}
                  </div>
                  <span className={`badge text-xs ${PRIORITY_COLORS[task.priority]}`}>
                    {PRIORITY_LABELS[task.priority]}
                  </span>
                </div>
              ))
            )}
          </div>
          <Link
            href="/tasks?new=1"
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-surface-border rounded-lg text-sm text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Neue Aufgabe
          </Link>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Today's Routines */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-200 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                Routinen heute
              </h2>
              <Link href="/routines" className="text-xs text-brand-400 hover:underline">
                Alle
              </Link>
            </div>
            {loading ? (
              <div className="h-20 bg-surface-tertiary rounded-lg animate-pulse" />
            ) : routines.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">
                Noch keine Routinen
              </p>
            ) : (
              <div className="space-y-2">
                {routines.slice(0, 4).map((routine) => {
                  const done = logs.some((l) => l.routine_id === routine.id);
                  return (
                    <div key={routine.id} className="flex items-center gap-3 p-2 rounded-lg">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          done ? "border-green-400 bg-green-400" : "border-slate-600"
                        }`}
                      >
                        {done && <CheckSquare className="w-3 h-3 text-white" />}
                      </div>
                      <span
                        className={`text-sm ${done ? "line-through text-slate-500" : "text-slate-300"}`}
                      >
                        {routine.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>{routinesCompleted}/{routines.length} erledigt</span>
                <span>{completionRate}%</span>
              </div>
              <div className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full transition-all"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="font-semibold text-slate-200 mb-3">Schnellzugriff</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Calendar, label: "Kalender", href: "/calendar", color: "text-purple-400" },
                { icon: BrainCircuit, label: "KI-Coach", href: "/coach", color: "text-brand-400" },
                { icon: CheckSquare, label: "Aufgaben", href: "/tasks", color: "text-blue-400" },
                { icon: TrendingUp, label: "Analyse", href: "/analytics", color: "text-green-400" },
              ].map(({ icon: Icon, label, href, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center gap-2 p-3 bg-surface-tertiary rounded-lg hover:bg-surface-border/30 transition-colors text-center"
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                  <span className="text-xs text-slate-400">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
