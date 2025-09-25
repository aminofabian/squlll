import React from 'react';
import { Staff, getRoleBadgeColor, getStatusBadgeColor, getDepartmentBadgeColor } from '../hooks/useStaff';
import { Badge } from "@/components/ui/badge";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Clock,
  Award,
  BookOpen,
  Shield,
  Building
} from "lucide-react";

interface StaffDetailProps {
  staffMember: Staff;
}

export function StaffDetail({ staffMember }: StaffDetailProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 border-2 border-primary/20 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-mono font-bold">{staffMember.fullName}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {staffMember.role && (
                  <Badge className={getRoleBadgeColor(staffMember.role)}>
                    {staffMember.role}
                  </Badge>
                )}
                <Badge className={getStatusBadgeColor(staffMember.status)}>
                  {staffMember.status || (staffMember.isActive ? 'Active' : 'Inactive')}
                </Badge>
                {staffMember.department && (
                  <Badge variant="outline" className={getDepartmentBadgeColor(staffMember.department)}>
                    {staffMember.department}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {staffMember.employeeId && (
            <div className="text-right">
              <div className="text-sm text-slate-600">Employee ID</div>
              <div className="text-xl font-mono font-bold">{staffMember.employeeId}</div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
          <h3 className="text-lg font-mono font-bold mb-4">Contact Information</h3>
          <div className="space-y-3">
            {staffMember.phoneNumber && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="font-mono">{staffMember.phoneNumber}</span>
              </div>
            )}
            {staffMember.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="font-mono text-sm">{staffMember.email}</span>
              </div>
            )}
            {staffMember.address && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm">{staffMember.address}</span>
              </div>
            )}
            {staffMember.emergencyContact && (
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium text-slate-600">Emergency Contact</div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-red-500" />
                  <span className="text-sm">{staffMember.emergencyContact}</span>
                  {staffMember.emergencyContactPhone && (
                    <span className="font-mono text-sm">{staffMember.emergencyContactPhone}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
          <h3 className="text-lg font-mono font-bold mb-4">Personal Details</h3>
          <div className="space-y-3">
            {staffMember.nationalId && (
              <div className="grid grid-cols-2">
                <div className="font-medium text-sm">National ID</div>
                <div className="font-mono">{staffMember.nationalId}</div>
              </div>
            )}
            {staffMember.gender && (
              <div className="grid grid-cols-2">
                <div className="font-medium text-sm">Gender</div>
                <div>{staffMember.gender}</div>
              </div>
            )}
            {staffMember.dateOfBirth && (
              <div className="grid grid-cols-2">
                <div className="font-medium text-sm">Date of Birth</div>
                <div className="text-sm">{formatDate(staffMember.dateOfBirth)}</div>
              </div>
            )}
            {staffMember.dateOfJoining && (
              <div className="grid grid-cols-2">
                <div className="font-medium text-sm">Joined</div>
                <div className="text-sm">{formatDate(staffMember.dateOfJoining)}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
        <h3 className="text-lg font-mono font-bold mb-4">Professional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {staffMember.department && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Department</h4>
              </div>
              <p className="text-sm">{staffMember.department}</p>
            </div>
          )}
          {staffMember.supervisor && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Reports To</h4>
              </div>
              <p className="text-sm">{staffMember.supervisor}</p>
            </div>
          )}
          {staffMember.jobDescription && (
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Job Description</h4>
              </div>
              <p className="text-sm">{staffMember.jobDescription}</p>
            </div>
          )}
          {staffMember.qualifications && (
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Qualifications</h4>
              </div>
              <p className="text-sm">{staffMember.qualifications}</p>
            </div>
          )}
          {staffMember.workExperience && (
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Work Experience</h4>
              </div>
              <p className="text-sm">{staffMember.workExperience}</p>
            </div>
          )}
        </div>
      </div>

      {/* Salary Information */}
      {staffMember.salary !== null && (
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
          <h3 className="text-lg font-mono font-bold mb-4">Salary Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
              <div className="text-sm text-slate-600">Monthly Salary</div>
              <div className="text-xl font-mono font-bold">
                KES {staffMember.salary.toLocaleString()}
              </div>
            </div>
            {staffMember.bankName && (
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
                <div className="text-sm text-slate-600">Bank Name</div>
                <div className="text-md font-medium">{staffMember.bankName}</div>
              </div>
            )}
            {staffMember.bankAccount && (
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
                <div className="text-sm text-slate-600">Account Number</div>
                <div className="font-mono">
                  {/* Display only last 4 digits for security */}
                  {'•••• ' + staffMember.bankAccount.slice(-4)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
