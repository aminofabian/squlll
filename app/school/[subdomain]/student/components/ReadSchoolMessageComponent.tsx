"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronUp,
  Inbox,
  MessageCircle,
  Send,
  Users,
} from "lucide-react";
import { EmptyState, PageHeader, Section, StatusPill } from "../_ui";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  from: string;
  to: string;
  text: string;
  time: string;
}

const mockContacts = [
  { id: "t1", name: "Mr. Johnson", role: "Teacher", avatar: "🧑‍🏫" },
  { id: "t2", name: "Ms. Smith", role: "Teacher", avatar: "👩‍🏫" },
  { id: "a1", name: "School Admin", role: "Admin", avatar: "🏫" },
  { id: "s1", name: "Support Staff", role: "Staff", avatar: "🧑‍💼" },
];

const mockMessages: Record<string, Message[]> = {
  t1: [
    { id: 1, from: "t1", to: "student", text: "Hi! Please remember to submit your assignment by Friday.", time: "2h ago" },
    { id: 2, from: "student", to: "t1", text: "Thank you, I will!", time: "1h ago" },
  ],
  t2: [
    { id: 1, from: "t2", to: "student", text: "Parent-teacher meeting is next week.", time: "3d ago" },
  ],
  a1: [
    { id: 1, from: "a1", to: "student", text: "Welcome to the new term! Let us know if you need anything.", time: "5d ago" },
  ],
  s1: [
    { id: 1, from: "s1", to: "student", text: "Your library books are due next Monday.", time: "1d ago" },
  ],
};

export default function ReadSchoolMessageComponent({ onBack }: { onBack: () => void }) {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const [showContacts, setShowContacts] = useState(true);
  const [contactSearch, setContactSearch] = useState("");

  const handleSend = () => {
    if (!selectedContact || !messageInput.trim()) return;
    setMessages((prev) => ({
      ...prev,
      [selectedContact]: [
        ...(prev[selectedContact] || []),
        { id: Date.now(), from: "student", to: selectedContact, text: messageInput, time: "now" },
      ],
    }));
    setMessageInput("");
  };

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    contact.role.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const activeContact = mockContacts.find((c) => c.id === selectedContact) ?? null;
  const threadMessages = selectedContact ? messages[selectedContact] ?? [] : [];
  const totalMessages = Object.values(messages).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Messages"
        subtitle="Read and send messages to your teachers, admin and staff"
        onBack={onBack}
        actions={<StatusPill tone="neutral">{totalMessages} messages</StatusPill>}
      />

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        {/* Contacts */}
        <Section
          icon={Users}
          title="Contacts"
          padded={false}
          bodyClassName="p-3"
          actions={
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowContacts((v) => !v)}
              aria-label={showContacts ? "Hide contacts" : "Show contacts"}
            >
              {showContacts ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          }
        >
          {showContacts ? (
            <div className="space-y-3">
              <Input
                placeholder="Search teacher or staff…"
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
              />
              <div className="space-y-1.5">
                {filteredContacts.length === 0 ? (
                  <EmptyState icon={Inbox} title="No contacts found" className="py-6" />
                ) : (
                  filteredContacts.map((contact) => {
                    const active = selectedContact === contact.id;
                    return (
                      <button
                        key={contact.id}
                        type="button"
                        onClick={() => setSelectedContact(contact.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border px-2.5 py-2 text-left transition-colors",
                          active
                            ? "border-primary/40 bg-primary/10"
                            : "border-transparent hover:bg-muted",
                        )}
                      >
                        <span className="text-xl">{contact.avatar}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {contact.name}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {contact.role}
                          </span>
                        </span>
                        {active ? <StatusPill tone="accent">Active</StatusPill> : null}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : null}
        </Section>

        {/* Thread */}
        <Section
          icon={MessageCircle}
          title={activeContact ? activeContact.name : "Select a contact"}
          description={activeContact?.role}
          padded={false}
          className="flex min-h-[420px] flex-col"
          bodyClassName="flex min-h-0 flex-1 flex-col p-0"
        >
          {selectedContact && activeContact ? (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {threadMessages.map((msg) => {
                  const mine = msg.from === "student";
                  return (
                    <div
                      key={msg.id}
                      className={cn("flex", mine ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                          mine
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground",
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        <p
                          className={cn(
                            "mt-1 text-[10px]",
                            mine ? "text-primary-foreground/70" : "text-muted-foreground",
                          )}
                        >
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {threadMessages.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No messages yet. Start the conversation!
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-2 border-t border-border p-3">
                <Input
                  placeholder="Type your message…"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  className="shrink-0"
                  disabled={!messageInput.trim()}
                  onClick={handleSend}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <EmptyState
              icon={MessageCircle}
              title="Select a contact to start messaging"
              description="You can message your teachers, admin, or staff here."
              className="flex-1"
            />
          )}
        </Section>
      </div>
    </div>
  );
}
