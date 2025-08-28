"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Mail, 
  Copy, 
  Clock,
  User,
  Key,
  GraduationCap,
  Phone,
  IdCard,
} from "lucide-react";
import { toast } from 'sonner';

interface StudentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentData: {
    user: { id: string; email: string; name: string };
    student: { id: string; admission_number: string; grade: { id: string }; gender: string; phone: string; gradeName: string };
    generatedPassword: string;
  };
  schoolSubdomain?: string;
}

export function StudentSuccessModal({ 
  isOpen, 
  onClose, 
  studentData,
  schoolSubdomain = 'school'
}: StudentSuccessModalProps) {
  
  const copyPasswordToClipboard = () => {
    navigator.clipboard.writeText(studentData.generatedPassword);
    toast.success("Password copied to clipboard!");
  };

  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(studentData.user.email);
    toast.success("Email copied to clipboard!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Student Created Successfully!
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
            {studentData.user.name} has been registered and login credentials have been generated
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Student Details */}
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Student:</span>
                </div>
                <span className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                  {studentData.user.name}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Admission No:</span>
                </div>
                <span className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                  {studentData.student.admission_number}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Grade:</span>
                </div>
                <span className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                  {studentData.student.gradeName}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone:</span>
                </div>
                <span className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                  {studentData.student.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Login Credentials */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
              <Key className="h-4 w-4" />
              Login Credentials
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Email:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                    {studentData.user.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyEmailToClipboard}
                    className="h-6 w-6 p-0 hover:bg-blue-200 dark:hover:bg-blue-700"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Password:</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100 px-2 py-1 rounded font-mono">
                    {studentData.generatedPassword}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyPasswordToClipboard}
                    className="h-6 w-6 p-0 hover:bg-blue-200 dark:hover:bg-blue-700"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-blue-200 dark:border-blue-700">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Portal URL:</span>
                <span className="text-xs font-mono bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100 px-2 py-1 rounded">
                  {schoolSubdomain}.squl.co.ke/student
                </span>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-3">
              Important Notice
            </h3>
            
            <div className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Please share these login credentials with the student or their guardian</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>The student can change their password after first login</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>These credentials are only shown once for security reasons</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button 
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-white"
          >
            Got it!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 