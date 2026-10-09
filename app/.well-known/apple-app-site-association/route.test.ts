import { afterEach, describe, expect, it } from "vitest";
import { GET } from "./route";

const ORIGINAL_TEAM_ID = process.env.APPLE_TEAM_ID;

afterEach(() => {
  if (ORIGINAL_TEAM_ID === undefined) {
    delete process.env.APPLE_TEAM_ID;
  } else {
    process.env.APPLE_TEAM_ID = ORIGINAL_TEAM_ID;
  }
});

describe("apple-app-site-association route", () => {
  it("404s until the Apple team ID is configured", () => {
    delete process.env.APPLE_TEAM_ID;
    expect(GET().status).toBe(404);
  });

  it("serves the applinks statement once the team ID is set", async () => {
    process.env.APPLE_TEAM_ID = "ABCDE12345";

    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");

    const body = await response.json();
    expect(body.applinks.details[0]).toMatchObject({
      appID: "ABCDE12345.ke.co.squl.app",
      components: [{ "/": "*" }],
    });
  });
});
