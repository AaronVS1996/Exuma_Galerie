"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Task, RoutineLog, Routine } from "@/types";
import { TrendingUp, CheckSquare, Flame, Target, BarChart3, Calendar } from "lucide-react";

function Bar({ value, max, color = "bg-brand-500" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function AnalyticsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [logs, setLogs] = useState<RoutineLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    Promise.all([
      supabase.from("tasks").select("*"),
      supabase.from("routines").select("*"),
      supabase.from("routine_logs").select("*").gte("date", weekAgo),
    ]).then(([{ data: t }, { data: r }, { data: l }]) => {
      setTasks((t as Task[]) || []);
      setRoutines((r as Routine[]) || []);
      setLogs((l as RoutineLog[]) || []);
      setLoading(false);
    });
  }, []);

  const done = tasks.filter(t => t.status === "done").length;
  const total = tasks.length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  const byPriority = {
    urgent: tasks.filter(t => t.priority === "urgent").length,
    high: tasks.filter(t => t.priority === "high").length,
    medium: tasks.filter(t => t.priority === "medium").length,
    low: tasks.filter(t => t.priority === "low").length,
  };

  // Last 7 days routine completion
  const days7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split("T")[0];
    const dayLogs = logs.filter(l => l.date === dateStr).length;
    return {
      date: d.toLocaleDateString("de-DE", { weekday: "short" }),
      completed: dayLogs,
      total: routines.length,
    };
  });

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Analyse</h1>
        <p className="text-slate-400 text-sm mt-1">Deine Produktivitätsübersicht</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: CheckSquare, label: "Abschlussrate", value: `${completionRate}%`, sub: `${done}/${total} Aufgaben`, color: "text-green-400", bg: "bg-green-400/10" },
          { icon: Flame, label: "Streak", value: "—", sub: "Tage in Folge", color: "text-orange-400", bg: "bg-orange-400/10" },
          { icon: Target, label: "Routinen (7T)", value: logs.length, sub: "Einträge diese Woche", color: "text-blue-400", bg: "bg-blue-400/10" },
          { icon: TrendingUp, label: "Fokus-Score", value: `${Math.min(100, completionRate + 10)}%`, sub: "Geschätzt", color: "text-purple-400", bg: "bg-purple-400/10" },
        ].map(({ icon: Icon, label, value, sub, color, bg }) => (
          <div key={label} className="card">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{loading ? "—" : value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            <p className="text-xs text-slate-600">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Routinen letzte 7 Tage */}
        <div className="card">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-400" />
            Routinen letzte 7 Tage
          </h3>
          <div className="space-y-3">
            {days7.map(({ date, completed, total: t }) => (
              <div key={date}>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{date}</span>
                  <span>{completed}/{t}</span>
                </div>
                <Bar value={completed} max={Math.max(t, 1)} color="bg-green-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Aufgaben nach Priorität */}
        <div className="card">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-orange-400" />
            Aufgaben nach Priorität
          </h3>
          <div className="space-y-4">
            {[
              { label: "Dringend", value: byPriority.urgent, color: "bg-red-400", text: "text-red-400" },
              { label: "Hoch", value: byPriority.high, color: "bg-orange-400", text: "text-orange-400" },
              { label: "Mittel", value: byPriority.medium, color: "bg-blue-400", text: "text-blue-400" },
              { label: "Niedrig", value: byPriority.low, color: "bg-slate-500", text: "text-slate-400" },
            ].map(({ label, value, color, text }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className={text}>{label}</span>
                  <span className="text-slate-400">{loading ? "—" : value} Aufgaben</span>
                </div>
                <Bar value={value} max={Math.max(...Object.values(byPriority), 1)} color={color} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Status Distribution */}
      <div className="card">
        <h3 className="font-semibold text-slate-200 mb-4">Aufgaben-Status</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Offen", count: tasks.filter(t => t.status === "todo").length, color: "text-slate-400", bg: "bg-slate-400" },
            { label: "In Arbeit", count: tasks.filter(t => t.status === "in_progress").length, color: "text-blue-400", bg: "bg-blue-400" },
            { label: "Erledigt", count: tasks.filter(t => t.status === "done").length, color: "text-green-400", bg: "bg-green-400" },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className="text-center p-4 bg-surface-tertiary rounded-xl">
              <p className={`text-3xl font-bold ${color}`}>{loading ? "—" : count}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
              <div className={`h-1 ${bg}/30 rounded-full mt-2 overflow-hidden`}>
                <div className={`h-full ${bg} rounded-full`} style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
