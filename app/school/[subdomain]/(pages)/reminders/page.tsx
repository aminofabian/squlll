"use client";

import { RemindersPanel } from "./_components/RemindersPanel";

export default function RemindersPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Reminders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Automatically remind parents about opening dates, half-terms, fee due
          dates and meetings — over SMS, email and in-app.
        </p>
      </div>
      <RemindersPanel />
    </div>
  );
}
