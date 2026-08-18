import { Check, ExternalLink } from "lucide-react";
import { useMarkConsumed } from "@/hooks/useKnowledge";
import type { ContentItem, SavedItem } from "@/services";

const TYPE_LABEL: Record<ContentItem["type"], string> = {
  article: "Article",
  paper: "Paper",
  repo: "Repo",
};

export function SavedList({
  entries,
  emptyTitle,
  emptyHint,
}: {
  entries: { item: ContentItem; saved: SavedItem }[];
  emptyTitle: string;
  emptyHint: string;
}) {
  const markConsumed = useMarkConsumed();

  if (entries.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <p className="font-display text-lg font-semibold">{emptyTitle}</p>
        <p className="max-w-xs text-sm text-muted-foreground">{emptyHint}</p>
      </div>
    );
  }

  return (
    <ul className="mt-5 space-y-3">
      {entries.map(({ item, saved }) => (
        <li key={item.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
            <span>{TYPE_LABEL[item.type]}</span>
            <span aria-hidden>·</span>
            <span>{item.source}</span>
            {saved.action === "must_learn" ? (
              <span className="ml-auto rounded-full bg-must/15 px-2 py-0.5 font-semibold text-must">
                Must learn
              </span>
            ) : null}
          </div>
          <h2 className="mt-2 text-base font-semibold leading-snug">{item.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{item.summary}</p>
          <div className="mt-3 flex items-center gap-3">
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => markConsumed.mutate(item.id)}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium"
            >
              Open <ExternalLink className="size-3.5" aria-hidden />
            </a>
            {saved.consumedAt ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                <Check className="size-3.5" aria-hidden /> Consumed
              </span>
            ) : (
              <button
                type="button"
                onClick={() => markConsumed.mutate(item.id)}
                className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Mark as consumed (+2 XP)
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
