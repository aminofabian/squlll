"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { feesPlansHref } from "../lib/feesRoutes";

/** @deprecated Use /fees?section=plans */
export default function FeeStructuresPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(feesPlansHref());
  }, [router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center p-8 text-sm text-slate-600">
      Redirecting to school fees…
    </div>
  );
}
