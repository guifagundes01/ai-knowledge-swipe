import { beforeEach, describe, expect, it } from "vitest";
import { createMemoryStorage, createMockKnowledgeService } from "../mockKnowledgeService";
import { mulberry32 } from "../recommendation";
import { CATALOG } from "../catalog";
import type { KnowledgeService } from "../types";

function makeService(nowRef: { current: Date }, storage = createMemoryStorage()): KnowledgeService {
  return createMockKnowledgeService({
    storage,
    now: () => nowRef.current,
    random: mulberry32(11),
  });
}

describe("mock knowledge service", () => {
  let now: { current: Date };
  let service: KnowledgeService;

  beforeEach(() => {
    now = { current: new Date("2026-03-10T10:00:00.000Z") };
    service = makeService(now);
  });

  it("starts un-onboarded with zero XP", async () => {
    const profile = await service.getProfile();
    expect(profile.onboarded).toBe(false);
    expect(profile.xp).toBe(0);
    expect(profile.streakDays).toBe(0);
  });

  it("stores onboarding answers and starts the streak", async () => {
    const profile = await service.completeOnboarding({ topics: ["llm"], level: "advanced" });
    expect(profile).toMatchObject({ onboarded: true, topics: ["llm"], level: "advanced" });
    expect(profile.streakDays).toBe(1);
  });

  it("awards 1 XP for interested and 3 XP for must learn", async () => {
    await service.completeOnboarding({ topics: ["llm"], level: "intermediate" });
    const a = await service.swipe("c-lora", "interested");
    expect(a.xpAwarded).toBe(1);
    const b = await service.swipe("c-attention", "must_learn");
    expect(b.xpAwarded).toBe(3);
    const c = await service.swipe("c-bert", "skip");
    expect(c.xpAwarded).toBe(0);
    expect((await service.getProfile()).xp).toBe(4);
  });

  it("does not double-count a repeated swipe", async () => {
    await service.swipe("c-lora", "interested");
    const again = await service.swipe("c-lora", "must_learn");
    expect(again.xpAwarded).toBe(0);
    expect((await service.getProfile()).xp).toBe(1);
  });

  it("saves right and up swipes, and keeps must-learn in its own queue", async () => {
    await service.swipe("c-lora", "interested");
    await service.swipe("c-attention", "must_learn");
    await service.swipe("c-bert", "skip");

    const saved = await service.getSaved();
    const mustLearn = await service.getMustLearn();
    expect(saved.map((s) => s.item.id).sort()).toEqual(["c-attention", "c-lora"]);
    expect(mustLearn.map((s) => s.item.id)).toEqual(["c-attention"]);
  });

  it("awards consumption XP only once", async () => {
    await service.swipe("c-lora", "interested");
    expect((await service.markConsumed("c-lora")).xpAwarded).toBe(2);
    expect((await service.markConsumed("c-lora")).xpAwarded).toBe(0);
    const saved = await service.getSaved();
    expect(saved[0]!.saved.consumedAt).not.toBeNull();
  });

  it("rejects unknown items", async () => {
    await expect(service.swipe("nope", "interested")).rejects.toThrow(/Unknown content item/);
  });

  it("never re-serves an already swiped item in the feed", async () => {
    await service.completeOnboarding({ topics: ["llm", "rag"], level: "intermediate" });
    const first = await service.getFeed(5);
    for (const card of first) await service.swipe(card.item.id, "skip");
    const second = await service.getFeed(5);
    const firstIds = new Set(first.map((c) => c.item.id));
    expect(second.every((c) => !firstIds.has(c.item.id))).toBe(true);
  });

  it("eventually exhausts the catalog", async () => {
    await service.completeOnboarding({ topics: ["llm"], level: "beginner" });
    for (const item of CATALOG) await service.swipe(item.id, "skip");
    expect(await service.getFeed(10)).toHaveLength(0);
  });

  it("increments the streak on consecutive days and resets after a gap", async () => {
    await service.completeOnboarding({ topics: ["llm"], level: "beginner" });
    expect((await service.getProfile()).streakDays).toBe(1);

    now.current = new Date("2026-03-11T09:00:00.000Z");
    await service.swipe("c-lora", "interested");
    expect((await service.getProfile()).streakDays).toBe(2);

    now.current = new Date("2026-03-11T22:00:00.000Z");
    await service.swipe("c-bert", "interested");
    expect((await service.getProfile()).streakDays).toBe(2);

    now.current = new Date("2026-03-20T09:00:00.000Z");
    await service.swipe("c-attention", "must_learn");
    expect((await service.getProfile()).streakDays).toBe(1);
  });

  it("records activity newest first", async () => {
    await service.swipe("c-lora", "interested");
    await service.swipe("c-attention", "must_learn");
    const activity = await service.getActivity();
    expect(activity.map((a) => a.event.itemId)).toEqual(["c-attention", "c-lora"]);
    expect(activity[0]!.item?.title).toContain("Attention");
  });

  it("persists state across service instances via storage", async () => {
    const storage = createMemoryStorage();
    const first = makeService(now, storage);
    await first.completeOnboarding({ topics: ["rag"], level: "advanced" });
    await first.swipe("c-lora", "must_learn");

    const second = makeService(now, storage);
    const profile = await second.getProfile();
    expect(profile.xp).toBe(3);
    expect(profile.topics).toEqual(["rag"]);
    expect((await second.getMustLearn()).map((s) => s.item.id)).toEqual(["c-lora"]);
  });

  it("resets everything", async () => {
    await service.completeOnboarding({ topics: ["rag"], level: "advanced" });
    await service.swipe("c-lora", "must_learn");
    await service.reset();
    const profile = await service.getProfile();
    expect(profile.xp).toBe(0);
    expect(profile.onboarded).toBe(false);
    expect(await service.getSaved()).toHaveLength(0);
  });
});
