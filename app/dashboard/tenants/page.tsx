"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CreateSchoolDialog } from "@/components/dashboard/superadmin/CreateSchoolDialog";
import { DashboardErrorBanner } from "@/components/dashboard/superadmin/DashboardStatCards";
import {
  AdminPageHeader,
  AdminPagination,
  AdminSearchBar,
  AdminStatGrid,
  AdminTableSkeleton,
} from "@/components/dashboard/superadmin/AdminPageChrome";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTenants } from "@/lib/superadmin/useTenants";
import {
  Building2,
  CalendarDays,
  Circle,
  CreditCard,
  Plus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "ACTIVE";
  return (
    <div className="flex items-center gap-2">
      <Circle
        className={cn(
          "h-2 w-2",
          isActive
            ? "fill-green-500 text-green-500"
            : "fill-slate-400 text-slate-400",
        )}
      />
      <Badge
        variant={isActive ? "default" : "secondary"}
        className="text-[10px] font-semibold uppercase tracking-wide"
      >
        {isActive ? "Active" : "Inactive"}
      </Badge>
    </div>
  );
}

export default function TenantsPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <AdminTableSkeleton />
        </DashboardLayout>
      }
    >
      <TenantsPageContent />
    </Suspense>
  );
}

function TenantsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenants, loading, creating, error, refresh, addTenant } = useTenants();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("create") !== "1") return;
    setCreateOpen(true);
    router.replace("/dashboard/tenants", { scroll: false });
  }, [searchParams, router]);

  const filtered = useMemo(() => {
    if (!searchTerm) return tenants;
    const term = searchTerm.toLowerCase();
    return tenants.filter(
      (tenant) =>
        tenant.name.toLowerCase().includes(term) ||
        tenant.subdomain.toLowerCase().includes(term),
    );
  }, [tenants, searchTerm]);

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const activeCount = tenants.filter((tenant) => tenant.status === "ACTIVE")
    .length;

  const stats = useMemo(
    () => [
      {
        label: "Total schools",
        value: String(tenants.length),
        helper: "Registered on the platform",
        icon: Building2,
        color: "text-blue-600",
        gradient: "from-blue-500/10 to-blue-500/5",
      },
      {
        label: "Active",
        value: String(activeCount),
        helper:
          tenants.length > 0
            ? `${Math.round((activeCount / tenants.length) * 100)}% of all`
            : "—",
        icon: CreditCard,
        color: "text-green-600",
        gradient: "from-green-500/10 to-green-500/5",
      },
      {
        label: "Subdomains",
        value: String(new Set(tenants.map((tenant) => tenant.subdomain)).size),
        helper: "Unique subdomains",
        icon: Users,
        color: "text-violet-600",
        gradient: "from-violet-500/10 to-violet-500/5",
      },
      {
        label: "Inactive",
        value: String(
          tenants.filter((tenant) => tenant.status !== "ACTIVE").length,
        ),
        helper: "Requires attention",
        icon: CalendarDays,
        color: "text-amber-600",
        gradient: "from-amber-500/10 to-amber-500/5",
      },
    ],
    [tenants, activeCount],
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <AdminPageHeader
          icon={Building2}
          title="Schools"
          description="Schools registered on the platform. Add a school manually or let them self-register."
          count={tenants.length}
          loading={loading}
          onRefresh={refresh}
          actions={
            <Button
              size="sm"
              className="h-9 gap-2"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add school
            </Button>
          }
        />

        <AdminStatGrid stats={stats} />

        <AdminSearchBar
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            setPage(1);
          }}
          placeholder="Search by school or subdomain..."
          resultCount={filtered.length}
          loading={loading}
        />

        {error ? (
          <DashboardErrorBanner message={error} onRetry={refresh} />
        ) : null}

        {loading && !error ? <AdminTableSkeleton /> : null}

        {!loading && !error ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    {["School", "Subdomain", "Status", "Created"].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {paginated.map((tenant) => (
                    <tr
                      key={tenant.id}
                      className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10">
                            <span className="text-sm font-bold text-primary">
                              {tenant.name.charAt(0)}
                            </span>
                          </div>
                          <p className="max-w-[240px] truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                            <Link
                              href={`/dashboard/tenants/${tenant.id}`}
                              className="transition-colors hover:text-primary"
                            >
                              {tenant.name}
                            </Link>
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-500">
                        {tenant.subdomain}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={tenant.status} />
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-500">
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <Building2 className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {searchTerm
                    ? "No schools match your search"
                    : "No schools found"}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {searchTerm
                    ? "Try adjusting your search"
                    : "Schools will appear here once they register"}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {!loading && !error && filtered.length > 0 ? (
          <AdminPagination
            page={page}
            perPage={perPage}
            totalItems={filtered.length}
            onPageChange={setPage}
            onPerPageChange={(size) => {
              setPerPage(size);
              setPage(1);
            }}
          />
        ) : null}
      </div>

      <CreateSchoolDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        saving={creating}
        onSubmit={addTenant}
      />
    </DashboardLayout>
  );
}
