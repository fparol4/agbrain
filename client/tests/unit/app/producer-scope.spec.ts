import { describe, expect, it } from "vitest";
import { getScopedPath } from "@/app/producer-scope";

describe("getScopedPath helper", () => {
  const mockProducerId = "123e4567-e89b-12d3-a456-426614174000";
  const searchWithScope = `?idProducer=${mockProducerId}`;
  const emptySearch = "";

  it("preserves idProducer when navigating to /dashboard, /farms, or /harvests", () => {
    expect(getScopedPath("/dashboard", searchWithScope)).toBe(
      `/dashboard?idProducer=${mockProducerId}`,
    );
    expect(getScopedPath("/farms", searchWithScope)).toBe(`/farms?idProducer=${mockProducerId}`);
    expect(getScopedPath("/harvests", searchWithScope)).toBe(
      `/harvests?idProducer=${mockProducerId}`,
    );
  });

  it("strips idProducer when navigating to /producers or /audit", () => {
    expect(getScopedPath("/producers", searchWithScope)).toBe("/producers");
    expect(getScopedPath("/audit", searchWithScope)).toBe("/audit");
  });

  it("returns base path unchanged when no idProducer exists in search", () => {
    expect(getScopedPath("/dashboard", emptySearch)).toBe("/dashboard");
    expect(getScopedPath("/farms", emptySearch)).toBe("/farms");
    expect(getScopedPath("/producers", emptySearch)).toBe("/producers");
  });
});
