"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { DeleteTenantsResult } from "./tenantsApi";
import { toggleSelection } from "./toggleSelection";
import type { TenantRecord } from "./types";

type RemoveTenants = (tenantIds: string[]) => Promise<DeleteTenantsResult>;

function reportResult(result: DeleteTenantsResult) {
  if (result.deleted.length === 1) {
    toast.success(`${result.deleted[0].name} was deleted`);
  } else if (result.deleted.length > 1) {
    toast.success(`${result.deleted.length} schools were deleted`);
  }
  for (const failure of result.failed) {
    toast.error(`Could not delete a school: ${failure.message}`);
  }
}

/** Row selection plus the confirm-then-delete flow for the schools table. */
export function useTenantDeletion(removeTenants: RemoveTenants) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<TenantRecord[]>([]);

  const setSelected = useCallback((ids: string[], checked: boolean) => {
    setSelectedIds((current) => toggleSelection(current, ids, checked));
  }, []);

  const cancel = useCallback(() => setPending([]), []);

  const confirm = useCallback(async () => {
    const ids = pending.map((school) => school.id);
    try {
      const result = await removeTenants(ids);
      reportResult(result);
      const deletedIds = result.deleted.map((d) => d.tenantId);
      setSelectedIds((current) => toggleSelection(current, deletedIds, false));
      setPending([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }, [pending, removeTenants]);

  return {
    selectedIds,
    setSelected,
    pending,
    requestDelete: setPending,
    cancel,
    confirm,
  };
}
