import { useState } from "react";
import { Check, Flame, Trash2 } from "lucide-react";
import confetti from "canvas-confetti";
import {
  type Habit,
  currentStreak,
  last7Days,
  todayKey,
  weekProgress,
} from "@/lib/habits";
import { cn } from "@/lib/utils";

interface Props {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function HabitCard({ habit, onToggle, onDelete }: Props) {
  const [pulse, setPulse] = useState(false);
  const isFriction = habit.type === "friction";
  const today = todayKey();
  const doneToday = habit.completions.includes(today);
  const streak = currentStreak(habit.completions);
  const progress = weekProgress(habit.completions);
  const days = last7Days();
  const completedSet = new Set(habit.completions);

  const handleToggle = () => {
    if (!doneToday) {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
      // confetti — green for going, warm for friction (overcoming)
      const colors = isFriction
        ? ["#f59e0b", "#ef4444", "#fbbf24"]
        : ["#10b981", "#34d399", "#a7f3d0"];
      confetti({
        particleCount: 60,
        spread: 55,
        startVelocity: 35,
        origin: { y: 0.7 },
        colors,
        scalar: 0.8,
      });
    }
    onToggle(habit.id);
  };

  return (
    <div
      className={cn(
        "group relative rounded-2xl border p-5 transition-all animate-float-up",
        "hover:shadow-lg hover:-translate-y-0.5",
        isFriction
          ? "bg-friction-muted/60 border-friction/20"
          : "bg-going-muted/60 border-going/20",
      )}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={handleToggle}
          aria-label={doneToday ? "Снять отметку" : "Отметить выполнение"}
          className={cn(
            "relative shrink-0 h-11 w-11 rounded-full border-2 flex items-center justify-center transition-all",
            "active:scale-90",
            doneToday
              ? isFriction
                ? "bg-friction border-friction text-friction-foreground"
                : "bg-going border-going text-going-foreground"
              : isFriction
                ? "border-friction/40 hover:border-friction text-friction"
                : "border-going/40 hover:border-going text-going",
            pulse && "animate-ring-pulse",
          )}
        >
          {doneToday && <Check className="h-5 w-5 animate-check-in" strokeWidth={3} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-base leading-snug text-foreground break-words">
              {habit.name}
            </h3>
            <button
              onClick={() => onDelete(habit.id)}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity shrink-0"
              aria-label="Удалить"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span
              className={cn(
                "inline-flex items-center gap-1 font-medium",
                streak > 0 && (isFriction ? "text-friction" : "text-going"),
                streak > 0 && "animate-pop",
              )}
              key={streak}
            >
              <Flame className="h-3.5 w-3.5" />
              {streak} {streakWord(streak)}
            </span>
            <span>{progress}% за неделю</span>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full rounded-full bg-foreground/5 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                isFriction ? "bg-friction" : "bg-going",
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* 7 day dots */}
          <div className="mt-3 flex gap-1.5">
            {days.map((d, i) => {
              const done = completedSet.has(d);
              const isToday = d === today;
              return (
                <div
                  key={d}
                  className={cn(
                    "h-2 flex-1 rounded-full transition-colors",
                    done
                      ? isFriction
                        ? "bg-friction"
                        : "bg-going"
                      : "bg-foreground/10",
                    isToday && !done && "ring-1 ring-foreground/30",
                  )}
                  title={d}
                  style={{ animationDelay: `${i * 30}ms` }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function streakWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день подряд";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "дня подряд";
  return "дней подряд";
}
