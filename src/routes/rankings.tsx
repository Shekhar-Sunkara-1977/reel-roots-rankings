import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { fetchMovies, fetchPeopleRankings } from "@/lib/data";
import { DECADES, GENRES, INDUSTRIES, type Industry } from "@/lib/industry";
import { PosterArt } from "@/components/PosterArt";
import { PersonArt } from "@/components/PersonCard";

export const Route = createFileRoute("/rankings")({
  head: () => ({
    meta: [
      { title: "Rankings — Top Indian films, actors & directors | Kalpit" },
      {
        name: "description",
        content:
          "Weighted-average leaderboards for Indian cinema: top films, actors, directors and music directors, filterable by industry, decade and genre.",
      },
      { property: "og:title", content: "Rankings — Top Indian films, actors & directors" },
      {
        property: "og:description",
        content: "Weighted leaderboards across Bollywood, Tollywood, Kollywood, Mollywood, Sandalwood and Bengali cinema.",
      },
    ],
  }),
  component: Rankings,
});

type Tab = "movies" | "actor" | "director" | "music_director";

const TABS: { key: Tab; label: string }[] = [
  { key: "movies", label: "Films" },
  { key: "actor", label: "Actors" },
  { key: "director", label: "Directors" },
  { key: "music_director", label: "Music" },
];

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
        active
          ? "border-transparent industry-gradient text-industry-foreground"
          : "border-border text-muted-foreground hover:border-industry hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Rankings() {
  const [tab, setTab] = useState<Tab>("movies");
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [decade, setDecade] = useState<number | null>(null);
  const [genre, setGenre] = useState<string | null>(null);

  const filters = { industry, decade, genre };

  const { data: movies = [] } = useQuery({
    queryKey: ["movies", filters],
    queryFn: () => fetchMovies(filters),
    enabled: tab === "movies",
  });
  const { data: people = [] } = useQuery({
    queryKey: ["people-rank", tab, filters],
    queryFn: () => fetchPeopleRankings(tab as "actor" | "director" | "music_director", filters),
    enabled: tab !== "movies",
  });

  const rankedMovies = [...movies].sort((a, b) => b.weighted_score - a.weighted_score);

  return (
    <main data-industry={industry ?? "Kollywood"} className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="display text-[clamp(2.5rem,8vw,6rem)]">
        The <span className="industry-text">leaderboards</span>
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Ranked on a weighted average, so a single 10/10 doesn't buy the top spot.
      </p>

      <div className="mt-6 flex gap-2">
        {TABS.map((t) => (
          <Chip key={t.key} active={tab === t.key} onClick={() => setTab(t.key)}>
            {t.label}
          </Chip>
        ))}
      </div>

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        <Chip active={!industry} onClick={() => setIndustry(null)}>
          All industries
        </Chip>
        {INDUSTRIES.map((i) => (
          <Chip key={i} active={industry === i} onClick={() => setIndustry(industry === i ? null : i)}>
            {i}
          </Chip>
        ))}
      </div>
      <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
        {DECADES.map((d) => (
          <Chip key={d} active={decade === d} onClick={() => setDecade(decade === d ? null : d)}>
            {d}s
          </Chip>
        ))}
      </div>
      <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
        {GENRES.map((g) => (
          <Chip key={g} active={genre === g} onClick={() => setGenre(genre === g ? null : g)}>
            {g}
          </Chip>
        ))}
      </div>

      <div className="mt-8 space-y-2">
        <AnimatePresence mode="popLayout">
          {tab === "movies"
            ? rankedMovies.map((m, i) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.4), type: "spring", stiffness: 300, damping: 30 }}
                  data-industry={m.industry}
                >
                  <Link
                    to="/movies/$movieId"
                    params={{ movieId: m.id }}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-surface/50 p-3 transition-colors hover:border-industry"
                  >
                    <span className="display w-12 shrink-0 text-right text-4xl text-muted-foreground">{i + 1}</span>
                    <div className="h-16 w-11 shrink-0 overflow-hidden rounded-md">
                      <PosterArt
                        title={m.title}
                        industry={m.industry}
                        year={m.release_year}
                        posterUrl={m.poster_url}
                        compact
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{m.title}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="text-industry">{m.industry}</span> · {m.release_year ?? "—"} ·{" "}
                        {m.vote_count} ratings
                      </p>
                    </div>
                    <span className="display text-3xl industry-text">{m.weighted_score.toFixed(1)}</span>
                  </Link>
                </motion.div>
              ))
            : people.map((p, i) => (
                <motion.div
                  key={p.person.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.4), type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Link
                    to="/people/$personId"
                    params={{ personId: p.person.id }}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-surface/50 p-3 transition-colors hover:border-industry"
                  >
                    <span className="display w-12 shrink-0 text-right text-4xl text-muted-foreground">{i + 1}</span>
                    <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md">
                      <PersonArt name={p.person.name} photoUrl={p.person.photo_url} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{p.person.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.film_count} films · {p.vote_count} ratings
                      </p>
                    </div>
                    <span className="display text-3xl industry-text">{p.weighted_score.toFixed(1)}</span>
                  </Link>
                </motion.div>
              ))}
        </AnimatePresence>
      </div>
    </main>
  );
}
