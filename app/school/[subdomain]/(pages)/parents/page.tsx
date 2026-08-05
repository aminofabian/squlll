"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Info,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle,
  Loader2,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateParentDrawer } from "./components/CreateParentDrawer";
import { ParentsSearchSidebar } from "./components/ParentsSearchSidebar";
import { ParentDetailView } from "./components/ParentDetailView";
import { ParentsOverviewBar } from "./components/ParentsOverviewBar";
import { ParentsTable } from "./components/ParentsTable";
import { ParentsFilterBar } from "./components/ParentsFilterBar";
import { PendingParentInvitations } from "./components/PendingParentInvitations";
import { ParentsBulkActions } from "./components/ParentsBulkActions";
import { matchesParentFilter, type ParentFilter } from "./utils/parents-utils";
import { isParentProfileIncomplete } from "./utils/mapGraphqlParent";
import { useExactParents } from "./hooks/useExactParents";
import { usePendingParentInvitations } from "./hooks/usePendingParentInvitations";
import { useParentDetail } from "@/lib/hooks/useParentDetail";
import { getTenantInfo } from "@/lib/utils";
import { useDomainRealtime } from "@/lib/realtime/useDomainRealtime";
import {
  parentsIconButton,
  parentsPageContainer,
  parentsSearchChip,
} from "./components/parents-ui";

