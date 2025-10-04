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
  AlertCircle
} from 'lucide-react';
import SchoolReportCard from './ReportCard';
import { useStudentDetailSummary } from '@/lib/hooks/useStudentDetailSummary';
import { StudentLedger } from './StudentLedger';
import { useStudentLedger } from '@/lib/hooks/use-student-ledger';

interface StudentDetailsViewProps {
  studentId: string;
  onClose: () => void;
  schoolConfig?: any;
}

export function StudentDetailsView({ studentId, onClose, schoolConfig }: StudentDetailsViewProps) {
  const [expandedDocuments, setExpandedDocuments] = useState<Record<string, boolean>>({});
  const { studentDetail, loading, error, refetch } = useStudentDetailSummary(studentId);
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'classic' | 'compact' | 'uganda-classic'>('modern');
  
  // Student ledger data
  const { ledgerData, loading: ledgerLoading, error: ledgerError } = useStudentLedger({
    studentId,
    dateRange: {
      startDate: "2024-01-01",
      endDate: "2024-12-31"
    }
  });

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
              <CardTitle className="font-mono font-bold tracking-wide text-[var(--color-text)]">Student Information</CardTitle>
              <CardDescription className="font-mono text-[var(--color-textSecondary)]">
                Detailed personal information about {student.studentName}
              </CardDescription>
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
    </div>
  );
} 