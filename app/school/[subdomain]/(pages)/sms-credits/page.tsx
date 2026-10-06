"use client";

import { SmsCreditsPanel } from "./_components/SmsCreditsPanel";

export default function SmsCreditsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">SMS messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your monthly messages and top-ups. Paying plans include free messages
          every month; buy more whenever you run low.
        </p>
      </div>
      <SmsCreditsPanel />
    </div>
  );
}
