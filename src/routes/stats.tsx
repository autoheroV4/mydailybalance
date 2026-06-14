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
  Legend,
} from "recharts";
import { loadHabits, last7Days, type Habit } from "@/lib/habits";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Статистика — Life Balance Tracker" },
      { name: "description", content: "График выполнения привычек за последние 7 дней." },
    ],
  }),
  component: Stats,
});

function dayLabel(iso: string): string {
  const d = new Date(iso);
  return ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][d.getDay()];
}

function Stats() {
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    setHabits(loadHabits());
  }, []);

  const data = useMemo(() => {
    const days = last7Days();
    return days.map((day) => {
      let friction = 0;
      let going = 0;
      for (const h of habits) {
        if (h.completions.includes(day)) {
          if (h.type === "friction") friction++;
          else going++;
        }
      }
      return { day: dayLabel(day), date: day, Friction: friction, "Going Well": going };
    });
  }, [habits]);

  const totalFriction = data.reduce((s, d) => s + d.Friction, 0);
  const totalGoing = data.reduce((s, d) => s + (d["Going Well"] as number), 0);

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
          <p className="font-display text-2xl sm:text-3xl leading-tight">
            Последние <span className="italic">7 дней</span>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Сколько привычек отмечено каждый день.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <StatCard label="Friction всего" value={totalFriction} tone="friction" />
          <StatCard label="Going Well всего" value={totalGoing} tone="going" />
        </div>

        <ChartBlock title="Friction" color="var(--friction)" data={data} dataKey="Friction" />
        <div className="h-8" />
        <ChartBlock title="Going Well" color="var(--going)" data={data} dataKey="Going Well" />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "friction" | "going";
}) {
  return (
    <div
      className={
        "rounded-2xl border border-border p-5 " +
        (tone === "friction" ? "bg-friction-muted" : "bg-going-muted")
      }
    >
      <div className={"text-xs " + (tone === "friction" ? "text-friction" : "text-going")}>
        {label}
      </div>
      <div className="font-display text-3xl mt-1">{value}</div>
    </div>
  );
}

function ChartBlock({
  title,
  color,
  data,
  dataKey,
}: {
  title: string;
  color: string;
  data: Array<Record<string, string | number>>;
  dataKey: string;
}) {
  return (
    <div className="rounded-2xl border border-border p-4 sm:p-6 bg-card">
      <h2 className="font-display text-xl mb-4">{title}</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
            <XAxis
              dataKey="day"
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
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
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
