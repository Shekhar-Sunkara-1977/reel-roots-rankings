import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Kalpit" },
      { name: "description", content: "The terms that govern your use of Kalpit, the Indian cinema rating and ranking platform." },
      { property: "og:title", content: "Terms of Service — Kalpit" },
      { property: "og:description", content: "The terms that govern your use of Kalpit." },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="display text-6xl">Terms of Service</h1>
      <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">Draft — last updated today</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/85">
        <p>
          By using Kalpit you agree to these terms. Kalpit is a community platform for rating, reviewing
          and ranking Indian cinema.
        </p>
        <div>
          <h2 className="display text-2xl">Your account</h2>
          <p className="mt-2">
            You are responsible for activity on your account. Do not impersonate others or create
            accounts to manipulate ratings.
          </p>
        </div>
        <div>
          <h2 className="display text-2xl">Your content</h2>
          <p className="mt-2">
            You keep ownership of your reviews, lists and submissions, and grant Kalpit a licence to
            display them. Content that is abusive, hateful, spam or infringing may be removed. Anyone
            can flag content for moderation, and repeat violations can end in account removal.
          </p>
        </div>
        <div>
          <h2 className="display text-2xl">Film data</h2>
          <p className="mt-2">
            Catalogue metadata is sourced from licensed third-party providers and community
            submissions reviewed by moderators. Kalpit is not affiliated with any studio or
            production house.
          </p>
        </div>
        <div>
          <h2 className="display text-2xl">Changes</h2>
          <p className="mt-2">
            These terms may change as Kalpit grows; continued use means you accept the updated terms.
          </p>
        </div>
      </div>
    </main>
  );
}
