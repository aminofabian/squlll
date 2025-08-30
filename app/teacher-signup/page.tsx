"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  GraduationCap
} from "lucide-react";
import toast from "react-hot-toast";
import { TeacherInvitationValidator } from "@/components/auth/TeacherInvitationValidator";

// Types for the mutation response
interface AcceptTeacherInvitationResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  teacher: {
    id: string;
    name: string;
  };
  role: string;
}

function TeacherSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidInvitation, setIsValidInvitation] = useState<boolean | null>(null);
  const [invitationData, setInvitationData] = useState<any>(null);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      toast.error('Invalid invitation link');
      router.push('/login');
    }
  }, [token, router]);

  const handleValidationComplete = (isValid: boolean, data?: any) => {
    setIsValidInvitation(isValid);
    setInvitationData(data);
    if (!isValid) {
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  };

  // Password validation
  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(pwd)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(pwd)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrors({ password: passwordError });
      return;
    }
    
    // Validate password confirmation
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }
    
    if (!token) {
      setErrors({ general: 'Invalid invitation token' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation AcceptTeacherInvitation($acceptInvitationInput: AcceptInvitationInput!) {
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
            }
          `,
          variables: {
            acceptInvitationInput: {
              token,
              password
            }
          }
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Failed to accept invitation');
      }

      const data: AcceptTeacherInvitationResponse = result.data.acceptTeacherInvitation;

      // Store tokens in localStorage
      localStorage.setItem('accessToken', data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('teacherId', data.teacher.id);

      toast.success(data.message || 'Welcome! Your teacher account has been activated.');

      // Redirect to teacher dashboard
      router.push('/dashboard');

    } catch (error) {
      console.error('Error accepting teacher invitation:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : 'Failed to accept invitation. Please try again.' 
      });
      toast.error('Failed to accept invitation');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Complete Your Teacher Account
            </h1>
            <p className="text-slate-600">
              Set up your password to activate your teacher account
            </p>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 mt-3" variant="outline">
              Teacher Invitation
            </Badge>
          </div>

          {/* Invitation Validation */}
          {token && (
            <div className="mb-6">
              <TeacherInvitationValidator 
                token={token} 
                onValidationComplete={handleValidationComplete} 
              />
            </div>
          )}

          {/* Show form only if invitation is valid */}
          {isValidInvitation === false && (
            <div className="text-center py-8">
              <p className="text-slate-600">Redirecting to login page...</p>
            </div>
          )}

          {isValidInvitation === true && (
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{errors.general}</span>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pr-10 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              <div className="mt-2 text-xs text-slate-500">
                Password must contain at least 8 characters with uppercase, lowercase, and numbers
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pr-10 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Activating Account...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activate Teacher Account
                </>
              )}
            </Button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">
              By activating your account, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeacherSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <TeacherSignupContent />
    </Suspense>
  );
}
