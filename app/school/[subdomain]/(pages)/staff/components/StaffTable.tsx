"use client";

import React from "react";
import { useAllStaffQuery } from "@/lib/hooks/useAllStaffQuery";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Calendar, Building, AlertCircle, Loader2 } from "lucide-react";
import { 
  getRoleDisplayName, 
  getStatusDisplayName, 
  getRoleColor, 
  getStatusColor,
  StaffMember 
} from "../types";

export function StaffTable() {
  const { staffMembers, isLoading, error, refetch } = useAllStaffQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Loading staff members...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border border-red-300 bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
        <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
        <h3 className="font-mono font-bold text-red-700 mb-2">Error Loading Staff</h3>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <Button 
          variant="outline" 
          className="border-red-300 text-red-700 hover:bg-red-50"
          onClick={() => refetch()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!staffMembers.length) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-primary/20 rounded-lg">
        <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-mono font-medium text-slate-600 dark:text-slate-400 mb-2">
          No staff members found
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-500 font-mono">
          Staff data not available or no staff members have been added yet.
        </p>
      </div>
    );
  }

  return (
    <div className="border-2 border-primary/20 rounded-xl overflow-hidden">
      <Table>
        <TableHeader className="bg-primary/5">
          <TableRow>
            <TableHead className="font-mono font-medium text-primary">Staff Member</TableHead>
            <TableHead className="font-mono font-medium text-primary">Contact</TableHead>
            <TableHead className="font-mono font-medium text-primary">Role</TableHead>
            <TableHead className="font-mono font-medium text-primary">Department</TableHead>
            <TableHead className="font-mono font-medium text-primary">Status</TableHead>
            <TableHead className="font-mono font-medium text-primary">Joining Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-white dark:bg-slate-800">
          {staffMembers.map((staff: StaffMember) => (
            <TableRow 
              key={staff.id} 
              className="hover:bg-primary/5 transition-colors duration-150"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{staff.fullName}</div>
                    <div className="text-xs text-slate-500">{staff.employeeId}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-slate-400" />
                    <span>{staff.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span>{staff.phoneNumber}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getRoleColor(staff.role)}>
                  {getRoleDisplayName(staff.role)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Building className="h-3 w-3 text-slate-400" />
                  <span>{staff.department || 'General'}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusColor(staff.status)}>
                  {getStatusDisplayName(staff.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  <span>{new Date(staff.dateOfJoining).toLocaleDateString()}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
