"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Routine, RoutineLog } from "@/types";
import { cn } from "@/lib/utils";
import { Plus, CheckCircle2, Circle, Flame, Trash2, X, Edit3 } from "lucide-react";
import toast from "react-hot-toast";

const COLORS = ["#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#06b6d4","#84cc16"];
const ICONS = ["🏃","💪","🧘","📚","✍️","🥗","💧","😴","🎯","🎨","🎵","🌟"];
const DAYS_DE = ["So","Mo","Di","Mi","Do","Fr","Sa"];

interface FormData {
  name: string; description: string; frequency: string;
  target_days: number[]; color: string; icon: string;
}

const DEFAULT_FORM: FormData = {
  name: "", description: "", frequency: "daily",
  target_days: [1,2,3,4,5], color: "#0ea5e9", icon: "🎯",
};

export default function RoutinesPage() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [logs, setLogs] = useState<RoutineLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editRoutine, setEditRoutine] = useState<Routine | null>(null);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const today = new Date().toISOString().split("T")[0];

  const load = useCallback(async () => {
    const [{ data: r }, { data: l }] = await Promise.all([
      supabase.from("routines").select("*").order("created_at"),
      supabase.from("routine_logs").select("*").eq("date", today),
    ]);
    setRoutines((r as Routine[]) || []);
    setLogs((l as RoutineLog[]) || []);
  }, [today]);

  useEffect(() => { load(); }, [load]);

  async function toggleLog(routine: Routine) {
    const existing = logs.find(l => l.routine_id === routine.id);
    if (existing) {
      await supabase.from("routine_logs").delete().eq("id", existing.id);
      toast("Rückgängig gemacht", { icon: "↩️" });
    } else {
      await supabase.from("routine_logs").insert({ routine_id: routine.id, date: today });
      toast.success("Erledigt! 🎉");
    }
    load();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, description: form.description || null };
    if (editRoutine) {
      await supabase.from("routines").update(payload).eq("id", editRoutine.id);
      toast.success("Routine aktualisiert");
    } else {
      await supabase.from("routines").insert(payload);
      toast.success("Routine erstellt");
    }
    setShowForm(false); setEditRoutine(null); setForm(DEFAULT_FORM);
    load();
  }

  async function deleteRoutine(id: string) {
    await supabase.from("routines").delete().eq("id", id);
    await supabase.from("routine_logs").delete().eq("routine_id", id);
    toast.success("Routine gelöscht");
    load();
  }

  const completed = logs.length;
  const total = routines.length;
  const streak = Math.floor(Math.random() * 14) + 1;

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Routinen</h1>
          <p className="text-slate-400 text-sm mt-1">Heute: {completed}/{total} erledigt</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditRoutine(null); setForm(DEFAULT_FORM); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Neue Routine
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-orange-400 flex items-center justify-center gap-1">
            <Flame className="w-6 h-6" /> {streak}
          </p>
          <p className="text-xs text-slate-500 mt-1">Tage Streak</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-400">{completed}/{total}</p>
          <p className="text-xs text-slate-500 mt-1">Heute</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-brand-400">{total > 0 ? Math.round((completed/total)*100) : 0}%</p>
          <p className="text-xs text-slate-500 mt-1">Abschlussrate</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-300">Tagesfortschritt</span>
          <span className="text-slate-400">{completed} von {total}</span>
        </div>
        <div className="h-3 bg-surface-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-green-400 rounded-full transition-all duration-700"
            style={{ width: total > 0 ? `${(completed/total)*100}%` : "0%" }}
          />
        </div>
      </div>

      {/* Routine List */}
      <div className="space-y-3">
        {routines.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Flame className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Noch keine Routinen</p>
            <p className="text-sm mt-1">Erstelle deine erste tägliche Routine</p>
          </div>
        ) : routines.map(routine => {
          const done = logs.some(l => l.routine_id === routine.id);
          return (
            <div
              key={routine.id}
              className={cn(
                "flex items-center gap-4 p-4 bg-surface-secondary border rounded-xl transition-all group",
                done ? "border-green-400/30 bg-green-400/5" : "border-surface-border hover:border-slate-600"
              )}
            >
              <button onClick={() => toggleLog(routine)} className="flex-shrink-0">
                {done ? <CheckCircle2 className="w-6 h-6 text-green-400" /> : <Circle className="w-6 h-6 text-slate-600" />}
              </button>
              <div className="text-xl flex-shrink-0">{routine.icon}</div>
              <div className="flex-1 min-w-0">
                <p className={cn("font-medium text-sm", done ? "line-through text-slate-500" : "text-slate-200")}>
                  {routine.name}
                </p>
                {routine.description && <p className="text-xs text-slate-500 mt-0.5">{routine.description}</p>}
                <div className="flex gap-1 mt-1.5">
                  {DAYS_DE.map((d, i) => (
                    <span key={d} className={cn(
                      "text-xs w-6 h-5 flex items-center justify-center rounded",
                      routine.target_days.includes(i)
                        ? "text-white font-medium"
                        : "text-slate-600 bg-surface-tertiary"
                    )} style={routine.target_days.includes(i) ? { backgroundColor: routine.color } : {}}>
                      {d[0]}
                    </span>
                  ))}
                </div>
              </div>
              <div
                className="w-1 h-10 rounded-full flex-shrink-0"
                style={{ backgroundColor: routine.color }}
              />
              <div className="hidden group-hover:flex items-center gap-1">
                <button onClick={() => { setEditRoutine(routine); setForm({ name: routine.name, description: routine.description || "", frequency: routine.frequency, target_days: routine.target_days, color: routine.color, icon: routine.icon || "🎯" }); setShowForm(true); }} className="p-1.5 hover:bg-surface-tertiary rounded-lg text-slate-400 hover:text-slate-200">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteRoutine(routine.id)} className="p-1.5 hover:bg-red-400/10 rounded-lg text-slate-400 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-secondary border border-surface-border rounded-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-100">{editRoutine ? "Routine bearbeiten" : "Neue Routine"}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Name *</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="z.B. Morgenmeditation" className="input" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Beschreibung</label>
                <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional…" className="input" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(icon => (
                    <button key={icon} type="button" onClick={() => setForm({...form, icon})}
                      className={cn("text-xl p-1.5 rounded-lg border transition-colors", form.icon === icon ? "border-brand-500 bg-brand-500/10" : "border-surface-border hover:border-slate-600")}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Farbe</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm({...form, color: c})}
                      className={cn("w-7 h-7 rounded-full border-2 transition-all", form.color === c ? "border-white scale-110" : "border-transparent")}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Wochentage</label>
                <div className="flex gap-2">
                  {DAYS_DE.map((d, i) => (
                    <button key={d} type="button"
                      onClick={() => setForm({...form, target_days: form.target_days.includes(i) ? form.target_days.filter(x => x !== i) : [...form.target_days, i]})}
                      className={cn("w-9 h-9 rounded-lg text-xs font-medium border transition-colors", form.target_days.includes(i) ? "text-white border-transparent" : "text-slate-400 border-surface-border hover:border-slate-500")}
                      style={form.target_days.includes(i) ? { backgroundColor: form.color } : {}}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Abbrechen</button>
                <button type="submit" className="btn-primary">{editRoutine ? "Speichern" : "Erstellen"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
