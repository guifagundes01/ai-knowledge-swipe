/**
 * Shared contracts for the whole app.
 *
 * Every backend call in the app goes through `KnowledgeService`.
 * The MVP ships a mock implementation (`createMockKnowledgeService`) so the
 * product runs end to end with no real backend. A future Cloud-backed
 * implementation only has to satisfy this same interface.
 */

export type ContentType = "article" | "paper" | "repo";

export type ExpertiseLevel = "beginner" | "intermediate" | "advanced";

export type SwipeAction = "skip" | "interested" | "must_learn";

export interface Topic {
  id: string;
  label: string;
}

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  /** One-line description. Cards stay minimal on purpose. */
  summary: string;
  url: string;
  source: string;
  topics: string[];
  level: ExpertiseLevel;
  /** ISO date the resource was published. */
  publishedAt: string;
  /** 0..1 normalized popularity signal (stars, citations, shares). */
  popularity: number;
  /** Foundational knowledge that never goes stale. */
  evergreen: boolean;
}

export interface SwipeEvent {
  id: string;
  itemId: string;
  action: SwipeAction;
  xp: number;
  at: string;
}

export interface SavedItem {
  itemId: string;
  action: Exclude<SwipeAction, "skip">;
  savedAt: string;
  consumedAt: string | null;
}

export interface KnowledgeProfile {
  userId: string;
  displayName: string;
  onboarded: boolean;
  topics: string[];
  level: ExpertiseLevel;
  xp: number;
  streakDays: number;
  lastActiveDay: string | null;
  createdAt: string;
}

export interface FeedCard {
  item: ContentItem;
  /** Occasional, human-readable reason. `null` on most cards by design. */
  explanation: string | null;
}

export interface SwipeResult {
  profile: KnowledgeProfile;
  xpAwarded: number;
}

export interface KnowledgeService {
  getTopics(): Promise<Topic[]>;
  getProfile(): Promise<KnowledgeProfile>;
  completeOnboarding(input: { topics: string[]; level: ExpertiseLevel }): Promise<KnowledgeProfile>;
  getFeed(limit?: number): Promise<FeedCard[]>;
  swipe(itemId: string, action: SwipeAction): Promise<SwipeResult>;
  getSaved(): Promise<{ item: ContentItem; saved: SavedItem }[]>;
  getMustLearn(): Promise<{ item: ContentItem; saved: SavedItem }[]>;
  markConsumed(itemId: string): Promise<SwipeResult>;
  getActivity(limit?: number): Promise<{ event: SwipeEvent; item: ContentItem | null }[]>;
  reset(): Promise<void>;
}

export const XP_REWARDS = {
  interested: 1,
  must_learn: 3,
  skip: 0,
  consume: 2,
} as const;
