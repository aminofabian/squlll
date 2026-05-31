"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  isSuperAdminSession,
  SUPER_ADMIN_LOGIN_PATH,
} from "@/lib/superadmin/auth";

export function SuperAdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (isSuperAdminSession()) {
      setAllowed(true);
      return;
    }

    const loginUrl = `${SUPER_ADMIN_LOGIN_PATH}?next=${encodeURIComponent(pathname)}`;
    router.replace(loginUrl);
  }, [pathname, router]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking access...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
