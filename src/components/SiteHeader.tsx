import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { to: "/browse", label: "Browse" },
  { to: "/rankings", label: "Rankings" },
  { to: "/stats", label: "Your Stats" },
] as const;

export function SiteHeader() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link to="/" className="display text-3xl leading-none industry-text">
          Kalpit
        </Link>
        <nav className="hidden items-center gap-5 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                pathname.startsWith(item.to) ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-3 md:flex">
          {user ? (
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/auth"
              className="rounded-full industry-gradient px-4 py-2 text-sm font-semibold text-industry-foreground"
            >
              Join Kalpit
            </Link>
          )}
        </div>
        <button
          className="ml-auto md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open ? (
        <div className="border-t border-border/60 bg-ink px-4 py-3 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm text-muted-foreground"
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <button onClick={() => supabase.auth.signOut()} className="py-2 text-sm text-muted-foreground">
              Sign out
            </button>
          ) : (
            <Link to="/auth" onClick={() => setOpen(false)} className="block py-2 text-sm text-industry">
              Join Kalpit
            </Link>
          )}
        </div>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-ink/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-10 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Kalpit — rating & ranking Indian cinema, one industry at a time.</p>
        <div className="flex gap-4">
          <Link to="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
