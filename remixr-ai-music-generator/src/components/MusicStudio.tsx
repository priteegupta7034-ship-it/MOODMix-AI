import { useEffect, useState } from "react";
import { Dices, Sparkles, Music2, Loader2 } from "lucide-react";
import { MOODS, renderTrack, type Mood } from "@/lib/audio-engine";
import { MoodCard } from "./MoodCard";
import { TrackPlayer, type Track } from "./TrackPlayer";
import { toast } from "sonner";

const PROMPT_IDEAS = [
  "midnight train through neon city",
  "sunrise over the mountains",
  "study session in a rainy cafe",
  "boss battle in a retro game",
  "first dance at a beach wedding",
  "lost in an enchanted forest",
  "driving fast under stars",
  "morning yoga with the ocean",
];

const STORAGE_KEY = "remixr.tracks.v1";

export function MusicStudio() {
  const [prompt, setPrompt] = useState("");
  const [mood, setMood] = useState<Mood>("synthwave");
  const [generating, setGenerating] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Omit<Track, "url">[] & { url?: string }[];
        // We can't persist blob URLs; drop saved tracks on load.
        void saved;
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    // persist only titles/mood for now
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks.map(t => ({ ...t, url: "" }))));
    } catch { /* ignore */ }
  }, [tracks]);

  const surprise = () => {
    setPrompt(PROMPT_IDEAS[Math.floor(Math.random() * PROMPT_IDEAS.length)]);
    const moods = MOODS.map(m => m.id);
    setMood(moods[Math.floor(Math.random() * moods.length)]);
  };

  const generate = async () => {
    if (!prompt.trim()) {
      toast.error("Describe the track you want to hear");
      return;
    }
    setGenerating(true);
    try {
      const preset = MOODS.find(m => m.id === mood)!;
      const seed = prompt.trim() + "|" + Date.now();
      const blob = await renderTrack({ preset, seed });
      const url = URL.createObjectURL(blob);
      const track: Track = {
        id: crypto.randomUUID(),
        title: prompt.trim().slice(0, 60),
        mood: preset.label,
        emoji: preset.emoji,
        url,
        createdAt: Date.now(),
      };
      setTracks(prev => [track, ...prev]);
      toast.success("Your track is ready");
    } catch (err) {
      console.error(err);
      toast.error("Could not generate the track");
    } finally {
      setGenerating(false);
    }
  };

  const remove = (id: string) => {
    setTracks(prev => {
      const t = prev.find(x => x.id === id);
      if (t) URL.revokeObjectURL(t.url);
      return prev.filter(x => x.id !== id);
    });
  };

  return (
    <section id="studio" className="relative z-10 mx-auto w-full max-w-5xl px-4 py-12 md:py-20">
      <div className="glass mx-auto rounded-3xl p-5 shadow-elevated md:p-8">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Music2 className="size-4 text-ember" />
          The Studio
        </div>
        <h2 className="mt-2 font-display text-2xl font-bold md:text-4xl">
          Describe a vibe. <span className="text-gradient">Hear it.</span>
        </h2>

        <div className="mt-6 space-y-4">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="A dreamy lofi beat for a late-night essay session…"
              rows={3}
              className="w-full resize-none rounded-2xl border border-border/60 bg-input/40 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/70 focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/40"
              maxLength={240}
            />
            <div className="absolute bottom-2 right-3 text-[10px] uppercase tracking-wider text-muted-foreground">
              {prompt.length}/240
            </div>
          </div>

          <div>
            <div className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">Mood &amp; Genre</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {MOODS.map(m => (
                <MoodCard key={m.id} mood={m} active={mood === m.id} onSelect={() => setMood(m.id)} />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={surprise}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <Dices className="size-4" />
              Surprise me
            </button>

            <button
              type="button"
              onClick={generate}
              disabled={generating}
              className="group inline-flex items-center gap-2 rounded-full bg-create px-6 py-3 font-display text-base font-semibold text-primary-foreground shadow-glow transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {generating ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Composing…
                </>
              ) : (
                <>
                  <Sparkles className="size-5" />
                  Create Track
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {tracks.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-4 font-display text-xl font-bold md:text-2xl">Your library</h3>
          <div className="grid gap-3">
            {tracks.map(t => (
              <TrackPlayer key={t.id} track={t} onDelete={remove} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
