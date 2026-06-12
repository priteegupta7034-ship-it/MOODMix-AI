import { useEffect, useRef, useState } from "react";
import { Pause, Play, Download, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Track {
  id: string;
  title: string;
  mood: string;
  emoji: string;
  url: string;
  createdAt: number;
}

interface Props {
  track: Track;
  onDelete?: (id: string) => void;
}

export function TrackPlayer({ track, onDelete }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => { setProgress(a.currentTime); setDuration(a.duration || 0); };
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onTime);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onTime);
      a.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play(); setPlaying(true); }
  };

  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-4 shadow-elevated">
      <audio ref={audioRef} src={track.url} preload="metadata" />
      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="grid size-14 shrink-0 place-items-center rounded-full bg-create text-primary-foreground shadow-glow transition hover:scale-105 active:scale-95"
        >
          {playing ? <Pause className="size-6" /> : <Play className="size-6 translate-x-0.5" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{track.emoji}</span>
            <h3 className="truncate font-display text-base font-semibold">{track.title}</h3>
          </div>
          <p className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">{track.mood}</p>

          <div className="mt-3 flex items-center gap-3">
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-create transition-[width] duration-150"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-16 text-right text-xs tabular-nums text-muted-foreground">
              {fmt(progress)} / {fmt(duration)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href={track.url}
            download={`${track.title}.wav`}
            className="grid size-9 place-items-center rounded-full border border-border/60 text-muted-foreground transition hover:text-foreground"
            aria-label="Download"
          >
            <Download className="size-4" />
          </a>
          {onDelete && (
            <button
              onClick={() => onDelete(track.id)}
              className="grid size-9 place-items-center rounded-full border border-border/60 text-muted-foreground transition hover:text-destructive"
              aria-label="Delete"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      {playing && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-6 items-end justify-center gap-0.5 opacity-50">
          {Array.from({ length: 32 }).map((_, i) => (
            <span
              key={i}
              className={cn("eq-bar w-1 rounded-t bg-create")}
              style={{ height: `${8 + (i % 5) * 4}px`, animationDelay: `${(i * 70) % 900}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
