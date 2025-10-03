"use client";

import React from "react";
import { StudentLedgerDemo } from "../components/StudentLedgerDemo";

export default function StudentLedgerPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Student Ledger
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-mono">
            View comprehensive financial transaction history for students
          </p>
        </div>
        
        <StudentLedgerDemo />
      </div>
    </div>
  );
}
