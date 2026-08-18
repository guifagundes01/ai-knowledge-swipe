import type { ContentItem, ExpertiseLevel, FeedCard, KnowledgeProfile } from "./types";
import { TOPICS } from "./catalog";

/**
 * Rules-based recommendation with controlled exploration.
 *
 * Deliberately dependency-free and pure so it can be swapped later for
 * embeddings / collaborative filtering / hybrid ranking without touching
 * the rest of the app.
 */

const LEVEL_INDEX: Record<ExpertiseLevel, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

/** Share of the feed reserved for exploration (less predictable picks). */
export const EXPLORATION_RATE = 0.2;

export interface RankingContext {
  profile: KnowledgeProfile;
  /** Topic -> affinity built from swipe history (positive and negative). */
  topicAffinity: Record<string, number>;
  now: Date;
}

export function freshnessScore(item: ContentItem, now: Date): number {
  if (item.evergreen) return 0.6;
  const ageDays = (now.getTime() - new Date(item.publishedAt).getTime()) / 86_400_000;
  if (ageDays <= 0) return 1;
  // Half-life of roughly one year for non-evergreen content.
  return Math.max(0, Math.min(1, Math.exp(-ageDays / 365)));
}

export function topicMatchScore(item: ContentItem, ctx: RankingContext): number {
  const selected = new Set(ctx.profile.topics);
  const overlap = item.topics.filter((t) => selected.has(t)).length;
  const base = selected.size === 0 ? 0.5 : Math.min(1, overlap / 2);
  const affinity = item.topics.reduce((sum, t) => sum + (ctx.topicAffinity[t] ?? 0), 0);
  return clamp01(base + affinity * 0.1);
}

export function levelScore(item: ContentItem, level: ExpertiseLevel): number {
  const distance = Math.abs(LEVEL_INDEX[item.level] - LEVEL_INDEX[level]);
  return distance === 0 ? 1 : distance === 1 ? 0.6 : 0.2;
}

export function scoreItem(item: ContentItem, ctx: RankingContext): number {
  return (
    topicMatchScore(item, ctx) * 0.45 +
    levelScore(item, ctx.profile.level) * 0.2 +
    freshnessScore(item, ctx.now) * 0.15 +
    item.popularity * 0.2
  );
}

export function buildTopicAffinity(
  history: { item: ContentItem; action: "skip" | "interested" | "must_learn" }[],
): Record<string, number> {
  const weights = { skip: -0.5, interested: 1, must_learn: 2 } as const;
  const affinity: Record<string, number> = {};
  for (const { item, action } of history) {
    for (const topic of item.topics) {
      affinity[topic] = (affinity[topic] ?? 0) + weights[action];
    }
  }
  return affinity;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function topicLabel(id: string): string {
  return TOPICS.find((t) => t.id === id)?.label ?? id;
}

export function explanationFor(item: ContentItem, ctx: RankingContext): string | null {
  const matched = item.topics.filter((t) => ctx.profile.topics.includes(t));
  if (matched.length === 0) {
    return item.popularity >= 0.85 ? "A classic most people bookmark" : "Something a bit different";
  }
  if (matched.length > 1) {
    return `Matches your interests + ${ctx.profile.level} level`;
  }
  return `Because you like ${topicLabel(matched[0])}`;
}

/**
 * Deterministic pseudo-random generator so the feed is reproducible in tests.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface RecommendOptions {
  limit?: number;
  random?: () => number;
  explanationRate?: number;
}

/**
 * Ranks candidates, then injects a controlled amount of exploration:
 * every ~1/EXPLORATION_RATE slots a random lower-ranked item is surfaced.
 */
export function recommend(
  candidates: ContentItem[],
  ctx: RankingContext,
  options: RecommendOptions = {},
): FeedCard[] {
  const { limit = 20, random = Math.random, explanationRate = 0.3 } = options;
  const ranked = [...candidates].sort((a, b) => scoreItem(b, ctx) - scoreItem(a, ctx));
  const exploitPool = ranked.slice(0, Math.max(limit, 10));
  const explorePool = ranked.slice(exploitPool.length);

  const picked: ContentItem[] = [];
  const used = new Set<string>();

  while (picked.length < Math.min(limit, ranked.length)) {
    const explore = explorePool.length > 0 && random() < EXPLORATION_RATE;
    const pool = explore ? explorePool : exploitPool;
    const next = explore
      ? pool[Math.floor(random() * pool.length)]
      : pool.find((item) => !used.has(item.id));
    const chosen = next && !used.has(next.id) ? next : pool.find((i) => !used.has(i.id));
    if (!chosen) {
      const fallback = ranked.find((i) => !used.has(i.id));
      if (!fallback) break;
      used.add(fallback.id);
      picked.push(fallback);
      continue;
    }
    used.add(chosen.id);
    picked.push(chosen);
  }

  return picked.map((item) => ({
    item,
    explanation: random() < explanationRate ? explanationFor(item, ctx) : null,
  }));
}
