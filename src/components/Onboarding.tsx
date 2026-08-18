import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOnboarding, useTopics } from "@/hooks/useKnowledge";
import type { ExpertiseLevel } from "@/services";

const LEVELS: { id: ExpertiseLevel; label: string; hint: string }[] = [
  { id: "beginner", label: "Beginner", hint: "New to ML, learning the basics" },
  { id: "intermediate", label: "Intermediate", hint: "Comfortable training and shipping models" },
  { id: "advanced", label: "Advanced", hint: "Research papers are your normal reading" },
];

export function Onboarding() {
  const { data: topics = [] } = useTopics();
  const onboarding = useOnboarding();
  const [selected, setSelected] = useState<string[]>([]);
  const [level, setLevel] = useState<ExpertiseLevel>("intermediate");

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));

  return (
    <div className="flex flex-1 flex-col justify-center py-10">
      <h1 className="text-3xl font-bold leading-tight">
        Swipe your way through <span className="text-primary">AI/ML</span>.
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Two questions and you're in.</p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          What topics interest you?
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {topics.map((topic) => {
            const active = selected.includes(topic.id);
            return (
              <button
                key={topic.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(topic.id)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-secondary text-foreground hover:border-primary/50"
                }`}
              >
                {topic.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Your expertise level
        </h2>
        <div className="mt-3 space-y-2">
          {LEVELS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={level === option.id}
              onClick={() => setLevel(option.id)}
              className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                level === option.id
                  ? "border-primary bg-card"
                  : "border-border bg-card/50 hover:border-primary/40"
              }`}
            >
              <span className="block text-sm font-semibold">{option.label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{option.hint}</span>
            </button>
          ))}
        </div>
      </section>

      <Button
        className="mt-8 h-12 rounded-full text-base font-semibold"
        disabled={selected.length === 0 || onboarding.isPending}
        onClick={() => onboarding.mutate({ topics: selected, level })}
      >
        Start discovering
      </Button>
    </div>
  );
}
