import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUp, Heart, RotateCcw, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Onboarding } from "@/components/Onboarding";
import { SwipeCard } from "@/components/SwipeCard";
import { useFeed, useProfile, useSwipe } from "@/hooks/useKnowledge";
import type { SwipeAction } from "@/services";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "swipe.ml — Swipe to discover AI/ML knowledge" },
      {
        name: "description",
        content:
          "A Tinder-style feed for AI/ML papers, articles and repos. Swipe to save what you want to learn and earn XP.",
      },
      { property: "og:title", content: "swipe.ml — Swipe to discover AI/ML knowledge" },
      {
        property: "og:description",
        content: "Swipe through curated AI/ML papers, articles and GitHub repos. Save, learn, earn XP.",
      },
    ],
  }),
  component: DiscoverPage,
});

function DiscoverPage() {
  const { data: profile, isLoading } = useProfile();

  return (
    <AppShell>
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      ) : profile?.onboarded ? (
        <Feed />
      ) : (
        <Onboarding />
      )}
    </AppShell>
  );
}

function Feed() {
  const { data: cards = [], isLoading, refetch } = useFeed();
  const swipe = useSwipe();
  const [index, setIndex] = useState(0);
  const [toast, setToast] = useState<{ id: number; xp: number } | null>(null);

  useEffect(() => {
    setIndex(0);
  }, [cards]);

  const visible = cards.slice(index, index + 3);

  const handleSwipe = (itemId: string, action: SwipeAction) => {
    setIndex((i) => i + 1);
    swipe.mutate(
      { itemId, action },
      {
        onSuccess: (result) => {
          if (result.xpAwarded > 0) setToast({ id: Date.now(), xp: result.xpAwarded });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Building your feed…
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <p className="font-display text-xl font-semibold">You&apos;re all caught up</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          New resources are ingested from arXiv, GitHub and trusted blogs. Check your Must Learn
          queue in the meantime.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium"
        >
          <RotateCcw className="size-4" aria-hidden /> Refresh feed
        </button>
      </div>
    );
  }

  const top = visible[0]!;

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative mt-8 min-h-[22rem] flex-1">
        {[...visible].reverse().map((card, reversedIdx) => {
          const depth = visible.length - 1 - reversedIdx;
          return (
            <SwipeCard
              key={card.item.id}
              card={card}
              depth={depth}
              interactive={depth === 0}
              onSwipe={(action) => handleSwipe(card.item.id, action)}
            />
          );
        })}
        {toast ? (
          <span
            key={toast.id}
            className="animate-xp-pop pointer-events-none absolute inset-x-0 -top-6 text-center text-sm font-bold text-primary"
          >
            +{toast.xp} XP
          </span>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-center gap-5">
        <ActionButton
          label="Skip"
          className="bg-secondary text-skip"
          onClick={() => handleSwipe(top.item.id, "skip")}
        >
          <X className="size-6" aria-hidden />
        </ActionButton>
        <ActionButton
          label="Must learn"
          className="bg-must text-must-foreground"
          onClick={() => handleSwipe(top.item.id, "must_learn")}
        >
          <ArrowUp className="size-7" aria-hidden />
        </ActionButton>
        <ActionButton
          label="Interested"
          className="bg-primary text-primary-foreground"
          onClick={() => handleSwipe(top.item.id, "interested")}
        >
          <Heart className="size-6" aria-hidden />
        </ActionButton>
      </div>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Swipe left to skip · right for interested · up for must learn
      </p>
    </div>
  );
}

function ActionButton({
  label,
  className,
  onClick,
  children,
}: {
  label: string;
  className: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex size-14 items-center justify-center rounded-full transition-transform active:scale-90 ${className}`}
    >
      {children}
    </button>
  );
}
