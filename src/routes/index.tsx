import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Moon, Sun, Scale, BarChart3 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  type Habit,
  type HabitType,
  loadHabits,
  saveHabits,
  todayKey,
} from "@/lib/habits";
import { applyTheme, getInitialTheme, type Theme } from "@/lib/theme";
import { HabitCard } from "@/components/HabitCard";
import { AddHabit } from "@/components/AddHabit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Life Balance Tracker — баланс привычек" },
      {
        name: "description",
        content:
          "Отслеживайте что помогает и что мешает. Простой трекер привычек с сериями и прогрессом.",
      },
      { property: "og:title", content: "Life Balance Tracker" },
      {
        property: "og:description",
        content: "Простой трекер привычек: Friction vs Going Well.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: App,
});

function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHabits(loadHabits());
    const t = getInitialTheme();
    setTheme(t);
    applyTheme(t);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveHabits(habits);
  }, [habits, mounted]);

  const toggleTheme = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
  };

  const addHabit = (type: HabitType) => (name: string) => {
    setHabits((h) => [
      ...h,
      {
        id: crypto.randomUUID(),
        name,
        type,
        createdAt: new Date().toISOString(),
        completions: [],
      },
    ]);
  };

  const toggleHabit = (id: string) => {
    const today = todayKey();
    setHabits((hs) =>
      hs.map((h) => {
        if (h.id !== id) return h;
        const done = h.completions.includes(today);
        return {
          ...h,
          completions: done
            ? h.completions.filter((d) => d !== today)
            : [...h.completions, today],
        };
      }),
    );
  };

  const deleteHabit = (id: string) => {
    setHabits((hs) => hs.filter((h) => h.id !== id));
  };

  const friction = useMemo(() => habits.filter((h) => h.type === "friction"), [habits]);
  const going = useMemo(() => habits.filter((h) => h.type === "going"), [habits]);

  const today = todayKey();
  const doneToday = habits.filter((h) => h.completions.includes(today)).length;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-10 sm:mb-14">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-foreground text-background flex items-center justify-center">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl leading-none">
                Life Balance
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                {doneToday} из {habits.length || 0} отмечено сегодня
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/stats"
              aria-label="Статистика"
              className="h-10 w-10 rounded-xl border border-border flex items-center justify-center hover:bg-accent transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
            </Link>
            <button
              onClick={toggleTheme}
              aria-label="Сменить тему"
              className="h-10 w-10 rounded-xl border border-border flex items-center justify-center hover:bg-accent transition-colors"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Hero line */}
        <div className="mb-10 sm:mb-12 max-w-2xl">
          <p className="font-display text-3xl sm:text-5xl leading-tight">
            Что <span className="italic text-friction">мешает</span>, а что{" "}
            <span className="italic text-going">помогает</span> сегодня?
          </p>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <Column
            type="friction"
            title="Friction"
            subtitle="Что мешает"
            hint="Отметь если удержался сегодня"
            count={friction.length}
            items={friction}
            onAdd={addHabit("friction")}
            onToggle={toggleHabit}
            onDelete={deleteHabit}
          />
          <Column
            type="going"
            title="Going Well"
            subtitle="Что помогает"
            hint="Отметь если уделил время этому"
            count={going.length}
            items={going}
            onAdd={addHabit("going")}
            onToggle={toggleHabit}
            onDelete={deleteHabit}
          />
        </div>

        <footer className="mt-16 text-center text-xs text-muted-foreground">
          Данные хранятся в вашем браузере. Без аккаунтов, без облака. Made by autohero
        </footer>
      </div>
    </div>
  );
}

interface ColumnProps {
  type: HabitType;
  title: string;
  subtitle: string;
  hint: string;
  count: number;
  items: Habit[];
  onAdd: (name: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function Column({ type, title, subtitle, hint, count, items, onAdd, onToggle, onDelete }: ColumnProps) {
  const isFriction = type === "friction";
  return (
    <section>
      <div className="flex items-baseline justify-between mb-1 px-1">
        <div className="flex items-baseline gap-3">
          <h2
            className={cn(
              "font-display text-2xl",
              isFriction ? "text-friction" : "text-going",
            )}
          >
            {title}
          </h2>
          <span className="text-sm text-muted-foreground">{subtitle}</span>
        </div>
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            isFriction ? "bg-friction-muted text-friction" : "bg-going-muted text-going",
          )}
        >
          {count}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-4 px-1 italic">{hint}</p>

      <div className="space-y-3">
        {items.map((h) => (
          <HabitCard key={h.id} habit={h} onToggle={onToggle} onDelete={onDelete} />
        ))}
        <AddHabit type={type} onAdd={onAdd} />
      </div>
    </section>
  );
}
