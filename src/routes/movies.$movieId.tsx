import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { fetchCredits, fetchMovie, fetchReviews } from "@/lib/data";
import { PosterArt } from "@/components/PosterArt";
import { RatePanel } from "@/components/RatePanel";
import { ReviewList } from "@/components/ReviewList";
import { useAuth } from "@/hooks/useAuth";
import { INDUSTRY_SCRIPT } from "@/lib/industry";

export const Route = createFileRoute("/movies/$movieId")({
  head: () => ({
    meta: [
      { title: "Film — Kalpit" },
      { name: "description", content: "Cast, crew, ratings and reviews for this Indian film on Kalpit." },
      { property: "og:title", content: "Film — Kalpit" },
      { property: "og:description", content: "Cast, crew, ratings and reviews on Kalpit." },
    ],
  }),
  component: MovieDetail,
});

const ROLE_LABEL: Record<string, string> = {
  actor: "Cast",
  director: "Director",
  music_director: "Music",
};

function MovieDetail() {
  const { movieId } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: movie, isLoading } = useQuery({
    queryKey: ["movie", movieId],
    queryFn: () => fetchMovie(movieId),
  });
  const { data: credits = [] } = useQuery({
    queryKey: ["credits", movieId],
    queryFn: () => fetchCredits(movieId),
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", movieId],
    queryFn: () => fetchReviews(movieId),
  });

  if (isLoading) return <main className="p-10 text-sm text-muted-foreground">Loading…</main>;
  if (!movie) return <main className="p-10 text-sm text-muted-foreground">Film not found.</main>;

  const grouped = ["actor", "director", "music_director"].map((role) => ({
    role,
    people: credits.filter((c) => c.role_on_film === role),
  }));

  return (
    <main data-industry={movie.industry}>
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="absolute inset-0 opacity-45"
          style={{
            backgroundImage:
              "radial-gradient(100% 90% at 20% 0%, color-mix(in oklab, var(--industry) 60%, transparent), transparent 65%), radial-gradient(80% 70% at 85% 10%, color-mix(in oklab, var(--industry-2) 45%, transparent), transparent 70%)",
          }}
        />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 md:flex-row md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-44 shrink-0 overflow-hidden rounded-2xl industry-glow sm:w-56"
          >
            <div className="aspect-[2/3]">
              <PosterArt
                title={movie.title}
                industry={movie.industry}
                year={movie.release_year}
                posterUrl={movie.poster_url}
              />
            </div>
          </motion.div>

          <div className="min-w-0 flex-1">
            <p className="deva text-xs tracking-[0.3em] text-industry">
              {INDUSTRY_SCRIPT[movie.industry]} · {movie.industry}
            </p>
            <h1 className="display mt-2 text-[clamp(2.5rem,8vw,6rem)]">{movie.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {movie.release_year ?? "—"} · {movie.runtime ? `${movie.runtime} min` : "runtime unknown"} ·{" "}
              {(movie.genres ?? []).join(", ")}
            </p>

            <div className="mt-6 flex items-end gap-6">
              <div>
                <motion.p
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="display text-[clamp(3.5rem,12vw,7rem)] leading-none industry-text"
                >
                  {movie.vote_count ? movie.avg_score.toFixed(1) : "—"}
                </motion.p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {movie.vote_count} {movie.vote_count === 1 ? "rating" : "ratings"}
                </p>
              </div>
              <div className="pb-3">
                <p className="display text-2xl">{movie.weighted_score.toFixed(2)}</p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Kalpit score</p>
              </div>
            </div>

            {movie.synopsis ? (
              <p className="mt-6 max-w-2xl text-sm leading-relaxed text-foreground/85">{movie.synopsis}</p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-8">
          {grouped.map((g) =>
            g.people.length ? (
              <section key={g.role}>
                <h2 className="display text-2xl">{ROLE_LABEL[g.role]}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {g.people.map((c) => (
                    <Link
                      key={`${c.person.id}-${c.role_on_film}`}
                      to="/people/$personId"
                      params={{ personId: c.person.id }}
                      className="rounded-full border border-border bg-surface/60 px-4 py-2 text-sm transition-colors hover:border-industry"
                    >
                      {c.person.name}
                    </Link>
                  ))}
                </div>
              </section>
            ) : null,
          )}

          <section>
            <h2 className="display text-2xl">Reviews</h2>
            <div className="mt-4">
              <ReviewList reviews={reviews} userId={user?.id ?? null} />
            </div>
          </section>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <RatePanel
            movieId={movieId}
            userId={user?.id ?? null}
            onSaved={() => {
              qc.invalidateQueries({ queryKey: ["reviews", movieId] });
              qc.invalidateQueries({ queryKey: ["movie", movieId] });
              qc.invalidateQueries({ queryKey: ["movies"] });
            }}
          />
        </div>
      </div>
    </main>
  );
}
