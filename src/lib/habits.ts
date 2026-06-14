export type HabitType = "friction" | "going";

export interface Habit {
  id: string;
  name: string;
  type: HabitType;
  createdAt: string; // ISO date
  completions: string[]; // YYYY-MM-DD
}

const KEY = "lbt.habits.v1";

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function loadHabits(): Habit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Habit[];
  } catch {
    return [];
  }
}

export function saveHabits(habits: Habit[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(habits));
}

export function currentStreak(completions: string[]): number {
  if (completions.length === 0) return 0;
  const set = new Set(completions);
  let streak = 0;
  const d = new Date();
  // if today not done, start from yesterday so streak doesn't reset mid-day
  if (!set.has(todayKey(d))) {
    d.setDate(d.getDate() - 1);
  }
  while (set.has(todayKey(d))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function last7Days(): string[] {
  const days: string[] = [];
  const d = new Date();
  for (let i = 6; i >= 0; i--) {
    const nd = new Date(d);
    nd.setDate(d.getDate() - i);
    days.push(todayKey(nd));
  }
  return days;
}

export function weekProgress(completions: string[]): number {
  const days = last7Days();
  const set = new Set(completions);
  const hits = days.filter((d) => set.has(d)).length;
  return Math.round((hits / 7) * 100);
}
