import { supabase } from "@/integrations/supabase/client";
import type { Industry } from "./industry";

export type Movie = {
  id: string;
  title: string;
  industry: Industry;
  release_year: number | null;
  poster_url: string | null;
  backdrop_url: string | null;
  runtime: number | null;
  genres: string[];
  synopsis: string | null;
};

export type MovieWithStats = Movie & {
  avg_score: number;
  vote_count: number;
  weighted_score: number;
};

export type Person = {
  id: string;
  name: string;
  photo_url: string | null;
  bio: string | null;
};

const MOVIE_COLS =
  "id,title,industry,release_year,poster_url,backdrop_url,runtime,genres,synopsis";

type StatRow = { movie_id: string; avg_score: number; vote_count: number; weighted_score: number };

async function attachStats(movies: Movie[]): Promise<MovieWithStats[]> {
  if (!movies.length) return [];
  const { data } = await supabase
    .from("movie_stats")
    .select("movie_id,avg_score,vote_count,weighted_score")
    .in("movie_id", movies.map((m) => m.id));
  const map = new Map((data ?? []).map((s) => [s.movie_id as string, s as StatRow]));
  return movies.map((m) => {
    const s = map.get(m.id);
    return {
      ...m,
      avg_score: Number(s?.avg_score ?? 0),
      vote_count: Number(s?.vote_count ?? 0),
      weighted_score: Number(s?.weighted_score ?? 0),
    };
  });
}

export type MovieFilters = {
  industry?: Industry | null;
  decade?: number | null;
  genre?: string | null;
  search?: string | null;
  minRating?: number | null;
};

export async function fetchMovies(filters: MovieFilters = {}): Promise<MovieWithStats[]> {
  let q = supabase.from("movies").select(MOVIE_COLS).order("release_year", { ascending: false });
  if (filters.industry) q = q.eq("industry", filters.industry);
  if (filters.decade) q = q.gte("release_year", filters.decade).lte("release_year", filters.decade + 9);
  if (filters.genre) q = q.contains("genres", [filters.genre]);
  if (filters.search) q = q.ilike("title", `%${filters.search}%`);
  const { data, error } = await q;
  if (error) throw error;
  const withStats = await attachStats((data ?? []) as Movie[]);
  return filters.minRating
    ? withStats.filter((m) => m.avg_score >= filters.minRating!)
    : withStats;
}

export async function fetchMovie(id: string) {
  const { data, error } = await supabase.from("movies").select(MOVIE_COLS).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [withStats] = await attachStats([data as Movie]);
  return withStats;
}

export type Credit = {
  role_on_film: string;
  character_name: string | null;
  person: Person;
};

export async function fetchCredits(movieId: string): Promise<Credit[]> {
  const { data, error } = await supabase
    .from("movie_people")
    .select("role_on_film,character_name,billing_order,people(id,name,photo_url,bio)")
    .eq("movie_id", movieId)
    .order("billing_order");
  if (error) throw error;
  return (data ?? []).map((row) => ({
    role_on_film: row.role_on_film as string,
    character_name: row.character_name as string | null,
    person: row.people as unknown as Person,
  }));
}

export type Review = {
  id: string;
  user_id: string;
  score: number;
  review_text: string | null;
  created_at: string;
  profile: { username: string; avatar_url: string | null } | null;
};

