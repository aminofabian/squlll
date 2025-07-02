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
    toast.success("Email copied!", {
      description: "Teacher's email address copied to clipboard"
    });
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
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Invitation Sent Successfully!
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
            The teacher invitation has been sent to their email address
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invitation Details Card */}
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
              Invitation Details
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Teacher:</span>
                </div>
                <span className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                  {invitationData.fullName}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
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
                  <Clock className="h-4 w-4 text-primary" />
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

          {/* What happens next */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-primary mb-3">
              What happens next?
            </h3>
            
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>The teacher will receive an email with a secure signup link</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>They'll click the link to create their password and activate their account</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>Once activated, they can access the teacher portal</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button 
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary-dark text-white"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 