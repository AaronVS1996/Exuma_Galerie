"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Task, Priority, TaskStatus } from "@/types";
import { PRIORITY_COLORS, PRIORITY_LABELS, formatRelative, cn } from "@/lib/utils";
import {
  Plus, Search, Filter, CheckCircle2, Circle, Clock,
  Trash2, Edit3, X, Calendar, Tag, AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const PRIORITIES: Priority[] = ["urgent", "high", "medium", "low"];
const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "Offen" },
  { value: "in_progress", label: "In Arbeit" },
  { value: "done", label: "Erledigt" },
];

interface TaskFormData {
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  due_date: string;
  tags: string;
}

const DEFAULT_FORM: TaskFormData = {
  title: "",
  description: "",
  priority: "medium",
  status: "todo",
  due_date: "",
  tags: "",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskFormData>(DEFAULT_FORM);

  const load = useCallback(async () => {
    const { data } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
    setTasks((data as Task[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tasks.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title,
      description: form.description || null,
      priority: form.priority,
      status: form.status,
      due_date: form.due_date || null,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };
    if (editTask) {
      const { error } = await supabase.from("tasks").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editTask.id);
      if (error) { toast.error("Fehler beim Speichern"); return; }
      toast.success("Aufgabe aktualisiert");
    } else {
      const { error } = await supabase.from("tasks").insert({ ...payload, updated_at: new Date().toISOString() });
      if (error) { toast.error("Fehler beim Erstellen"); return; }
      toast.success("Aufgabe erstellt");
    }
    setShowForm(false);
    setEditTask(null);
    setForm(DEFAULT_FORM);
    load();
  }

  async function toggleStatus(task: Task) {
    const next = task.status === "done" ? "todo" : task.status === "todo" ? "in_progress" : "done";
    await supabase.from("tasks").update({ status: next, updated_at: new Date().toISOString() }).eq("id", task.id);
    load();
  }

  async function deleteTask(id: string) {
    await supabase.from("tasks").delete().eq("id", id);
    toast.success("Aufgabe gelöscht");
    load();
  }

  function openEdit(task: Task) {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      due_date: task.due_date || "",
      tags: task.tags?.join(", ") || "",
    });
    setShowForm(true);
  }

  const StatusIcon = ({ status }: { status: TaskStatus }) => {
    if (status === "done") return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    if (status === "in_progress") return <Clock className="w-5 h-5 text-blue-400" />;
    return <Circle className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Aufgaben</h1>
          <p className="text-slate-400 text-sm mt-1">{tasks.filter(t => t.status !== "done").length} offen · {tasks.filter(t => t.status === "done").length} erledigt</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditTask(null); setForm(DEFAULT_FORM); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Neue Aufgabe
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Aufgaben suchen…"
            className="input pl-9"
          />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as TaskStatus | "all")} className="input w-auto">
          <option value="all">Alle Status</option>
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as Priority | "all")} className="input w-auto">
          <option value="all">Alle Prioritäten</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {loading ? (
          Array(5).fill(0).map((_, i) => <div key={i} className="h-16 bg-surface-secondary rounded-xl animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Keine Aufgaben gefunden</p>
          </div>
        ) : (
          filtered.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-center gap-4 p-4 bg-surface-secondary border border-surface-border rounded-xl transition-all hover:border-slate-600 group",
                task.status === "done" && "opacity-60"
              )}
            >
              <button onClick={() => toggleStatus(task)} className="flex-shrink-0">
                <StatusIcon status={task.status} />
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", task.status === "done" ? "line-through text-slate-500" : "text-slate-200")}>
                  {task.title}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  {task.due_date && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatRelative(task.due_date)}
                    </span>
                  )}
                  {task.tags?.map((tag) => (
                    <span key={tag} className="text-xs px-1.5 py-0.5 bg-surface-tertiary text-slate-400 rounded flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>
                {PRIORITY_LABELS[task.priority]}
              </span>
              <div className="hidden group-hover:flex items-center gap-1">
                <button onClick={() => openEdit(task)} className="p-1.5 hover:bg-surface-tertiary rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteTask(task.id)} className="p-1.5 hover:bg-red-400/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-secondary border border-surface-border rounded-2xl w-full max-w-lg p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-100">{editTask ? "Aufgabe bearbeiten" : "Neue Aufgabe"}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Titel *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Was muss erledigt werden?" className="input" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Beschreibung</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Details…" rows={3} className="input resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Priorität</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })} className="input">
                    {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })} className="input">
                    {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Fälligkeitsdatum</label>
                  <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Tags (kommagetrennt)</label>
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="arbeit, projekt…" className="input" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Abbrechen</button>
                <button type="submit" className="btn-primary">{editTask ? "Speichern" : "Erstellen"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
