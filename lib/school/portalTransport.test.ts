import { describe, expect, it } from "vitest";
import {
  journeyEventLabel,
  journeyEventTone,
  journeyStage,
} from "./portalTransport";

describe("journeyEventLabel", () => {
  it("maps known event types to human labels", () => {
    expect(journeyEventLabel("BOARDED")).toBe("Boarded the bus");
    expect(journeyEventLabel("DROPPED_AT_HOME")).toBe("Dropped off at home");
  });

  it("falls back to a de-snaked label for unknown types", () => {
    expect(journeyEventLabel("SOMETHING_NEW")).toBe("something new");
  });
});

describe("journeyEventTone", () => {
  it("flags no-shows as danger and absences as warning", () => {
    expect(journeyEventTone("NO_SHOW")).toBe("danger");
    expect(journeyEventTone("MARKED_ABSENT")).toBe("warning");
    expect(journeyEventTone("BOARDED")).toBe("success");
  });
});

describe("journeyStage", () => {
  it("derives the stage from the latest event", () => {
    expect(journeyStage([]).label).toBe("Waiting for the bus");
    expect(journeyStage([{ type: "BOARDED" }]).label).toBe("On the bus");
    expect(journeyStage([{ type: "BOARDED" }, { type: "DROPPED_AT_SCHOOL" }]).label).toBe(
      "Arrived at school",
    );
  });

  it("surfaces problems", () => {
    expect(journeyStage([{ type: "NO_SHOW" }])).toMatchObject({
      label: "Not present at pickup",
      tone: "danger",
    });
  });
});