export default function ParentsPage() {
  const searchParams = useSearchParams();
  const openAddParent = searchParams.get("action") === "add";

  const tenantInfo = getTenantInfo();
  const tenantId = tenantInfo?.tenantId;

  const { parents, loading, error, refetchParents } = useExactParents();
  const {
    pendingInvitations,
    isLoading: invitationsLoading,
    error: invitationsError,
    refetch: refetchInvitations,
  } = usePendingParentInvitations();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [displayedParentsCount, setDisplayedParentsCount] = useState(10);
  const [parentCreated, setParentCreated] = useState(false);
  const [parentFilter, setParentFilter] = useState<ParentFilter>("all");
  const [gradeFilter, setGradeFilter] = useState("all");

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    if (mq.matches) setIsSidebarMinimized(true);
  }, []);

  useDomainRealtime({
    onParentInvitationAccepted: () => {
      void refetchInvitations();
      void refetchParents();
    },
    onInvitationSent: () => {
      void refetchInvitations();
    },
    onInvitationRevoked: () => {
      void refetchInvitations();
    },
  });

  const grades = useMemo(() => {
    const unique = new Set<string>();
    for (const parent of parents) {
      for (const grade of parent.grades) {
        unique.add(grade);
      }
    }
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [parents]);

  const filteredParents = useMemo(() => {
    return parents.filter((parent) => {
      if (!matchesParentFilter(parent, parentFilter)) return false;
      if (
        gradeFilter !== "all" &&
        !parent.students.some((s) => s.grade === gradeFilter)
      ) {
        return false;
      }
      const q = searchTerm.toLowerCase();
      if (!q) return true;
      return (
        parent.name.toLowerCase().includes(q) ||
        parent.email.toLowerCase().includes(q) ||
        parent.phone.includes(q) ||
        parent.occupation.toLowerCase().includes(q) ||
        parent.students.some(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.admissionNumber.toLowerCase().includes(q) ||
            s.grade.toLowerCase().includes(q),
        )
      );
    });
  }, [parents, searchTerm, parentFilter, gradeFilter]);

  const filterCounts = useMemo(
    () => ({
      all: parents.length,
      active: parents.filter((p) => p.status === "active").length,
      needsSetup: parents.filter((p) => p.status === "inactive").length,
      incomplete: parents.filter((p) => isParentProfileIncomplete(p)).length,
    }),
    [parents],
  );

  const selectedParentFromList = useMemo(
    () => parents.find((p) => p.id === selectedParentId) ?? null,
    [parents, selectedParentId],
  );

  const {
    parent: selectedParentDetail,
    loading: detailLoading,
    refetch: refetchParentDetail,
  } = useParentDetail(selectedParentId);

  const selectedParent = selectedParentDetail ?? selectedParentFromList;

  const selectedParentInvitation = useMemo(() => {
    if (!selectedParent?.email) return null;
    const normalized = selectedParent.email.trim().toLowerCase();
    return (
      pendingInvitations.find(
        (inv) => inv.email.trim().toLowerCase() === normalized,
      ) ?? null
    );
  }, [pendingInvitations, selectedParent?.email]);

  const overviewStats = useMemo(() => {
    const active = parents.filter((p) => p.status === "active").length;
    const linkedChildren = parents.reduce(
      (sum, p) => sum + p.studentCount,
      0,
    );
    return { active, linkedChildren };
  }, [parents]);

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    parentFilter !== "all" ||
    gradeFilter !== "all";

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setParentFilter("all");
    setGradeFilter("all");
  }, []);

  const handleParentUpdated = () => {
    void refetchParents();
    void refetchInvitations();
    if (selectedParentId) void refetchParentDetail();
  };

  const handleParentCreated = () => {
    setParentCreated(true);
    void refetchParents();
    void refetchInvitations();
    setTimeout(() => setParentCreated(false), 3000);
  };

  const listSubtitle = selectedParent
    ? `${selectedParent.studentCount} linked child${selectedParent.studentCount !== 1 ? "ren" : ""} · ${selectedParent.status === "active" ? "Active" : "Not activated"}`
    : filteredParents.length !== parents.length
      ? `${filteredParents.length} of ${parents.length} parents · ${pendingInvitations.length} pending invite${pendingInvitations.length !== 1 ? "s" : ""}`
      : `${parents.length} parent${parents.length !== 1 ? "s" : ""} · ${pendingInvitations.length} pending invite${pendingInvitations.length !== 1 ? "s" : ""}`;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f7f5] dark:bg-[#071411]">
      {!isSidebarMinimized ? (
        <button
          type="button"
          aria-label="Close directory"
          className="fixed inset-0 z-40 bg-[#0a1f1a]/20 backdrop-blur-[1px] md:hidden"
          onClick={() => setIsSidebarMinimized(true)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#1a4d42]/12 bg-[#f8fbfa] transition-all duration-300 dark:border-white/10 dark:bg-[#0c1a17]",
          "md:relative md:translate-x-0",
          isSidebarMinimized
            ? "w-14 -translate-x-full md:translate-x-0"
            : "w-72 translate-x-0",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center border-b border-[#1a4d42]/10 px-2 py-2 dark:border-white/10",
            isSidebarMinimized ? "justify-center" : "justify-between gap-2",
          )}
        >
          {!isSidebarMinimized ? (
            <p className="truncate px-1 text-xs font-medium text-[#1a4d42]/55">
              Parents
            </p>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            className={parentsIconButton}
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
          >
            {isSidebarMinimized ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!isSidebarMinimized ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-3 pt-1">
            <ParentsSearchSidebar
              parents={filteredParents}
              totalCount={parents.length}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedParentId={selectedParentId}
              onParentSelect={setSelectedParentId}
              displayedParentsCount={displayedParentsCount}
              onLoadMore={() =>
                setDisplayedParentsCount((prev) => prev + 10)
              }
            />
          </div>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-[#1a4d42]/12 bg-[#f8fbfa]/95 px-3 py-1.5 backdrop-blur-md dark:border-white/10 dark:bg-[#071411]/95 sm:px-4">
          <div className={parentsPageContainer}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                {isSidebarMinimized ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(parentsIconButton, "h-7 w-7 shrink-0 md:hidden")}
                    onClick={() => setIsSidebarMinimized(false)}
                    aria-label="Open directory"
                  >
                    <PanelLeftOpen className="h-4 w-4" />
                  </Button>
                ) : null}
                <div className="min-w-0">
                  <h1 className="truncate font-display text-lg tracking-tight text-[#0a1f1a] dark:text-white">
                    {selectedParent ? selectedParent.name : "Parents"}
                  </h1>
                  <p className="truncate text-[11px] text-[#1a4d42]/50 dark:text-white/45">
                    {listSubtitle}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!selectedParentId ? (
                  <CreateParentDrawer
                    onParentCreated={handleParentCreated}
                    defaultOpen={openAddParent}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className={cn(parentsPageContainer, "space-y-2 p-3 sm:space-y-2.5 sm:p-4")}>
            {!tenantId ? (
              <div className="flex items-center gap-2 border border-amber-300/80 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                <Info className="h-4 w-4 shrink-0" />
                Tenant ID not found. Please log in again.
              </div>
            ) : null}

            {loading && tenantId ? (
              <div className="flex items-center gap-2 text-sm text-[#1a4d42]/55">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading parents…
              </div>
            ) : null}

            {error ? (
              <div className="flex flex-wrap items-center justify-between gap-3 border border-red-300/80 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                <span className="flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0" />
                  Error loading parents: {error}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void refetchParents()}
                  className="h-7 rounded-none border-red-200 text-red-700 hover:bg-red-100"
                >
                  Retry
                </Button>
              </div>
            ) : null}

            {parentCreated ? (
              <div className="flex items-center gap-2 border border-emerald-300/80 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
                <CheckCircle className="h-4 w-4 shrink-0" />
                Parent invitation sent successfully.
              </div>
            ) : null}

            {selectedParent ? (
              <ParentDetailView
                parent={selectedParent}
                pendingInvitation={selectedParentInvitation}
                detailLoading={detailLoading && !!selectedParentId}
                onClose={() => setSelectedParentId(null)}
                onUpdated={handleParentUpdated}
              />
            ) : parents.length === 0 && !loading ? (
              <div className="rounded-none border border-dashed border-[#1a4d42]/20 bg-white px-6 py-14 text-center shadow-[3px_3px_0_0_rgba(10,31,26,0.04)] dark:border-white/15 dark:bg-[#0c1a17]">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-none bg-[#246a59]/10 text-[#246a59]">
                  <Users className="h-5 w-5" />
                </div>
                <h2 className="font-display text-lg tracking-tight text-[#0a1f1a] dark:text-white">
                  No parents yet
                </h2>
                <p className="mx-auto mt-1 max-w-sm text-xs text-[#1a4d42]/55 dark:text-white/45">
                  Invite your first parent to connect them with their
                  children&apos;s school records.
                </p>
                <div className="mt-5 flex justify-center">
                  <CreateParentDrawer
                    onParentCreated={handleParentCreated}
                    defaultOpen={openAddParent}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <ParentsOverviewBar
                  total={parents.length}
                  active={overviewStats.active}
                  pendingInvites={pendingInvitations.length}
                  linkedChildren={overviewStats.linkedChildren}
                  isLoading={loading}
                />

                {!loading && parents.length > 0 ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <ParentsFilterBar
                      filter={parentFilter}
                      onFilterChange={setParentFilter}
                      counts={filterCounts}
                      grades={grades}
                      gradeFilter={gradeFilter}
                      onGradeFilterChange={setGradeFilter}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      {hasActiveFilters ? (
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#1a4d42]/55">
                          {searchTerm ? (
                            <button
                              type="button"
                              onClick={() => setSearchTerm("")}
                              className={parentsSearchChip}
                            >
                              &ldquo;{searchTerm}&rdquo;
                              <X className="h-3 w-3 text-[#1a4d42]/40" />
                            </button>
                          ) : null}
                          {parentFilter !== "all" || gradeFilter !== "all" ? (
                            <button
                              type="button"
                              onClick={clearFilters}
                              className="text-[#1a4d42]/55 underline-offset-2 hover:text-[#0a1f1a] hover:underline"
                            >
                              Clear
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                      <ParentsBulkActions
                        parents={filteredParents}
                        invitations={pendingInvitations}
                        onInvitationsUpdated={() => void refetchInvitations()}
                      />
                    </div>
                  </div>
                ) : null}

                {pendingInvitations.length > 0 || invitationsLoading ? (
                  <section aria-labelledby="pending-invites-heading">
                    <PendingParentInvitations
                      invitations={pendingInvitations}
                      isLoading={invitationsLoading}
                      error={invitationsError}
                      onInvitationRevoked={() => void refetchInvitations()}
                      onInvitationResent={() => void refetchInvitations()}
                    />
                  </section>
                ) : null}

                <ParentsTable
                  parents={filteredParents}
                  onParentSelect={setSelectedParentId}
                  totalCount={parents.length}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
