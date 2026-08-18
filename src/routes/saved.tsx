import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SavedList } from "@/components/SavedList";
import { useSaved } from "@/hooks/useKnowledge";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved resources — swipe.ml" },
      {
        name: "description",
        content: "Every AI/ML paper, article and repo you swiped right on, ready to open.",
      },
      { property: "og:title", content: "Saved resources — swipe.ml" },
      {
        property: "og:description",
        content: "Every AI/ML paper, article and repo you swiped right on, ready to open.",
      },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const { data: entries = [] } = useSaved();

  return (
    <AppShell>
      <h1 className="mt-6 text-2xl font-bold">Saved</h1>
      <p className="text-sm text-muted-foreground">Everything you swiped right or up on.</p>
      <SavedList
        entries={entries}
        emptyTitle="Nothing saved yet"
        emptyHint="Swipe right on anything that looks interesting and it lands here."
      />
    </AppShell>
  );
}
