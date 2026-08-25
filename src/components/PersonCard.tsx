import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { Person } from "@/lib/data";

/**
 * Photo surface for a person. Uses the real headshot when available, otherwise
 * renders an industry-coded typographic plate with initials so the grid never
 * shows a broken image.
 */
export function PersonArt({
  name,
  photoUrl,
  className = "",
}: {
  name: string;
  photoUrl?: string | null;
  className?: string;
}) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        loading="lazy"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(150deg, color-mix(in oklab, var(--industry) 65%, black), color-mix(in oklab, var(--industry-2) 40%, black) 55%, var(--ink))",
      }}
      aria-hidden="true"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, transparent 0 14px, color-mix(in oklab, var(--industry) 40%, transparent) 14px 15px)",
        }}
      />
      <span className="display relative text-5xl text-foreground/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
        {initials}
      </span>
    </div>
  );
}

type PersonCardProps = {
  person: Person;
  subtitle?: string;
  score?: number;
  rank?: number;
};

export function PersonCard({ person, subtitle, score, rank }: PersonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className="group relative"
    >
      <Link
        to="/people/$personId"
        params={{ personId: person.id }}
        className="block overflow-hidden rounded-2xl bg-surface transition-shadow group-hover:industry-glow"
      >
        <div className="relative aspect-[3/4] w-full">
          <PersonArt name={person.name} photoUrl={person.photo_url} />
          {rank ? (
            <span className="display absolute -bottom-1 left-2 text-5xl text-foreground drop-shadow-[0_3px_14px_rgba(0,0,0,0.8)]">
              {rank}
            </span>
          ) : null}
          {score != null ? (
            <div className="absolute right-2 top-2 rounded-full bg-ink/75 px-2 py-1 backdrop-blur">
              <span className="display text-lg leading-none industry-text">{score.toFixed(1)}</span>
            </div>
          ) : null}
        </div>
        <div className="space-y-1 p-3">
          <p className="truncate text-sm font-semibold">{person.name}</p>
          {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
      </Link>
    </motion.div>
  );
}
