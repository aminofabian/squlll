import { describe, expect, it } from "vitest";
import { groupMessagesByDay } from "./groupMessagesByDay";
import type { ChatMessage } from "./types";

const ME = "user-me";
const THEM = "user-them";
const NOW = new Date(2026, 9, 9, 15, 0, 0);

function message(id: string, senderId: string, createdAt: Date): ChatMessage {
  return {
    id,
    conversationId: "c1",
    senderType: "TEACHER",
    senderId,
    content: id,
    createdAt: createdAt.toISOString(),
    isRead: false,
  };
}

describe("groupMessagesByDay", () => {
  it("returns no sections for an empty thread", () => {
    expect(groupMessagesByDay([], ME, NOW)).toEqual([]);
  });

  it("merges consecutive messages from one sender within the window", () => {
    const messages = [
      message("a", THEM, new Date(2026, 9, 9, 10, 0)),
      message("b", THEM, new Date(2026, 9, 9, 10, 2)),
    ];
    const [section] = groupMessagesByDay(messages, ME, NOW);
    expect(section.groups).toHaveLength(1);
    expect(section.groups[0].messages.map((m) => m.id)).toEqual(["a", "b"]);
    expect(section.groups[0].isMine).toBe(false);
  });

  it("starts a new group when the sender changes", () => {
    const messages = [
      message("a", THEM, new Date(2026, 9, 9, 10, 0)),
      message("b", ME, new Date(2026, 9, 9, 10, 1)),
    ];
    const [section] = groupMessagesByDay(messages, ME, NOW);
    expect(section.groups.map((g) => g.isMine)).toEqual([false, true]);
  });

  it("starts a new group after the grouping window has passed", () => {
    const messages = [
      message("a", THEM, new Date(2026, 9, 9, 10, 0)),
      message("b", THEM, new Date(2026, 9, 9, 10, 6)),
    ];
    const [section] = groupMessagesByDay(messages, ME, NOW);
    expect(section.groups).toHaveLength(2);
  });

  it("splits sections at local midnight and labels them", () => {
    const messages = [
      message("a", THEM, new Date(2026, 9, 8, 23, 59)),
      message("b", THEM, new Date(2026, 9, 9, 0, 1)),
    ];
    const sections = groupMessagesByDay(messages, ME, NOW);
    expect(sections.map((s) => s.dayLabel)).toEqual(["Yesterday", "Today"]);
    expect(sections[1].groups).toHaveLength(1);
  });

  it("treats every message as foreign when the current user is unknown", () => {
    const messages = [message("a", ME, new Date(2026, 9, 9, 10, 0))];
    const [section] = groupMessagesByDay(messages, null, NOW);
    expect(section.groups[0].isMine).toBe(false);
  });
});
