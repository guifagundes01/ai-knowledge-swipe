import { Link } from "@tanstack/react-router";
import { Flame, Layers, Sparkles, User, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { useProfile } from "@/hooks/useKnowledge";

const NAV = [
  { to: "/", label: "Discover", icon: Sparkles },
  { to: "/saved", label: "Saved", icon: Layers },
  { to: "/must-learn", label: "Must Learn", icon: Zap },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { data: profile } = useProfile();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-5">
      <header className="flex items-center justify-between">
        <Link to="/" className="font-display text-lg font-bold tracking-tight">
          swipe<span className="text-primary">.ml</span>
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 font-medium">
            <Zap className="size-3.5 text-primary" aria-hidden />
            {profile?.xp ?? 0} XP
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 font-medium">
            <Flame className="size-3.5 text-must" aria-hidden />
            {profile?.streakDays ?? 0}d
          </span>
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-background/85 backdrop-blur">
        <ul className="mx-auto flex w-full max-w-md items-center justify-between px-6 py-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                activeOptions={{ exact: to === "/" }}
                activeProps={{ className: "text-primary" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="flex flex-col items-center gap-1 text-[11px] font-medium transition-colors"
              >
                <Icon className="size-5" aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
