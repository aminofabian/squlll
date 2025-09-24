"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { BarChart3, ChevronDown, ChevronRight, Users, UserCheck, User, Receipt } from "lucide-react";
import { Parent } from "../types";

interface ParentStatisticsProps {
  parents: Parent[];
  showStats: boolean;
  onToggleStats: () => void;
}

export function ParentStatistics({ parents, showStats, onToggleStats }: ParentStatisticsProps) {
  return (
    <div className="mb-8">
      <div className="border-2 border-primary/20 bg-primary/5 rounded-xl overflow-hidden">
        <button
          onClick={onToggleStats}
          className="w-full p-4 flex items-center justify-between hover:bg-primary/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-mono font-semibold text-slate-900 dark:text-slate-100">Parent Statistics</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                View comprehensive parent statistics and metrics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/20 text-primary border border-primary/30 font-mono text-xs">
              {parents.length} Parents
            </Badge>
            {showStats ? (
              <ChevronDown className="w-5 h-5 text-primary" />
            ) : (
              <ChevronRight className="w-5 h-5 text-primary" />
            )}
          </div>
        </button>
        
        {showStats && (
          <div className="border-t-2 border-primary/20 bg-white dark:bg-slate-800 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                      {parents.length}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Total Parents
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                      {parents.filter(p => p.status === 'active').length}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Active Parents
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                      {parents.reduce((total, parent) => total + parent.students.length, 0)}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Total Students
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                      {parents.filter(p => p.feeStatus && p.feeStatus.totalOwed > 0).length}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Fee Defaulters
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
