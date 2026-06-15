import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { loadHabits, todayKey, type Habit } from "@/lib/habits";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Статистика — Life Balance Tracker" },
      { name: "description", content: "График выполнения привычек за последние 7 дней." },
    ],
  }),
  component: Stats,
});

const DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

// Возвращает 7 дат с понедельника текущей недели по воскресенье.
function currentWeekMonToSun(): string[] {
  const today = new Date();
  const dow = today.getDay(); // 0=Вс..6=Сб
  const offsetToMonday = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + offsetToMonday);
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(todayKey(d));
  }
  return days;
}

function Stats() {
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    setHabits(loadHabits());
  }, []);

  const frictionTotal = habits.filter((h) => h.type === "friction").length;
  const goingTotal = habits.filter((h) => h.type === "going").length;

  const data = useMemo(() => {
    const days = currentWeekMonToSun();
    return days.map((day, i) => {
      let frictionDone = 0;
      let goingDone = 0;
      for (const h of habits) {
        if (h.completions.includes(day)) {
          if (h.type === "friction") frictionDone++;
          else goingDone++;
        }
      }
      // Friction: чем больше отмечено (= удержался), тем НИЖЕ столбик
      const frictionBar = Math.max(0, frictionTotal - frictionDone);
      return {
        day: DAY_LABELS[i],
        Friction: frictionBar,
        "Going Well": goingDone,
      };
    });
  }, [habits, frictionTotal]);

  const maxY = Math.max(frictionTotal, goingTotal, 1);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        <header className="flex items-center justify-between mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl">Статистика</h1>
          <div className="w-16" />
        </header>

        <div className="mb-8 max-w-2xl">
          <p className="font-display text-3xl sm:text-4xl leading-tight">
            Эта <span className="italic">неделя</span>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            С понедельника по воскресенье.
          </p>
        </div>

        <div className="rounded-2xl border border-border p-4 sm:p-6 bg-card">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
                barCategoryGap="25%"
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, maxY]}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--accent)", opacity: 0.3 }}
                  contentStyle={{
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="Friction" fill="var(--friction)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Going Well" fill="var(--going)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-friction inline-block" />
              <span className="font-medium">Friction</span>
              <span className="text-muted-foreground">— чем ниже тем лучше</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-going inline-block" />
              <span className="font-medium">Going Well</span>
              <span className="text-muted-foreground">— чем выше тем лучше</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
