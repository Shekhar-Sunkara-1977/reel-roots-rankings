import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { fetchFilmography, fetchPerson } from "@/lib/data";
import { MovieCard } from "@/components/MovieCard";

export const Route = createFileRoute("/people/$personId")({
  head: () => ({
    meta: [
      { title: "Person — Kalpit" },
      {
        name: "description",
        content: "Filmography, average rating and career stats for this Indian cinema actor, director or music director.",
      },
      { property: "og:title", content: "Person — Kalpit" },
      { property: "og:description", content: "Filmography and career stats on Kalpit." },
    ],
  }),
  component: PersonPage,
});

function PersonPage() {
  const { personId } = Route.useParams();
  const { data: person } = useQuery({ queryKey: ["person", personId], queryFn: () => fetchPerson(personId) });
  const { data: films = [] } = useQuery({
    queryKey: ["filmography", personId],
    queryFn: () => fetchFilmography(personId),
  });

  if (!person) return <main className="p-10 text-sm text-muted-foreground">Loading…</main>;

  const rated = films.filter((f) => f.movie.vote_count > 0);
  const avg = rated.length ? rated.reduce((s, f) => s + f.movie.avg_score, 0) / rated.length : 0;
  const years = films.map((f) => f.movie.release_year ?? 0).filter(Boolean);
  const genreCounts = new Map<string, number>();
  films.forEach((f) => (f.movie.genres ?? []).forEach((g) => genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1)));
  const topGenre = [...genreCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const industry = films[0]?.movie.industry ?? "Bollywood";
  const roles = [...new Set(films.map((f) => f.role.replace("_", " ")))];

  const stats = [
    { label: "Films", value: String(films.length) },
    { label: "Avg rating", value: avg ? avg.toFixed(1) : "—" },
    { label: "Top genre", value: topGenre },
    {
      label: "Years active",
      value: years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "—",
    },
  ];

  return (
    <main data-industry={industry}>
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "radial-gradient(90% 80% at 10% 0%, color-mix(in oklab, var(--industry) 60%, transparent), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14">
          <p className="text-xs uppercase tracking-[0.3em] text-industry">{roles.join(" · ")}</p>
          <h1 className="display mt-2 text-[clamp(3rem,10vw,7rem)]">{person.name}</h1>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="rounded-2xl border border-border bg-surface/60 p-4"
              >
                <p className="display text-4xl industry-text">{s.value}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="display text-3xl">Filmography</h2>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {films.map((f) => (
            <MovieCard key={`${f.movie.id}-${f.role}`} movie={f.movie} />
          ))}
        </div>
      </section>
    </main>
  );
}
