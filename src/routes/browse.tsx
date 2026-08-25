import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { fetchMovies, searchPeople } from "@/lib/data";
import { MovieCard } from "@/components/MovieCard";
import { DECADES, GENRES, INDUSTRIES, type Industry } from "@/lib/industry";

type BrowseSearch = {
  industry?: Industry | undefined;
  genre?: string | undefined;
  decade?: number | undefined;
  q?: string | undefined;
};

export const Route = createFileRoute("/browse")({
  validateSearch: (search: Record<string, unknown>): BrowseSearch => ({
    industry: (INDUSTRIES as readonly string[]).includes(String(search['industry']))
      ? (search['industry'] as Industry)
      : undefined,
    genre: search['genre'] ? String(search['genre']) : undefined,
    decade: search['decade'] ? Number(search['decade']) : undefined,
    q: search['q'] ? String(search['q']) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse Indian films — Kalpit" },
      {
        name: "description",
        content:
          "Search and filter Indian cinema by industry, genre, decade and rating — Bollywood to Bengali cinema in one catalogue.",
      },
      { property: "og:title", content: "Browse Indian films — Kalpit" },
      {
        property: "og:description",
        content: "Filter Indian cinema by industry, genre, decade and rating.",
      },
    ],
  }),
  component: Browse,
});

function Chip({
  active,
  children,
  onClick,
  industry,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  industry?: string;
}) {
  return (
    <button
      onClick={onClick}
      data-industry={industry}
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

function Browse() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [term, setTerm] = useState(search.q ?? "");
  const [minRating, setMinRating] = useState(0);

  const filters = {
    industry: search.industry ?? null,
    genre: search.genre ?? null,
    decade: search.decade ?? null,
    search: search.q ?? null,
    minRating: minRating || null,
  };

  const { data: movies = [], isLoading } = useQuery({
    queryKey: ["movies", filters],
    queryFn: () => fetchMovies(filters),
  });
  const { data: people = [] } = useQuery({
    queryKey: ["people-search", search.q],
    queryFn: () => (search.q ? searchPeople(search.q) : Promise.resolve([])),
    enabled: Boolean(search.q),
  });

  const set = (patch: Partial<BrowseSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  return (
    <main data-industry={search.industry ?? "Bollywood"} className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="display text-[clamp(2.5rem,7vw,5rem)]">
        Browse <span className="industry-text">the archive</span>
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          set({ q: term.trim() || undefined });
        }}
        className="mt-6 flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-2"
      >
        <Search className="size-4 text-muted-foreground" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search films, actors, directors, music directors…"
          className="w-full bg-transparent py-1 text-sm outline-none"
        />
        <button className="rounded-full industry-gradient px-4 py-1.5 text-xs font-bold text-industry-foreground">
          Search
        </button>
      </form>

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
        <Chip active={!search.industry} onClick={() => set({ industry: undefined })}>
          All industries
        </Chip>
        {INDUSTRIES.map((i) => (
          <Chip
            key={i}
            industry={i}
            active={search.industry === i}
            onClick={() => set({ industry: search.industry === i ? undefined : i })}
          >
            {i}
          </Chip>
        ))}
      </div>

      <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
        {GENRES.map((g) => (
          <Chip key={g} active={search.genre === g} onClick={() => set({ genre: search.genre === g ? undefined : g })}>
            {g}
          </Chip>
        ))}
      </div>

      <div className="no-scrollbar mt-2 flex items-center gap-2 overflow-x-auto pb-1">
        {DECADES.map((d) => (
          <Chip
            key={d}
            active={search.decade === d}
            onClick={() => set({ decade: search.decade === d ? undefined : d })}
          >
            {d}s
          </Chip>
        ))}
        <span className="ml-2 shrink-0 text-xs text-muted-foreground">Min rating {minRating || "any"}</span>
        <input
          type="range"
          min={0}
          max={9}
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          className="w-28 accent-[var(--industry)]"
        />
      </div>

      {people.length ? (
        <section className="mt-8">
          <h2 className="display text-2xl">People</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {people.map((p) => (
              <Link
                key={p.id}
                to="/people/$personId"
                params={{ personId: p.id }}
                className="rounded-full border border-border px-4 py-2 text-sm hover:border-industry"
              >
                {p.name}
                <span className="ml-2 text-xs text-muted-foreground">{p.bio}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <p className="mt-8 text-xs uppercase tracking-widest text-muted-foreground">
        {isLoading ? "Loading…" : `${movies.length} films`}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {movies.map((m) => (
          <MovieCard key={m.id} movie={m} />
        ))}
      </div>
      {!isLoading && !movies.length ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Nothing matches those filters yet.
        </p>
      ) : null}
    </main>
  );
}
