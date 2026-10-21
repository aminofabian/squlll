import { describe, expect, it } from "vitest";
import {
  isDuplicateTermError,
  isOverlappingTermError,
  normalizeTermName,
  pendingTermDrafts,
  termErrorMessage,
} from "./onboarding-terms";
import type { TermDraft } from "./school-calendar-presets";

const draft = (name: string, extra: Partial<TermDraft> = {}): TermDraft => ({
  name,
  startDate: "2027-01-01",
  endDate: "2027-04-30",
  ...extra,
});

describe("pendingTermDrafts", () => {
  it("returns every included draft when no terms exist yet", () => {
    const drafts = [draft("Term 1"), draft("Term 2"), draft("Term 3")];

    expect(pendingTermDrafts(drafts, [])).toEqual(drafts);
  });

  it("skips terms that are already saved for the year", () => {
    const drafts = [draft("Term 1"), draft("Term 2"), draft("Term 3")];

    expect(
      pendingTermDrafts(drafts, [{ name: "term 1" }, { name: "  Term   2 " }]),
    ).toEqual([draft("Term 3")]);
  });

  it("skips excluded drafts and duplicate draft names", () => {
    const drafts = [
      draft("Term 1"),
      draft(" term 1 "),
      draft("Term 2", { included: false }),
      draft("Term 3"),
    ];

    expect(pendingTermDrafts(drafts, [])).toEqual([draft("Term 1"), draft("Term 3")]);
  });

  it("ignores blank names", () => {
    expect(pendingTermDrafts([draft("   "), draft("Term 1")], [])).toEqual([
      draft("Term 1"),
    ]);
  });

  it("is empty when every draft already exists", () => {
    expect(
      pendingTermDrafts(
        [draft("Term 1"), draft("Term 2")],
        [{ name: "Term 1" }, { name: "Term 2" }],
      ),
    ).toEqual([]);
  });
});

describe("isDuplicateTermError", () => {
  it("detects the backend CONFLICT response", () => {
    const payload = {
      error: "Error creating term",
      details: [
        {
          message: "Term with name 'Term 1' already exists in this academic year",
          extensions: { code: "CONFLICT" },
        },
      ],
    };

    expect(isDuplicateTermError(payload)).toBe(true);
    expect(termErrorMessage(payload)).toBe(
      "Term with name 'Term 1' already exists in this academic year",
    );
  });

  it("detects database unique violations", () => {
    expect(
      isDuplicateTermError({
        error: 'duplicate key value violates unique constraint "terms"',
      }),
    ).toBe(true);
  });

  it("does not treat other errors as duplicates", () => {
    expect(
      isDuplicateTermError({
        error: "Term dates overlap with existing term 'Term 1'",
      }),
    ).toBe(false);
  });
});

describe("isOverlappingTermError", () => {
  it("detects the overlap CONFLICT response", () => {
    expect(
      isOverlappingTermError({
        error: "Error creating term",
        details: [
          {
            message: "Term dates overlap with existing term 'First Term'",
            extensions: { code: "CONFLICT" },
          },
        ],
      }),
    ).toBe(true);
  });

  it("does not treat a duplicate-name error as an overlap", () => {
    expect(
      isOverlappingTermError({
        details: [
          {
            message:
              "Term with name 'Term 1' already exists in this academic year",
          },
        ],
      }),
    ).toBe(false);
  });
});

describe("normalizeTermName", () => {
  it("normalizes case and whitespace", () => {
    expect(normalizeTermName("  First   Term ")).toBe("first term");
    expect(normalizeTermName(null)).toBe("");
  });
});
