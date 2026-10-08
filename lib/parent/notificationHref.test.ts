import { describe, expect, it } from "vitest";
import { parentTabForNotificationHref } from "./notificationHref";

describe("parentTabForNotificationHref", () => {
  it("maps transport deep-links onto the transport tab", () => {
    expect(parentTabForNotificationHref("/parent/transport")).toBe("transport");
    expect(parentTabForNotificationHref("/student/transport")).toBe("transport");
  });

  it("translates href segments that differ from the web tab key", () => {
    expect(parentTabForNotificationHref("/parent/fees")).toBe("payments");
    expect(parentTabForNotificationHref("/parent/timetable")).toBe("schedule");
    expect(parentTabForNotificationHref("/parent")).toBe("dashboard");
  });

  it("ignores queries/fragments and unknown or empty hrefs", () => {
    expect(parentTabForNotificationHref("/parent/transport?tab=x")).toBe("transport");
    expect(parentTabForNotificationHref("/something/else")).toBeNull();
    expect(parentTabForNotificationHref("")).toBeNull();
    expect(parentTabForNotificationHref(null)).toBeNull();
    expect(parentTabForNotificationHref(undefined)).toBeNull();
  });
});
