"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  LifeBuoy,
  Loader2,
  MessageSquare,
  Search,
  Send,
  ShieldCheck,
} from "lucide-react";
import { AdminPageHeader } from "@/components/dashboard/superadmin/AdminPageChrome";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { superAdminGraphqlRequest } from "@/lib/superadmin/graphql";
import { formatRelativeTime } from "@/lib/chat/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SupportThread {
  id: string;
  tenantId: string;
  tenantName?: string | null;
  participant1Type: string;
  participant1Id: string;
  participant1Name?: string | null;
  participant2Type: string;
  participant2Id: string;
  participant2Name?: string | null;
  lastMessage?: string | null;
  unreadCount: number;
  updatedAt: string;
}

interface SupportMessage {
  id: string;
  conversationId: string;
  senderType: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

const THREADS_QUERY = `
  query SupportConversations {
    supportConversations {
      id tenantId tenantName
      participant1Type participant1Id participant1Name
      participant2Type participant2Id participant2Name
      lastMessage unreadCount updatedAt
    }
  }
`;

const MESSAGES_QUERY = `
  query SupportMessages($conversationId: String!, $limit: Float) {
    conversationMessages(conversationId: $conversationId, limit: $limit) {
      id conversationId senderType senderId content createdAt isRead
    }
  }
`;

const SEND_MUTATION = `
  mutation SendSupportMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id conversationId senderType senderId content createdAt isRead
    }
  }
`;

const READ_MUTATION = `
  mutation MarkSupportRead($conversationId: String!) {
    markConversationAsRead(conversationId: $conversationId)
  }
`;

function peer(thread: SupportThread) {
  return thread.participant1Type === "superadmin"
    ? {
        id: thread.participant2Id,
        type: thread.participant2Type,
        name: thread.participant2Name ?? "School admin",
      }
    : {
        id: thread.participant1Id,
        type: thread.participant1Type,
        name: thread.participant1Name ?? "School admin",
      };
}

function clock(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("en-KE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function SupportPage() {
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const selected = useMemo(
    () => threads.find((thread) => thread.id === selectedId) ?? null,
    [threads, selectedId],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((thread) =>
      [thread.tenantName, thread.participant1Name, thread.participant2Name, thread.lastMessage]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [threads, search]);

  const loadThreads = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await superAdminGraphqlRequest<{
        supportConversations: SupportThread[];
      }>(THREADS_QUERY);
      setThreads(data.supportConversations ?? []);
      setError(null);
    } catch (err) {
      if (!silent) {
        setError(err instanceof Error ? err.message : "Could not load support threads");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string, silent = false) => {
    if (!silent) setMessagesLoading(true);
    try {
      const data = await superAdminGraphqlRequest<{
        conversationMessages: SupportMessage[];
      }>(MESSAGES_QUERY, { conversationId, limit: 100 });
      const loaded = data.conversationMessages ?? [];
      setMessages(loaded);
      if (
        loaded.some(
          (message) =>
            message.senderType !== "superadmin" && !message.isRead,
        )
      ) {
        await superAdminGraphqlRequest(READ_MUTATION, { conversationId });
      }
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === conversationId ? { ...thread, unreadCount: 0 } : thread,
        ),
      );
    } catch (err) {
      if (!silent) {
        toast.error(
          err instanceof Error ? err.message : "Could not load this conversation",
        );
      }
    } finally {
      if (!silent) setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    const kickoff = window.setTimeout(() => void loadThreads(), 0);
    const timer = window.setInterval(() => void loadThreads(true), 5000);
    return () => {
      window.clearTimeout(kickoff);
      window.clearInterval(timer);
    };
  }, [loadThreads]);

  useEffect(() => {
    if (!selectedId) return;
    const kickoff = window.setTimeout(() => void loadMessages(selectedId), 0);
    const timer = window.setInterval(
      () => void loadMessages(selectedId, true),
      3000,
    );
    return () => {
      window.clearTimeout(kickoff);
      window.clearInterval(timer);
    };
  }, [selectedId, loadMessages]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!selected || !content || sending) return;
    const other = peer(selected);
    setSending(true);
    try {
      const data = await superAdminGraphqlRequest<{ sendMessage: SupportMessage }>(
        SEND_MUTATION,
        {
          input: {
            conversationId: selected.id,
            recipientType: other.type.toUpperCase(),
            recipientId: other.id,
            content,
          },
        },
      );
      setMessages((prev) => [...prev, data.sendMessage]);
      setDraft("");
      setThreads((prev) =>
        prev.map((thread) =>
          thread.id === selected.id
            ? {
                ...thread,
                lastMessage: content.slice(0, 100),
                updatedAt: new Date().toISOString(),
              }
            : thread,
        ),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Message could not be sent");
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <AdminPageHeader
        icon={LifeBuoy}
        title="Squl Technical Support"
        description="Conversations with school admins who asked Squl for help. Your replies appear in the school's Messages inbox."
        count={threads.length}
        loading={loading}
        onRefresh={() => {
          void loadThreads();
          if (selectedId) void loadMessages(selectedId);
        }}
      />

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex min-h-[32rem] flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <aside
          className={cn(
            "flex w-full min-w-0 flex-col border-r border-slate-200 dark:border-slate-800 md:w-80 lg:w-96",
            selected && "hidden md:flex",
          )}
        >
          <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search school or admin…"
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>

          {loading && threads.length === 0 ? (
            <div className="flex flex-1 items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading support threads…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <LifeBuoy className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {search ? "No matching conversations" : "No support conversations yet"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                School admins can start one from Messages → New → Squl Technical
                Support.
              </p>
            </div>
          ) : (
            <ul className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
              {filtered.map((thread) => {
                const other = peer(thread);
                return (
                  <li key={thread.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setMessages([]);
                        setSelectedId(thread.id);
                      }}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60",
                        thread.id === selectedId && "bg-primary/[0.07]",
                      )}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Building2 className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {thread.tenantName ?? "School"}
                          </span>
                          <span className="shrink-0 text-[10px] text-slate-400">
                            {formatRelativeTime(thread.updatedAt)}
                          </span>
                        </span>
                        <span className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                          <ShieldCheck className="h-3 w-3" />
                          {other.name}
                        </span>
                        <span className="mt-1 flex items-center justify-between gap-2">
                          <span className="line-clamp-1 text-xs text-slate-500">
                            {thread.lastMessage || "No messages yet"}
                          </span>
                          {thread.unreadCount > 0 ? (
                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-white">
                              {thread.unreadCount}
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <section
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col bg-slate-50/50 dark:bg-slate-950/30",
            !selected && "hidden md:flex",
          )}
        >
          {!selected ? (
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-900">
                <MessageSquare className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Select a support conversation
              </p>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
                You&apos;ll see the school, the admin who started it, and the full
                history.
              </p>
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 md:hidden"
                  onClick={() => setSelectedId(null)}
                  aria-label="Back to support conversations"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {selected.tenantName ?? "School"}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {peer(selected).name} · School admin
                  </p>
                </div>
              </header>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {messagesLoading && messages.length === 0 ? (
                  <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading messages…
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-500">
                    No messages yet. Say hello to the school admin.
                  </div>
                ) : (
                  messages.map((message) => {
                    const mine = message.senderType === "superadmin";
                    return (
                      <div
                        key={message.id}
                        className={cn("flex", mine ? "justify-end" : "justify-start")}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm",
                            mine
                              ? "rounded-br-md bg-primary text-white"
                              : "rounded-bl-md border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <p
                            className={cn(
                              "mt-1 text-right text-[10px]",
                              mine ? "text-white/65" : "text-slate-400",
                            )}
                          >
                            {clock(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-primary/50 dark:border-slate-700 dark:bg-slate-950">
                  <Textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void handleSend();
                      }
                    }}
                    placeholder="Reply to the school admin…"
                    rows={1}
                    className="max-h-32 min-h-8 flex-1 resize-none border-0 bg-transparent px-1 py-1 text-sm shadow-none focus-visible:ring-0"
                  />
                  <Button
                    type="button"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full"
                    disabled={!draft.trim() || sending}
                    onClick={() => void handleSend()}
                    aria-label="Send reply"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="mt-1.5 px-1 text-[10px] text-slate-400">
                  Enter to send · Shift + Enter for a new line
                </p>
              </div>
            </>
          )}
        </section>
      </div>
      </div>
    </DashboardLayout>
  );
}
