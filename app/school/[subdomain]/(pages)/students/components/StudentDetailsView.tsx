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
  FileText
} from 'lucide-react';
import SchoolReportCard from './ReportCard';

interface Student {
  id: string;
  name: string;
  admissionNumber: string;
  photo?: string;
  gender: "male" | "female";
  class: string;
  stream?: string;
  grade: string;
  age: number;
  admissionDate: string;
  status: "active" | "inactive" | "transferred" | "graduated" | "suspended";
  contacts: {
    primaryGuardian: string;
    guardianPhone: string;
    guardianEmail?: string;
    homeAddress?: string;
  };
  academicDetails?: {
    averageGrade?: string;
    classRank?: number;
    streamRank?: number;
    yearRank?: number;
    kcpeScore?: number;
    kcsePrediction?: string;
  };
}

interface StudentDetailsViewProps {
  student: Student;
  onBack: () => void;
  schoolConfig?: any;
}

export function StudentDetailsView({ student, onBack, schoolConfig }: StudentDetailsViewProps) {
  const [expandedDocuments, setExpandedDocuments] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'classic' | 'compact' | 'uganda-classic'>('modern');

  return (
    <div className="space-y-6">
      {/* Back button and header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center gap-2 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-mono"
        >
          ← Back to Students
        </Button>
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-4">
          <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-2">
            <span className="text-xs font-mono uppercase tracking-wide text-primary">
              Student Details
            </span>
          </div>
          <h2 className="text-xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">
            {student.name}
          </h2>
        </div>
      </div>
      
      {/* Student profile header */}
      <div className="border-2 border-primary/20 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Student photo */}
          <div className="flex-shrink-0">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20">
              {student.photo ? (
                <img 
                  src={student.photo} 
                  alt={student.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
              )}
              
              <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white
                ${student.status === 'active' ? 'bg-green-500' : 
                  student.status === 'inactive' ? 'bg-gray-400' : 
                  student.status === 'suspended' ? 'bg-red-500' : 'bg-yellow-500'}`}
              />
            </div>
          </div>
          
          {/* Student basic info */}
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">{student.name}</h2>
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-600 dark:text-slate-400 font-mono">
                <div className="flex items-center gap-1">
                  <Info className="h-3.5 w-3.5 text-primary" />
                  <span>ID: {student.admissionNumber}</span>
                </div>
                <div className="flex items-center gap-1">
                  <School className="h-3.5 w-3.5 text-primary" />
                  <span>Class: {student.class}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5 text-primary" />
                  <span>Age: {student.age}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <Badge className={`font-mono text-xs capitalize border-2 ${
                student.status === 'active' 
                  ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                  : student.status === 'inactive' 
                    ? 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
                    : student.status === 'suspended' 
                      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800' 
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
              }`}>
                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
              </Badge>
              <Badge variant="outline" className="capitalize font-mono border-primary/20 text-primary">
                {student.gender}
              </Badge>
              <Badge variant="outline" className="capitalize font-mono border-primary/20 text-primary">
                Grade {student.grade}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      {/* Student details tabs */}
      <Tabs defaultValue="details">
        <TabsList className="grid grid-cols-5 mb-6 border-2 border-primary/20 bg-primary/5 rounded-xl p-1">
          <TabsTrigger value="details" className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm">Details</TabsTrigger>
          <TabsTrigger value="attendance" className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm">Attendance</TabsTrigger>
          <TabsTrigger value="academics" className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm">Academics</TabsTrigger>
          <TabsTrigger value="fees" className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm">Fees</TabsTrigger>
          <TabsTrigger value="documents" className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card className="border-2 border-primary/20 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
            <CardHeader className="border-b-2 border-primary/20 bg-primary/5">
              <CardTitle className="font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">Student Information</CardTitle>
              <CardDescription className="font-mono text-slate-600 dark:text-slate-400">
                Detailed personal information about {student.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
                  <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
                    <h3 className="text-xs font-mono uppercase tracking-wide text-primary">Personal Details</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-primary/10">
                      <div className="font-mono font-medium text-sm text-slate-700 dark:text-slate-300">Full Name</div>
                      <div className="font-mono text-sm text-slate-900 dark:text-slate-100">{student.name}</div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-primary/10">
                      <div className="font-mono font-medium text-sm text-slate-700 dark:text-slate-300">Age</div>
                      <div className="font-mono text-sm text-slate-900 dark:text-slate-100">{student.age} years</div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-primary/10">
                      <div className="font-mono font-medium text-sm text-slate-700 dark:text-slate-300">Gender</div>
                      <div className="font-mono text-sm text-slate-900 dark:text-slate-100 capitalize">{student.gender}</div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-primary/10">
                      <div className="font-mono font-medium text-sm text-slate-700 dark:text-slate-300">Admission Number</div>
                      <div className="font-mono text-sm text-slate-900 dark:text-slate-100">{student.admissionNumber}</div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-primary/10">
                      <div className="font-mono font-medium text-sm text-slate-700 dark:text-slate-300">Admission Date</div>
                      <div className="font-mono text-sm text-slate-900 dark:text-slate-100">{student.admissionDate}</div>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <div className="font-mono font-medium text-sm text-slate-700 dark:text-slate-300">Status</div>
                      <div className="font-mono text-sm text-slate-900 dark:text-slate-100 capitalize">{student.status}</div>
                    </div>
                  </div>
                </div>
                
                <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
                  <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
                    <h3 className="text-xs font-mono uppercase tracking-wide text-primary">Contact Information</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-primary/10">
                      <div className="font-mono font-medium text-sm text-slate-700 dark:text-slate-300">Guardian Name</div>
                      <div className="font-mono text-sm text-slate-900 dark:text-slate-100">{student.contacts.primaryGuardian}</div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-primary/10">
                      <div className="font-mono font-medium text-sm text-slate-700 dark:text-slate-300">Guardian Phone</div>
                      <div className="font-mono text-sm text-slate-900 dark:text-slate-100">{student.contacts.guardianPhone}</div>
                    </div>
                    {student.contacts.guardianEmail && (
                      <div className="flex justify-between items-center py-2 border-b border-primary/10">
                        <div className="font-mono font-medium text-sm text-slate-700 dark:text-slate-300">Guardian Email</div>
                        <div className="font-mono text-sm text-slate-900 dark:text-slate-100">{student.contacts.guardianEmail}</div>
                      </div>
                    )}
                    {student.contacts.homeAddress && (
                      <div className="flex justify-between items-center py-2">
                        <div className="font-mono font-medium text-sm text-slate-700 dark:text-slate-300">Address</div>
                        <div className="font-mono text-sm text-slate-900 dark:text-slate-100">{student.contacts.homeAddress}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="academics">
          <Card className="border-2 border-primary/20 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
            <CardHeader className="border-b-2 border-primary/20 bg-primary/5">
              <CardTitle className="font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">Academic Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
                  <div className="inline-block w-fit px-3 py-1 bg-primary/10 border border-primary/20 rounded-md mb-4">
                    <h3 className="text-xs font-mono uppercase tracking-wide text-primary flex items-center">
                      <BookOpen className="h-3 w-3 mr-2" />
                      Current Performance
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="border-2 border-primary/20 bg-white dark:bg-slate-700 rounded-xl p-4">
                      <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mb-2">Average Grade</div>
                      <div className="text-2xl font-mono font-bold text-primary">{student.academicDetails?.averageGrade || 'N/A'}</div>
                    </div>
                    <div className="border-2 border-primary/20 bg-white dark:bg-slate-700 rounded-xl p-4">
                      <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mb-2">Class Rank</div>
                      <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                        {student.academicDetails?.classRank || 'N/A'}
                        <span className="text-xs font-normal ml-1 text-slate-600 dark:text-slate-400">/ {student.academicDetails?.classRank ? '30' : '0'}</span>
                      </div>
                    </div>
                    <div className="border-2 border-primary/20 bg-white dark:bg-slate-700 rounded-xl p-4">
                      <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mb-2">Stream Rank</div>
                      <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                        {student.academicDetails?.streamRank || 'N/A'}
                        <span className="text-xs font-normal ml-1 text-slate-600 dark:text-slate-400">/ {student.academicDetails?.streamRank ? '15' : '0'}</span>
                      </div>
                    </div>
                    <div className="border-2 border-primary/20 bg-white dark:bg-slate-700 rounded-xl p-4">
                      <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mb-2">Year Rank</div>
                      <div className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                        {student.academicDetails?.yearRank || 'N/A'}
                        <span className="text-xs font-normal ml-1 text-slate-600 dark:text-slate-400">/ {student.academicDetails?.yearRank ? '120' : '0'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attendance">
          <Card className="border-2 border-primary/20 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
            <CardHeader className="border-b-2 border-primary/20 bg-primary/5">
              <CardTitle className="font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">Attendance Records</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center p-8 text-slate-600 dark:text-slate-400 font-mono">
                Attendance records will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fees">
          <Card className="border-2 border-primary/20 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
            <CardHeader className="border-b-2 border-primary/20 bg-primary/5">
              <CardTitle className="font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">Fee Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center p-8 text-slate-600 dark:text-slate-400 font-mono">
                Fee payment history will appear here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card className="border-2 border-primary/20 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
            <CardHeader className="border-b-2 border-primary/20 bg-primary/5">
              <CardTitle className="font-mono font-bold tracking-wide text-slate-900 dark:text-slate-100">Student Documents</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="border border-[#246a59]/20 rounded-lg overflow-hidden">
                  <button
                    onClick={() => {
                      const newExpanded = new Set(expandedDocuments);
                      if (newExpanded.has('report-card')) {
                        newExpanded.delete('report-card');
                      } else {
                        newExpanded.add('report-card');
                      }
                      setExpandedDocuments(newExpanded);
                    }}
                    className="w-full p-4 bg-[#246a59]/5 hover:bg-[#246a59]/10 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#246a59] rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-[#246a59]">Academic Report Card</h3>
                        <p className="text-sm text-gray-600">Term 1, 2024</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedDocuments.has('report-card') ? (
                        <ChevronDown className="w-5 h-5 text-[#246a59]" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-[#246a59]" />
                      )}
                    </div>
                  </button>
                  
                  {expandedDocuments.has('report-card') && (
                    <div className="p-4 border-t border-[#246a59]/20 bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Template:</span>
                            <select
                              value={selectedTemplate}
                              onChange={(e) => setSelectedTemplate(e.target.value as 'modern' | 'classic' | 'compact' | 'uganda-classic')}
                              className="border border-[#246a59]/30 rounded px-2 py-1 text-sm bg-white"
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
                              className="border-[#246a59]/30 text-[#246a59] hover:bg-[#246a59]/10"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-[#246a59]/30 text-[#246a59] hover:bg-[#246a59]/10"
                            >
                              <Printer className="w-4 h-4 mr-2" />
                              Print
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-[#246a59]/20 rounded-lg overflow-hidden">
                        <SchoolReportCard
                          student={{
                            id: student.id,
                            name: student.name,
                            admissionNumber: student.admissionNumber,
                            gender: student.gender,
                            grade: student.grade,
                            stream: student.stream,
                            user: { email: student.contacts?.guardianEmail || '' }
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
                
                <div className="border border-[#246a59]/20 rounded-lg overflow-hidden">
                  <button
                    onClick={() => {
                      const newExpanded = new Set(expandedDocuments);
                      if (newExpanded.has('other-docs')) {
                        newExpanded.delete('other-docs');
                      } else {
                        newExpanded.add('other-docs');
                      }
                      setExpandedDocuments(newExpanded);
                    }}
                    className="w-full p-4 bg-[#246a59]/5 hover:bg-[#246a59]/10 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#246a59] rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-[#246a59]">Other Documents</h3>
                        <p className="text-sm text-gray-600">Additional student documents</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedDocuments.has('other-docs') ? (
                        <ChevronDown className="w-5 h-5 text-[#246a59]" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-[#246a59]" />
                      )}
                    </div>
                  </button>
                  
                  {expandedDocuments.has('other-docs') && (
                    <div className="p-4 border-t border-[#246a59]/20 bg-white">
                      <div className="text-center p-8 text-muted-foreground">
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