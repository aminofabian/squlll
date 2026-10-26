import { describe, expect, it } from "vitest";
import { resolveTermWindow } from "./termWindow";

const terms = [
  {
    id: "t1",
    name: "Term 1 2027",
    startDate: "2027-01-01",
    endDate: "2027-03-31",
  },
  {
    id: "t2",
    name: "Term 2 2027",
    startDate: "2027-05-01",
    endDate: "2027-07-31",
  },
  {
    id: "t3",
    name: "Term 3 2027",
    startDate: "2027-09-01",
    endDate: "2027-11-30",
  },
];

describe("resolveTermWindow", () => {
  it("picks the first scheduled term when today is before all terms", () => {
    const window = resolveTermWindow(terms, new Date(2026, 9, 26));
    expect(window.current).toBeNull();
    expect(window.next?.name).toBe("Term 1 2027");
  });

  it("uses the term dates, not the selected term, inside Term 1", () => {
    const window = resolveTermWindow(terms, new Date(2027, 1, 15));
    expect(window.current?.name).toBe("Term 1 2027");
    expect(window.next?.name).toBe("Term 2 2027");
  });

  it("finds the upcoming term between terms", () => {
    const window = resolveTermWindow(terms, new Date(2027, 3, 15));
    expect(window.current).toBeNull();
    expect(window.next?.name).toBe("Term 2 2027");
  });

  it("treats the end date as inclusive", () => {
    const window = resolveTermWindow(terms, new Date(2027, 2, 31));
    expect(window.current?.name).toBe("Term 1 2027");
    expect(window.next?.name).toBe("Term 2 2027");
  });

  it("returns no next term after the final term", () => {
    const window = resolveTermWindow(terms, new Date(2027, 11, 20));
    expect(window.current).toBeNull();
    expect(window.next).toBeNull();
  });

  it("ignores terms with invalid dates", () => {
    const window = resolveTermWindow(
      [{ id: "bad", name: "Bad", startDate: "nope", endDate: "nope" }],
      new Date(2026, 9, 26),
    );
    expect(window.current).toBeNull();
    expect(window.next).toBeNull();
  });
});
