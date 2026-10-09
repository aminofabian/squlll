import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("assetlinks.json route", () => {
  it("serves an Android App Links statement for the SQUL package", async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");

    const statements = await response.json();
    expect(statements).toHaveLength(1);
    expect(statements[0]).toMatchObject({
      relation: ["delegate_permission/common.handle_all_messages"],
      target: {
        namespace: "android_app",
        package_name: "ke.co.squl.app",
      },
    });
    expect(statements[0].target.sha256_cert_fingerprints).toContain(
      "A2:BC:01:29:74:A4:7A:C1:DE:55:67:2A:B7:10:57:CD:DA:F2:2D:98:D1:58:71:09:BA:DB:D7:A7:EE:48:52:29",
    );
  });
});
