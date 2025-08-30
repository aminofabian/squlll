"use client";

import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface TeacherInvitationValidatorProps {
  token: string;
  onValidationComplete: (isValid: boolean, invitationData?: any) => void;
}

interface InvitationData {
  email: string;
  schoolName: string;
  inviterName: string;
  expiresAt: string;
}

export function TeacherInvitationValidator({ token, onValidationComplete }: TeacherInvitationValidatorProps) {
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);

  useEffect(() => {
    validateInvitation();
  }, [token]);

  const validateInvitation = async () => {
    try {
      setIsValidating(true);
      setValidationError(null);

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query ValidateTeacherInvitation($token: String!) {
              validateTeacherInvitation(token: $token) {
                isValid
                email
                schoolName
                inviterName
                expiresAt
                error
              }
            }
          `,
          variables: { token }
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to validate invitation');
      }

      const validation = result.data.validateTeacherInvitation;

      if (validation.isValid) {
        const data: InvitationData = {
          email: validation.email,
          schoolName: validation.schoolName,
          inviterName: validation.inviterName,
          expiresAt: validation.expiresAt
        };
        setInvitationData(data);
        onValidationComplete(true, data);
      } else {
        setValidationError(validation.error || 'Invalid or expired invitation');
        onValidationComplete(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate invitation';
      setValidationError(errorMessage);
      onValidationComplete(false);
    } finally {
      setIsValidating(false);
    }
  };

  if (isValidating) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-start gap-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium">Invalid Invitation</h3>
          <p className="text-sm mt-1">{validationError}</p>
        </div>
      </div>
    );
  }

  if (invitationData) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium">Valid Teacher Invitation</h3>
            <div className="text-sm mt-2 space-y-1">
              <p><span className="font-medium">Email:</span> {invitationData.email}</p>
              <p><span className="font-medium">School:</span> {invitationData.schoolName}</p>
              <p><span className="font-medium">Invited by:</span> {invitationData.inviterName}</p>
              <p><span className="font-medium">Expires:</span> {new Date(invitationData.expiresAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
