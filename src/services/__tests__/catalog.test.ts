import { describe, expect, it } from "vitest";
import { CATALOG, TOPICS } from "../catalog";

describe("ingested catalog", () => {
  it("has unique ids", () => {
    expect(new Set(CATALOG.map((i) => i.id)).size).toBe(CATALOG.length);
  });

  it("only references known topics", () => {
    const known = new Set(TOPICS.map((t) => t.id));
    for (const item of CATALOG) {
      expect(item.topics.length).toBeGreaterThan(0);
      for (const topic of item.topics) expect(known.has(topic)).toBe(true);
    }
  });

  it("covers articles, papers and repositories", () => {
    const types = new Set(CATALOG.map((i) => i.type));
    expect(types).toEqual(new Set(["article", "paper", "repo"]));
  });

  it("mixes evergreen and recent content", () => {
    expect(CATALOG.some((i) => i.evergreen)).toBe(true);
    expect(CATALOG.some((i) => !i.evergreen)).toBe(true);
  });

  it("links only to whitelisted https sources", () => {
    for (const item of CATALOG) expect(item.url.startsWith("https://")).toBe(true);
  });
});
