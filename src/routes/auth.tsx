import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to Kalpit" },
      { name: "description", content: "Create your Kalpit account to rate Indian films, write reviews and build stat cards." },
      { property: "og:title", content: "Sign in to Kalpit" },
      { property: "og:description", content: "Rate Indian films, write reviews and build your stat card." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate({ to: "/stats" });
  }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { username: username.trim() || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created. You're in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Try email instead.");
      return;
    }
  }

  return (
    <main data-industry="Mollywood" className="relative mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(80% 60% at 50% 0%, color-mix(in oklab, var(--industry) 55%, transparent), transparent 65%)",
        }}
      />
      <div className="relative">
        <h1 className="display text-6xl">
          {mode === "signup" ? "Join Kalpit" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Rate films out of 10, build lists, and get your year in Indian cinema.
        </p>

        <button
          onClick={google}
          className="mt-8 w-full rounded-full border border-border bg-surface px-5 py-3 text-sm font-semibold transition-colors hover:border-industry"
        >
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" ? (
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full rounded-xl border border-input bg-ink/60 px-4 py-3 text-sm outline-none focus:border-industry"
            />
          ) : null}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border border-input bg-ink/60 px-4 py-3 text-sm outline-none focus:border-industry"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-input bg-ink/60 px-4 py-3 text-sm outline-none focus:border-industry"
          />
          <button
            disabled={busy}
            className="w-full rounded-full industry-gradient px-5 py-3 text-sm font-bold text-industry-foreground disabled:opacity-50"
          >
            {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          className="mt-5 w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          {mode === "signup" ? "Already on Kalpit? Sign in" : "New here? Create an account"}
        </button>
      </div>
    </main>
  );
}
