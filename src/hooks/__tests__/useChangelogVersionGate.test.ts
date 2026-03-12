import { describe, expect, it } from "vitest";
import { shouldDisplayChangelog } from "../useChangelogVersionGate";

describe("shouldDisplayChangelog", () => {
  it("returns false when no previous version is stored", () => {
    expect(shouldDisplayChangelog(undefined, "1.0.0")).toBe(false);
    expect(shouldDisplayChangelog("", "1.0.0")).toBe(false);
  });

  it("returns false when version has not changed", () => {
    expect(shouldDisplayChangelog("1.0.0", "1.0.0")).toBe(false);
    expect(shouldDisplayChangelog(" 1.0.0 ", "1.0.0")).toBe(false);
  });

  it("returns true when stored version differs from current version", () => {
    expect(shouldDisplayChangelog("0.9.0", "1.0.0")).toBe(true);
    expect(shouldDisplayChangelog("1.0.0", "1.1.0")).toBe(true);
  });
});
