"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  Heart, 
  User, 
  Crown,
  BookOpen,
  Receipt,
  Grid2x2PlusIcon,
  BookKeyIcon,
  GraduationCap as Gradebook
} from "lucide-react";

// Student type definition
type Student = {
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
  feeStatus?: {
    currentBalance: number;
    lastPaymentDate: string;
    lastPaymentAmount: number;
    scholarshipPercentage?: number;
    paymentHistory?: Array<{
      date: string;
      amount: number;
      receiptNumber: string;
      paymentMethod: string;
    }>;
  };
  attendance?: {
    rate: string;
    absentDays: number;
    lateDays: number;
    trend: "improving" | "declining" | "stable";
  };
  healthInfo?: {
    bloodGroup?: string;
    knownConditions?: string[];
    emergencyContact?: string;
    nhifNumber?: string;
  };
  extraCurricular?: {
    clubs?: string[];
    sports?: string[];
    achievements?: string[];
    leadership?: string[];
  };
};

interface StudentCardProps {
  student: Student;
  getStatusColor: (status: string) => string;
  getTrendIcon: (trend: string) => React.ReactNode;
}

export function StudentCard({ 
  student, 
  getStatusColor,
  getTrendIcon
}: StudentCardProps) {
  // Format currency - Kenya uses KES (Kenyan Shilling)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <Card className="overflow-hidden border-l-4 border-l-sky-500">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            {student.photo ? (
              <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden">
                <img src={student.photo} alt={student.name} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
                {student.name.charAt(0)}
              </div>
            )}
            <div>
              <CardTitle className="text-lg font-bold">{student.name}</CardTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-medium">{student.admissionNumber}</span>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-1">
                  {student.gender === "female" ? (
                    <Grid2x2PlusIcon className="h-3.5 w-3.5 text-pink-500" />
                  ) : (
                    <BookKeyIcon className="h-3.5 w-3.5 text-blue-500" />
                  )}
                  <span className="text-xs text-muted-foreground capitalize">{student.gender}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <Badge 
              className={`${getStatusColor(student.status)} px-3 py-0.5 font-medium`}
            >
              <div className="w-1.5 h-1.5 rounded-full mr-1 bg-current inline-block"></div>
              {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
            </Badge>
            <div className="text-xs text-muted-foreground">
              Age: {student.age} years
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 pt-0">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Class</div>
            <div className="flex items-center gap-1.5">
              <Gradebook className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-sm font-medium">{student.class}</span>
              {student.stream && (
                <Badge variant="outline" className="text-xs h-5 font-normal">
                  {student.stream} Stream
                </Badge>
              )}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Admitted</div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-indigo-600" />
              <span className="text-sm">
                {student.admissionDate}
              </span>
            </div>
          </div>
        </div>
        
        {/* Academic Information */}
        <div className="p-3 bg-blue-50/50 rounded mb-3 border border-blue-100">
          <div className="flex justify-between items-start mb-1">
            <h4 className="text-xs font-semibold text-blue-700 flex items-center">
              <BookOpen className="h-3.5 w-3.5 mr-1" />
              Academic Performance
            </h4>
            {student.academicDetails?.averageGrade && (
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 px-3">
                Grade: {student.academicDetails.averageGrade}
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-xs">
            {student.academicDetails?.classRank && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Class Rank:</span>
                <span className="font-medium">{student.academicDetails.classRank}</span>
              </div>
            )}
            
            {student.academicDetails?.streamRank && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Stream Rank:</span>
                <span className="font-medium">{student.academicDetails.streamRank}</span>
              </div>
            )}
            
            {student.academicDetails?.yearRank && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Year Rank:</span>
                <span className="font-medium">{student.academicDetails.yearRank}</span>
              </div>
            )}
            
            {student.academicDetails?.kcpeScore && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">KCPE:</span>
                <span className="font-medium">{student.academicDetails.kcpeScore} marks</span>
              </div>
            )}
            
            {student.academicDetails?.kcsePrediction && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">KCSE Pred.:</span>
                <span className="font-medium">{student.academicDetails.kcsePrediction}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Fee Status */}
        <div className="p-3 bg-yellow-50/50 rounded mb-3 border border-yellow-100">
          <div className="flex justify-between items-start mb-1">
            <h4 className="text-xs font-semibold text-yellow-700 flex items-center">
              <Receipt className="h-3.5 w-3.5 mr-1" />
              Fee Status
            </h4>
            {student.feeStatus?.scholarshipPercentage && (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-3">
                {student.feeStatus.scholarshipPercentage}% Scholarship
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <div className="col-span-2 flex items-center justify-between mb-0.5">
              <span className="text-xs text-muted-foreground">Current Balance:</span>
              <span className={`text-sm font-medium ${student.feeStatus?.currentBalance ? 'text-red-600' : 'text-green-600'}`}>
                {student.feeStatus ? formatCurrency(student.feeStatus.currentBalance) : 'N/A'}
              </span>
            </div>
            
            {student.feeStatus?.lastPaymentDate && (
              <div className="col-span-2 text-xs">
                <span className="text-muted-foreground">Last payment:</span>
                <span className="ml-1">
                  {formatCurrency(student.feeStatus.lastPaymentAmount)} on {' '}
                  {student.feeStatus.lastPaymentDate}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom section with tabs or condensed info */}
        <div className="flex flex-wrap gap-1.5 items-center text-xs">
          {/* Attendance stats */}
          {student.attendance && (
            <div className="flex items-center gap-1 pr-1.5">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Attendance:</span>
              <span className="font-medium flex items-center gap-0.5">
                {student.attendance.rate}
                {student.attendance.trend && getTrendIcon(student.attendance.trend)}
              </span>
            </div>
          )}
          
          {/* Health info (simplified) */}
          {student.healthInfo?.bloodGroup && (
            <div className="flex items-center gap-1 border-l border-gray-200 pl-1.5 pr-1.5">
              <Heart className="h-3 w-3 text-red-500" />
              <span className="text-muted-foreground">Blood:</span>
              <span className="font-medium">{student.healthInfo.bloodGroup}</span>
            </div>
          )}
          
          {/* Guardian info (simplified) */}
          {student.contacts?.primaryGuardian && (
            <div className="flex items-center gap-1 border-l border-gray-200 pl-1.5">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Guardian:</span>
              <span className="font-medium">{student.contacts.primaryGuardian}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 pb-3">
        {/* Extra curricular activities badges */}
        {student.extraCurricular && (
          <div className="w-full">
            {student.extraCurricular.leadership && student.extraCurricular.leadership.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1">
                {student.extraCurricular.leadership.map((role, index) => (
                  <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 text-xs border-purple-200">
                    <Crown className="h-3 w-3 mr-1" />
                    {role}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex flex-wrap gap-1">
              {student.extraCurricular.clubs && student.extraCurricular.clubs.map((club, index) => (
                <Badge key={index} variant="outline" className="text-xs border-gray-200 bg-white">
                  {club}
                </Badge>
              ))}
              
              {student.extraCurricular.sports && student.extraCurricular.sports.map((sport, index) => (
                <Badge key={index} variant="outline" className="bg-green-50 text-green-700 text-xs border-green-200">
                  {sport}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
} 