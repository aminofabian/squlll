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
  parentsControlDivider,
  parentsControlShell,
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
    <div className="flex h-screen overflow-hidden bg-slate-50/80 dark:bg-slate-950">
      {!isSidebarMinimized ? (
        <button
          type="button"
          aria-label="Close directory"
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] md:hidden"
          onClick={() => setIsSidebarMinimized(true)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200/60 bg-slate-50/90 transition-all duration-300 dark:border-slate-800 dark:bg-slate-950",
          "md:relative md:translate-x-0",
          isSidebarMinimized
            ? "w-14 -translate-x-full md:translate-x-0"
            : "w-72 translate-x-0",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center border-b border-slate-200/60 px-2 py-2 dark:border-slate-800",
            isSidebarMinimized ? "justify-center" : "justify-between gap-2",
          )}
        >
          {!isSidebarMinimized ? (
            <p className="truncate px-1 text-xs font-medium text-slate-500">
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
        <header className="shrink-0 border-b border-slate-200/50 bg-slate-50/80 px-4 py-3 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-950/80 sm:px-6">
          <div className={parentsPageContainer}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                {isSidebarMinimized ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(parentsIconButton, "shrink-0 md:hidden")}
                    onClick={() => setIsSidebarMinimized(false)}
                    aria-label="Open directory"
                  >
                    <PanelLeftOpen className="h-4 w-4" />
                  </Button>
                ) : null}
                <div className="min-w-0">
                  <h1 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                    {selectedParent ? selectedParent.name : "Parents & guardians"}
                  </h1>
                  <p className="mt-0.5 text-xs text-slate-400">{listSubtitle}</p>
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
          <div className={cn(parentsPageContainer, "space-y-5 p-4 sm:p-6")}>
            {!tenantId ? (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
                <Info className="h-4 w-4 shrink-0" />
                Tenant ID not found. Please log in again.
              </div>
            ) : null}

            {loading && tenantId ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading parents…
              </div>
            ) : null}

            {error ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200/80 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                <span className="flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0" />
                  Error loading parents: {error}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void refetchParents()}
                  className="h-7 border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-950/50"
                >
                  Retry
                </Button>
              </div>
            ) : null}

            {parentCreated ? (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200/80 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
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
              <div className="rounded-xl border border-dashed border-slate-200/80 bg-white/60 px-6 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <Users className="h-6 w-6 text-slate-400" />
                </div>
                <h2 className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  No parents yet
                </h2>
                <p className="mx-auto mt-1 max-w-sm text-xs text-slate-400">
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
              <div className="space-y-5">
                <ParentsOverviewBar
                  total={parents.length}
                  active={overviewStats.active}
                  pendingInvites={pendingInvitations.length}
                  linkedChildren={overviewStats.linkedChildren}
                  isLoading={loading}
                />

                {!loading && parents.length > 0 ? (
                  <div className={parentsControlShell}>
                    <ParentsFilterBar
                      filter={parentFilter}
                      onFilterChange={setParentFilter}
                      counts={filterCounts}
                      grades={grades}
                      gradeFilter={gradeFilter}
                      onGradeFilterChange={setGradeFilter}
                    />

                    <div
                      className={cn(
                        parentsControlDivider,
                        "flex flex-wrap items-center justify-between gap-2",
                      )}
                    >
                      {hasActiveFilters ? (
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>Filtered results</span>
                          {searchTerm ? (
                            <button
                              type="button"
                              onClick={() => setSearchTerm("")}
                              className={parentsSearchChip}
                            >
                              &ldquo;{searchTerm}&rdquo;
                              <X className="h-3 w-3 text-slate-400" />
                            </button>
                          ) : null}
                          {(parentFilter !== "all" || gradeFilter !== "all") ? (
                            <button
                              type="button"
                              onClick={clearFilters}
                              className="text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline dark:hover:text-slate-300"
                            >
                              Clear filters
                            </button>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Use the directory or filters to narrow the list
                        </span>
                      )}
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
