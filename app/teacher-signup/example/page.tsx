"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function TeacherSignupExamplePage() {
  const [copied, setCopied] = useState(false);
  
  // Example token for testing (this would normally come from the invitation email)
  const exampleToken = "cd1193dbe005e8d86a73a1c309f7507b59eb2573d93cd15bb0feb5d94d11ac89";
  const signupUrl = `/teacher-signup?token=${exampleToken}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${signupUrl}`);
      setCopied(true);
      toast.success('URL copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy URL');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Teacher Signup System
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            A complete teacher invitation and signup flow that distinguishes teacher accounts from staff and other user types
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Teacher-Specific Signup
              </CardTitle>
              <CardDescription>
                Dedicated signup flow specifically for teacher invitations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Uses `acceptTeacherInvitation` GraphQL mutation</li>
                <li>• Validates invitation tokens before signup</li>
                <li>• Sets correct user role as "TEACHER"</li>
                <li>• Stores teacher-specific data and tokens</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                Complete Validation
              </CardTitle>
              <CardDescription>
                Comprehensive form validation and error handling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Password strength validation</li>
                <li>• Token expiration checking</li>
                <li>• Real-time form feedback</li>
                <li>• Toast notifications for user feedback</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Demo Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Try the Teacher Signup Flow</CardTitle>
            <CardDescription>
              Use the example token below to test the complete teacher signup process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Example Invitation Token:
              </label>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border">
                <code className="flex-1 text-sm font-mono text-slate-800 break-all">
                  {exampleToken}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Signup URL:
              </label>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border">
                <code className="flex-1 text-sm font-mono text-slate-800 break-all">
                  /teacher-signup?token={exampleToken}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button asChild>
                <Link href={signupUrl}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Test Teacher Signup
                </Link>
              </Button>
              <Badge variant="secondary" className="px-3 py-1">
                Demo Mode
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* GraphQL Mutation Info */}
        <Card>
          <CardHeader>
            <CardTitle>GraphQL Mutation</CardTitle>
            <CardDescription>
              The mutation used for teacher account activation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-slate-100">
{`mutation AcceptTeacherInvitation($acceptInvitationInput: AcceptInvitationInput!) {
  acceptTeacherInvitation(acceptInvitationInput: $acceptInvitationInput) {
    message
    user {
      id
      name
      email
    }
    tokens {
      accessToken
      refreshToken
    }
    teacher {
      id
      name
    }
    role
  }
}`}
              </pre>
            </div>
            <div className="mt-4 text-sm text-slate-600">
              <p><strong>Input Variables:</strong></p>
              <ul className="mt-2 space-y-1">
                <li>• <code>token</code>: The invitation token from the email</li>
                <li>• <code>password</code>: The new password for the teacher account</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-500">
          <p>Teacher signup system ready for production use</p>
        </div>
      </div>
    </div>
  );
}
