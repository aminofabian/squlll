"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Mail,
  Info,
  Loader2,
  RefreshCw
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
}

export function PendingInvitations({ invitations, isLoading, error, onInvitationResent }: PendingInvitationsProps) {
  const [resendingIds, setResendingIds] = useState<Set<string>>(new Set());

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
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Loading pending invitations...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">
              <Info className="h-8 w-8 mx-auto" />
            </div>
            <h3 className="text-lg font-mono font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Error loading invitations
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {error}
            </p>
          </div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-mono font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No pending invitations
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              All teacher invitations have been processed.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-primary/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary/5 border-b border-primary/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Invited By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                  {invitations.map((invitation) => (
                    <tr key={invitation.id} className="hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Mail className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-mono font-medium text-slate-900 dark:text-slate-100">
                              {invitation.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">
                          {invitation.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            invitation.status === 'PENDING' ? 'bg-yellow-500' : 
                            invitation.status === 'ACCEPTED' ? 'bg-green-500' : 
                            invitation.status === 'REJECTED' ? 'bg-red-500' : 'bg-gray-400'
                          }`} />
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
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                        {invitation.invitedBy ? (
                          <div>
                            <div className="font-medium">{invitation.invitedBy.name}</div>
                            <div className="text-slate-500">{invitation.invitedBy.email}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">System</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                        {new Date(invitation.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {invitation.status === 'PENDING' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resendInvitation(invitation.id)}
                            disabled={resendingIds.has(invitation.id)}
                            className="flex items-center gap-2 text-xs"
                          >
                            {resendingIds.has(invitation.id) ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3 w-3" />
                            )}
                            {resendingIds.has(invitation.id) ? 'Sending...' : 'Resend'}
                          </Button>
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
