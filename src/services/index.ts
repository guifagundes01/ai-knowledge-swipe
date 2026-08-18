import { createBrowserStorage, createMockKnowledgeService } from "./mockKnowledgeService";
import type { KnowledgeService } from "./types";

export * from "./types";
export { TOPICS, CATALOG } from "./catalog";

/**
 * Single entry point for every backend call in the app.
 * Swap this factory for a Cloud-backed implementation later; no UI changes needed.
 */
let instance: KnowledgeService | null = null;

export function getKnowledgeService(): KnowledgeService {
  if (!instance) {
    instance = createMockKnowledgeService({ storage: createBrowserStorage(), latencyMs: 120 });
  }
  return instance;
}

export function setKnowledgeService(service: KnowledgeService | null) {
  instance = service;
}

export const queryKeys = {
  profile: ["profile"] as const,
  topics: ["topics"] as const,
  feed: ["feed"] as const,
  saved: ["saved"] as const,
  mustLearn: ["must-learn"] as const,
  activity: ["activity"] as const,
};
