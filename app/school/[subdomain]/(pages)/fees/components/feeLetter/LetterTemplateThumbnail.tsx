"use client";

import { cn } from "@/lib/utils";
import type { FeeLetterTemplateId } from "../../lib/feeLetter/types";

/** Mini wireframe hint for each letter layout in the picker. */
export function LetterTemplateThumbnail({
  templateId,
  className,
}: {
  templateId: FeeLetterTemplateId;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-slate-200/90 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]",
        className,
      )}
      aria-hidden
    >
      {templateId === "classic" ? <ClassicThumb /> : null}
      {templateId === "modern" ? <ModernThumb /> : null}
      {templateId === "formal" ? <FormalThumb /> : null}
      {templateId === "compact" ? <CompactThumb /> : null}
      {templateId === "banner" ? <BannerThumb /> : null}
      {templateId === "kenya" ? <KenyaThumb /> : null}
    </div>
  );
}

function ClassicThumb() {
  return (
    <>
      <div className="flex items-center justify-center gap-0.5 border-b border-slate-200 bg-slate-50 px-1 py-1">
        <div className="h-2 w-2 rounded-full bg-slate-300" />
        <div className="h-1 flex-1 max-w-[40%] rounded-sm bg-slate-300" />
      </div>
      <div className="space-y-0.5 p-1">
        <div className="mx-auto h-0.5 w-2/3 rounded-sm bg-slate-400" />
        <div className="rounded border border-slate-300">
          <div className="h-1 bg-slate-400" />
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "h-0.5 border-t border-slate-200",
                i % 2 ? "bg-slate-50" : "bg-white",
              )}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function ModernThumb() {
  return (
    <>
      <div className="h-2 bg-gradient-to-r from-slate-800 to-blue-700" />
      <div className="space-y-0.5 p-1">
        <div className="mx-auto h-0.5 w-1/2 rounded-sm bg-slate-500" />
        <div className="overflow-hidden rounded-sm ring-1 ring-slate-200">
          <div className="h-1 bg-slate-800" />
          <div className="grid grid-cols-3 gap-px bg-slate-100">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={cn("h-1", i % 2 ? "bg-slate-50" : "bg-white")}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function FormalThumb() {
  return (
    <div className="absolute inset-1 rounded-sm border border-[#9a7b4f]/50 bg-[#faf7f2] p-0.5">
      <div className="flex h-full flex-col items-center justify-between py-0.5">
        <div className="h-0.5 w-3/4 rounded-sm bg-[#5c1a2e]/70" />
        <div className="w-full rounded-sm border border-[#9a7b4f]/40">
          <div className="h-0.5 bg-[#5c1a2e]/80" />
          <div className="h-2 bg-[#faf7f2]" />
        </div>
        <div className="h-1.5 w-1.5 rounded-full border border-[#9a7b4f]/60" />
      </div>
    </div>
  );
}

function CompactThumb() {
  return (
    <>
      <div className="h-1 bg-slate-800" />
      <div className="grid grid-cols-2 gap-px p-0.5">
        <div className="space-y-px">
          <div className="h-0.5 rounded-sm bg-slate-300" />
          <div className="h-2 rounded-sm border border-slate-200 bg-slate-50" />
        </div>
        <div className="space-y-px">
          <div className="h-0.5 rounded-sm bg-slate-300" />
          <div className="h-2 rounded-sm border border-slate-200" />
        </div>
      </div>
    </>
  );
}

function BannerThumb() {
  return (
    <>
      <div
        className="h-3 bg-gradient-to-br from-emerald-700 via-emerald-600 to-white"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 70%, 0 100%)" }}
      />
      <div className="flex gap-0.5 px-1 pb-1">
        <div className="h-2 flex-1 rounded-sm bg-emerald-100 ring-1 ring-emerald-200/80" />
        <div className="h-2 flex-1 rounded-sm bg-emerald-50 ring-1 ring-emerald-200/60" />
      </div>
    </>
  );
}

function KenyaThumb() {
  return (
    <>
      <div className="flex h-1">
        <div className="flex-1 bg-black" />
        <div className="flex-1 bg-red-700" />
        <div className="flex-1 bg-green-700" />
      </div>
      <div className="flex items-start justify-center gap-0.5 p-1">
        <div className="mt-0.5 h-2 w-2 rounded-full border border-amber-600/70 bg-amber-50" />
        <div className="flex-1 space-y-0.5">
          <div className="h-0.5 rounded-sm bg-slate-500" />
          <div className="rounded-sm border border-green-800/30">
            <div className="h-0.5 bg-green-800" />
            <div className="h-1.5 bg-white" />
          </div>
        </div>
      </div>
    </>
  );
}