export async function fetchReviews(movieId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("ratings")
    .select("id,user_id,score,review_text,created_at")
    .eq("movie_id", movieId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = data ?? [];
  if (!rows.length) return [];

  // ratings.user_id points at auth.users, so author profiles are fetched separately.
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id,username,avatar_url")
    .in("id", rows.map((r) => r.user_id as string));
  const map = new Map(
    (profiles ?? []).map((p) => [
      p.id as string,
      { username: p.username as string, avatar_url: p.avatar_url as string | null },
    ]),
  );

  return rows.map((r) => ({
    id: r.id as string,
    user_id: r.user_id as string,
    score: r.score as number,
    review_text: r.review_text as string | null,
    created_at: r.created_at as string,
    profile: map.get(r.user_id as string) ?? null,
  }));
}

export async function fetchMyRating(movieId: string, userId: string) {
  const { data } = await supabase
    .from("ratings")
    .select("id,score,review_text")
    .eq("movie_id", movieId)
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export async function upsertRating(input: {
  movieId: string;
  userId: string;
  score: number;
  reviewText: string | null;
}) {
  const { error } = await supabase.from("ratings").upsert(
    {
      movie_id: input.movieId,
      user_id: input.userId,
      score: input.score,
      review_text: input.reviewText,
    },
    { onConflict: "user_id,movie_id" },
  );
  if (error) throw error;
}

export async function deleteRating(id: string) {
  const { error } = await supabase.from("ratings").delete().eq("id", id);
  if (error) throw error;
}

export async function reportContent(input: {
  reporterId: string;
  targetType: "review" | "submission";
  targetId: string;
  reason: string;
  details?: string;
}) {
  const { error } = await supabase.from("reports").insert({
    reporter_id: input.reporterId,
    target_type: input.targetType,
    target_id: input.targetId,
    reason: input.reason,
    details: input.details ?? null,
  });
  if (error) throw error;
}

/* ---------- people ---------- */

export async function fetchPerson(id: string) {
  const { data, error } = await supabase
    .from("people")
    .select("id,name,photo_url,bio")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Person | null;
}

export async function fetchFilmography(personId: string) {
  const { data, error } = await supabase
    .from("movie_people")
    .select(`role_on_film,movies(${MOVIE_COLS})`)
    .eq("person_id", personId);
  if (error) throw error;
  const rows = (data ?? []).map((r) => ({
    role: r.role_on_film as string,
    movie: r.movies as unknown as Movie,
  }));
  const stats = await attachStats(rows.map((r) => r.movie));
  const statMap = new Map(stats.map((s) => [s.id, s]));
  return rows
    .map((r) => ({ role: r.role, movie: statMap.get(r.movie.id)! }))
    .sort((a, b) => (b.movie.release_year ?? 0) - (a.movie.release_year ?? 0));
}

export type PersonRanking = {
  person: Person;
  role: string;
  film_count: number;
  avg_score: number;
  weighted_score: number;
  vote_count: number;
};

export async function fetchPeopleRankings(
  role: "actor" | "director" | "music_director",
  filters: { industry?: Industry | null; decade?: number | null; genre?: string | null } = {},
): Promise<PersonRanking[]> {
  const { data, error } = await supabase
    .from("movie_people")
    .select(`role_on_film,people(id,name,photo_url,bio),movies(${MOVIE_COLS})`)
    .eq("role_on_film", role);
  if (error) throw error;

  const rows = (data ?? [])
    .map((r) => ({
      person: r.people as unknown as Person,
      movie: r.movies as unknown as Movie,
    }))
    .filter((r) => r.person && r.movie)
    .filter((r) => (filters.industry ? r.movie.industry === filters.industry : true))
    .filter((r) =>
      filters.decade
        ? (r.movie.release_year ?? 0) >= filters.decade &&
          (r.movie.release_year ?? 0) <= filters.decade + 9
        : true,
    )
    .filter((r) => (filters.genre ? (r.movie.genres ?? []).includes(filters.genre) : true));

  const stats = await attachStats(rows.map((r) => r.movie));
  const statMap = new Map(stats.map((s) => [s.id, s]));

  const grouped = new Map<string, PersonRanking>();
  for (const row of rows) {
    const s = statMap.get(row.movie.id);
    const entry =
      grouped.get(row.person.id) ??
      ({
        person: row.person,
        role,
        film_count: 0,
        avg_score: 0,
        weighted_score: 0,
        vote_count: 0,
      } as PersonRanking & { _sum?: number });
    entry.film_count += 1;
    entry.vote_count += s?.vote_count ?? 0;
    (entry as PersonRanking & { _sum: number })._sum =
      ((entry as PersonRanking & { _sum?: number })._sum ?? 0) + (s?.avg_score ?? 0);
    grouped.set(row.person.id, entry);
  }

  return [...grouped.values()]
    .map((e) => {
      const sum = (e as PersonRanking & { _sum?: number })._sum ?? 0;
      const avg = e.film_count ? sum / e.film_count : 0;
      const weighted = (e.film_count * avg + 3 * 6.5) / (e.film_count + 3);
      return { ...e, avg_score: Number(avg.toFixed(2)), weighted_score: Number(weighted.toFixed(2)) };
    })
    .sort((a, b) => b.weighted_score - a.weighted_score || b.vote_count - a.vote_count);
}

export async function searchPeople(term: string) {
  const { data, error } = await supabase
    .from("people")
    .select("id,name,photo_url,bio")
    .ilike("name", `%${term}%`)
    .limit(30);
  if (error) throw error;
  return (data ?? []) as Person[];
}

/* ---------- personal stats ---------- */

export type UserStats = {
  totalRated: number;
  avgScore: number;
  topIndustry: { name: Industry; count: number } | null;
  topGenre: { name: string; count: number } | null;
  highest: { movie: Movie; score: number } | null;
  lowest: { movie: Movie; score: number } | null;
  byIndustry: { name: Industry; count: number }[];
  yearCount: number;
  hoursWatched: number;
  decade: { name: string; count: number } | null;
};

export async function fetchUserStats(userId: string): Promise<UserStats> {
  const { data, error } = await supabase
    .from("ratings")
    .select(`score,created_at,movies(${MOVIE_COLS})`)
    .eq("user_id", userId);
  if (error) throw error;
  const rows = (data ?? []).map((r) => ({
    score: r.score as number,
    created_at: r.created_at as string,
    movie: r.movies as unknown as Movie,
  }));

  const count = <T extends string>(items: T[]) => {
    const m = new Map<T, number>();
    items.forEach((i) => m.set(i, (m.get(i) ?? 0) + 1));
    return [...m.entries()]
      .map(([name, c]) => ({ name, count: c }))
      .sort((a, b) => b.count - a.count);
  };

  const industries = count(rows.map((r) => r.movie.industry));
  const genres = count(rows.flatMap((r) => r.movie.genres ?? []));
  const decades = count(
    rows.map((r) => (r.movie.release_year ? `${Math.floor(r.movie.release_year / 10) * 10}s` : "—")),
  );
  const sorted = [...rows].sort((a, b) => b.score - a.score);
  const thisYear = new Date().getFullYear();

  return {
    totalRated: rows.length,
    avgScore: rows.length ? Number((rows.reduce((s, r) => s + r.score, 0) / rows.length).toFixed(1)) : 0,
    topIndustry: industries[0] ?? null,
    topGenre: genres[0] ?? null,
    highest: sorted[0] ? { movie: sorted[0].movie, score: sorted[0].score } : null,
    lowest: (() => {
      const last = sorted[sorted.length - 1];
      return sorted.length > 1 && last ? { movie: last.movie, score: last.score } : null;
    })(),
    byIndustry: industries,
    yearCount: rows.filter((r) => new Date(r.created_at).getFullYear() === thisYear).length,
    hoursWatched: Math.round(rows.reduce((s, r) => s + (r.movie.runtime ?? 0), 0) / 60),
    decade: decades[0] ?? null,
  };
}
