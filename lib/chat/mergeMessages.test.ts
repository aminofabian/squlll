import { describe, expect, it } from "vitest";
import { mergeMessages } from "./mergeMessages";
import type { ChatMessage } from "./types";

function message(id: string, createdAt: string): ChatMessage {
  return {
    id,
    conversationId: "c1",
    senderType: "PARENT",
    senderId: "p1",
    content: id,
    createdAt,
    isRead: true,
  };
}

describe("mergeMessages", () => {
  it("drops incoming messages that are already present", () => {
    const existing = [message("a", "2026-10-09T10:00:00Z")];
    const incoming = [message("a", "2026-10-09T10:00:00Z")];
    expect(mergeMessages(existing, incoming)).toHaveLength(1);
  });

  it("sorts the combined list oldest first", () => {
    const existing = [message("c", "2026-10-09T12:00:00Z")];
    const incoming = [
      message("a", "2026-10-09T10:00:00Z"),
      message("b", "2026-10-09T11:00:00Z"),
    ];
    expect(mergeMessages(existing, incoming).map((m) => m.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });
});
