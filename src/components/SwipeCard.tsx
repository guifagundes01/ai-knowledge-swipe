import { useRef, useState } from "react";
import { BookOpen, ExternalLink, FileText, Github } from "lucide-react";
import type { ContentType, FeedCard, SwipeAction } from "@/services";

const TYPE_META: Record<ContentType, { label: string; icon: typeof FileText }> = {
  article: { label: "Article", icon: BookOpen },
  paper: { label: "Paper", icon: FileText },
  repo: { label: "Repository", icon: Github },
};

const THRESHOLD = 90;

export function SwipeCard({
  card,
  onSwipe,
  interactive,
  depth,
}: {
  card: FeedCard;
  onSwipe: (action: SwipeAction) => void;
  interactive: boolean;
  depth: number;
}) {
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const { item } = card;
  const meta = TYPE_META[item.type];
  const Icon = meta.icon;

  const intent: SwipeAction | null = drag
    ? drag.y < -THRESHOLD && Math.abs(drag.y) > Math.abs(drag.x)
      ? "must_learn"
      : drag.x > THRESHOLD
        ? "interested"
        : drag.x < -THRESHOLD
          ? "skip"
          : null
    : null;

  const release = () => {
    if (intent) onSwipe(intent);
    start.current = null;
    setDrag(null);
  };

  const style = drag
    ? {
        transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 22}deg)`,
        transition: "none",
      }
    : {
        transform: `translateY(${depth * 10}px) scale(${1 - depth * 0.04})`,
      };

  return (
    <article
      className="card-stack absolute inset-x-0 top-0 select-none rounded-3xl border border-border bg-card p-6 transition-transform duration-200"
      style={{ ...style, zIndex: 10 - depth, touchAction: "none" }}
      onPointerDown={(e) => {
        if (!interactive) return;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        start.current = { x: e.clientX, y: e.clientY };
        setDrag({ x: 0, y: 0 });
      }}
      onPointerMove={(e) => {
        if (!start.current) return;
        setDrag({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
      }}
      onPointerUp={release}
      onPointerCancel={release}
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          <Icon className="size-3.5" aria-hidden />
          {meta.label}
        </span>
        <span className="text-[11px] text-muted-foreground">{item.source}</span>
      </div>

      <h2 className="mt-6 text-2xl font-semibold leading-tight">{item.title}</h2>
      <p className="mt-3 text-sm text-muted-foreground">{item.summary}</p>

      {card.explanation ? (
        <p className="mt-6 text-xs font-medium text-primary">{card.explanation}</p>
      ) : null}

      <a
        href={item.url}
        target="_blank"
        rel="noreferrer noopener"
        onPointerDown={(e) => e.stopPropagation()}
        className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Open original <ExternalLink className="size-3.5" aria-hidden />
      </a>

      {intent ? (
        <span
          className={`pointer-events-none absolute right-5 top-5 rounded-full px-3 py-1 text-xs font-bold uppercase ${
            intent === "must_learn"
              ? "bg-must text-must-foreground"
              : intent === "interested"
                ? "bg-primary text-primary-foreground"
                : "bg-skip text-primary-foreground"
          }`}
        >
          {intent === "must_learn" ? "Must learn" : intent === "interested" ? "Interested" : "Skip"}
        </span>
      ) : null}
    </article>
  );
}
