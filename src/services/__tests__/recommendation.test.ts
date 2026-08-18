import { describe, expect, it } from "vitest";
import {
  buildTopicAffinity,
  explanationFor,
  freshnessScore,
  levelScore,
  mulberry32,
  recommend,
  scoreItem,
  topicMatchScore,
} from "../recommendation";
import type { ContentItem, KnowledgeProfile } from "../types";

const NOW = new Date("2026-01-01T00:00:00.000Z");

function item(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: "x",
    type: "paper",
    title: "T",
    summary: "S",
    url: "https://example.com",
    source: "arXiv",
    topics: ["llm"],
    level: "intermediate",
    publishedAt: "2025-12-01",
    popularity: 0.5,
    evergreen: false,
    ...overrides,
  };
}

const profile: KnowledgeProfile = {
  userId: "u",
  displayName: "You",
  onboarded: true,
  topics: ["llm", "rag"],
  level: "intermediate",
  xp: 0,
  streakDays: 0,
  lastActiveDay: null,
  createdAt: NOW.toISOString(),
};

const ctx = { profile, topicAffinity: {}, now: NOW };

describe("freshnessScore", () => {
  it("gives evergreen content a stable floor", () => {
    expect(freshnessScore(item({ evergreen: true, publishedAt: "2015-01-01" }), NOW)).toBe(0.6);
  });

  it("decays recent content with age", () => {
    const fresh = freshnessScore(item({ publishedAt: "2025-12-25" }), NOW);
    const old = freshnessScore(item({ publishedAt: "2020-01-01" }), NOW);
    expect(fresh).toBeGreaterThan(old);
    expect(old).toBeGreaterThanOrEqual(0);
  });
});

describe("levelScore", () => {
  it("rewards exact level matches most", () => {
    expect(levelScore(item({ level: "intermediate" }), "intermediate")).toBe(1);
    expect(levelScore(item({ level: "advanced" }), "intermediate")).toBe(0.6);
    expect(levelScore(item({ level: "advanced" }), "beginner")).toBe(0.2);
  });
});

describe("topicMatchScore", () => {
  it("scores overlapping topics higher than unrelated ones", () => {
    const match = topicMatchScore(item({ topics: ["llm", "rag"] }), ctx);
    const miss = topicMatchScore(item({ topics: ["cv"] }), ctx);
    expect(match).toBe(1);
    expect(miss).toBe(0);
  });

  it("boosts topics with positive swipe affinity", () => {
    const boosted = topicMatchScore(item({ topics: ["cv"] }), {
      ...ctx,
      topicAffinity: { cv: 4 },
    });
    expect(boosted).toBeGreaterThan(0);
  });
});

describe("buildTopicAffinity", () => {
  it("weights must-learn above interested and penalises skips", () => {
    const affinity = buildTopicAffinity([
      { item: item({ topics: ["llm"] }), action: "must_learn" },
      { item: item({ topics: ["rag"] }), action: "interested" },
      { item: item({ topics: ["cv"] }), action: "skip" },
    ]);
    expect(affinity["llm"]).toBe(2);
    expect(affinity["rag"]).toBe(1);
    expect(affinity["cv"]).toBe(-0.5);
  });
});

describe("scoreItem", () => {
  it("ranks an on-topic, on-level, popular item above an off-topic one", () => {
    const good = scoreItem(item({ topics: ["llm", "rag"], popularity: 0.9 }), ctx);
    const bad = scoreItem(item({ topics: ["rl"], level: "advanced", popularity: 0.1 }), ctx);
    expect(good).toBeGreaterThan(bad);
  });
});

describe("explanationFor", () => {
  it("names a single matched topic", () => {
    expect(explanationFor(item({ topics: ["llm"] }), ctx)).toBe("Because you like LLMs");
  });

  it("mentions interests plus level on multi-topic matches", () => {
    expect(explanationFor(item({ topics: ["llm", "rag"] }), ctx)).toBe(
      "Matches your interests + intermediate level",
    );
  });

  it("falls back for off-topic items", () => {
    expect(explanationFor(item({ topics: ["cv"], popularity: 0.2 }), ctx)).toBe(
      "Something a bit different",
    );
  });
});

describe("recommend", () => {
  const candidates: ContentItem[] = [
    item({ id: "a", topics: ["llm"], popularity: 0.9 }),
    item({ id: "b", topics: ["rag"], popularity: 0.8 }),
    item({ id: "c", topics: ["cv"], popularity: 0.3, level: "advanced" }),
    item({ id: "d", topics: ["rl"], popularity: 0.2, level: "beginner" }),
    item({ id: "e", topics: ["mlops"], popularity: 0.1 }),
  ];

  it("returns unique items up to the limit", () => {
    const cards = recommend(candidates, ctx, { limit: 4, random: mulberry32(7) });
    expect(cards).toHaveLength(4);
    expect(new Set(cards.map((c) => c.item.id)).size).toBe(4);
  });

  it("never returns more items than available", () => {
    const cards = recommend(candidates, ctx, { limit: 50, random: mulberry32(1) });
    expect(cards).toHaveLength(candidates.length);
  });

  it("is deterministic for a given seed", () => {
    const a = recommend(candidates, ctx, { random: mulberry32(3) }).map((c) => c.item.id);
    const b = recommend(candidates, ctx, { random: mulberry32(3) }).map((c) => c.item.id);
    expect(a).toEqual(b);
  });

  it("leads with the highest ranked item", () => {
    const cards = recommend(candidates, ctx, { limit: 3, random: () => 0.99 });
    expect(cards[0]!.item.id).toBe("a");
  });

  it("shows explanations only occasionally", () => {
    const none = recommend(candidates, ctx, { random: () => 0.99, explanationRate: 0.3 });
    expect(none.every((c) => c.explanation === null)).toBe(true);
    const all = recommend(candidates, ctx, { random: () => 0, explanationRate: 1 });
    expect(all.every((c) => c.explanation !== null)).toBe(true);
  });
});
