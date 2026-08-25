import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteRating, fetchMyRating, upsertRating } from "@/lib/data";
import { scoreLabel } from "@/lib/industry";

export function RatePanel({
  movieId,
  userId,
  onSaved,
}: {
  movieId: string;
  userId: string | null;
  onSaved: () => void;
}) {
  const [score, setScore] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [existingId, setExistingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    if (!userId) return;
    fetchMyRating(movieId, userId).then((r) => {
      if (!r) return;
      setExistingId(r.id as string);
      setScore(r.score as number);
      setText((r.review_text as string) ?? "");
    });
  }, [movieId, userId]);

  if (!userId) {
    return (
      <div className="rounded-2xl border border-border bg-surface/60 p-6 text-center">
        <p className="display text-2xl">Rate this film</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to score it out of 10 and write your take.
        </p>
        <Link
          to="/auth"
          className="mt-4 inline-block rounded-full industry-gradient px-5 py-2 text-sm font-semibold text-industry-foreground"
        >
          Sign in to rate
        </Link>
      </div>
    );
  }

  const active = hover ?? score;

  async function save() {
    if (!score || !userId) return;
    setSaving(true);
    try {
      await upsertRating({ movieId, userId, score, reviewText: text.trim() || null });
      setPulse((p) => p + 1);
      toast.success(`Rated ${score}/10 — ${scoreLabel(score)}`);
      onSaved();
      const r = await fetchMyRating(movieId, userId);
      setExistingId((r?.id as string) ?? null);
    } catch {
      toast.error("Couldn't save your rating. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!existingId) return;
    await deleteRating(existingId);
    setExistingId(null);
    setScore(null);
    setText("");
    toast("Rating removed");
    onSaved();
  }

  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-6">
      <div className="flex items-baseline justify-between">
        <p className="display text-2xl">{existingId ? "Your rating" : "Rate this film"}</p>
        <motion.span
          key={`${active}-${pulse}`}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className="display text-5xl industry-text"
        >
          {active ?? "—"}
        </motion.span>
      </div>

      <div className="mt-4 flex gap-1.5" onMouseLeave={() => setHover(null)}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <motion.button
            key={n}
            whileTap={{ scale: 0.85 }}
            onMouseEnter={() => setHover(n)}
            onClick={() => setScore(n)}
            aria-label={`Score ${n} out of 10`}
            className="h-11 flex-1 rounded-md text-xs font-bold transition-all"
            style={{
              background:
                active && n <= active
                  ? "linear-gradient(180deg, var(--industry), var(--industry-2))"
                  : "var(--surface-2)",
              color: active && n <= active ? "var(--industry-foreground)" : "var(--muted-foreground)",
            }}
          >
            {n}
          </motion.button>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {active ? scoreLabel(active) : "Tap a number — 1 is a disaster, 10 is an all-timer."}
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        maxLength={4000}
        placeholder="Write your review… (optional)"
        className="mt-4 w-full resize-none rounded-xl border border-input bg-ink/60 p-3 text-sm outline-none focus:border-industry"
      />

      <div className="mt-3 flex items-center gap-2">
        <button
          disabled={!score || saving}
          onClick={save}
          className="rounded-full industry-gradient px-5 py-2 text-sm font-semibold text-industry-foreground disabled:opacity-40"
        >
          {saving ? "Saving…" : existingId ? "Update rating" : "Post rating"}
        </button>
        {existingId ? (
          <button
            onClick={remove}
            className="flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" /> Delete
          </button>
        ) : null}
      </div>
    </div>
  );
}
