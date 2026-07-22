"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Goal } from "@/types";
import { cn, formatRelative } from "@/lib/utils";
import { Plus, Target, Edit3, Trash2, X, TrendingUp, CheckCircle2, Pause } from "lucide-react";
import toast from "react-hot-toast";

interface FormData {
  title: string; description: string; target_date: string;
  progress: number; status: string; category: string;
}
const DEFAULT_FORM: FormData = { title: "", description: "", target_date: "", progress: 0, status: "active", category: "persönlich" };
const CATEGORIES = ["persönlich","beruf","gesundheit","finanzen","bildung","kreativität","beziehungen"];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);

  const load = useCallback(async () => {
    const { data } = await supabase.from("goals").select("*").order("created_at", { ascending: false });
    setGoals((data as Goal[]) || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, description: form.description || null, target_date: form.target_date || null, progress: Number(form.progress) };
    if (editGoal) {
      await supabase.from("goals").update(payload).eq("id", editGoal.id);
      toast.success("Ziel aktualisiert");
    } else {
      await supabase.from("goals").insert(payload);
      toast.success("Ziel erstellt! 🎯");
    }
    setShowForm(false); setEditGoal(null); setForm(DEFAULT_FORM);
    load();
  }

  async function deleteGoal(id: string) {
    await supabase.from("goals").delete().eq("id", id);
    toast.success("Ziel gelöscht");
    load();
  }

  const active = goals.filter(g => g.status === "active");
  const completed = goals.filter(g => g.status === "completed");

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Ziele</h1>
          <p className="text-slate-400 text-sm mt-1">{active.length} aktiv · {completed.length} erreicht</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditGoal(null); setForm(DEFAULT_FORM); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Neues Ziel
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-20">
          <Target className="w-12 h-12 mx-auto mb-4 text-slate-600" />
          <h3 className="font-medium text-slate-300 mb-2">Noch keine Ziele</h3>
          <p className="text-sm text-slate-500">Setze dir klare Ziele, um deine Produktivität zu steigern</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => (
            <div key={goal.id} className="card group hover:border-slate-600 transition-colors">
              <div className="flex items-start gap-4">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                  goal.status === "completed" ? "bg-green-400/10" : goal.status === "paused" ? "bg-slate-400/10" : "bg-brand-500/10"
                )}>
                  {goal.status === "completed" ? <CheckCircle2 className="w-4 h-4 text-green-400" /> :
                   goal.status === "paused" ? <Pause className="w-4 h-4 text-slate-400" /> :
                   <Target className="w-4 h-4 text-brand-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-200">{goal.title}</p>
                      {goal.description && <p className="text-xs text-slate-500 mt-0.5">{goal.description}</p>}
                    </div>
                    <div className="hidden group-hover:flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => { setEditGoal(goal); setForm({ title: goal.title, description: goal.description || "", target_date: goal.target_date || "", progress: goal.progress, status: goal.status, category: goal.category }); setShowForm(true); }} className="p-1.5 hover:bg-surface-tertiary rounded-lg text-slate-400">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteGoal(goal.id)} className="p-1.5 hover:bg-red-400/10 rounded-lg text-slate-400 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 mb-2">
                    <span className="badge bg-surface-tertiary text-slate-400 text-xs">{goal.category}</span>
                    {goal.target_date && <span className="text-xs text-slate-500">{formatRelative(goal.target_date)}</span>}
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Fortschritt</span>
                      <span className="font-medium">{goal.progress}%</span>
                    </div>
                    <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-700",
                          goal.progress === 100 ? "bg-green-400" : "bg-gradient-to-r from-brand-500 to-blue-400"
                        )}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-secondary border border-surface-border rounded-2xl w-full max-w-lg p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-100">{editGoal ? "Ziel bearbeiten" : "Neues Ziel"}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Ziel *</label>
                <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Was möchtest du erreichen?" className="input" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Beschreibung</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="input resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Kategorie</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input">
                    <option value="active">Aktiv</option>
                    <option value="paused">Pausiert</option>
                    <option value="completed">Erreicht</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Zieldatum</label>
                  <input type="date" value={form.target_date} onChange={e => setForm({...form, target_date: e.target.value})} className="input" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Fortschritt: {form.progress}%</label>
                  <input type="range" min="0" max="100" value={form.progress} onChange={e => setForm({...form, progress: Number(e.target.value)})} className="w-full mt-2 accent-brand-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Abbrechen</button>
                <button type="submit" className="btn-primary">{editGoal ? "Speichern" : "Erstellen"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
