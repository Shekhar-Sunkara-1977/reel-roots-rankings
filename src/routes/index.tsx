import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { fetchMovies } from "@/lib/data";
import { MovieCard } from "@/components/MovieCard";
import { PosterArt } from "@/components/PosterArt";
import { INDUSTRIES, INDUSTRY_SCRIPT } from "@/lib/industry";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kalpit — Rate & Rank Indian Cinema" },
      {
        name: "description",
        content:
          "The rating and ranking home for Indian cinema. Score films 1–10 across Bollywood, Tollywood, Kollywood, Mollywood, Sandalwood and Bengali cinema, then share your stat card.",
      },
      { property: "og:title", content: "Kalpit — Rate & Rank Indian Cinema" },
      {
        property: "og:description",
        content: "Score Indian films out of 10, build rankings, and share your year in cinema.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: movies = [] } = useQuery({ queryKey: ["movies", {}], queryFn: () => fetchMovies() });

  const top = [...movies].sort((a, b) => b.weighted_score - a.weighted_score).slice(0, 10);
  const hero = top[0] ?? movies[0];
  const recent = [...movies].slice(0, 12);

  return (
    <main>
      {/* HERO */}
      <section
        data-industry={hero?.industry ?? "Bollywood"}
        className="relative overflow-hidden border-b border-border/60"
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(120% 80% at 15% 0%, color-mix(in oklab, var(--industry) 55%, transparent), transparent 60%), radial-gradient(90% 70% at 90% 20%, color-mix(in oklab, var(--industry-2) 45%, transparent), transparent 65%)",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-[1.4fr_1fr] md:items-center md:py-24">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="deva text-sm tracking-[0.3em] text-industry"
            >
              कल्पित · सिनेमा
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="display mt-3 text-[clamp(3.5rem,11vw,9rem)]"
            >
              Every industry.
              <br />
              <span className="industry-text">One scale.</span>
            </motion.h1>
            <p className="mt-6 max-w-lg text-base text-muted-foreground">
              Kalpit is where Indian film fans put a real number on it. Rate 1–10, argue in reviews,
              watch the rankings rearrange, and walk away with a stat card worth posting.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/browse"
                className="group inline-flex items-center gap-2 rounded-full industry-gradient px-6 py-3 text-sm font-bold text-industry-foreground"
              >
                Start rating
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/rankings"
                className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:border-industry"
              >
                See the rankings
              </Link>
            </div>
          </div>

          {hero ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: -2 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto w-56 sm:w-64"
            >
              <Link
                to="/movies/$movieId"
                params={{ movieId: hero.id }}
                className="block aspect-[2/3] overflow-hidden rounded-3xl industry-glow"
              >
                <PosterArt
                  title={hero.title}
                  industry={hero.industry}
                  year={hero.release_year}
                  posterUrl={hero.poster_url}
                />
              </Link>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                #1 right now · <span className="text-industry">{hero.title}</span>
              </p>
            </motion.div>
          ) : null}
        </div>
      </section>

      {/* INDUSTRY RAIL */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="display text-3xl">Pick your industry</h2>
        <div className="no-scrollbar mt-5 flex gap-3 overflow-x-auto pb-2">
          {INDUSTRIES.map((ind) => (
            <Link
              key={ind}
              to="/browse"
              search={{ industry: ind }}
              data-industry={ind}
              className="group relative min-w-44 shrink-0 overflow-hidden rounded-2xl border border-border p-5 transition-transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 opacity-30 transition-opacity group-hover:opacity-60 industry-gradient" />
              <div className="relative">
                <p className="deva text-xs text-foreground/80">{INDUSTRY_SCRIPT[ind]}</p>
                <p className="display mt-6 text-2xl">{ind}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TOP 10 */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-end justify-between">
          <h2 className="display text-3xl">Top rated on Kalpit</h2>
          <Link to="/rankings" className="text-sm text-muted-foreground hover:text-foreground">
            Full rankings →
          </Link>
        </div>
        <div className="no-scrollbar mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
          {top.map((m, i) => (
            <div key={m.id} className="w-40 shrink-0 snap-start sm:w-48">
              <MovieCard movie={m} rank={i + 1} />
            </div>
          ))}
        </div>
      </section>

      {/* RECENT */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="display text-3xl">In the catalogue</h2>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {recent.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      </section>
    </main>
  );
}
