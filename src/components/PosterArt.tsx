import { INDUSTRY_SCRIPT, type Industry } from "@/lib/industry";

type Props = {
  title: string;
  industry: Industry;
  year?: number | null;
  posterUrl?: string | null;
  className?: string;
  /** Small surfaces (stat cards, inline rows) need tighter type. */
  compact?: boolean;
};

/**
 * Poster surface. Uses the real poster when we have one, otherwise renders a
 * typographic industry-coded plate so the grid never shows a broken image.
 */
export function PosterArt({
  title,
  industry,
  year,
  posterUrl,
  className = "",
  compact = false,
}: Props) {
  if (posterUrl) {
    return (
      <img
        src={posterUrl}
        alt={`${title} poster`}
        loading="lazy"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      data-industry={industry}
      className={`relative flex h-full w-full flex-col justify-between overflow-hidden ${compact ? "p-2" : "p-4"} ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(150deg, color-mix(in oklab, var(--industry) 70%, black), color-mix(in oklab, var(--industry-2) 45%, black) 55%, var(--ink))",
      }}
      aria-hidden="true"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, transparent 0 14px, color-mix(in oklab, var(--industry) 40%, transparent) 14px 15px)",
        }}
      />
      <span
        className={`deva relative tracking-widest text-foreground/70 ${compact ? "text-[0.5rem]" : "text-xs"}`}
      >
        {INDUSTRY_SCRIPT[industry]}
      </span>
      <div className="relative">
        <h3
          className={`display leading-[0.9] text-foreground drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)] ${
            compact ? "text-xs" : "text-2xl sm:text-3xl"
          }`}
        >
          {title}
        </h3>
        {year ? (
          <span
            className={`display mt-1 block text-foreground/65 ${compact ? "text-[0.55rem]" : "text-sm"}`}
          >
            {year}
          </span>
        ) : null}
      </div>
    </div>
  );
}
