"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, MapPin, Receipt } from "lucide-react";
import { Parent } from "../types";

interface ParentDetailViewProps {
  parent: Parent;
  formatCurrency: (amount: number) => string;
  getRelationshipColor: (relationship: string) => string;
  getStatusColor: (status: string) => string;
}

export function ParentDetailView({ 
  parent, 
  formatCurrency, 
  getRelationshipColor, 
  getStatusColor
}: ParentDetailViewProps) {
  return (
    <div className="space-y-8">
      {/* Header with Parent Info */}
      <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 border-2 border-primary/20 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-mono font-bold">{parent.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getRelationshipColor(parent.relationship)}>
                  {parent.relationship}
                </Badge>
                <Badge className={getStatusColor(parent.status)}>
                  {parent.status}
                </Badge>
              </div>
            </div>
          </div>
          {parent.feeStatus && (
            <div className="text-right">
              <div className="text-sm text-slate-600">Outstanding Balance</div>
              <div className={`text-2xl font-mono font-bold ${
                parent.feeStatus.totalOwed > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(parent.feeStatus.totalOwed)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
          <h3 className="text-lg font-mono font-bold mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-primary" />
              <span className="font-mono">{parent.phone}</span>
            </div>
            {parent.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="font-mono text-sm">{parent.email}</span>
              </div>
            )}
            {parent.homeAddress && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm">{parent.homeAddress}</span>
              </div>
            )}
            {parent.emergencyContact && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-red-500" />
                <span className="font-mono text-sm">Emergency: {parent.emergencyContact}</span>
              </div>
            )}
          </div>
        </div>

        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
          <h3 className="text-lg font-mono font-bold mb-4">Personal Details</h3>
          <div className="space-y-3">
            {parent.idNumber && (
              <div className="grid grid-cols-2">
                <div className="font-medium text-sm">ID Number</div>
                <div className="font-mono">{parent.idNumber}</div>
              </div>
            )}
            {parent.occupation && (
              <div className="grid grid-cols-2">
                <div className="font-medium text-sm">Occupation</div>
                <div>{parent.occupation}</div>
              </div>
            )}
            {parent.workAddress && (
              <div className="grid grid-cols-2">
                <div className="font-medium text-sm">Work Address</div>
                <div className="text-sm">{parent.workAddress}</div>
              </div>
            )}
            <div className="grid grid-cols-2">
              <div className="font-medium text-sm">Registered</div>
              <div className="text-sm">{new Date(parent.registrationDate).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Students */}
      <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
        <h3 className="text-lg font-mono font-bold mb-4">
          {parent.students[0]?.grade === 'Teacher' ? 'Department' : 'Children'} ({parent.students.length})
        </h3>
        <div className="grid gap-3">
          {parent.students.map(student => (
            <div key={student.id} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono font-medium">{student.name}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    {student.grade === 'Teacher' ? 
                      // Display format for teachers
                      `${student.class}` : 
                      // Display format for regular students
                      `${student.class} • Grade ${student.grade}`
                    }
                  </div>
                </div>
                <div className="text-sm font-mono text-slate-500">
                  {student.admissionNumber}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Communication Preferences */}
      <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
        <h3 className="text-lg font-mono font-bold mb-4">Communication Preferences</h3>
        <div className="flex gap-3">
          {parent.communicationPreferences.sms && <Badge variant="outline">SMS</Badge>}
          {parent.communicationPreferences.email && <Badge variant="outline">Email</Badge>}
          {parent.communicationPreferences.whatsapp && <Badge variant="outline">WhatsApp</Badge>}
        </div>
      </div>

      {/* Fee Information */}
      {parent.feeStatus && (
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
          <h3 className="text-lg font-mono font-bold mb-4">Fee Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
              <div className="text-sm text-slate-600">Total Owed</div>
              <div className={`text-xl font-mono font-bold ${
                parent.feeStatus.totalOwed > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(parent.feeStatus.totalOwed)}
              </div>
            </div>
            {parent.feeStatus.lastPayment && (
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
                <div className="text-sm text-slate-600">Last Payment</div>
                <div className="font-mono">{parent.feeStatus.lastPayment}</div>
              </div>
            )}
            {parent.feeStatus.paymentMethod && (
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
                <div className="text-sm text-slate-600">Payment Method</div>
                <div>{parent.feeStatus.paymentMethod}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
