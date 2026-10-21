"use client"

import React from "react";
import { ArrowLeft } from "lucide-react";
import ExamsMarksComponent from "./ExamsMarksComponent";
import { tp } from "../styles/portal";

interface EnterMarksSectionProps {
  subdomain: string;
  onBack: () => void;
}

export default function EnterMarksSection({ subdomain, onBack }: EnterMarksSectionProps) {
  return (
    <div className={tp.page}>
      <div className={tp.stack}>
        <header className="tp-reveal flex flex-col gap-4">
          <button
            type="button"
            onClick={onBack}
            className="tp-focus inline-flex w-fit items-center gap-1.5 rounded-full text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Home
          </button>
          <div>
            <p className={tp.eyebrow}>Assessment</p>
            <h1 className="mt-2 font-display text-[2.1rem] leading-[1.04] tracking-[-0.015em] text-foreground sm:text-[2.55rem]">
              Enter marks
            </h1>
            <p className={tp.lede}>
              Record exam results and keep an eye on how each class is doing.
            </p>
          </div>
        </header>

        <ExamsMarksComponent subdomain={subdomain} />
      </div>
    </div>
  );
}
