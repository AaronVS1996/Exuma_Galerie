export type Priority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "done";
export type Frequency = "daily" | "weekly" | "monthly";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  due_date?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  frequency: Frequency;
  target_days: number[];
  color: string;
  icon?: string;
  created_at: string;
}

export interface RoutineLog {
  id: string;
  routine_id: string;
  date: string;
  completed_at: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  target_date?: string;
  progress: number;
  status: "active" | "completed" | "paused";
  category: string;
  created_at: string;
}

export interface CoachMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface DashboardStats {
  tasksToday: number;
  tasksCompleted: number;
  routinesCompleted: number;
  routinesTotal: number;
  urgentTasks: number;
  weeklyProgress: number;
}
