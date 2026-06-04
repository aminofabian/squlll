"use client";

import React from "react";
import { ParentInvitation } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Calendar, 
  Clock, 
  User, 
  UserPlus, 
  RefreshCcw, 
  AlertCircle, 
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { usePendingParentInvitations } from "../hooks/usePendingParentInvitations";
import { toast } from "sonner";

export function PendingInvitationsSection() {
  const { pendingInvitations, isLoading, error, resendInvitation } = usePendingParentInvitations();

  const handleResendInvitation = async (id: string, email: string) => {
    try {
      await resendInvitation(id);
      toast.success("Invitation resent", {
        description: `Invitation has been resent to ${email}`,
      });
    } catch (err) {
      toast.error("Failed to resend invitation", {
        description: "Please try again later",
      });
    }
  };

  // Format date helper function
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return `${formatDistanceToNow(date, { addSuffix: true })}`;
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Loading pending invitations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32 border border-red-300 bg-red-50 dark:bg-red-900/20 rounded-xl p-6">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5" />
          <span>Failed to load pending invitations: {error}</span>
        </div>
      </div>
    );
  }

  if (pendingInvitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-primary/20 rounded-xl bg-primary/5 p-6">
        <Mail className="h-8 w-8 text-primary/40 mb-2" />
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
          No pending parent invitations found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto w-full border-2 border-primary/20 rounded-xl">
        <table className="w-full">
          <thead>
            <tr className="bg-primary/10">
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Invited By</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10 bg-white dark:bg-slate-800">
            {pendingInvitations.map((invitation) => (
              <tr 
                key={invitation.id} 
                className="hover:bg-primary/5 transition-colors duration-150"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary/60" />
                    <span className="font-mono text-sm">{invitation.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="bg-primary/10 border border-primary/20 text-primary font-mono text-xs px-2 py-1 rounded inline-flex">
                    {invitation.role}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800">
                    {invitation.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-primary/60" />
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {new Date(invitation.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary/60" />
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        Sent {formatDate(invitation.createdAt)}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {invitation.invitedBy ? (
                    <div className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-primary/60" />
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {invitation.invitedBy.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 dark:text-slate-500">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleResendInvitation(invitation.id, invitation.email)}
                    className="border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/40 font-mono gap-1"
                  >
                    <RefreshCcw className="h-3 w-3" />
                    Resend
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
