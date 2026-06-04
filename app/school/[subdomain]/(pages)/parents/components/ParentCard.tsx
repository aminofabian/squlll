"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Parent } from "../types";

interface ParentCardProps {
  parent: Parent;
  onSelect: (id: string) => void;
  getRelationshipColor: (relationship: string) => string;
  formatCurrency: (amount: number) => string;
}

export function ParentCard({ 
  parent, 
  onSelect,
  getRelationshipColor,
  formatCurrency 
}: ParentCardProps) {
  return (
    <div
      key={parent.id}
      className="p-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-200 cursor-pointer"
      onClick={() => onSelect(parent.id)}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-3 h-3 rounded-full ${
          parent.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
        }`} />
        <div className="font-mono font-medium text-slate-900 dark:text-slate-100">
          {parent.name}
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs text-slate-600 dark:text-slate-400">
          <Badge className={getRelationshipColor(parent.relationship)} variant="outline">
            {parent.relationship}
          </Badge>
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
          {parent.phone}
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400">
          {parent.students.length} student{parent.students.length !== 1 ? 's' : ''}
        </div>
        {parent.feeStatus && parent.feeStatus.totalOwed > 0 && (
          <div className="text-xs text-red-600 font-mono">
            Owes: {formatCurrency(parent.feeStatus.totalOwed)}
          </div>
        )}
      </div>
    </div>
  );
}
