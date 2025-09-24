"use client";

import React from "react";
import { Users } from "lucide-react";
import { Parent } from "../types";
import { ParentCard } from "./ParentCard";

interface ParentsGridProps {
  parents: Parent[];
  onSelectParent: (id: string) => void;
  getRelationshipColor: (relationship: string) => string;
  formatCurrency: (amount: number) => string;
}

export function ParentsGrid({ 
  parents, 
  onSelectParent, 
  getRelationshipColor,
  formatCurrency 
}: ParentsGridProps) {
  return (
    <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-mono font-bold text-slate-900 dark:text-slate-100">All Parents</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            Showing {parents.length} parents
          </p>
        </div>
      </div>
      
      {parents.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-mono font-semibold text-slate-700 dark:text-slate-300 mb-2">
            No parents found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Try adjusting your search criteria or add a new parent.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {parents.map((parent) => (
            <ParentCard
              key={parent.id}
              parent={parent}
              onSelect={onSelectParent}
              getRelationshipColor={getRelationshipColor}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      )}
    </div>
  );
}
