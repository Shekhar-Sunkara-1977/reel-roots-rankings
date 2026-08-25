import { useState } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { reportContent, type Review } from "@/lib/data";

const REASONS = ["Spam or advertising", "Hate speech or abuse", "Spoilers without warning", "Off-topic / not a review"];

export function ReviewList({ reviews, userId }: { reviews: Review[]; userId: string | null }) {
  const [reportingId, setReportingId] = useState<string | null>(null);

  if (!reviews.length) {
    return (
      <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No reviews yet. Be the first to put a number on it.
      </p>
    );
  }

  async function submitReport(reviewId: string, reason: string) {
    if (!userId) {
      toast.error("Sign in to report a review.");
      return;
    }
    try {
      await reportContent({ reporterId: userId, targetType: "review", targetId: reviewId, reason });
      toast.success("Reported. Our moderators will take a look.");
    } catch {
      toast("You've already reported this review.");
    }
    setReportingId(null);
  }

  return (
    <ul className="space-y-3">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-2xl border border-border bg-surface/60 p-5">
          <div className="flex items-start gap-4">
            <span className="display shrink-0 text-4xl industry-text">{r.score}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{r.profile?.username ?? "Kalpit user"}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              {r.review_text ? (
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {r.review_text}
                </p>
              ) : null}
            </div>
            <button
              onClick={() => setReportingId(reportingId === r.id ? null : r.id)}
              className="text-muted-foreground transition-colors hover:text-destructive"
              aria-label="Report this review"
              title="Report this review"
            >
              <Flag className="size-4" />
            </button>
          </div>
          {reportingId === r.id ? (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
              {REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => submitReport(r.id, reason)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-destructive hover:text-destructive"
                >
                  {reason}
                </button>
              ))}
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
