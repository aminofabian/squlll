"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, PanelLeftClose } from "lucide-react";
import { Parent } from "../types";

interface ParentSidebarProps {
  parents: Parent[];
  filteredParents: Parent[];
  searchTerm: string;
  selectedParentId: string | null;
  selectedGradeId: string;
  displayedParentsCount: number;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  onSelectParent: (id: string) => void;
  onLoadMore: () => void;
  onCollapseSidebar: () => void;
  getRelationshipColor: (relationship: string) => string;
  formatCurrency: (amount: number) => string;
}

export function ParentSidebar({
  parents,
  filteredParents,
  searchTerm,
  selectedParentId,
  selectedGradeId,
  displayedParentsCount,
  onSearchChange,
  onClearFilters,
  onSelectParent,
  onLoadMore,
  onCollapseSidebar,
  getRelationshipColor,
  formatCurrency
}: ParentSidebarProps) {
  return (
    <div className="hidden md:flex flex-col w-96 border-r border-primary/20 overflow-y-auto p-6 shrink-0 bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out relative">
      {/* Collapse button positioned at top-right of sidebar */}
      <Button
        variant="outline"
        size="sm"
        onClick={onCollapseSidebar}
        className="absolute top-4 right-4 border-slate-200 bg-white/80 backdrop-blur-sm text-slate-600 hover:bg-white hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all duration-200 z-10"
        title="Hide search sidebar"
      >
        <PanelLeftClose className="h-4 w-4" />
      </Button>
      
      <div className="space-y-6">
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
          <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
            <label className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
              <Search className="h-3 w-3 mr-2" />
              Parent Name
            </label>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-primary" />
            <Input
              type="text"
              placeholder="Search by name, phone, email..."
              className="pl-9 h-12 text-base font-mono bg-white dark:bg-slate-800 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Clear Search Button */}
        {(searchTerm || selectedGradeId !== 'all') && (
          <div className="pt-1">
            <Button 
              variant="outline" 
              onClick={onClearFilters}
              className="w-full border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-mono"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
      
      <div className="mt-8 border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-mono font-bold text-slate-900 dark:text-slate-100">Parents</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Showing {Math.min(displayedParentsCount, filteredParents.length)} of {filteredParents.length} parents
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary border border-primary/20 font-mono">
            {filteredParents.length}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          {filteredParents.length === 0 ? (
            <div className="text-center py-8 text-slate-600 dark:text-slate-400 font-medium">
              No parents match your search criteria
            </div>
          ) : (
            filteredParents.slice(0, displayedParentsCount).map((parent) => (
              <div
                key={parent.id}
                className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  parent.id === selectedParentId 
                    ? 'bg-primary/10 border-primary/40 shadow-md' 
                    : 'bg-white dark:bg-slate-800 border-primary/20 hover:bg-primary/5 hover:border-primary/40 hover:shadow-sm'
                }`}
                onClick={() => onSelectParent(parent.id)}
                title="Click to view parent details"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        parent.status === 'active' ? 'bg-green-500' : 
                        parent.status === 'inactive' ? 'bg-gray-400' : 
                        parent.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'
                      }`} />
                      <div className="font-mono font-medium text-slate-900 dark:text-slate-100">
                        {parent.name}
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-mono mb-1">
                      <Badge className={getRelationshipColor(parent.relationship)} variant="outline">
                        {parent.relationship}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                      {parent.students.length} student{parent.students.length !== 1 ? 's' : ''}
                    </div>
                    {parent.feeStatus && parent.feeStatus.totalOwed > 0 && (
                      <div className="text-xs text-red-600 mt-1 font-mono">
                        Owes: {formatCurrency(parent.feeStatus.totalOwed)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredParents.length > displayedParentsCount && (
          <div className="border-t border-primary/20 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                Showing {displayedParentsCount} of {filteredParents.length} parents
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadMore}
                className="border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-mono text-xs"
              >
                Load More ({Math.min(10, filteredParents.length - displayedParentsCount)})
              </Button>
            </div>
          </div>
        )}
        
        {displayedParentsCount >= filteredParents.length && filteredParents.length > 10 && (
          <div className="border-t border-primary/20 pt-4">
            <div className="flex items-center justify-center">
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                All {filteredParents.length} parents loaded
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
