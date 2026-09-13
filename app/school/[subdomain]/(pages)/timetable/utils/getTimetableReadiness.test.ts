import { describe, expect, it } from "vitest";
import { getTimetableReadiness } from "./getTimetableReadiness";

const base = {
  hasScheduleStructure: true,
  hasAnyLessons: true,
  filledSlots: 40,
  totalSlots: 40,
  clashCount: 0,
};

describe("getTimetableReadiness", () => {
  it("reports no structure when the school day is missing", () => {
    const r = getTimetableReadiness({
      ...base,
      hasScheduleStructure: false,
      hasAnyLessons: false,
      filledSlots: 0,
    });
    expect(r.verdict).toBe("no-structure");
    expect(r.canPublish).toBe(false);
  });

  it("reports not started with structure but no lessons", () => {
    const r = getTimetableReadiness({
      ...base,
      hasAnyLessons: false,
      filledSlots: 0,
    });
    expect(r.verdict).toBe("not-started");
    expect(r.canPublish).toBe(false);
  });

  it("puts clashes above fill level", () => {
    const r = getTimetableReadiness({ ...base, clashCount: 2 });
    expect(r.verdict).toBe("clashes");
    expect(r.canPublish).toBe(false);
    expect(r.nextStep).toContain("2 clashes");
  });

  it("only says ready at 100% with no clashes", () => {
    const r = getTimetableReadiness({ ...base });
    expect(r.verdict).toBe("ready");
    expect(r.isComplete).toBe(true);
    expect(r.canPublish).toBe(true);
    expect(r.nextStep).toContain("Ready to publish");
  });

  it("says almost there at 85–99% without ever claiming ready", () => {
    const r = getTimetableReadiness({ ...base, filledSlots: 36 });
    expect(r.verdict).toBe("almost");
    expect(r.canPublish).toBe(true);
    expect(r.nextStep).toContain("4 empty slots");
    expect(r.nextStep).not.toContain("Ready to publish");
  });

  it("says in progress below 85%", () => {
    const r = getTimetableReadiness({ ...base, filledSlots: 20 });
    expect(r.verdict).toBe("in-progress");
    expect(r.nextStep).toContain("20 empty slots");
    expect(r.nextStep).not.toContain("Ready to publish");
  });

  it("never claims ready while empty slots remain", () => {
    for (const filled of [0, 10, 20, 33, 34, 39]) {
      const r = getTimetableReadiness({ ...base, filledSlots: filled });
      expect(r.isComplete).toBe(false);
      expect(r.nextStep).not.toContain("Ready to publish");
      expect(r.nextStep).not.toContain("Every slot is filled");
    }
  });

  it("uses singular wording for a single clash and empty slot", () => {
    const clashes = getTimetableReadiness({ ...base, clashCount: 1 });
    expect(clashes.nextStep).toContain("1 clash must be fixed");
    const empty = getTimetableReadiness({ ...base, filledSlots: 39 });
    expect(empty.nextStep).toContain("1 empty slot");
  });

  it("requires a term before publishing", () => {
    const r = getTimetableReadiness({ ...base, hasTerm: false });
    expect(r.canPublish).toBe(false);
    expect(r.verdict).toBe("ready");
  });

  it("reflects publish state in the ready next step", () => {
    expect(getTimetableReadiness({ ...base, publishState: "published" }).nextStep).toContain(
      "Published",
    );
    expect(getTimetableReadiness({ ...base, publishState: "stale" }).nextStep).toContain(
      "publish again",
    );
  });
});
