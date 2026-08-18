import { CATALOG, TOPICS } from "./catalog";
import { buildTopicAffinity, mulberry32, recommend } from "./recommendation";
import { dayKey, nextStreak } from "./streak";
import {
  XP_REWARDS,
  type ContentItem,
  type ExpertiseLevel,
  type FeedCard,
  type KnowledgeProfile,
  type KnowledgeService,
  type SavedItem,
  type SwipeAction,
  type SwipeEvent,
  type SwipeResult,
  type Topic,
} from "./types";

export interface MockState {
  profile: KnowledgeProfile;
  swipes: SwipeEvent[];
  saved: SavedItem[];
}

export interface Storage {
  read(): MockState | null;
  write(state: MockState): void;
  clear(): void;
}

export function createMemoryStorage(): Storage {
  let state: MockState | null = null;
  return {
    read: () => (state ? structuredClone(state) : null),
    write: (next) => {
      state = structuredClone(next);
    },
    clear: () => {
      state = null;
    },
  };
}

const STORAGE_KEY = "aiml-tinder-state-v1";

export function createBrowserStorage(): Storage {
  if (typeof window === "undefined" || !window.localStorage) return createMemoryStorage();
  return {
    read: () => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as MockState) : null;
      } catch {
        return null;
      }
    },
    write: (next) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable — stay in-memory for this session */
      }
    },
    clear: () => {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    },
  };
}

export function createInitialState(now: Date): MockState {
  return {
    profile: {
      userId: "local-user",
      displayName: "You",
      onboarded: false,
      topics: [],
      level: "beginner",
      xp: 0,
      streakDays: 0,
      lastActiveDay: null,
      createdAt: now.toISOString(),
    },
    swipes: [],
    saved: [],
  };
}

export interface MockServiceOptions {
  storage?: Storage;
  catalog?: ContentItem[];
  now?: () => Date;
  random?: () => number;
  /** Simulated network latency in ms. */
  latencyMs?: number;
}

export function createMockKnowledgeService(options: MockServiceOptions = {}): KnowledgeService {
  const storage = options.storage ?? createMemoryStorage();
  const catalog = options.catalog ?? CATALOG;
  const now = options.now ?? (() => new Date());
  const random = options.random ?? mulberry32(42);
  const latency = options.latencyMs ?? 0;

  const byId = new Map(catalog.map((item) => [item.id, item]));

  let cache: MockState = storage.read() ?? createInitialState(now());

  const persist = () => storage.write(cache);
  const delay = <T,>(value: T): Promise<T> =>
    latency > 0
      ? new Promise((resolve) => setTimeout(() => resolve(value), latency))
      : Promise.resolve(value);

  const touchStreak = () => {
    const today = dayKey(now());
    cache.profile.streakDays = nextStreak(cache.profile.lastActiveDay, cache.profile.streakDays, now());
    cache.profile.lastActiveDay = today;
  };

  const historyWithItems = () =>
    cache.swipes
      .map((event) => ({ item: byId.get(event.itemId), action: event.action }))
      .filter((entry): entry is { item: ContentItem; action: SwipeAction } => Boolean(entry.item));

  const savedWithItems = (filter: (s: SavedItem) => boolean) =>
    cache.saved
      .filter(filter)
      .map((saved) => ({ item: byId.get(saved.itemId), saved }))
      .filter((entry): entry is { item: ContentItem; saved: SavedItem } => Boolean(entry.item))
      .sort((a, b) => b.saved.savedAt.localeCompare(a.saved.savedAt));

  return {
    async getTopics(): Promise<Topic[]> {
      return delay(TOPICS);
    },

    async getProfile(): Promise<KnowledgeProfile> {
      return delay({ ...cache.profile });
    },

    async completeOnboarding({ topics, level }: { topics: string[]; level: ExpertiseLevel }) {
      cache.profile = { ...cache.profile, topics, level, onboarded: true };
      touchStreak();
      persist();
      return delay({ ...cache.profile });
    },

    async getFeed(limit = 20): Promise<FeedCard[]> {
      const seen = new Set(cache.swipes.map((s) => s.itemId));
      const candidates = catalog.filter((item) => !seen.has(item.id));
      const cards = recommend(
        candidates,
        {
          profile: cache.profile,
          topicAffinity: buildTopicAffinity(historyWithItems()),
          now: now(),
        },
        { limit, random },
      );
      return delay(cards);
    },

    async swipe(itemId: string, action: SwipeAction): Promise<SwipeResult> {
      if (!byId.has(itemId)) throw new Error(`Unknown content item: ${itemId}`);
      const already = cache.swipes.some((s) => s.itemId === itemId);
      const xp = already ? 0 : XP_REWARDS[action];
      const timestamp = now().toISOString();

      if (!already) {
        cache.swipes = [
          { id: `sw-${cache.swipes.length + 1}-${itemId}`, itemId, action, xp, at: timestamp },
          ...cache.swipes,
        ];
        if (action !== "skip") {
          cache.saved = [
            { itemId, action, savedAt: timestamp, consumedAt: null },
            ...cache.saved.filter((s) => s.itemId !== itemId),
          ];
        }
        cache.profile.xp += xp;
        touchStreak();
        persist();
      }

      return delay({ profile: { ...cache.profile }, xpAwarded: xp });
    },

    async getSaved() {
      return delay(savedWithItems(() => true));
    },

    async getMustLearn() {
      return delay(savedWithItems((s) => s.action === "must_learn"));
    },

    async markConsumed(itemId: string): Promise<SwipeResult> {
      const saved = cache.saved.find((s) => s.itemId === itemId);
      let xp = 0;
      if (saved && !saved.consumedAt) {
        saved.consumedAt = now().toISOString();
        xp = XP_REWARDS.consume;
        cache.profile.xp += xp;
        touchStreak();
        persist();
      }
      return delay({ profile: { ...cache.profile }, xpAwarded: xp });
    },

    async getActivity(limit = 30) {
      const events = cache.swipes
        .slice(0, limit)
        .map((event) => ({ event, item: byId.get(event.itemId) ?? null }));
      return delay(events);
    },

    async reset() {
      cache = createInitialState(now());
      storage.clear();
      persist();
      return delay(undefined);
    },
  };
}
