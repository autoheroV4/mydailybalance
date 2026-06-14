import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HabitType } from "@/lib/habits";

interface Props {
  type: HabitType;
  onAdd: (name: string) => void;
}

export function AddHabit({ type, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const isFriction = type === "friction";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    onAdd(v);
    setValue("");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "w-full rounded-2xl border border-dashed p-4 flex items-center justify-center gap-2 text-sm font-medium transition-all",
          "hover:bg-foreground/[0.02]",
          isFriction
            ? "border-friction/30 text-friction hover:border-friction/60"
            : "border-going/30 text-going hover:border-going/60",
        )}
      >
        <Plus className="h-4 w-4" />
        Добавить привычку
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        "rounded-2xl border p-3 flex gap-2 animate-float-up",
        isFriction ? "border-friction/30 bg-friction-muted/40" : "border-going/30 bg-going-muted/40",
      )}
    >
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => !value && setOpen(false)}
        placeholder={isFriction ? "Что мешает?" : "Что помогает?"}
        className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        className={cn(
          "rounded-lg px-3 py-1 text-sm font-medium text-white transition-opacity",
          isFriction ? "bg-friction" : "bg-going",
          !value.trim() && "opacity-40",
        )}
      >
        Добавить
      </button>
    </form>
  );
}
