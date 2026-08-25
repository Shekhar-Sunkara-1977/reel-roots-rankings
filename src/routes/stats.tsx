import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useAuth, useProfile } from "@/hooks/useAuth";
import { fetchUserStats } from "@/lib/data";
import { PosterArt } from "@/components/PosterArt";
import { INDUSTRY_SCRIPT } from "@/lib/industry";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Your year in Indian cinema — Kalpit" },
      {
        name: "description",
        content: "A shareable stat card built from your Kalpit ratings: films rated, top industry, top genre and your highest score.",
      },
      { property: "og:title", content: "Your year in Indian cinema — Kalpit" },
      { property: "og:description", content: "A shareable stat card built from your Kalpit ratings." },
    ],
  }),
  component: StatsPage,
});

const rise = (i: number) => ({
  initial: { opacity: 0, y: 24, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { delay: 0.15 + i * 0.12, duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
});

function StatsPage() {
  const { user, loading } = useAuth();
  const profile = useProfile(user?.id);
  const { data: stats } = useQuery({
    queryKey: ["user-stats", user?.id],
    queryFn: () => fetchUserStats(user!.id),
    enabled: Boolean(user?.id),
  });

  if (loading) return <main className="p-10 text-sm text-muted-foreground">Loading…</main>;

  if (!user) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="display text-5xl">Your stat card awaits</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Sign in and rate a few films — we'll build a card worth posting.
        </p>
        <Link
          to="/auth"
          className="mt-6 inline-block rounded-full industry-gradient px-6 py-3 text-sm font-bold text-industry-foreground"
        >
          Sign in
        </Link>
      </main>
    );
  }

  const industry = stats?.topIndustry?.name ?? "Bollywood";

  return (
    <main data-industry={industry} className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="display text-[clamp(2.5rem,8vw,5rem)]">
        Your year in <span className="industry-text">cinema</span>
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Screenshot it. Post it. This is your Kalpit card, @{profile?.username ?? "you"}.
      </p>

      {!stats || stats.totalRated === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-border p-12 text-center">
          <p className="display text-3xl">Nothing rated yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Rate five films and this page comes alive.</p>
          <Link
            to="/browse"
            className="mt-5 inline-block rounded-full industry-gradient px-6 py-3 text-sm font-bold text-industry-foreground"
          >
            Browse films
          </Link>
        </div>
      ) : (
        <div
          className="mt-8 overflow-hidden rounded-[2rem] border border-border p-6 sm:p-8"
          style={{
            backgroundImage:
              "radial-gradient(90% 70% at 10% 0%, color-mix(in oklab, var(--industry) 45%, transparent), transparent 60%), radial-gradient(80% 60% at 100% 10%, color-mix(in oklab, var(--industry-2) 40%, transparent), transparent 65%), linear-gradient(180deg, var(--surface), var(--ink))",
          }}
        >
          <div className="flex items-center justify-between">
            <p className="display text-2xl industry-text">Kalpit</p>
            <p className="deva text-xs text-foreground/70">{INDUSTRY_SCRIPT[industry]}</p>
          </div>

          <motion.div {...rise(0)} className="mt-6">
            <p className="display text-[clamp(4rem,18vw,9rem)] leading-[0.8] industry-text">
              {stats.totalRated}
            </p>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Films rated</p>
          </motion.div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Avg score", value: stats.avgScore.toFixed(1) },
              { label: "Top industry", value: stats.topIndustry?.name ?? "—" },
              { label: "Top genre", value: stats.topGenre?.name ?? "—" },
              { label: "Hours watched", value: `${stats.hoursWatched}h` },
            ].map((s, i) => (
              <motion.div key={s.label} {...rise(i + 1)} className="rounded-2xl bg-ink/45 p-4">
                <p className="display text-3xl">{s.value}</p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { tag: "Highest rated", entry: stats.highest },
              { tag: "Lowest rated", entry: stats.lowest },
            ].map((block, i) =>
              block.entry ? (
                <motion.div key={block.tag} {...rise(i + 5)} className="flex gap-3 rounded-2xl bg-ink/45 p-4">
                  <div className="h-24 w-16 shrink-0 overflow-hidden rounded-lg">
                    <PosterArt
                      title={block.entry.movie.title}
                      industry={block.entry.movie.industry}
                      year={block.entry.movie.release_year}
                      posterUrl={block.entry.movie.poster_url}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{block.tag}</p>
                    <p className="truncate text-sm font-semibold">{block.entry.movie.title}</p>
                    <p className="display text-4xl industry-text">{block.entry.score}</p>
                  </div>
                </motion.div>
              ) : null,
            )}
          </div>

          <motion.div {...rise(7)} className="mt-6 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Industry split</p>
            {stats.byIndustry.slice(0, 5).map((row) => (
              <div key={row.name} data-industry={row.name} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs">{row.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(row.count / stats.totalRated) * 100}%` }}
                    transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full industry-gradient"
                  />
                </div>
                <span className="w-6 text-right text-xs text-muted-foreground">{row.count}</span>
              </div>
            ))}
          </motion.div>

          <p className="mt-8 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            kalpit · @{profile?.username ?? "you"} · {new Date().getFullYear()}
          </p>
        </div>
      )}
    </main>
  );
}
