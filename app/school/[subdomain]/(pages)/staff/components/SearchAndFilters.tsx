import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  X,
  Filter,
  SortAsc,
  SortDesc,
  ChevronDown
} from "lucide-react";
import { Staff } from '../hooks/useStaff';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortField: string;
  onSortFieldChange: (value: string) => void;
  sortDirection: string;
  onSortDirectionChange: (value: string) => void;
  staff: Staff[];
}

export function SearchAndFilters({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  departmentFilter,
  onDepartmentFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortField,
  onSortFieldChange,
  sortDirection,
  onSortDirectionChange,
  staff
}: SearchAndFiltersProps) {
  // Extract unique roles, departments, and statuses from staff data
  const roles = Array.from(new Set(staff.map(s => s.role).filter(Boolean) as string[]));
  const departments = Array.from(new Set(staff.map(s => s.department).filter(Boolean) as string[]));
  const statuses = Array.from(new Set(staff.map(s => s.status).filter(Boolean) as string[]));
  
  // Sort options
  const sortOptions = [
    { value: 'fullName', label: 'Name' },
    { value: 'role', label: 'Role' },
    { value: 'department', label: 'Department' },
    { value: 'dateOfJoining', label: 'Date Joined' },
  ];
  
  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          type="search"
          placeholder="Search staff..."
          className="pl-9 pr-9"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button 
            className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-700"
            onClick={() => onSearchChange('')}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Role dropdown filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={roleFilter ? "default" : "outline"} 
            className="w-full justify-between"
            size="sm"
          >
            <div className="flex items-center gap-2">
              <Badge className="h-2 w-2 p-0 rounded-full bg-primary" />
              {roleFilter || "Filter by Role"}
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Select Role</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {roleFilter && (
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10"
              onClick={() => onRoleFilterChange('')}
            >
              Clear Selection
            </DropdownMenuItem>
          )}
          {roles.length > 0 ? roles.map(role => (
            <DropdownMenuItem 
              key={role}
              className={roleFilter === role ? "bg-primary/10 font-medium" : ""}
              onClick={() => onRoleFilterChange(roleFilter === role ? '' : role)}
            >
              {role}
              {roleFilter === role && (
                <Badge className="ml-auto h-1.5 w-1.5 p-0 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          )) : (
            <DropdownMenuItem disabled>No roles available</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Department dropdown filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={departmentFilter ? "default" : "outline"} 
            className="w-full justify-between"
            size="sm"
          >
            <div className="flex items-center gap-2">
              <Badge className="h-2 w-2 p-0 rounded-full bg-primary" />
              {departmentFilter || "Filter by Department"}
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Select Department</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {departmentFilter && (
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10"
              onClick={() => onDepartmentFilterChange('')}
            >
              Clear Selection
            </DropdownMenuItem>
          )}
          {departments.length > 0 ? departments.map(department => (
            <DropdownMenuItem 
              key={department}
              className={departmentFilter === department ? "bg-primary/10 font-medium" : ""}
              onClick={() => onDepartmentFilterChange(departmentFilter === department ? '' : department)}
            >
              {department}
              {departmentFilter === department && (
                <Badge className="ml-auto h-1.5 w-1.5 p-0 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          )) : (
            <DropdownMenuItem disabled>No departments available</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status dropdown filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={statusFilter ? "default" : "outline"} 
            className="w-full justify-between"
            size="sm"
          >
            <div className="flex items-center gap-2">
              <Badge className="h-2 w-2 p-0 rounded-full bg-primary" />
              {statusFilter || "Filter by Status"}
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Select Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {statusFilter && (
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10"
              onClick={() => onStatusFilterChange('')}
            >
              Clear Selection
            </DropdownMenuItem>
          )}
          {statuses.length > 0 ? statuses.map(status => (
            <DropdownMenuItem 
              key={status}
              className={statusFilter === status ? "bg-primary/10 font-medium" : ""}
              onClick={() => onStatusFilterChange(statusFilter === status ? '' : status)}
            >
              {status}
              {statusFilter === status && (
                <Badge className="ml-auto h-1.5 w-1.5 p-0 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          )) : (
            <DropdownMenuItem disabled>No status options available</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Sort dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={sortField ? "default" : "outline"} 
            className="w-full justify-between"
            size="sm"
          >
            <div className="flex items-center gap-2">
              {sortDirection === 'asc' ? 
                <SortAsc className="h-4 w-4" /> : 
                <SortDesc className="h-4 w-4" />
              }
              {sortField ? `Sort by ${sortOptions.find(o => o.value === sortField)?.label}` : "Sort by..."}
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="font-medium"
            onClick={() => onSortDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}
          >
            {sortDirection === 'asc' ? (
              <>
                <SortAsc className="h-4 w-4 mr-2" />
                Ascending
              </>
            ) : (
              <>
                <SortDesc className="h-4 w-4 mr-2" />
                Descending
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {sortOptions.map(option => (
            <DropdownMenuItem 
              key={option.value}
              className={sortField === option.value ? "bg-primary/10 font-medium" : ""}
              onClick={() => onSortFieldChange(option.value)}
            >
              {option.label}
              {sortField === option.value && (
                <Badge className="ml-auto h-1.5 w-1.5 p-0 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
