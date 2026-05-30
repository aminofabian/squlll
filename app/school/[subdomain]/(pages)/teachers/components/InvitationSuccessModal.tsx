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
} from "lucide-react";
import { toast } from 'sonner';

interface InvitationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitationData: {
    email: string;
    fullName: string;
    status: string;
    createdAt: string;
    emailSent?: boolean;
  };
  schoolSubdomain?: string;
}

export function InvitationSuccessModal({ 
  isOpen, 
  onClose, 
  invitationData,
  schoolSubdomain = 'school'
}: InvitationSuccessModalProps) {
  
  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(invitationData.email);
    toast.success("Email copied to clipboard!");
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-white dark:bg-slate-900">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {invitationData.emailSent === false
              ? 'Teacher registered'
              : 'Invitation sent!'}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
            {invitationData.emailSent === false
              ? `${invitationData.fullName} was added, but the invitation email could not be delivered.`
              : `${invitationData.fullName} will receive an email to join your school`}
          </DialogDescription>
        </DialogHeader>

        {invitationData.emailSent === false && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
            Email delivery failed (likely a mail provider config issue in dev).
            Open <strong>Pending invitations</strong> and tap <strong>Resend</strong> once email is configured.
          </div>
        )}

        <div className="space-y-4">
          {/* Teacher Details */}
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Teacher:</span>
                </div>
                <span className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                  {invitationData.fullName}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                    {invitationData.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyEmailToClipboard}
                    className="h-6 w-6 p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Sent:</span>
                </div>
                <span className="text-sm text-slate-900 dark:text-slate-100">
                  {formatDate(invitationData.createdAt)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Status:</span>
                <Badge 
                  variant="outline" 
                  className="border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-400 text-xs"
                >
                  {invitationData.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
              {invitationData.emailSent === false
                ? 'What you can do'
                : 'What happens next?'}
            </h3>
            
            <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              {invitationData.emailSent === false ? (
                <>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>The teacher record and pending invitation are saved</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Use Resend on the pending invitations list when email is working</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>They&apos;ll get an email with a signup link</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>They&apos;ll create their password and join your school</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>You&apos;ll see them in your teachers list once they sign up</span>
                  </div>
                </>
              )}
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