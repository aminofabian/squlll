"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  User, 
  Info, 
  CalendarDays, 
  School, 
  BookOpen,
  ChevronDown,
  ChevronRight,
  Download,
  Printer,
  FileText,
  Key,
  Mail,
  Copy,
  RefreshCw,
  Loader2,
  AlertCircle,
  Check,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import SchoolReportCard from './ReportCard';
import { useStudentDetailSummary } from '@/lib/hooks/useStudentDetailSummary';
import { StudentLedger } from './StudentLedger';
import { useStudentLedger } from '@/lib/hooks/use-student-ledger';
import { useStudentCredentials } from '@/lib/hooks/useStudentCredentials';

interface StudentDetailsViewProps {
  studentId: string;
  onClose: () => void;
  schoolConfig?: any;
}

export function StudentDetailsView({ studentId, onClose, schoolConfig }: StudentDetailsViewProps) {
  const { toast } = useToast();
  const [expandedDocuments, setExpandedDocuments] = useState<Record<string, boolean>>({});
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { studentDetail, loading, error, refetch } = useStudentDetailSummary(studentId);
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'classic' | 'compact' | 'uganda-classic'>('modern');
  
  // Password change form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null);
  
  // Student credentials hook
  const { credentials, loading: credentialsLoading, error: credentialsError, fetchCredentials } = useStudentCredentials(studentId);
  
  // Student ledger data
  const { ledgerData, loading: ledgerLoading, error: ledgerError } = useStudentLedger({
    studentId,
    dateRange: {
      startDate: "2024-01-01",
      endDate: "2024-12-31"
    }
  });

  const handleShowCredentials = async () => {
    setShowCredentialsDialog(true);
    if (!credentials) {
      await fetchCredentials();
    }
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset messages
    setPasswordChangeError(null);
    setPasswordChangeSuccess(null);
    
    // Validation
    if (!oldPassword || !newPassword) {
      setPasswordChangeError('Both old and new passwords are required');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordChangeError('New password must be at least 8 characters long');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const mutation = `
        mutation ChangeMyPassword($input: ChangePasswordsInput!) {
          changeMyPassword(changePasswordsInput: $input) {
            success
            message
          }
        }
      `;
      
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          query: mutation,
          variables: {
            input: {
              oldPassword: oldPassword.trim(),
              newPassword: newPassword.trim(),
            },
          },
        }),
      });
      
      // Read response text first (can only be read once)
      const responseText = await response.text();
      
      // Parse response as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        // If response is not JSON, it's a true HTTP error
        toast({
          variant: 'destructive',
          title: 'Server Error',
          description: responseText || `HTTP error! status: ${response.status}`,
        });
        setIsChangingPassword(false);
        return;
      }
      
      // Check for HTTP errors (non-200 status)
      if (!response.ok) {
        // Try to extract error message from GraphQL response or JSON
        let errorMessage = `Server error (${response.status})`;
        
        if (result.errors && result.errors.length > 0) {
          // GraphQL errors in error response - show in toast
          errorMessage = result.errors[0].message || errorMessage;
        } else if (result.message) {
          errorMessage = result.message;
        } else if (result.error) {
          errorMessage = result.error;
        }
        
        toast({
          variant: 'destructive',
          title: 'Server Error',
          description: errorMessage,
        });
        setIsChangingPassword(false);
        return;
      }
      
      // Check for GraphQL errors in successful HTTP response
      if (result.errors && result.errors.length > 0) {
        // Extract the specific error message from the first error
        const errorMessage = result.errors[0].message || 'An error occurred while changing password';
        // GraphQL errors are shown in the dialog, not toast
        setPasswordChangeError(errorMessage);
        setIsChangingPassword(false);
        return;
      }
      
      // Check if the mutation was successful
      if (result.data?.changeMyPassword?.success) {
        setPasswordChangeSuccess(result.data.changeMyPassword.message || 'Password changed successfully');
        // Clear form
        setOldPassword('');
        setNewPassword('');
        setShowOldPassword(false);
        setShowNewPassword(false);
        // Close dialog after 2 seconds
        setTimeout(() => {
          setShowChangePasswordDialog(false);
          setPasswordChangeSuccess(null);
        }, 2000);
      } else {
        // If data exists but success is false, use the message from the response
        const errorMessage = result.data?.changeMyPassword?.message || 'Failed to change password';
        setPasswordChangeError(errorMessage);
      }
    } catch (error: any) {
      console.error('Password change error:', error);
      
      // Check if it's an HTTP error that wasn't caught above
      if (error.message && error.message.includes('HTTP error')) {
        toast({
          variant: 'destructive',
          title: 'Server Error',
          description: error.message,
        });
      } else {
        // Other errors (network, etc.) - show in dialog
        setPasswordChangeError(error.message || 'Failed to change password. Please try again.');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)] mx-auto" />
          <p className="text-sm font-mono text-[var(--color-textSecondary)]">Loading student details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !studentDetail) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-8 w-8 text-[var(--color-error)] mx-auto" />
          <p className="text-sm font-mono text-[var(--color-error)]">{error || 'Student not found'}</p>
          <Button onClick={refetch} variant="outline" size="sm" className="font-mono border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface)]">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const student = studentDetail;

  return (
    <div className="space-y-6">
      {/* Back button and header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={onClose}
          className="flex items-center gap-2 border-[var(--color-border)] text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/40 font-mono"
        >
          ← Back to Students
        </Button>
        <div className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] rounded-xl p-4">
          <div className="inline-block w-fit px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-md mb-2">
            <span className="text-xs font-mono uppercase tracking-wide text-[var(--color-primary)]">
              Student Details
            </span>
          </div>
          <h2 className="text-xl font-mono font-bold tracking-wide text-[var(--color-text)]">
            {student.studentName}
          </h2>
        </div>
      </div>
      
      {/* Student profile header */}
      <div className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Student photo */}
          <div className="flex-shrink-0">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--color-primary)]/20">
              <div className="w-full h-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                <User className="h-12 w-12 text-[var(--color-primary)]" />
              </div>
              
              <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white ${
                student.isActive ? 'bg-[var(--color-success)]' : 'bg-[var(--color-textSecondary)]'
              }`} />
            </div>
          </div>
          
          {/* Student basic info */}
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-mono font-bold tracking-wide text-[var(--color-text)]">{student.studentName}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-[var(--color-textSecondary)] font-mono">
                <div className="flex items-center gap-1">
                  <Info className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                  <span>ID: {student.admissionNumber}</span>
                </div>
                <div className="flex items-center gap-1">
                  <School className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                  <span>{student.gradeLevelName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                  <span>{student.curriculumName}</span>
                </div>
                {student.streamName && (
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                    <span>Stream: {student.streamName}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <Badge className={`font-mono text-xs capitalize border-2 ${
                student.isActive 
                  ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20' 
                  : 'bg-[var(--color-textSecondary)]/10 text-[var(--color-textSecondary)] border-[var(--color-textSecondary)]/20'
              }`}>
                {student.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline" className="capitalize font-mono border-[var(--color-primary)]/20 text-[var(--color-primary)]">
                {student.gender}
              </Badge>
              <Badge variant="outline" className="capitalize font-mono border-[var(--color-primary)]/20 text-[var(--color-primary)]">
                {student.schoolType}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      {/* Student details tabs */}
      <Tabs defaultValue="details">
        <TabsList className="grid grid-cols-6 mb-6 border-2 border-[var(--color-border)] bg-[var(--color-surface)] rounded-xl p-1">
          <TabsTrigger value="details" className="font-mono text-xs data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-white data-[state=active]:shadow-sm">Details</TabsTrigger>
          <TabsTrigger value="attendance" className="font-mono text-xs data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-white data-[state=active]:shadow-sm">Attendance</TabsTrigger>
          <TabsTrigger value="academics" className="font-mono text-xs data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-white data-[state=active]:shadow-sm">Academics</TabsTrigger>
          <TabsTrigger value="fees" className="font-mono text-xs data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-white data-[state=active]:shadow-sm">Fees</TabsTrigger>
          <TabsTrigger value="ledger" className="font-mono text-xs data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-white data-[state=active]:shadow-sm">Ledger</TabsTrigger>
          <TabsTrigger value="documents" className="font-mono text-xs data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-white data-[state=active]:shadow-sm">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] rounded-xl shadow-sm">
            <CardHeader className="border-b-2 border-[var(--color-border)] bg-[var(--color-primary)]/5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="font-mono font-bold tracking-wide text-[var(--color-text)]">Student Information</CardTitle>
                  <CardDescription className="font-mono text-[var(--color-textSecondary)] mt-1">
                    Detailed personal information about {student.studentName}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="default"
                    onClick={handleShowCredentials}
                    className="font-mono border-2 border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/15 hover:border-[var(--color-primary)]/60 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md whitespace-nowrap"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                      <Key className="h-4 w-4 text-[var(--color-primary)]" />
                    </div>
                    <span className="font-semibold">Login Credentials</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => {
                      setShowChangePasswordDialog(true);
                      setPasswordChangeError(null);
                      setPasswordChangeSuccess(null);
                      setOldPassword('');
                      setNewPassword('');
                    }}
                    className="font-mono border-2 border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/15 hover:border-[var(--color-primary)]/60 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md whitespace-nowrap"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                      <Lock className="h-4 w-4 text-[var(--color-primary)]" />
                    </div>
                    <span className="font-semibold">Change Password</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border-2 border-[var(--color-border)] bg-[var(--color-primary)]/5 rounded-xl p-6">
                  <div className="inline-block w-fit px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-md mb-4">
                    <h3 className="text-xs font-mono uppercase tracking-wide text-[var(--color-primary)]">Personal Details</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]/20">
                      <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)]">Full Name</div>
                      <div className="font-mono text-sm text-[var(--color-text)]">{student.studentName}</div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]/20">
                      <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)]">Gender</div>
                      <div className="font-mono text-sm text-[var(--color-text)] capitalize">{student.gender.toLowerCase()}</div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]/20">
                      <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)]">Admission Number</div>
                      <div className="font-mono text-sm text-[var(--color-text)]">{student.admissionNumber}</div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]/20">
                      <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)]">School Type</div>
                      <div className="font-mono text-sm text-[var(--color-text)] capitalize">{student.schoolType}</div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]/20">
                      <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)]">Created At</div>
                      <div className="font-mono text-sm text-[var(--color-text)]">{new Date(student.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)]">Status</div>
                      <div className="font-mono text-sm text-[var(--color-text)] capitalize">{student.isActive ? 'Active' : 'Inactive'}</div>
                    </div>
                  </div>
                </div>
                
                <div className="border-2 border-[var(--color-border)] bg-[var(--color-primary)]/5 rounded-xl p-6">
                  <div className="inline-block w-fit px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-md mb-4">
                    <h3 className="text-xs font-mono uppercase tracking-wide text-[var(--color-primary)]">Contact Information</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]/20">
                      <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)] flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="font-mono text-sm text-[var(--color-text)]">{student.email}</div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 hover:bg-[var(--color-primary)]/10"
                          onClick={() => navigator.clipboard.writeText(student.email)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)]">Phone</div>
                      <div className="font-mono text-sm text-[var(--color-text)]">{student.phone}</div>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-[var(--color-border)] bg-[var(--color-primary)]/5 rounded-xl p-6 md:col-span-2">
                  <div className="inline-block w-fit px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-md mb-4">
                    <h3 className="text-xs font-mono uppercase tracking-wide text-[var(--color-primary)]">Academic Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]/20">
                      <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)]">Grade Level</div>
                      <div className="font-mono text-sm text-[var(--color-text)]">{student.gradeLevelName}</div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]/20">
                      <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)]">Curriculum</div>
                      <div className="font-mono text-sm text-[var(--color-text)]">{student.curriculumName}</div>
                    </div>
                    {student.streamName && (
                      <div className="flex justify-between items-center py-2 border-b border-[var(--color-border)]/20">
                        <div className="font-mono font-medium text-sm text-[var(--color-textSecondary)]">Stream</div>
                        <div className="font-mono text-sm text-[var(--color-text)]">{student.streamName}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="academics">
          <Card className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] rounded-xl shadow-sm">
            <CardHeader className="border-b-2 border-[var(--color-border)] bg-[var(--color-primary)]/5">
              <CardTitle className="font-mono font-bold tracking-wide text-[var(--color-text)]">Academic Performance</CardTitle>
              <CardDescription className="font-mono text-[var(--color-textSecondary)]">
                Academic performance metrics will be available soon
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="border-2 border-[var(--color-border)] bg-[var(--color-primary)]/5 rounded-xl p-6">
                  <div className="inline-block w-fit px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-md mb-4">
                    <h3 className="text-xs font-mono uppercase tracking-wide text-[var(--color-primary)] flex items-center">
                      <BookOpen className="h-3 w-3 mr-2" />
                      Academic Summary
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] rounded-xl p-4">
                      <div className="text-xs font-mono text-[var(--color-textSecondary)] mb-2">Grade Level</div>
                      <div className="text-xl font-mono font-bold text-[var(--color-primary)]">{student.gradeLevelName}</div>
                    </div>
                    <div className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] rounded-xl p-4">
                      <div className="text-xs font-mono text-[var(--color-textSecondary)] mb-2">Curriculum</div>
                      <div className="text-xl font-mono font-bold text-[var(--color-text)]">{student.curriculumName}</div>
                    </div>
                    {student.streamName && (
                      <div className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] rounded-xl p-4">
                        <div className="text-xs font-mono text-[var(--color-textSecondary)] mb-2">Stream</div>
                        <div className="text-xl font-mono font-bold text-[var(--color-text)]">{student.streamName}</div>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 text-center p-8 text-[var(--color-textSecondary)] font-mono text-sm">
                    Academic performance data will be displayed here once exams and assessments are recorded.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attendance">
          <Card className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] rounded-xl shadow-sm">
            <CardHeader className="border-b-2 border-[var(--color-border)] bg-[var(--color-primary)]/5">
              <CardTitle className="font-mono font-bold tracking-wide text-[var(--color-text)]">Attendance Records</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center p-8 text-[var(--color-textSecondary)] font-mono">
                Attendance records will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fees">
          <Card className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] rounded-xl shadow-sm">
            <CardHeader className="border-b-2 border-[var(--color-border)] bg-[var(--color-primary)]/5">
              <CardTitle className="font-mono font-bold tracking-wide text-[var(--color-text)]">Fee Information</CardTitle>
              <CardDescription className="font-mono text-[var(--color-textSecondary)]">
                Complete fee structure and payment status
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {/* Fee Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="border-2 border-[var(--color-border)] bg-[var(--color-primary)]/5 rounded-xl p-4">
                  <div className="text-xs font-mono text-[var(--color-textSecondary)] mb-2">Total Owed</div>
                  <div className="text-2xl font-mono font-bold text-[var(--color-text)]">
                    KSh {student.feeSummary.totalOwed.toLocaleString()}
                  </div>
                </div>
                <div className="border-2 border-[var(--color-success)]/20 bg-[var(--color-success)]/10 rounded-xl p-4">
                  <div className="text-xs font-mono text-[var(--color-textSecondary)] mb-2">Total Paid</div>
                  <div className="text-2xl font-mono font-bold text-[var(--color-success)]">
                    KSh {student.feeSummary.totalPaid.toLocaleString()}
                  </div>
                </div>
                <div className="border-2 border-[var(--color-error)]/20 bg-[var(--color-error)]/10 rounded-xl p-4">
                  <div className="text-xs font-mono text-[var(--color-textSecondary)] mb-2">Balance</div>
                  <div className="text-2xl font-mono font-bold text-[var(--color-error)]">
                    KSh {student.feeSummary.balance.toLocaleString()}
                  </div>
                </div>
                <div className="border-2 border-[var(--color-info)]/20 bg-[var(--color-info)]/10 rounded-xl p-4">
                  <div className="text-xs font-mono text-[var(--color-textSecondary)] mb-2">Fee Items</div>
                  <div className="text-2xl font-mono font-bold text-[var(--color-info)]">
                    {student.feeSummary.numberOfFeeItems}
                  </div>
                </div>
              </div>

              {/* Fee Items Table */}
              <div className="border-2 border-[var(--color-border)] bg-[var(--color-primary)]/5 rounded-xl p-6">
                <div className="inline-block w-fit px-3 py-1 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-md mb-4">
                  <h3 className="text-xs font-mono uppercase tracking-wide text-[var(--color-primary)]">Fee Structure Details</h3>
                </div>
                
                {student.feeSummary.feeItems.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b-2 border-[var(--color-border)]">
                          <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wide text-[var(--color-textSecondary)]">Fee Item</th>
                          <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wide text-[var(--color-textSecondary)]">Amount</th>
                          <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wide text-[var(--color-textSecondary)]">Type</th>
                          <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wide text-[var(--color-textSecondary)]">Structure</th>
                          <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wide text-[var(--color-textSecondary)]">Academic Year</th>
                        </tr>
                      </thead>
                      <tbody>
                        {student.feeSummary.feeItems.map((item) => (
                          <tr key={item.id} className="border-b border-[var(--color-border)]/20 hover:bg-[var(--color-primary)]/5 transition-colors">
                            <td className="py-3 px-4 font-mono text-sm text-[var(--color-text)]">
                              {item.feeBucketName}
                            </td>
                            <td className="py-3 px-4 font-mono text-sm font-bold text-[var(--color-text)]">
                              KSh {item.amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={item.isMandatory ? "default" : "outline"} className="font-mono text-xs">
                                {item.isMandatory ? 'Mandatory' : 'Optional'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 font-mono text-sm text-[var(--color-textSecondary)]">
                              {item.feeStructureName}
                            </td>
                            <td className="py-3 px-4 font-mono text-sm text-[var(--color-textSecondary)]">
                              {item.academicYearName}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-8 text-[var(--color-textSecondary)] font-mono">
                    No fee items found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ledger">
          <StudentLedger 
            ledgerData={ledgerData}
            loading={ledgerLoading}
            error={ledgerError}
          />
        </TabsContent>
        
        <TabsContent value="documents">
          <Card className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] rounded-xl shadow-sm">
            <CardHeader className="border-b-2 border-[var(--color-border)] bg-[var(--color-primary)]/5">
              <CardTitle className="font-mono font-bold tracking-wide text-[var(--color-text)]">Student Documents</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="border border-[var(--color-primary)]/20 rounded-lg overflow-hidden">
                  <button
                    onClick={() => {
                      setExpandedDocuments(prev => ({
                        ...prev,
                        'report-card': !prev['report-card']
                      }));
                    }}
                    className="w-full p-4 bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-[var(--color-primary)]">Academic Report Card</h3>
                        <p className="text-sm text-[var(--color-textSecondary)]">Term 1, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedDocuments['report-card'] ? (
                        <ChevronDown className="w-5 h-5 text-[var(--color-primary)]" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-[var(--color-primary)]" />
                      )}
                    </div>
                  </button>
                  
                  {expandedDocuments['report-card'] && (
                    <div className="p-4 border-t border-[var(--color-primary)]/20 bg-[var(--color-surface)]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[var(--color-text)]">Template:</span>
                            <select
                              value={selectedTemplate}
                              onChange={(e) => setSelectedTemplate(e.target.value as 'modern' | 'classic' | 'compact' | 'uganda-classic')}
                              className="border border-[var(--color-primary)]/30 rounded px-2 py-1 text-sm bg-[var(--color-surface)]"
                            >
                              <option value="modern">Modern</option>
                              <option value="classic">Classic</option>
                              <option value="compact">Compact</option>
                              <option value="uganda-classic">Uganda Classic</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-[var(--color-primary)]/30 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-[var(--color-primary)]/30 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                            >
                              <Printer className="w-4 h-4 mr-2" />
                              Print
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-[var(--color-primary)]/20 rounded-lg overflow-hidden">
                        <SchoolReportCard
                          student={{
                            id: student.id,
                            name: student.studentName,
                            admissionNumber: student.admissionNumber,
                            gender: student.gender,
                            grade: student.gradeLevelName,
                            stream: student.streamName || undefined,
                            user: { email: student.email }
                          }}
                          school={{
                            id: schoolConfig?.id || 'school-id',
                            schoolName: schoolConfig?.tenant?.schoolName || 'School Name',
                            subdomain: schoolConfig?.tenant?.subdomain || 'school'
                          }}
                          subjects={schoolConfig?.selectedLevels?.flatMap((level: any) => level.subjects) || []}
                          term="1"
                          year="2024"
                          template={selectedTemplate}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="border border-[var(--color-primary)]/20 rounded-lg overflow-hidden">
                  <button
                    onClick={() => {
                      setExpandedDocuments(prev => ({
                        ...prev,
                        'other-docs': !prev['other-docs']
                      }));
                    }}
                    className="w-full p-4 bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-[var(--color-primary)]">Other Documents</h3>
                        <p className="text-sm text-[var(--color-textSecondary)]">Additional student documents</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedDocuments['other-docs'] ? (
                        <ChevronDown className="w-5 h-5 text-[var(--color-primary)]" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-[var(--color-primary)]" />
                      )}
                    </div>
                  </button>
                  
                  {expandedDocuments['other-docs'] && (
                    <div className="p-4 border-t border-[var(--color-primary)]/20 bg-[var(--color-surface)]">
                      <div className="text-center p-8 text-[var(--color-textSecondary)]">
                        Additional student documents will appear here
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Credentials Dialog */}
      <Dialog open={showCredentialsDialog} onOpenChange={setShowCredentialsDialog}>
        <DialogContent className="border-2 border-[var(--color-border)] bg-white rounded-xl max-w-lg shadow-xl">
          <DialogHeader className="pb-4 border-b-2 border-gray-200 bg-gray-50/50 rounded-t-xl -mx-6 -mt-6 px-6 pt-6 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center border-2 border-[var(--color-primary)]/20">
                <Key className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <DialogTitle className="font-mono font-bold text-xl tracking-wide text-[var(--color-text)]">
                Student Login Credentials
              </DialogTitle>
            </div>
            <DialogDescription className="font-mono text-sm text-[var(--color-textSecondary)] mt-2">
              Login details for <span className="font-semibold text-[var(--color-text)]">{student.studentName}</span>
            </DialogDescription>
          </DialogHeader>
          
          {credentialsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
              <p className="font-mono text-sm text-[var(--color-textSecondary)]">Loading credentials...</p>
            </div>
          ) : credentialsError ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-16 h-16 rounded-full bg-[var(--color-error)]/10 flex items-center justify-center border-2 border-[var(--color-error)]/20">
                <AlertCircle className="h-8 w-8 text-[var(--color-error)]" />
              </div>
              <p className="font-mono text-sm text-[var(--color-error)] text-center max-w-sm">{credentialsError}</p>
              <Button
                variant="outline"
                size="default"
                onClick={fetchCredentials}
                className="font-mono border-2 border-[var(--color-border)] text-[var(--color-text)] hover:bg-gray-50 hover:border-[var(--color-primary)]/40 transition-all"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : credentials ? (
            <div className="space-y-4 py-6">
              {/* Name Card */}
              <div className="border-2 border-[var(--color-border)] bg-gray-50 rounded-xl p-5 hover:border-[var(--color-primary)]/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-mono font-semibold text-xs text-[var(--color-textSecondary)] uppercase tracking-wider flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    Full Name
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-[var(--color-primary)]/10 rounded-md transition-colors"
                    onClick={() => handleCopy(credentials.name, 'name')}
                  >
                    {copiedField === 'name' ? (
                      <Check className="h-4 w-4 text-[var(--color-success)]" />
                    ) : (
                      <Copy className="h-4 w-4 text-[var(--color-textSecondary)]" />
                    )}
                  </Button>
                </div>
                <div className="font-mono text-base font-semibold text-[var(--color-text)] break-all">{credentials.name}</div>
              </div>

              {/* Email Card */}
              <div className="border-2 border-[var(--color-border)] bg-gray-50 rounded-xl p-5 hover:border-[var(--color-primary)]/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-mono font-semibold text-xs text-[var(--color-textSecondary)] uppercase tracking-wider flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    Email Address
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-[var(--color-primary)]/10 rounded-md transition-colors"
                    onClick={() => handleCopy(credentials.email, 'email')}
                  >
                    {copiedField === 'email' ? (
                      <Check className="h-4 w-4 text-[var(--color-success)]" />
                    ) : (
                      <Copy className="h-4 w-4 text-[var(--color-textSecondary)]" />
                    )}
                  </Button>
                </div>
                <div className="font-mono text-base font-semibold text-[var(--color-text)] break-all">{credentials.email}</div>
              </div>

              {/* Password Card - Highlighted */}
              <div className="border-2 border-[var(--color-primary)]/40 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 shadow-md hover:border-[var(--color-primary)]/60 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-mono font-semibold text-xs text-[var(--color-primary)] uppercase tracking-wider flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[var(--color-primary)]/20 flex items-center justify-center">
                      <Key className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                    </div>
                    Password (Admission Number)
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-[var(--color-primary)]/20 rounded-md transition-colors"
                    onClick={() => handleCopy(credentials.password, 'password')}
                  >
                    {copiedField === 'password' ? (
                      <Check className="h-4 w-4 text-[var(--color-success)]" />
                    ) : (
                      <Copy className="h-4 w-4 text-[var(--color-primary)]" />
                    )}
                  </Button>
                </div>
                <div className="font-mono text-2xl font-bold text-[var(--color-primary)] tracking-wider mb-2 select-all">
                  {credentials.password}
                </div>
                <div className="flex items-start gap-2 mt-3 pt-3 border-t border-[var(--color-primary)]/20">
                  <Info className="h-4 w-4 text-[var(--color-textSecondary)] mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-mono text-[var(--color-textSecondary)] leading-relaxed">
                    This is the student's default login password. The password is their admission number and should be changed on first login.
                  </p>
                </div>
              </div>

              {/* Info Banner */}
              <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs font-mono text-[var(--color-textSecondary)] text-center">
                  <span className="font-semibold text-[var(--color-info)]">Note:</span> Keep these credentials secure and share them only with authorized personnel.
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showChangePasswordDialog} onOpenChange={setShowChangePasswordDialog}>
        <DialogContent className="border-2 border-[var(--color-border)] bg-white rounded-xl max-w-lg shadow-xl">
          <DialogHeader className="pb-4 border-b-2 border-gray-200 bg-gray-50/50 rounded-t-xl -mx-6 -mt-6 px-6 pt-6 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center border-2 border-[var(--color-primary)]/20">
                <Lock className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <DialogTitle className="font-mono font-bold text-xl tracking-wide text-[var(--color-text)]">
                Change Password
              </DialogTitle>
            </div>
            <DialogDescription className="font-mono text-sm text-[var(--color-textSecondary)] mt-2">
              Change your password. All active sessions will be logged out for security.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleChangePassword} className="space-y-4 py-4">
            {/* Error Message */}
            {passwordChangeError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm font-mono text-red-600">{passwordChangeError}</p>
                </div>
              </div>
            )}
            
            {/* Success Message */}
            {passwordChangeSuccess && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-mono text-green-600">{passwordChangeSuccess}</p>
                </div>
              </div>
            )}
            
            {/* Old Password */}
            <div className="space-y-2">
              <Label htmlFor="oldPassword" className="font-mono text-sm font-semibold text-[var(--color-text)]">
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="oldPassword"
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  disabled={isChangingPassword}
                  className="font-mono border-2 border-[var(--color-border)] focus:border-[var(--color-primary)] pr-10"
                  placeholder="Enter your current password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  disabled={isChangingPassword}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-[var(--color-primary)]/10"
                  aria-label={showOldPassword ? "Hide password" : "Show password"}
                >
                  {showOldPassword ? (
                    <EyeOff className="h-4 w-4 text-[var(--color-textSecondary)]" />
                  ) : (
                    <Eye className="h-4 w-4 text-[var(--color-textSecondary)]" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="font-mono text-sm font-semibold text-[var(--color-text)]">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isChangingPassword}
                  className="font-mono border-2 border-[var(--color-border)] focus:border-[var(--color-primary)] pr-10"
                  placeholder="Enter your new password (min. 8 characters)"
                  required
                  minLength={8}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isChangingPassword}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-[var(--color-primary)]/10"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-[var(--color-textSecondary)]" />
                  ) : (
                    <Eye className="h-4 w-4 text-[var(--color-textSecondary)]" />
                  )}
                </Button>
              </div>
              <p className="text-xs font-mono text-[var(--color-textSecondary)]">
                Password must be at least 8 characters long
              </p>
            </div>
            
            {/* Info Banner */}
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs font-mono text-blue-700 leading-relaxed">
                  After changing your password, all active sessions will be logged out and you'll need to sign in again with your new password.
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowChangePasswordDialog(false);
                  setOldPassword('');
                  setNewPassword('');
                  setShowOldPassword(false);
                  setShowNewPassword(false);
                  setPasswordChangeError(null);
                  setPasswordChangeSuccess(null);
                }}
                disabled={isChangingPassword}
                className="font-mono border-2 border-[var(--color-border)] text-[var(--color-text)] hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isChangingPassword || !oldPassword || !newPassword}
                className="font-mono bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Change Password
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
} 