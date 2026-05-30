"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner";
import { User, MoreVertical, X, Check, Trash } from "lucide-react"
import Image from "next/image";
import { teachersPanel, teachersTableHead, teachersTh } from "./teachers-ui";

// Teacher type definition based on GraphQL query
type Teacher = {
  id: string;
  name: string; // maps to fullName in GraphQL
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  image?: string; // Profile image URL
  designation: string; // role title
  department: string;
  subjects: string[]; // derived from subject in GraphQL
  address?: string;
  employeeId: string;
  dateOfBirth?: string;
  photo?: string;
  status: "active" | "on leave" | "former" | "substitute" | "retired"; // derived from isActive
  hasCompletedProfile?: boolean;
  userId?: string;
  performance?: {
    rating: number;
  };
};

interface TeachersTableProps {
  teachers: Teacher[];
  onTeacherSelect: (teacherId: string) => void;
  onTeacherDelete?: (teacherId: string) => void;
}

export function TeachersTable({ teachers, onTeacherSelect, onTeacherDelete }: TeachersTableProps) {
  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null);

  const handleDeleteTeacher = async (teacherId: string, teacherName: string) => {
    if (!onTeacherDelete) return;
    
    const confirmed = window.confirm(`Are you sure you want to delete ${teacherName}? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletingTeacherId(teacherId);
    try {
      await onTeacherDelete(teacherId);
      toast.success(`${teacherName} has been deleted successfully`);
    } catch (error) {
      toast.error(`Failed to delete ${teacherName}`);
      console.error('Delete teacher error:', error);
    } finally {
      setDeletingTeacherId(null);
    }
  };
  if (teachers.length === 0) {
    return (
      <div className={`${teachersPanel} overflow-hidden`}>
      <div className="border-b border-slate-200/80 px-4 py-3 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          All teachers
        </h2>
        <p className="text-xs text-slate-400">No staff match your search</p>
      </div>
      <div className="px-4 py-12 text-center">
          <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            No teachers found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Try adjusting your search or add a new teacher.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${teachersPanel} overflow-hidden`}>
      <div className="border-b border-slate-200/80 px-4 py-3 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          All teachers
        </h2>
        <p className="text-xs text-slate-400">
          {teachers.length} on staff
        </p>
      </div>

      <div className="overflow-x-auto">
        {/* Mobile Card Layout - Small screens only */}
        <div className="grid gap-6 p-4 sm:hidden">
          {teachers.map((teacher, index) => (
            <div 
              key={teacher.id} 
              className="p-5 border border-slate-200/80 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              {/* Teacher Header Section */}
              <div className="flex items-start gap-3 pb-4 border-b border-slate-100 mb-4">
                <div className="flex-1 cursor-pointer" onClick={() => onTeacherSelect(teacher.id)}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {teacher.photo ? (
                        <img 
                          className="h-12 w-12 rounded-full object-cover border-2 border-slate-200/80" 
                          src={teacher.photo} 
                          alt={teacher.name} 
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200/80">
                          <User className="h-6 w-6 text-slate-600" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 break-all">
                        {teacher.name}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 break-words">
                        {teacher.designation.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </div>
                      <div className="mt-2">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
                          {teacher.department}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                {onTeacherDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTeacher(teacher.id, teacher.name);
                    }}
                    disabled={deletingTeacherId === teacher.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              {/* Teacher Details Grid - Two-column layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Left Column */}
                <div className="grid-rows-auto">
                  <h4 className="text-sm uppercase tracking-wide text-slate-600 font-bold border-b-2 border-slate-200/80 pb-3 mb-4">
                    Basic Info
                  </h4>
                  <div className="space-y-4">
                    {/* Row 1 - ID */}
                    <div className="flex justify-between items-center py-2 h-[42px]">
                      <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                        ID
                      </span>
                      <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold">
                        {teacher.employeeId}
                      </span>
                    </div>
                    
                    {/* Row 2 - Email */}
                    {teacher.email && (
                      <div className="flex justify-between items-center py-2 h-[42px]">
                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                          Email
                        </span>
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[180px]">
                          {teacher.email}
                        </span>
                      </div>
                    )}
                    
                    {/* Row 3 - Phone */}
                    {teacher.phoneNumber && (
                      <div className="flex justify-between items-center py-2 h-[42px]">
                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                          Phone
                        </span>
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold">
                          {teacher.phoneNumber}
                        </span>
                      </div>
                    )}
                    
                    {/* Row 4 - Gender */}
                    {teacher.gender && (
                      <div className="flex justify-between items-center py-2 h-[42px]">
                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                          Gender
                        </span>
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold">
                          {typeof teacher.gender === 'string' ? teacher.gender.charAt(0).toUpperCase() + teacher.gender.slice(1).toLowerCase() : ''}
                        </span>
                      </div>
                    )}
                    
                    {/* Row 5 - Status */}
                    <div className="flex justify-between items-center py-2 h-[42px]">
                      <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                        Status
                      </span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          teacher.status === 'active' ? 'bg-green-500' : 
                          teacher.status === 'on leave' ? 'bg-yellow-500' : 
                          teacher.status === 'former' ? 'bg-gray-400' :
                          teacher.status === 'substitute' ? 'bg-blue-500' :
                          'bg-purple-500'
                        }`} />
                        <Badge variant="outline" className={`
                          text-xs ${
                            teacher.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                            teacher.status === 'on leave' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                            teacher.status === 'former' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                            teacher.status === 'substitute' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-purple-50 text-purple-700 border-purple-200'
                          }
                        `}>
                          {teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="grid-rows-auto">
                  <h4 className="text-sm uppercase tracking-wide text-slate-600 font-bold border-b-2 border-slate-200/80 pb-3 mb-4">
                    Additional Info
                  </h4>
                  <div className="space-y-4">
                    {/* Date of Birth */}
                    {teacher.dateOfBirth && (
                      <div className="flex justify-between items-center py-2 h-[42px]">
                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                          Birth Date
                        </span>
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold">
                          {new Date(teacher.dateOfBirth).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    
                    {/* Address - Truncated */}
                    {teacher.address && (
                      <div className="flex justify-between items-center py-2 h-[42px]">
                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                          Address
                        </span>
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[180px]">
                          {teacher.address}
                        </span>
                      </div>
                    )}
                    
                    {/* Profile Status */}
                    {teacher.hasCompletedProfile !== undefined && (
                      <div className="flex justify-between items-center py-2 h-[42px]">
                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                          Profile
                        </span>
                        <Badge variant="outline" className={`
                          text-xs ${
                            teacher.hasCompletedProfile ? 'bg-green-50 text-green-700 border-green-200' : 
                            'bg-orange-50 text-orange-700 border-orange-200'
                          }`
                        }>
                          {teacher.hasCompletedProfile ? 'Complete' : 'Incomplete'}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Rating */}
                    <div className="flex justify-between items-center py-2 h-[42px]">
                      <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                        Rating
                      </span>
                      {teacher.performance?.rating ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, index) => (
                              <div 
                                key={index} 
                                className={`h-2 w-2 rounded-full ${
                                  index < teacher.performance!.rating ? 'bg-yellow-400' : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold">
                            {teacher.performance.rating}/5
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          Not rated
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Subjects Section */}
              <div className="border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium block mb-2">
                  Subjects:
                </span>
                <div className="flex flex-wrap gap-1">
                  {teacher.subjects.map((subject, index) => (
                    <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs break-all">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Medium Device 2-Row Layout - Up to 17 inch screens */}
        <div className="hidden sm:block 2xl:hidden">
          <div className="space-y-6 p-4">
            {teachers.map((teacher, index) => (
              <div 
                key={teacher.id} 
                className="p-5 border border-slate-200/80 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {/* Teacher Header Section */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-4">
                  <div className="flex items-start gap-4 cursor-pointer" onClick={() => onTeacherSelect(teacher.id)}>
                    <div className="flex-shrink-0">
                      {teacher.photo ? (
                        <img 
                          className="h-12 w-12 rounded-full object-cover border-2 border-slate-200/80" 
                          src={teacher.photo} 
                          alt={teacher.name} 
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200/80">
                          <User className="h-6 w-6 text-slate-600" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 break-words">
                        {teacher.name}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 break-words">
                        {teacher.designation.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </div>
                      <div className="mt-2">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
                          {teacher.department}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {onTeacherDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTeacher(teacher.id, teacher.name);
                      }}
                      disabled={deletingTeacherId === teacher.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {/* Teacher Details Grid - Two-column layout */}
                <div className="grid grid-cols-2 gap-6 mb-4">
                  {/* Left Column */}
                  <div className="grid-rows-auto">
                    <h4 className="text-sm uppercase tracking-wide text-slate-600 font-bold border-b-2 border-slate-200/80 pb-3 mb-4">
                      Basic Info
                    </h4>
                    <div className="space-y-4">
                      {/* Row 1 - ID */}
                      <div className="flex justify-between items-center py-2 h-[42px]">
                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                          ID
                        </span>
                        <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold">
                          {teacher.employeeId}
                        </span>
                      </div>
                      
                      {/* Row 2 - Email */}
                      {teacher.email && (
                        <div className="flex justify-between items-center py-2 h-[42px]">
                          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                            Email
                          </span>
                          <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[180px]">
                            {teacher.email}
                          </span>
                        </div>
                      )}
                      
                      {/* Row 3 - Phone */}
                      {teacher.phoneNumber && (
                        <div className="flex justify-between items-center py-2 h-[42px]">
                          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                            Phone
                          </span>
                          <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold">
                            {teacher.phoneNumber}
                          </span>
                        </div>
                      )}
                      
                      {/* Row 4 - Gender */}
                      {teacher.gender && (
                        <div className="flex justify-between items-center py-2 h-[42px]">
                          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                            Gender
                          </span>
                          <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold">
                            {typeof teacher.gender === 'string' ? teacher.gender.charAt(0).toUpperCase() + teacher.gender.slice(1).toLowerCase() : ''}
                          </span>
                        </div>
                      )}
                      
                      {/* Row 5 - Status */}
                      <div className="flex justify-between items-center py-2 h-[42px]">
                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                          Status
                        </span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            teacher.status === 'active' ? 'bg-green-500' : 
                            teacher.status === 'on leave' ? 'bg-yellow-500' : 
                            teacher.status === 'former' ? 'bg-gray-400' :
                            teacher.status === 'substitute' ? 'bg-blue-500' :
                            'bg-purple-500'
                          }`} />
                          <Badge variant="outline" className={`
                            text-xs ${
                              teacher.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                              teacher.status === 'on leave' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                              teacher.status === 'former' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                              teacher.status === 'substitute' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-purple-50 text-purple-700 border-purple-200'
                            }
                          `}>
                            {teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column */}
                  <div className="grid-rows-auto">
                    <h4 className="text-sm uppercase tracking-wide text-slate-600 font-bold border-b-2 border-slate-200/80 pb-3 mb-4">
                      Additional Info
                    </h4>
                    <div className="space-y-4">
                      {/* Date of Birth */}
                      {teacher.dateOfBirth && (
                        <div className="flex justify-between items-center py-2 h-[42px]">
                          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                            Birth Date
                          </span>
                          <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold">
                            {new Date(teacher.dateOfBirth).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                      
                      {/* Address - Truncated */}
                      {teacher.address && (
                        <div className="flex justify-between items-center py-2 h-[42px]">
                          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                            Address
                          </span>
                          <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[180px]">
                            {teacher.address}
                          </span>
                        </div>
                      )}
                      
                      {/* Profile Status */}
                      {teacher.hasCompletedProfile !== undefined && (
                        <div className="flex justify-between items-center py-2 h-[42px]">
                          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                            Profile
                          </span>
                          <Badge variant="outline" className={`
                            text-xs ${
                              teacher.hasCompletedProfile ? 'bg-green-50 text-green-700 border-green-200' : 
                              'bg-orange-50 text-orange-700 border-orange-200'
                            }`
                          }>
                            {teacher.hasCompletedProfile ? 'Complete' : 'Incomplete'}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Rating */}
                      <div className="flex justify-between items-center py-2 h-[42px]">
                        <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">
                          Rating
                        </span>
                        {teacher.performance?.rating ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, index) => (
                                <div 
                                  key={index} 
                                  className={`h-2 w-2 rounded-full ${
                                    index < teacher.performance!.rating ? 'bg-yellow-400' : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold">
                              {teacher.performance.rating}/5
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            Not rated
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Subjects Section */}
                <div className="border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium block mb-2">
                    Subjects:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjects.map((subject, index) => (
                      <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Desktop Table Layout - 17+ inch screens */}
        <div className="hidden 2xl:block">
          <table className="w-full">
            <thead className={teachersTableHead}>
              <tr>
                <th className={`${teachersTh} w-10`}>#</th>
                <th className={teachersTh}>Teacher</th>
                <th className={teachersTh}>Contact</th>
                <th className={teachersTh}>Department</th>
                <th className={teachersTh}>Employee ID</th>
                <th className={teachersTh}>Birth date</th>
                <th className={teachersTh}>Subjects</th>
                <th className={teachersTh}>Rating</th>
                <th className={teachersTh}>Profile</th>
                <th className={teachersTh}>Status</th>
                <th className={teachersTh}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {teachers.map((teacher, index) => (
                <tr 
                  key={teacher.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-center text-xs tabular-nums text-slate-400" onClick={() => onTeacherSelect(teacher.id)}>
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 mr-3">
                        <div className="relative h-10 w-10">
                          {teacher.image ? (
                            <Image 
                              src={teacher.image} 
                              alt={teacher.name} 
                              className="h-10 w-10 rounded-full object-cover border-2 border-slate-200/80" 
                              width={40} 
                              height={40} 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-slate-100 border-2 border-slate-200/80 text-slate-600">
                              <User size={20} />
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold">
                          {teacher.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {teacher.gender && typeof teacher.gender === 'string' ? 
                            teacher.gender.charAt(0).toUpperCase() + teacher.gender.slice(1).toLowerCase() : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-col">
                      <div className="text-slate-700 dark:text-slate-300 truncate max-w-[150px]" title={teacher.email}>
                        {teacher.email || '-'}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {teacher.phoneNumber || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {teacher.department || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {teacher.employeeId || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {teacher.dateOfBirth ? 
                      new Date(teacher.dateOfBirth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : '-'}
                  </td>
                  <td className="px-6 py-4 cursor-pointer" onClick={() => onTeacherSelect(teacher.id)}>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((subject, index) => (
                        <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  {/* Rating Column */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {teacher.performance?.rating ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, index) => (
                            <div 
                              key={index} 
                              className={`h-2 w-2 rounded-full ${
                                index < teacher.performance!.rating ? 'bg-yellow-400' : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold">{teacher.performance.rating}/5</span>
                      </div>
                    ) : (
                      <span className="text-slate-500">Not rated</span>
                    )}
                  </td>
                  {/* Profile Status Column */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {teacher.hasCompletedProfile !== undefined && (
                      <Badge variant="outline" className={`
                        text-xs ${
                          teacher.hasCompletedProfile ? 'bg-green-50 text-green-700 border-green-200' : 
                          'bg-orange-50 text-orange-700 border-orange-200'
                        }`
                      }>
                        {teacher.hasCompletedProfile ? 'Complete' : 'Incomplete'}
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        teacher.status === 'active' ? 'bg-green-500' : 
                        teacher.status === 'on leave' ? 'bg-yellow-500' : 
                        teacher.status === 'former' ? 'bg-gray-400' :
                        teacher.status === 'substitute' ? 'bg-blue-500' :
                        'bg-purple-500'
                      }`} />
                      <Badge variant="outline" className={`
                        text-xs ${
                          teacher.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                          teacher.status === 'on leave' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                          teacher.status === 'former' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                          teacher.status === 'substitute' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-purple-50 text-purple-700 border-purple-200'
                        }
                      `}>
                        {teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {onTeacherDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTeacher(teacher.id, teacher.name);
                        }}
                        disabled={deletingTeacherId === teacher.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
