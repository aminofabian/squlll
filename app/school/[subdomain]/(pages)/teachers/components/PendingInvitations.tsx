"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Mail,
  Info,
  InfoIcon,
  Loader2,
  RefreshCw,
  X,
  CheckCircle
} from "lucide-react";
import toast from "react-hot-toast";

import { PendingInvitation } from "@/lib/stores/usePendingInvitationsStore";

// Resend invitation response type
type ResendInvitationResponse = {
  email: string;
  fullName: string;
  status: string;
  createdAt: string;
};

interface PendingInvitationsProps {
  invitations: PendingInvitation[];
  isLoading: boolean;
  error: string | null;
  onInvitationResent?: (invitationId: string) => void;
  onInvitationRevoked?: (invitationId: string) => void;
  onTeacherActivated?: (invitationId: string) => void;
}

export function PendingInvitations({ invitations, isLoading, error, onInvitationResent, onInvitationRevoked, onTeacherActivated }: PendingInvitationsProps) {
  const [resendingIds, setResendingIds] = useState<Set<string>>(new Set());
  const [revokingIds, setRevokingIds] = useState<Set<string>>(new Set());
  const [activatingEmails, setActivatingEmails] = useState<Set<string>>(new Set());

  const resendInvitation = async (invitationId: string) => {
    setResendingIds(prev => new Set(prev).add(invitationId));
    
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation ResendInvitation($invitationId: String!) {
              resendTeacherInvitation(invitationId: $invitationId) {
                email
                fullName
                status
                createdAt
              }
            }
          `,
          variables: {
            invitationId
          }
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to resend invitation');
      }

      const resendData: ResendInvitationResponse = result.data.resendTeacherInvitation;
      
      toast.success(`Invitation has been resent to ${resendData.email}`);
      
      // Call the callback if provided
      onInvitationResent?.(invitationId);
      
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to resend invitation');
    } finally {
      setResendingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(invitationId);
        return newSet;
      });
    }
  };

  const revokeInvitation = async (invitationId: string) => {
    setRevokingIds(prev => new Set(prev).add(invitationId));
    
    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation RevokeInvitation($invitationId: String!) {
              revokeInvitation(invitationId: $invitationId) {
                message
              }
            }
          `,
          variables: {
            invitationId
          }
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to revoke invitation');
      }

      const revokeData = result.data.revokeInvitation;
      
      toast.success(revokeData.message || 'Invitation revoked successfully');
      
      // Call the callback if provided
      onInvitationRevoked?.(invitationId);
      
    } catch (error) {
      console.error('Error revoking invitation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to revoke invitation');
    } finally {
      setRevokingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(invitationId);
        return newSet;
      });
    }
  };

  const getTeacherIdByEmail = async (email: string): Promise<string | null> => {
    try {
      // NOTE: We need to query teachers because:
      // 1. The invitation only provides email (not teacherId)
      // 2. The activateTeacher mutation requires teacherId (UUID)
      // 3. We must look up the teacher record to get the ID
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          query: `
            query GetTeachers {
              getTeachers {
                id
                fullName
                firstName
                lastName
                email
                phoneNumber
                gender
                department
                role
                user {
                  id
                  name
                  email
                }
                tenantSubjects {
                  id
                  name
                }
                tenantGradeLevels {
                  id
                  gradeLevel {
                    name
                  }
                }
                tenantStreams {
                  id
                }
                classTeacherAssignments {
                  id
                  gradeLevel {
                    gradeLevel {
                      name
                    }
                  }
                }
                tenant {
                  id
                  name
                }
              }
            }
          `,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to fetch teachers');
      }

      const teachers = result.data?.getTeachers || [];
      
      // Log for debugging
      console.log('Looking for teacher with email:', email);
      console.log('Available teachers:', teachers.map((t: any) => ({
        id: t.id,
        email: t.email,
        userEmail: t.user?.email
      })));
      
      // Try to match by teacher.email first (direct field), then fall back to user.email
      const teacher = teachers.find((t: any) => 
        t.email === email || t.user?.email === email
      );
      
      if (!teacher) {
        // If we can't find by email but there's only one teacher, use it
        // This handles the case where teacher exists but email isn't stored on the record yet
        if (teachers.length === 1) {
          console.log('No email match found, but only one teacher exists. Using that teacher ID:', teachers[0].id);
          return teachers[0].id;
        }
        throw new Error(`Teacher with email ${email} not found. Found ${teachers.length} teacher(s) but none match the email.`);
      }

      // Return the teacher record ID (not user ID) - this is what activateTeacher mutation needs
      const foundTeacherId = teacher.id;
      
      if (!foundTeacherId) {
        console.error('Teacher found but has no ID:', teacher);
        throw new Error('Teacher record found but missing ID field');
      }
      
      console.log('Found teacher ID:', foundTeacherId);
      return foundTeacherId;
    } catch (error) {
      console.error('Error getting teacher ID:', error);
      throw error;
    }
  };

  const activateTeacher = async (invitation: PendingInvitation) => {
    const email = invitation.email;
    setActivatingEmails(prev => new Set(prev).add(email));
    
    try {
      console.log('Activating teacher for invitation:', {
        invitationId: invitation.id,
        email: invitation.email,
        status: invitation.status
      });
      
      // Step 1: Get the teacher ID from email
      // NOTE: The invitation only provides email, not teacherId
      // The activateTeacher mutation requires teacherId (UUID), so we must look it up
      const teacherId = await getTeacherIdByEmail(invitation.email);
      
      // Step 2: Validate teacherId exists and is valid
      if (!teacherId) {
        throw new Error(`Could not find teacher record for ${email}. Please ensure the teacher has accepted the invitation.`);
      }

      if (typeof teacherId !== 'string' || teacherId.trim() === '') {
        console.error('Invalid teacherId:', teacherId);
        throw new Error('Invalid teacher ID format. Received: ' + JSON.stringify(teacherId));
      }
      
      // Basic UUID validation (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(teacherId.trim())) {
        console.warn('Teacher ID does not match UUID format:', teacherId);
        throw new Error(`Invalid teacher ID format: "${teacherId}". Expected UUID format.`);
      }
      
      // Step 3: Ensure teacherId is properly escaped and not empty
      const sanitizedTeacherId = teacherId.trim();
      if (!sanitizedTeacherId) {
        throw new Error('Teacher ID is empty after sanitization');
      }
      
      console.log('Calling activateTeacher mutation with teacherId:', sanitizedTeacherId);
      
      // Use variables format for better security and consistency
      const mutation = `
        mutation ActivateTeacher($input: ActivateTeacherInput!) {
          activateTeacher(input: $input) {
            success
            message
            email
          }
        }
      `;
      
      const variables = {
        input: {
          teacherId: sanitizedTeacherId,
        },
      };
      
      console.log('Mutation variables:', JSON.stringify(variables, null, 2));
      
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          query: mutation,
          variables,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error:', response.status, errorText);
        throw new Error(`Server error (${response.status}). Please try again or contact support.`);
      }

      const result = await response.json();
      
      console.log('ActivateTeacher mutation response:', JSON.stringify(result, null, 2));
      
      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        const error = result.errors[0];
        const errorMessage = error?.extensions?.code === 'INTERNAL_SERVER_ERROR' 
          ? 'Server error while activating teacher. The teacher may already be activated or there may be a system issue. Please try again or contact support.'
          : error?.message || 'Failed to activate teacher';
        throw new Error(errorMessage);
      }

      const activateData = result.data?.activateTeacher;
      
      if (!activateData) {
        console.error('No activateTeacher data in response:', result);
        throw new Error('No data returned from activateTeacher mutation. The server may be experiencing issues.');
      }
      
      if (!activateData.success) {
        console.error('Activation failed:', activateData);
        throw new Error(activateData.message || 'Failed to activate teacher');
      }

      console.log('Teacher activated successfully:', activateData);
      toast.success(activateData.message || `Teacher ${activateData.email} has been activated successfully. Credentials sent via email.`);
      
      // Refresh invitations and teachers list after activation
      if (onTeacherActivated) {
        onTeacherActivated(invitation.id);
      } else if (onInvitationResent) {
        // Fallback to onInvitationResent if onTeacherActivated is not provided
        onInvitationResent(invitation.id);
      }
    } catch (error) {
      console.error('Error activating teacher:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to activate teacher');
    } finally {
      setActivatingEmails(prev => {
        const newSet = new Set(prev);
        newSet.delete(email);
        return newSet;
      });
    }
  };

  return (
    <div className="mb-8">
      <div className="border-2 border-primary/20 bg-primary/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-mono font-bold text-slate-900 dark:text-slate-100">Pending Teacher Invitations</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              {isLoading ? 'Loading...' : `Showing ${invitations.length} pending invitations`}
            </p>
          </div>
          {error && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              Error loading invitations
            </Badge>
          )}
        </div>
        
        {isLoading ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-primary/20 shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm font-mono text-slate-600 dark:text-slate-400">Loading pending invitations...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-red-200 shadow-sm">
            <div className="text-red-500 mb-4">
              <Info className="h-10 w-10 mx-auto" />
            </div>
            <h3 className="text-lg font-mono font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Error loading invitations
            </h3>
            <p className="text-sm font-mono text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-primary/20 shadow-sm">
            <Mail className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-mono font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No pending invitations
            </h3>
            <p className="text-sm font-mono text-slate-500 dark:text-slate-400">
              All teacher invitations have been processed.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-primary/20 shadow-sm overflow-hidden">
            {/* Mobile Card Layout - Small screens only */}
            <div className="grid gap-6 p-4 sm:hidden">
              {invitations.map((invitation, index) => (
                <div key={invitation.id} className="p-5 border-2 border-primary/10 rounded-xl space-y-3 bg-white dark:bg-slate-800 shadow-sm hover:bg-primary/5 transition-colors relative">                
                  {/* Invitation Number Badge */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                    <span className="font-mono text-xs font-bold">{index + 1}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="text-sm font-mono font-medium text-slate-900 dark:text-slate-100 break-all">
                        {invitation.email}
                      </span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
                      {invitation.role}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        invitation.status === 'PENDING' ? 'bg-yellow-500' : 
                        invitation.status === 'ACCEPTED' ? 'bg-green-500' : 
                        invitation.status === 'REJECTED' ? 'bg-red-500' : 'bg-gray-400'
                      }`} />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className={`
                                text-xs ${
                                  invitation.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                  invitation.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border-green-200' : 
                                  invitation.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 
                                  'bg-gray-50 text-gray-700 border-gray-200'
                                }
                              `}>
                                {invitation.status}
                              </Badge>
                              <InfoIcon className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-xs">
                              {invitation.status === 'PENDING' ? 
                                'This invitation is awaiting the teacher to accept and create their account.' : 
                                invitation.status === 'ACCEPTED' ? 
                                'The teacher has accepted this invitation and created an account.' : 
                                invitation.status === 'REJECTED' ? 
                                'This invitation has been rejected by the teacher.' : 
                                'Status unknown.'}
                              {invitation.expiresAt && (
                                <>
                                  <br/>
                                  {new Date(invitation.expiresAt) < new Date() ? 
                                    'This invitation has expired and can no longer be used.' : 
                                    `Expires on ${new Date(invitation.expiresAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}`}
                                </>
                              )}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    {invitation.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resendInvitation(invitation.id)}
                          disabled={resendingIds.has(invitation.id)}
                          className="flex items-center gap-2 text-xs bg-white dark:bg-slate-800 hover:bg-primary/5 shadow-sm"
                        >
                          {resendingIds.has(invitation.id) ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                          {resendingIds.has(invitation.id) ? 'Sending...' : 'Resend'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeInvitation(invitation.id)}
                          disabled={revokingIds.has(invitation.id)}
                          className="flex items-center gap-2 text-xs bg-white dark:bg-slate-800 hover:bg-red-50 hover:border-red-200 hover:text-red-700 shadow-sm"
                        >
                          {revokingIds.has(invitation.id) ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          {revokingIds.has(invitation.id) ? 'Revoking...' : 'Revoke'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => activateTeacher(invitation)}
                          disabled={activatingEmails.has(invitation.email)}
                          className="flex items-center gap-2 text-xs bg-white dark:bg-slate-800 hover:bg-green-50 hover:border-green-200 hover:text-green-700 shadow-sm"
                        >
                          {activatingEmails.has(invitation.email) ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          {activatingEmails.has(invitation.email) ? 'Activating...' : 'Activate'}
                        </Button>
                      </div>
                    )}
                    {invitation.status === 'ACCEPTED' && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => activateTeacher(invitation)}
                          disabled={activatingEmails.has(invitation.email)}
                          className="flex items-center gap-2 text-xs bg-white dark:bg-slate-800 hover:bg-green-50 hover:border-green-200 hover:text-green-700 shadow-sm"
                        >
                          {activatingEmails.has(invitation.email) ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          {activatingEmails.has(invitation.email) ? 'Activating...' : 'Activate'}
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs font-mono text-slate-500 space-y-1">
                    <div>
                      <span className="font-medium">Invited by:</span>{' '}
                      {invitation.invitedBy ? (
                        <span>{invitation.invitedBy.name} ({invitation.invitedBy.email})</span>
                      ) : (
                        <span>System</span>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>{' '}
                      {new Date(invitation.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    {invitation.expiresAt && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Expires:</span>{' '}
                        <span className={`
                          ${new Date(invitation.expiresAt) < new Date() ? 'text-red-600 font-medium' : 
                           new Date(invitation.expiresAt) < new Date(Date.now() + 24 * 60 * 60 * 1000) ? 'text-orange-600 font-medium' : 
                           ''}
                        `}>
                          {new Date(invitation.expiresAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        {new Date(invitation.expiresAt) < new Date() && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                            Expired
                          </Badge>
                        )}
                        {new Date(invitation.expiresAt) < new Date(Date.now() + 24 * 60 * 60 * 1000) && 
                          new Date(invitation.expiresAt) > new Date() && (
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                              Soon
                            </Badge>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Medium Device 2-Row Layout - Up to 17 inch screens */}
            <div className="hidden sm:block 2xl:hidden">
              <div className="space-y-6 p-4">
                {invitations.map((invitation, index) => (
                  <div
                    key={invitation.id}
                    className="p-5 border-2 border-primary/10 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:bg-primary/5 transition-colors relative"
                  >                
                    {/* Invitation Number Badge */}
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                      <span className="font-mono text-xs font-bold">{index + 1}</span>
                    </div>
                    
                    {/* First Row */}
                    <div className="grid grid-cols-12 gap-4 mb-4">
                      <div className="col-span-6 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-mono font-medium text-slate-900 dark:text-slate-100 break-all">
                          {invitation.email}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
                          {invitation.role}
                        </Badge>
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          invitation.status === 'PENDING' ? 'bg-yellow-500' : 
                          invitation.status === 'ACCEPTED' ? 'bg-green-500' : 
                          invitation.status === 'REJECTED' ? 'bg-red-500' : 'bg-gray-400'
                        }`} />
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className={`
                                  text-xs ${
                                    invitation.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                    invitation.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border-green-200' : 
                                    invitation.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 
                                    'bg-gray-50 text-gray-700 border-gray-200'
                                  }
                                `}>
                                  {invitation.status}
                                </Badge>
                                <InfoIcon className="h-3.5 w-3.5 text-slate-400" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="text-xs">
                                {invitation.status === 'PENDING' ? 
                                  'This invitation is awaiting the teacher to accept and create their account.' : 
                                  invitation.status === 'ACCEPTED' ? 
                                  'The teacher has accepted this invitation and created an account.' : 
                                  invitation.status === 'REJECTED' ? 
                                  'This invitation has been rejected by the teacher.' : 
                                  'Status unknown.'}
                                {invitation.expiresAt && (
                                  <>
                                    <br/>
                                    {new Date(invitation.expiresAt) < new Date() ? 
                                      'This invitation has expired and can no longer be used.' : 
                                      `Expires on ${new Date(invitation.expiresAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}`}
                                  </>
                                )}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="col-span-2 flex justify-end gap-2">
                        {invitation.status === 'PENDING' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resendInvitation(invitation.id)}
                              disabled={resendingIds.has(invitation.id)}
                              className="flex items-center gap-2 text-xs bg-white dark:bg-slate-800 hover:bg-primary/5 shadow-sm"
                            >
                              {resendingIds.has(invitation.id) ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <RefreshCw className="h-3 w-3" />
                              )}
                              {resendingIds.has(invitation.id) ? 'Sending...' : 'Resend'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => revokeInvitation(invitation.id)}
                              disabled={revokingIds.has(invitation.id)}
                              className="flex items-center gap-2 text-xs bg-white dark:bg-slate-800 hover:bg-red-50 hover:border-red-200 hover:text-red-700 shadow-sm"
                            >
                              {revokingIds.has(invitation.id) ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                              {revokingIds.has(invitation.id) ? 'Revoking...' : 'Revoke'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => activateTeacher(invitation)}
                              disabled={activatingEmails.has(invitation.email)}
                              className="flex items-center gap-2 text-xs bg-white dark:bg-slate-800 hover:bg-green-50 hover:border-green-200 hover:text-green-700 shadow-sm"
                            >
                              {activatingEmails.has(invitation.email) ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3 w-3" />
                              )}
                              {activatingEmails.has(invitation.email) ? 'Activating...' : 'Activate'}
                            </Button>
                          </>
                        )}
                        {invitation.status === 'ACCEPTED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => activateTeacher(invitation)}
                            disabled={activatingEmails.has(invitation.email)}
                            className="flex items-center gap-2 text-xs bg-white dark:bg-slate-800 hover:bg-green-50 hover:border-green-200 hover:text-green-700 shadow-sm"
                          >
                            {activatingEmails.has(invitation.email) ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            {activatingEmails.has(invitation.email) ? 'Activating...' : 'Activate'}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Second Row */}
                    <div className="grid grid-cols-3 gap-4 text-xs font-mono text-slate-500">
                      <div>
                        <span className="font-medium">Invited by:</span>{' '}
                        {invitation.invitedBy ? (
                          <span className="break-all">{invitation.invitedBy.name} ({invitation.invitedBy.email})</span>
                        ) : (
                          <span>System</span>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>{' '}
                        {new Date(invitation.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {invitation.expiresAt && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Expires:</span>{' '}
                          <span className={`
                            ${new Date(invitation.expiresAt) < new Date() ? 'text-red-600 font-medium' : 
                             new Date(invitation.expiresAt) < new Date(Date.now() + 24 * 60 * 60 * 1000) ? 'text-orange-600 font-medium' : 
                             ''}
                          `}>
                            {new Date(invitation.expiresAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          {new Date(invitation.expiresAt) < new Date() && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                              Expired
                            </Badge>
                          )}
                          {new Date(invitation.expiresAt) < new Date(Date.now() + 24 * 60 * 60 * 1000) && 
                            new Date(invitation.expiresAt) > new Date() && (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                                Soon
                              </Badge>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Desktop Table Layout - 17+ inch screens */}
            <div className="hidden 2xl:block">
              <table className="w-full">
                <thead className="bg-primary/10 border-b border-primary/20">
                  <tr className="text-xs">
                    <th className="w-10 px-6 py-3 text-left font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Invited By</th>
                    <th className="px-6 py-3 text-left font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-left font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Expires</th>
                    <th className="px-6 py-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {invitations.map((invitation, index) => (
                    <tr key={invitation.id} className="hover:bg-primary/5 transition-colors group even:bg-slate-50 even:dark:bg-slate-900/20">
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex h-6 w-6 rounded-full bg-primary text-white items-center justify-center shadow-sm">
                          <span className="font-mono text-xs font-bold">{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Mail className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                          <div className="ml-3 min-w-0 flex-1">
                            <div className="text-sm font-mono font-medium text-slate-900 dark:text-slate-100 break-all">
                              {invitation.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
                          {invitation.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className={`w-2 h-2 rounded-full ${
                            invitation.status === 'PENDING' ? 'bg-yellow-500' : 
                            invitation.status === 'ACCEPTED' ? 'bg-green-500' : 
                            invitation.status === 'REJECTED' ? 'bg-red-500' : 'bg-gray-400'
                          }`} />
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className={`
                                    text-xs ${
                                      invitation.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                      invitation.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border-green-200' : 
                                      invitation.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 
                                      'bg-gray-50 text-gray-700 border-gray-200'
                                    }
                                  `}>
                                    {invitation.status}
                                  </Badge>
                                  <InfoIcon className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <p className="text-xs">
                                  {invitation.status === 'PENDING' ? 
                                    'This invitation is awaiting the teacher to accept and create their account.' : 
                                    invitation.status === 'ACCEPTED' ? 
                                    'The teacher has accepted this invitation and created an account.' : 
                                    invitation.status === 'REJECTED' ? 
                                    'This invitation has been rejected by the teacher.' : 
                                    'Status unknown.'}
                                  {invitation.expiresAt && (
                                    <>
                                      <br/>
                                      {new Date(invitation.expiresAt) < new Date() ? 
                                        'This invitation has expired and can no longer be used.' : 
                                        `Expires on ${new Date(invitation.expiresAt).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}`}
                                    </>
                                  )}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                        {invitation.invitedBy ? (
                          <div className="min-w-0">
                            <div className="font-medium break-words">{invitation.invitedBy.name}</div>
                            <div className="text-slate-500 break-all text-xs">{invitation.invitedBy.email}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">System</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                        {new Date(invitation.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                        {invitation.expiresAt ? (
                          <div className="flex items-center gap-2">
                            <span className={`
                              ${new Date(invitation.expiresAt) < new Date() ? 'text-red-600' : 
                               new Date(invitation.expiresAt) < new Date(Date.now() + 24 * 60 * 60 * 1000) ? 'text-orange-600' : 
                               'text-slate-700 dark:text-slate-300'}
                            `}>
                              {new Date(invitation.expiresAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            {new Date(invitation.expiresAt) < new Date() && (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                Expired
                              </Badge>
                            )}
                            {new Date(invitation.expiresAt) < new Date(Date.now() + 24 * 60 * 60 * 1000) && 
                              new Date(invitation.expiresAt) > new Date() && (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                                  Soon
                                </Badge>
                              )}
                          </div>
                        ) : (
                          <span className="text-slate-400">Never</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        {invitation.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resendInvitation(invitation.id)}
                              disabled={resendingIds.has(invitation.id)}
                              className="flex items-center gap-2 text-xs bg-white dark:bg-slate-800 hover:bg-primary/5 shadow-sm"
                            >
                              {resendingIds.has(invitation.id) ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <RefreshCw className="h-3 w-3" />
                              )}
                              {resendingIds.has(invitation.id) ? 'Sending...' : 'Resend'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => revokeInvitation(invitation.id)}
                              disabled={revokingIds.has(invitation.id)}
                              className="flex items-center gap-2 text-xs bg-white dark:bg-slate-800 hover:bg-red-50 hover:border-red-200 hover:text-red-700 shadow-sm"
                            >
                              {revokingIds.has(invitation.id) ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                              {revokingIds.has(invitation.id) ? 'Revoking...' : 'Revoke'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => activateTeacher(invitation)}
                              disabled={activatingEmails.has(invitation.email)}
                              className="flex items-center gap-2 text-xs bg-white dark:bg-slate-800 hover:bg-green-50 hover:border-green-200 hover:text-green-700 shadow-sm"
                            >
                              {activatingEmails.has(invitation.email) ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3 w-3" />
                              )}
                              {activatingEmails.has(invitation.email) ? 'Activating...' : 'Activate'}
                            </Button>
                          </div>
                        )}
                        {invitation.status === 'ACCEPTED' && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => activateTeacher(invitation)}
                              disabled={activatingEmails.has(invitation.email)}
                              className="flex items-center gap-2 text-xs bg-white dark:bg-slate-800 hover:bg-green-50 hover:border-green-200 hover:text-green-700 shadow-sm"
                            >
                              {activatingEmails.has(invitation.email) ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3 w-3" />
                              )}
                              {activatingEmails.has(invitation.email) ? 'Activating...' : 'Activate'}
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
