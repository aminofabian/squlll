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
  ExternalLink,
  Clock,
  User,
  Key,
  ShieldCheck,
  ArrowRight,
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
  
  const inviteUrl = `https://${schoolSubdomain}.squl.co.ke/signup?token=<SECURE_TOKEN>`;
  const exampleTokenUrl = `https://${schoolSubdomain}.squl.co.ke/signup?token=b4455c462bbbdbcc27057dfb1933feb2a089355ad77dc30762a954b5f26887c2`;
  
  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(invitationData.email);
    toast.success("Email copied!", {
      description: "Teacher's email address copied to clipboard"
    });
  };
  
  const copyExampleUrl = () => {
    navigator.clipboard.writeText(exampleTokenUrl);
    toast.success("Example URL copied!", {
      description: "Example signup link copied to clipboard"
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900">
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <DialogTitle className="text-xl font-mono font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
            Invitation Sent Successfully!
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
            The teacher invitation has been sent with secure token authentication
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invitation Details Card */}
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-3">
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
                  className="border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-400 text-xs font-mono"
                >
                  {invitationData.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Teacher Signup Process Card */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h3 className="text-sm font-mono font-bold text-primary uppercase tracking-wide mb-3">
              Teacher Signup Process
            </h3>
            
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="text-xs text-primary" />
                </div>
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">Email Received</p>
                  <p>Teacher receives invitation email with secure signup link containing authentication token</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Key className="text-xs text-primary" />
                </div>
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">Token Authentication</p>
                  <p>Clicking the link extracts the secure token from URL parameters for verification</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="text-xs text-primary" />
                </div>
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">Password Setup</p>
                  <p>Teacher creates secure password and submits with token via acceptTeacherInvitation mutation</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ArrowRight className="text-xs text-primary" />
                </div>
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">Account Activation</p>
                  <p>System generates access/refresh tokens and activates teacher account with portal access</p>
                </div>
              </div>
            </div>
          </div>

          {/* Signup URL Example Card */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                Signup URL Format
              </h3>
              <ExternalLink className="h-4 w-4 text-primary" />
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Template URL:</p>
                <div className="bg-slate-50 dark:bg-slate-900 rounded p-3 border">
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all">
                    {inviteUrl}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Example with token:</p>
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 rounded p-3 border">
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400 break-all mr-2">
                    {exampleTokenUrl}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyExampleUrl}
                    className="h-8 px-2 hover:bg-slate-200 dark:hover:bg-slate-700 flex-shrink-0"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-mono font-bold text-blue-900 dark:text-blue-100 uppercase tracking-wide mb-3">
              Technical Implementation
            </h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">GraphQL Mutation:</p>
                <div className="bg-blue-100 dark:bg-blue-950/50 rounded p-2 border">
                  <pre className="text-blue-700 dark:text-blue-300 font-mono">
{`mutation {
  acceptTeacherInvitation(
    acceptInvitationInput: {
      token: "b4455c462bb..."
      password: "SecurePassword123"
    }
  ) {
    message
    user { id name email }
    tokens { accessToken refreshToken }
    teacher { id name }
  }
}`}
                  </pre>
                </div>
              </div>
              
              <div>
                <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">Expected Response:</p>
                <div className="bg-blue-100 dark:bg-blue-950/50 rounded p-2 border">
                  <pre className="text-blue-700 dark:text-blue-300 font-mono">
{`{
  "message": "Invitation accepted successfully",
  "user": { "id": "...", "name": "...", "email": "..." },
  "tokens": { "accessToken": "...", "refreshToken": "..." },
  "teacher": { "id": "...", "name": "..." }
}`}
                  </pre>
                </div>
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