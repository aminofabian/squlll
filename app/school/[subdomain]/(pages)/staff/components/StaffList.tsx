import React from 'react';
import { Staff, getRoleBadgeColor, getStatusBadgeColor, getDepartmentBadgeColor } from '../hooks/useStaff';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User, Phone, Mail, Building } from "lucide-react";

interface StaffListProps {
  staff: Staff[];
  onSelectStaff: (id: string) => void;
}

export function StaffList({ staff, onSelectStaff }: StaffListProps) {
  if (staff.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <User className="h-16 w-16 text-gray-300" />
        <p className="mt-4 text-lg font-medium text-gray-500">No staff members found</p>
        <p className="text-sm text-gray-400">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {staff.map((staffMember) => (
        <Card 
          key={staffMember.id} 
          className="cursor-pointer hover:border-primary/60 transition-colors"
          onClick={() => onSelectStaff(staffMember.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-primary/10 border-2 border-primary/20 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{staffMember.fullName}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {staffMember.role && (
                    <Badge className={getRoleBadgeColor(staffMember.role)}>
                      {staffMember.role}
                    </Badge>
                  )}
                  {staffMember.department && (
                    <Badge className={getDepartmentBadgeColor(staffMember.department)} variant="outline">
                      {staffMember.department}
                    </Badge>
                  )}
                  <Badge className={getStatusBadgeColor(staffMember.status)}>
                    {staffMember.status || (staffMember.isActive ? 'Active' : 'Inactive')}
                  </Badge>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  {staffMember.phoneNumber && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{staffMember.phoneNumber}</span>
                    </div>
                  )}
                  {staffMember.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="text-xs">{staffMember.email}</span>
                    </div>
                  )}
                  {staffMember.employeeId && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building className="h-3.5 w-3.5" />
                      <span>ID: {staffMember.employeeId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
