"use client";

import React, { useState } from "react";
import { teachersPanel, teachersTh } from "./teachers-ui";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

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

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface InvitationRowProps {
  invitation: PendingInvitation;
  resendingIds: Set<string>;
  revokingIds: Set<string>;
  activatingEmails: Set<string>;
  onResend: (id: string) => void;
  onRevoke: (id: string) => void;
  onActivate: (invitation: PendingInvitation) => void;
}

function InvitationTableRow({
  invitation,
  resendingIds,
  revokingIds,
  activatingEmails,
  onResend,
  onRevoke,
  onActivate,
}: InvitationRowProps) {
  const [confirmRevokeOpen, setConfirmRevokeOpen] = useState(false);
  const isResending = resendingIds.has(invitation.id);
  const isRevoking = revokingIds.has(invitation.id);
  const isActivating = activatingEmails.has(invitation.email);
  const isPending = invitation.status === "PENDING";
  const isAccepted = invitation.status === "ACCEPTED";
  const expiresAt = invitation.expiresAt;
  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;

  return (
    <>
      <tr className="text-slate-700 transition-colors hover:bg-slate-50/80 dark:text-slate-300 dark:hover:bg-slate-800/40">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <p
              className="truncate font-medium text-slate-800 dark:text-slate-100"
              title={invitation.email}
            >
              {invitation.email}
            </p>
          </div>
        </td>
        <td className="px-4 py-3">
          <Badge
            variant="outline"
            className="border-sky-200 bg-sky-50 text-[10px] font-normal capitalize text-sky-700"
          >
            {invitation.role.toLowerCase()}
          </Badge>
        </td>
        <td className="px-4 py-3">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-normal capitalize",
              invitation.status === "PENDING"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : invitation.status === "ACCEPTED"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-slate-50 text-slate-600",
            )}
          >
            {invitation.status.toLowerCase()}
          </Badge>
        </td>
        <td className="hidden px-4 py-3 sm:table-cell">
          {invitation.invitedBy ? (
            <div className="min-w-0 max-w-[180px]">
              <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                {invitation.invitedBy.name}
              </p>
              <p className="truncate text-[11px] text-slate-400" title={invitation.invitedBy.email}>
                {invitation.invitedBy.email}
              </p>
            </div>
          ) : (
            <span className="text-xs text-slate-400">System</span>
          )}
        </td>
        <td className="hidden px-4 py-3 text-xs text-slate-500 md:table-cell">
          {formatDateTime(invitation.createdAt)}
        </td>
        <td className="hidden px-4 py-3 text-xs text-slate-500 lg:table-cell">
          {expiresAt ? (
            <span className={isExpired ? "font-medium text-red-600" : undefined}>
              {formatDate(expiresAt)}
            </span>
          ) : (
            "Never"
          )}
        </td>
        <td className="px-4 py-3">
          {(isPending || isAccepted) && (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {isPending && (
                <>
                  <button
                    type="button"
                    onClick={() => onResend(invitation.id)}
                    disabled={isResending}
                    className="text-xs text-slate-500 hover:text-slate-800 disabled:opacity-50"
                  >
                    {isResending ? "Sending…" : "Resend"}
                  </button>
                  <span className="text-slate-200">·</span>
                  <button
                    type="button"
                    onClick={() => setConfirmRevokeOpen(true)}
                    disabled={isRevoking}
                    className="text-xs text-slate-500 hover:text-red-600 disabled:opacity-50"
                  >
                    {isRevoking ? "Revoking…" : "Revoke"}
                  </button>
                  <span className="text-slate-200">·</span>
                </>
              )}
              <button
                type="button"
                onClick={() => onActivate(invitation)}
                disabled={isActivating}
                className="text-xs font-medium text-emerald-700 hover:text-emerald-900 disabled:opacity-50"
              >
                {isActivating ? "Activating…" : "Activate"}
              </button>
            </div>
          )}
        </td>
      </tr>

      <AlertDialog open={confirmRevokeOpen} onOpenChange={setConfirmRevokeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the invitation for{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {invitation.email}
              </span>
              . They will no longer be able to accept it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep invitation</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                setConfirmRevokeOpen(false);
                onRevoke(invitation.id);
              }}
            >
              Revoke invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
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

  if (!isLoading && !error && invitations.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={teachersPanel}>
        <div className="flex items-center justify-center px-4 py-10">
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={teachersPanel}>
        <div className="px-4 py-4 text-sm text-red-600">
          Error loading invitations: {error}
        </div>
      </div>
    );
  }

  return (
    <div className={teachersPanel}>
      <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              <h2 className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Pending invitations
              </h2>
            </div>
            <p className="mt-0.5 pl-4 text-xs text-slate-400">
              {invitations.length} awaiting response — resend or activate when ready
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-left dark:border-slate-800 dark:bg-slate-900/60">
              <th className={teachersTh}>Email</th>
              <th className={teachersTh}>Role</th>
              <th className={teachersTh}>Status</th>
              <th className={cn(teachersTh, "hidden sm:table-cell")}>Invited by</th>
              <th className={cn(teachersTh, "hidden md:table-cell")}>Created</th>
              <th className={cn(teachersTh, "hidden lg:table-cell")}>Expires</th>
              <th className={teachersTh}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {invitations.map((invitation) => (
              <InvitationTableRow
                key={invitation.id}
                invitation={invitation}
                resendingIds={resendingIds}
                revokingIds={revokingIds}
                activatingEmails={activatingEmails}
                onResend={resendInvitation}
                onRevoke={revokeInvitation}
                onActivate={activateTeacher}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
