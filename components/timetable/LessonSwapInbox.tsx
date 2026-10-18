"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeftRight, Check, Clock, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SwapRequest = {
  id: string;
  swapType: "TEMPORARY" | "PERMANENT";
  status: string;
  effectiveDate: string;
  canRespond: boolean;
  canApprove: boolean;
  lessonA: {
    subjectName: string;
    className: string;
    teacherName: string;
    dayName: string;
    timeLabel: string;
  };
  lessonB: {
    subjectName: string;
    className: string;
    teacherName: string;
    dayName: string;
    timeLabel: string;
  };
};

const QUERY = `
  query MyLessonSwaps {
    myLessonSwapRequests(pendingOnly: true) {
      id swapType status effectiveDate canRespond canApprove
      lessonA { subjectName className teacherName dayName timeLabel }
      lessonB { subjectName className teacherName dayName timeLabel }
    }
  }
`;

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ query, variables }),
  });
  const body = await response.json();
  if (body.errors?.length) throw new Error(body.errors[0].message);
  return body.data as T;
}

export function LessonSwapInbox({ admin = false }: { admin?: boolean }) {
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await gql<{ myLessonSwapRequests: SwapRequest[] }>(QUERY);
      const relevant = admin
        ? data.myLessonSwapRequests.filter((r) => r.status === "PENDING_ADMIN" && r.canApprove)
        : data.myLessonSwapRequests.filter((r) => r.canRespond);
      setRequests(relevant);
    } catch {
      setRequests([]);
    }
  }, [admin]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (request: SwapRequest, accept: boolean) => {
    setBusyId(request.id);
    try {
      if (admin) {
        await gql(
          `mutation Review($input: AdminLessonSwapDecisionInput!) {
            reviewLessonSwap(input: $input) { id status }
          }`,
          { input: { requestId: request.id, approve: accept } },
        );
      } else {
        await gql(
          `mutation Respond($input: RespondLessonSwapInput!) {
            respondLessonSwap(input: $input) { id status }
          }`,
          { input: { requestId: request.id, accept } },
        );
      }
      toast.success(accept ? "Swap accepted" : "Swap declined");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update swap");
    } finally {
      setBusyId(null);
    }
  };

  if (requests.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-[22px] border border-[#c49a52]/25 bg-[#fffdf8] shadow-[0_20px_45px_-38px_rgba(10,38,32,0.5)] dark:border-[#c49a52]/20 dark:bg-[#0c1a17]">
      <div className="flex items-center justify-between gap-3 border-b border-[#1a4d42]/8 px-4 py-3 dark:border-white/8">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0a2620] text-[#d9c49a]">
            <ArrowLeftRight className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-[12px] font-semibold text-[#0a1f1a] dark:text-white">
              {admin ? "Swap approvals" : "Lesson swap requests"}
            </p>
            <p className="text-[10px] text-[#1a4d42]/45 dark:text-white/35">
              {requests.length} waiting for you
            </p>
          </div>
        </div>
      </div>
      <div className="divide-y divide-[#1a4d42]/6 dark:divide-white/8">
        {requests.map((request) => (
          <div key={request.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-[#c49a52]/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#8a6427] dark:text-[#d9c49a]">
                  {request.swapType}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-[#1a4d42]/40 dark:text-white/30">
                  <Clock className="h-3 w-3" />
                  {request.effectiveDate}
                </span>
              </div>
              <p className="mt-1 truncate text-[12px] font-semibold text-[#0a1f1a] dark:text-white">
                {request.lessonA.subjectName}{" "}
                <span className="font-normal text-[#1a4d42]/35">↔</span>{" "}
                {request.lessonB.subjectName}
              </p>
              <p className="mt-0.5 truncate text-[10px] text-[#1a4d42]/45 dark:text-white/35">
                {request.lessonA.teacherName} · {request.lessonA.className} ↔{" "}
                {request.lessonB.teacherName} · {request.lessonB.className}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {busyId === request.id ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#246a59]" />
              ) : (admin || request.canRespond) ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-lg border-[#1a4d42]/12 text-[11px]"
                    onClick={() => void act(request, false)}
                  >
                    <X className="mr-1 h-3 w-3" />
                    Decline
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 rounded-lg bg-[#0a2620] text-[11px] text-white hover:bg-[#246a59]"
                    onClick={() => void act(request, true)}
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Accept
                  </Button>
                </>
              ) : (
                <span className="rounded-full bg-[#1a4d42]/6 px-2 py-1 text-[9px] font-medium text-[#1a4d42]/45 dark:bg-white/5 dark:text-white/35">
                  Awaiting admin
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
