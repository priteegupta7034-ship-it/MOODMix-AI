import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, Headphones, Sparkles, Wand2, Layers } from "lucide-react";
import { MusicStudio } from "@/components/MusicStudio";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Remixr — AI Music & Mood Generator for Students" },
      { name: "description", content: "Turn any idea into music. Generate remixes, moods and genres with AI — no instruments, no software, no skills required." },
      { property: "og:title", content: "Remixr — AI Music & Mood Generator" },
      { property: "og:description", content: "Make any song you can imagine. Free, browser-based AI music studio built for students." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Toaster theme="dark" position="top-center" />

      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <a href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-create shadow-glow">
            <Headphones className="size-4 text-primary-foreground" />
          </span>
          Remixr
        </a>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#how" className="transition hover:text-foreground">How it works</a>
          <a href="#features" className="transition hover:text-foreground">Features</a>
          <a href="#studio" className="transition hover:text-foreground">Studio</a>
        </nav>
        <a
          href="#studio"
          className="rounded-full bg-create px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:scale-105"
        >
          Start creating
        </a>
      </header>

      {/* HERO */}
      <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 pb-12 pt-10 text-center md:pb-20 md:pt-16">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
          <Sparkles className="size-3 text-ember" />
          Free AI music studio for students
        </div>

        <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
          Make any song
          <br />
          <span className="text-gradient">you can imagine.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
          Remix tracks, generate moods and explore genres with one line of text.
          No instruments, no DAW, no music theory — just your idea.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#studio"
            className="inline-flex items-center gap-2 rounded-full bg-create px-7 py-4 font-display text-base font-semibold text-primary-foreground shadow-glow transition-all hover:scale-[1.03]"
          >
            <Wand2 className="size-5" />
            Open the Studio
          </a>
          <a
            href="#how"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 px-7 py-4 text-base text-foreground transition hover:bg-secondary/40"
          >
            How it works
            <ArrowDown className="size-4" />
          </a>
        </div>

        {/* floating waveform decoration */}
        <div className="pointer-events-none mt-16 flex h-24 items-end gap-1 opacity-80">
          {Array.from({ length: 64 }).map((_, i) => (
            <span
              key={i}
              className="eq-bar w-1.5 rounded-full bg-create"
              style={{
                height: `${18 + Math.abs(Math.sin(i * 0.6)) * 70}px`,
                animationDelay: `${(i * 60) % 1000}ms`,
                animationDuration: `${0.8 + (i % 5) * 0.15}s`,
              }}
            />
          ))}
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="relative z-10 mx-auto w-full max-w-5xl px-4 py-12 md:py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-bold md:text-5xl">
            From idea to track <br /> in <span className="text-gradient">three steps</span>.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { n: "01", t: "Describe", d: "Type any vibe, scene or feeling. From 'rainy Tokyo cafe' to 'epic boss battle'." },
            { n: "02", t: "Pick a mood", d: "Choose a genre or mood preset — chill, lofi, synthwave, trap, cinematic and more." },
            { n: "03", t: "Create & remix", d: "Hit Create. Tweak the prompt, remix instantly, download your track as WAV." },
          ].map(s => (
            <div key={s.n} className="glass rounded-2xl p-6 shadow-elevated">
              <div className="font-display text-sm text-ember">{s.n}</div>
              <h3 className="mt-2 font-display text-xl font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 mx-auto w-full max-w-5xl px-4 py-12 md:py-20">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass rounded-3xl p-8 shadow-elevated">
            <Layers className="size-8 text-ember" />
            <h3 className="mt-4 font-display text-2xl font-semibold">Built for creative students</h3>
            <p className="mt-3 text-muted-foreground">
              No music software to install. No production skills required. Just open
              your browser and start exploring sound.
            </p>
          </div>
          <div className="glass rounded-3xl p-8 shadow-elevated">
            <Sparkles className="size-8 text-ember" />
            <h3 className="mt-4 font-display text-2xl font-semibold">Eight moods, infinite remixes</h3>
            <p className="mt-3 text-muted-foreground">
              Chill, Epic, Lo-Fi, Synthwave, Dreamy, Trap, Cinematic, Happy — every
              generation is unique, seeded by your prompt.
            </p>
          </div>
        </div>
      </section>

      <MusicStudio />

      <footer className="relative z-10 border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        <p>Remixr • Made for students who want to create, not configure.</p>
      </footer>
    </div>
  );
}
