"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Task } from "@/types";
import { PRIORITY_COLORS } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number): number {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selected, setSelected] = useState<number | null>(now.getDate());

  useEffect(() => {
    const from = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const to = `${year}-${String(month + 1).padStart(2, "0")}-${getDaysInMonth(year, month)}`;
    supabase.from("tasks").select("*").gte("due_date", from).lte("due_date", to)
      .then(({ data }) => setTasks((data as Task[]) || []));
  }, [year, month]);

  function prev() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function next() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const days = getDaysInMonth(year, month);
  const offset = getFirstDayOfMonth(year, month);
  const selectedDate = selected ? `${year}-${String(month + 1).padStart(2, "0")}-${String(selected).padStart(2, "0")}` : null;
  const selectedTasks = tasks.filter(t => t.due_date === selectedDate);

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Kalender</h1>
          <p className="text-slate-400 text-sm mt-1">{tasks.length} Aufgaben diesen Monat</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-slate-100 text-lg">{MONTHS[month]} {year}</h2>
            <div className="flex items-center gap-2">
              <button onClick={prev} className="btn-ghost p-2"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()); setSelected(now.getDate()); }} className="text-xs text-brand-400 hover:underline px-2">Heute</button>
              <button onClick={next} className="btn-ghost p-2"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-medium text-slate-500 py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {Array(offset).fill(null).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: days }, (_, i) => i + 1).map(day => {
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayTasks = tasks.filter(t => t.due_date === dateStr);
              const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
              const isSelected = day === selected;
              return (
                <button
                  key={day}
                  onClick={() => setSelected(day)}
                  className={cn(
                    "aspect-square rounded-lg flex flex-col items-center justify-start pt-1.5 text-sm transition-all relative",
                    isSelected ? "bg-brand-500 text-white" :
                    isToday ? "bg-brand-500/20 text-brand-400 border border-brand-500/40" :
                    "hover:bg-surface-tertiary text-slate-300"
                  )}
                >
                  <span className="text-xs font-medium">{day}</span>
                  {dayTasks.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayTasks.slice(0, 3).map((t, i) => (
                        <div key={i} className={cn(
                          "w-1 h-1 rounded-full",
                          isSelected ? "bg-white/70" :
                          t.priority === "urgent" ? "bg-red-400" :
                          t.priority === "high" ? "bg-orange-400" :
                          t.priority === "medium" ? "bg-blue-400" : "bg-slate-500"
                        )} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Tasks */}
        <div className="card">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <CalIcon className="w-4 h-4 text-brand-400" />
            {selected ? `${String(selected).padStart(2, "0")}.${String(month + 1).padStart(2, "0")}.${year}` : "Datum wählen"}
          </h3>
          {selectedTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">Keine Aufgaben</p>
              <p className="text-xs text-slate-600 mt-1">Klicke auf einen Tag</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedTasks.map(task => (
                <div key={task.id} className="p-3 bg-surface-tertiary rounded-lg">
                  <p className="text-sm text-slate-200">{task.title}</p>
                  <span className={`badge mt-1 text-xs ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
