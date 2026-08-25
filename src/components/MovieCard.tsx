import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { PosterArt } from "./PosterArt";
import type { MovieWithStats } from "@/lib/data";

export function MovieCard({ movie, rank }: { movie: MovieWithStats; rank?: number }) {
  return (
    <motion.div
      data-industry={movie.industry}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className="group relative"
    >
      <Link
        to="/movies/$movieId"
        params={{ movieId: movie.id }}
        className="block overflow-hidden rounded-2xl bg-surface transition-shadow group-hover:industry-glow"
      >
        <div className="relative aspect-[2/3] w-full">
          <PosterArt
            title={movie.title}
            industry={movie.industry}
            year={movie.release_year}
            posterUrl={movie.poster_url}
          />
          {rank ? (
            <span className="display absolute -bottom-2 left-2 text-6xl text-foreground/85 mix-blend-overlay">
              {rank}
            </span>
          ) : null}
          <div className="absolute right-2 top-2 rounded-full bg-ink/75 px-2 py-1 backdrop-blur">
            <span className="display text-lg leading-none industry-text">
              {movie.vote_count ? movie.avg_score.toFixed(1) : "—"}
            </span>
          </div>
        </div>
        <div className="space-y-1 p-3">
          <p className="truncate text-sm font-semibold">{movie.title}</p>
          <p className="text-xs text-muted-foreground">
            <span className="text-industry">{movie.industry}</span> · {movie.release_year ?? "—"} ·{" "}
            {movie.vote_count} {movie.vote_count === 1 ? "rating" : "ratings"}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
