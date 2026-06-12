import { cn } from "@/lib/utils";
import type { MoodPreset } from "@/lib/audio-engine";

interface Props {
  mood: MoodPreset;
  active: boolean;
  onSelect: () => void;
}

export function MoodCard({ mood, active, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all duration-300",
        "glass hover:-translate-y-0.5 hover:shadow-glow",
        active
          ? "border-transparent bg-create text-primary-foreground shadow-glow"
          : "border-border/60 text-foreground"
      )}
    >
      <span className="text-2xl">{mood.emoji}</span>
      <span className="font-display text-lg font-semibold leading-tight">{mood.label}</span>
      <span className={cn("text-xs leading-snug", active ? "text-primary-foreground/90" : "text-muted-foreground")}>
        {mood.description}
      </span>
    </button>
  );
}
