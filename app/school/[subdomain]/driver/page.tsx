"use client";

import { useParams } from "next/navigation";
import { Bus, Download, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSignout } from "@/lib/hooks/useSignout";

/**
 * Driver landing page (web). Driving is done in the SQUL mobile app, so this
 * page only points drivers there and lets them sign out — it deliberately has
 * no admin content. Reached after sign-in for the DRIVER/CONDUCTOR roles, and
 * as the redirect target for drivers who hit the admin shell directly.
 */

const APP_DOWNLOAD_URL =
  process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL?.trim() ||
  "https://github.com/aminofabian/squlll/releases/download/app-android-latest/squl-app.apk";

function schoolNameFromSubdomain(subdomain: string): string {
  return subdomain
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export default function DriverPortalPage() {
  const params = useParams();
  const subdomain = (params.subdomain as string) ?? "";
  const schoolName = schoolNameFromSubdomain(subdomain);
  const { signOut, isSigningOut } = useSignout();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f7f5] p-4 dark:bg-[#071411]">
      <div className="w-full max-w-md border border-[#1a4d42]/12 bg-white p-6 shadow-[6px_6px_0_0_rgba(10,31,26,0.08)] dark:border-white/10 dark:bg-[#0c1a17]">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#246a59]/30 bg-[#246a59]/10 text-[#246a59]">
            <Bus className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-[#246a59]">
              {schoolName}
            </p>
            <h1 className="font-display text-xl tracking-tight text-[#0a1f1a] dark:text-white">
              Driver portal
            </h1>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-[#1a4d42]/70 dark:text-white/60">
          Driving is done in the SQUL driver app. Sign in there with the same
          email and password to see your trips, board students and share your
          location with the school.
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <Button
            asChild
            className="h-10 rounded-none bg-[#0a1f1a] text-sm text-white shadow-none hover:bg-[#246a59]"
          >
            <a
              href={APP_DOWNLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="h-4 w-4" />
              Download the driver app
            </a>
          </Button>
          <Button
            variant="outline"
            onClick={() => void signOut()}
            disabled={isSigningOut}
            className="h-10 rounded-none border-[#1a4d42]/15 bg-white text-sm text-[#0a1f1a] shadow-none hover:border-[#246a59]/40 hover:bg-[#f8fbfa] dark:border-white/15 dark:bg-[#0c1a17] dark:text-white"
          >
            <LogOut className="h-4 w-4" />
            {isSigningOut ? "Signing out…" : "Sign out"}
          </Button>
        </div>

        <p className="mt-4 flex items-start gap-2 text-xs text-[#1a4d42]/50 dark:text-white/40">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#246a59]" />
          Need help signing in? Ask your school administrator.
        </p>
      </div>
    </div>
  );
}
