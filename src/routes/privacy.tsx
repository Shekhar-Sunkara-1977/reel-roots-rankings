import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Kalpit" },
      { name: "description", content: "How Kalpit collects, uses and protects your data as you rate and review Indian films." },
      { property: "og:title", content: "Privacy Policy — Kalpit" },
      { property: "og:description", content: "How Kalpit collects, uses and protects your data." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="display text-6xl">Privacy Policy</h1>
      <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">Draft — last updated today</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/85">
        <div>
          <h2 className="display text-2xl">What we collect</h2>
          <p className="mt-2">
            Your email and username when you sign up, plus the ratings, reviews, lists and submissions
            you create. We store basic technical logs to keep the service running.
          </p>
        </div>
        <div>
          <h2 className="display text-2xl">How we use it</h2>
          <p className="mt-2">
            To show your profile and reviews, compute rankings and generate your personal stat cards.
            Aggregate, non-identifying rating data may be used to power public leaderboards.
          </p>
        </div>
        <div>
          <h2 className="display text-2xl">What is public</h2>
          <p className="mt-2">
            Your username, ratings, reviews and public lists are visible to everyone. Private lists and
            your email are not.
          </p>
        </div>
        <div>
          <h2 className="display text-2xl">Your control</h2>
          <p className="mt-2">
            You can edit or delete any rating, review or list at any time, and request deletion of your
            account and its data.
          </p>
        </div>
      </div>
    </main>
  );
}
