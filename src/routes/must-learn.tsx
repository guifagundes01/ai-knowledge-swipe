import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SavedList } from "@/components/SavedList";
import { useMustLearn } from "@/hooks/useKnowledge";

export const Route = createFileRoute("/must-learn")({
  head: () => ({
    meta: [
      { title: "Must Learn queue — swipe.ml" },
      {
        name: "description",
        content: "Your high-intent AI/ML learning queue, built from every up-swipe.",
      },
      { property: "og:title", content: "Must Learn queue — swipe.ml" },
      {
        property: "og:description",
        content: "Your high-intent AI/ML learning queue, built from every up-swipe.",
      },
    ],
  }),
  component: MustLearnPage,
});

function MustLearnPage() {
  const { data: entries = [] } = useMustLearn();

  return (
    <AppShell>
      <h1 className="mt-6 text-2xl font-bold">Must Learn</h1>
      <p className="text-sm text-muted-foreground">The things you really want to learn.</p>
      <SavedList
        entries={entries}
        emptyTitle="Your queue is empty"
        emptyHint="Swipe up on a card when it's something you genuinely want to learn."
      />
    </AppShell>
  );
}
