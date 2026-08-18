import { describe, expect, it } from "vitest";
import { dayKey, nextStreak } from "../streak";

const now = new Date("2026-05-10T08:00:00.000Z");

describe("streak", () => {
  it("formats day keys as ISO dates", () => {
    expect(dayKey(now)).toBe("2026-05-10");
  });

  it("starts at 1 with no history", () => {
    expect(nextStreak(null, 0, now)).toBe(1);
  });

  it("keeps the same streak twice in one day", () => {
    expect(nextStreak("2026-05-10", 5, now)).toBe(5);
  });

  it("increments after yesterday", () => {
    expect(nextStreak("2026-05-09", 5, now)).toBe(6);
  });

  it("resets after a gap", () => {
    expect(nextStreak("2026-05-01", 5, now)).toBe(1);
  });
});
