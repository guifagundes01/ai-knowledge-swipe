import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useActivity, useMustLearn, useProfile, useResetProfile, useSaved } from "@/hooks/useKnowledge";
import { TOPICS } from "@/services";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your knowledge profile — swipe.ml" },
      {
        name: "description",
        content: "Interests, expertise level, XP, streak and swipe history in one knowledge profile.",
      },
      { property: "og:title", content: "Your knowledge profile — swipe.ml" },
      {
        property: "og:description",
        content: "Interests, expertise level, XP, streak and swipe history in one knowledge profile.",
      },
    ],
  }),
  component: ProfilePage,
});

const ACTION_LABEL = {
  skip: "Skipped",
  interested: "Interested",
  must_learn: "Must learn",
} as const;

function ProfilePage() {
  const { data: profile } = useProfile();
  const { data: saved = [] } = useSaved();
  const { data: mustLearn = [] } = useMustLearn();
  const { data: activity = [] } = useActivity();
  const reset = useResetProfile();

  return (
    <AppShell>
      <h1 className="mt-6 text-2xl font-bold">Knowledge profile</h1>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="XP" value={profile?.xp ?? 0} />
        <Stat label="Day streak" value={profile?.streakDays ?? 0} />
        <Stat label="Saved" value={saved.length} />
        <Stat label="Must learn" value={mustLearn.length} />
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Interests · {profile?.level ?? "beginner"}
        </h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {(profile?.topics ?? []).map((id) => (
            <span key={id} className="rounded-full bg-secondary px-3 py-1 text-sm">
              {TOPICS.find((t) => t.id === id)?.label ?? id}
            </span>
          ))}
          {(profile?.topics.length ?? 0) === 0 ? (
            <span className="text-sm text-muted-foreground">No topics selected yet.</span>
          ) : null}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Recent activity
        </h2>
        <ul className="mt-2 space-y-2">
          {activity.map(({ event, item }) => (
            <li
              key={event.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2"
            >
              <span className="truncate text-sm">{item?.title ?? event.itemId}</span>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                {ACTION_LABEL[event.action]}
                {event.xp > 0 ? ` · +${event.xp} XP` : ""}
              </span>
            </li>
          ))}
          {activity.length === 0 ? (
            <li className="text-sm text-muted-foreground">Start swiping to build your profile.</li>
          ) : null}
        </ul>
      </section>

      <Button
        variant="outline"
        className="mt-8 rounded-full"
        onClick={() => reset.mutate()}
        disabled={reset.isPending}
      >
        Reset profile
      </Button>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
