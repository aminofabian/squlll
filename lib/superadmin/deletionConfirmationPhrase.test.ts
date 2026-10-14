import { describe, expect, it } from "vitest";
import { deletionConfirmationPhrase } from "./deletionConfirmationPhrase";

describe("deletionConfirmationPhrase", () => {
  it("asks for the subdomain when deleting one school", () => {
    expect(deletionConfirmationPhrase([{ subdomain: "mirema" }])).toBe(
      "mirema",
    );
  });

  it("asks for a count phrase when deleting several schools", () => {
    expect(
      deletionConfirmationPhrase([
        { subdomain: "mirema" },
        { subdomain: "kandie" },
        { subdomain: "kamukunji" },
      ]),
    ).toBe("delete 3 schools");
  });
});
