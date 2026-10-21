import { describe, expect, it } from "vitest";
import {
  audienceIsValid,
  audienceLabel,
  can,
  canCancel,
  canDelete,
  canEdit,
  channelListLabel,
  estimateSegments,
  insertMergeTag,
  isSendable,
  CAMPAIGN_STATUS_META,
  MESSAGE_STATUS_META,
} from "./communicationsHubUtils";

describe("communications hub UI helpers", () => {
  it("checks permissions without widening access", () => {
    expect(can(["VIEW"], "VIEW")).toBe(true);
    expect(can(["VIEW"], "CAMPAIGNS_SEND")).toBe(false);
    expect(can(undefined, "VIEW")).toBe(false);
  });

  it("labels audiences with the selected grade and student count", () => {
    const options = {
      grades: [{ id: "g1", name: "Grade 4" }],
      streams: [{ id: "s1", name: "Blue", gradeName: "Grade 4" }],
    };
    expect(audienceLabel({ type: "ALL_PARENTS" }, options)).toBe("All parents");
    expect(audienceLabel({ type: "GRADE", gradeId: "g1" }, options)).toBe(
      "A grade: Grade 4",
    );
    expect(audienceLabel({ type: "STUDENTS", studentIds: ["s1"] }, options)).toBe(
      "Selected students: 1 student",
    );
    expect(audienceLabel({ type: "EVENT_RECIPIENTS" }, options)).toBe(
      "People involved in the event",
    );
  });

  it("validates audiences before enabling send", () => {
    expect(audienceIsValid({ type: "ALL_PARENTS" })).toBe(true);
    expect(audienceIsValid({ type: "GRADE" })).toBe(false);
    expect(audienceIsValid({ type: "STREAM" })).toBe(false);
    expect(audienceIsValid({ type: "STUDENTS", studentIds: [] })).toBe(false);
    expect(audienceIsValid({ type: "STUDENTS", studentIds: ["s1"] })).toBe(true);
  });

  it("inserts merge tags at a text selection and returns the cursor", () => {
    const result = insertMergeTag("Hello ", "recipient.name", 6, 6);
    expect(result.value).toBe("Hello {{recipient.name}}");
    expect(result.cursor).toBe(result.value.length);
  });

  it("replaces a selected range when inserting a merge tag", () => {
    const result = insertMergeTag("Hello NAME", "recipient.name", 6, 10);
    expect(result.value).toBe("Hello {{recipient.name}}");
  });

  it("estimates GSM-7 and UCS-2 segments", () => {
    expect(estimateSegments("")).toBe(0);
    expect(estimateSegments("a".repeat(160))).toBe(1);
    expect(estimateSegments("a".repeat(161))).toBe(2);
    expect(estimateSegments("✓".repeat(70))).toBe(1);
    expect(estimateSegments("✓".repeat(71))).toBe(2);
  });

  it("communicates the correct campaign actions", () => {
    expect(isSendable("DRAFT")).toBe(true);
    expect(isSendable("SENT")).toBe(false);
    expect(canEdit("DRAFT")).toBe(true);
    expect(canEdit("SCHEDULED")).toBe(false);
    expect(canCancel("SCHEDULED")).toBe(true);
    expect(canCancel("SENT")).toBe(false);
    expect(canDelete("DRAFT")).toBe(true);
    expect(canDelete("SENT")).toBe(false);
  });

  it("exposes consistent status metadata", () => {
    expect(CAMPAIGN_STATUS_META.PARTIALLY_SENT.label).toBe("Partly sent");
    expect(CAMPAIGN_STATUS_META.PARTIALLY_SENT.description).toContain("retry");
    expect(MESSAGE_STATUS_META.PENDING.label).toBe("Queued");
    expect(channelListLabel(["SMS", "EMAIL"])).toBe("SMS · Email");
  });
});
