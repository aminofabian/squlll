"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Lock, Shield, CheckCircle2, AlertTriangle } from "lucide-react"

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    }
  }

  const passwordValidation = validatePassword(newPassword)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required")
      return
    }
    
    // Enhanced validation
    if (currentPassword.length < 1) {
      setError("Please enter your current password")
      return
    }
    
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long")
      return
    }
    
    if (newPassword === currentPassword) {
      setError("New password must be different from current password")
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }
    
    if (!passwordValidation.isValid) {
      setError("Password does not meet security requirements")
      return
    }

    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      console.log('Sending change password request with:', {
        currentPasswordLength: currentPassword.length,
        newPasswordLength: newPassword.length,
        confirmPasswordLength: confirmPassword.length,
        passwordsMatch: newPassword === confirmPassword
      })

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Change password failed:', data)
        throw new Error(data.error || 'Failed to change password')
      }

      setMessage(data.message || 'Password changed successfully!')
      
      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        setMessage("")
      }, 5000)
      
      // Clear form on success after a brief delay to let user see the success message
      setTimeout(() => {
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }, 2000) // 2 second delay

    } catch (error: any) {
      console.error('Password change error:', error)
      setError(error.message || 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  const PasswordStrengthIndicator = ({ validation }: { validation: ReturnType<typeof validatePassword> }) => (
    <div className="space-y-2 mt-3">
      <div className="text-xs font-medium text-muted-foreground mb-2">Password Requirements:</div>
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className={`flex items-center gap-1 ${validation.minLength ? 'text-primary' : 'text-muted-foreground'}`}>
          <CheckCircle2 className={`h-3 w-3 ${validation.minLength ? 'text-primary' : 'text-muted-foreground'}`} />
          8+ characters
        </div>
        <div className={`flex items-center gap-1 ${validation.hasUpperCase ? 'text-primary' : 'text-muted-foreground'}`}>
          <CheckCircle2 className={`h-3 w-3 ${validation.hasUpperCase ? 'text-primary' : 'text-muted-foreground'}`} />
          Uppercase letter
        </div>
        <div className={`flex items-center gap-1 ${validation.hasLowerCase ? 'text-primary' : 'text-muted-foreground'}`}>
          <CheckCircle2 className={`h-3 w-3 ${validation.hasLowerCase ? 'text-primary' : 'text-muted-foreground'}`} />
          Lowercase letter
        </div>
        <div className={`flex items-center gap-1 ${validation.hasNumbers ? 'text-primary' : 'text-muted-foreground'}`}>
          <CheckCircle2 className={`h-3 w-3 ${validation.hasNumbers ? 'text-primary' : 'text-muted-foreground'}`} />
          Number
        </div>
        <div className={`flex items-center gap-1 ${validation.hasSpecialChar ? 'text-primary' : 'text-muted-foreground'}`}>
          <CheckCircle2 className={`h-3 w-3 ${validation.hasSpecialChar ? 'text-primary' : 'text-muted-foreground'}`} />
          Special character
        </div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
            <p className="text-muted-foreground">Manage your account security and preferences</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Success notification at the top */}
        {message && (
          <Alert className="border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-xl animate-in fade-in-0 slide-in-from-top-2 duration-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-100/20 to-emerald-100/20 animate-pulse"></div>
            <div className="relative flex items-center gap-4 p-2">
              <div className="flex-shrink-0">
                <div className="relative">
                  <CheckCircle2 className="h-8 w-8 text-green-600 animate-bounce" />
                  <div className="absolute inset-0 h-8 w-8 border-2 border-green-400 rounded-full animate-ping"></div>
                </div>
              </div>
              <div className="flex-1">
                <AlertDescription className="text-green-800 font-bold text-lg leading-tight">
                  🎉 {message}
                </AlertDescription>
                <p className="text-green-700 text-base mt-1 font-medium">
                  Your account is now more secure with your new password!
                </p>
              </div>
              <div className="flex-shrink-0">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setMessage("")}
                  className="text-green-600 hover:text-green-800 hover:bg-green-100"
                >
                  ✕
                </Button>
              </div>
            </div>
          </Alert>
        )}

        {/* Security Settings */}
        <Card className="border-2 border-border">
          <CardHeader className="bg-muted/50">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle className="text-primary">Security Settings</CardTitle>
            </div>
            <CardDescription>
              Change your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pr-10 h-11 border-2 focus:border-primary"
                    placeholder="Enter your current password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10 h-11 border-2 focus:border-primary"
                    placeholder="Enter your new password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {newPassword && <PasswordStrengthIndicator validation={passwordValidation} />}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10 h-11 border-2 focus:border-primary"
                    placeholder="Confirm your new password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-sm text-destructive">Passwords do not match</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isLoading || !passwordValidation.isValid || newPassword !== confirmPassword}
                  className="w-full h-11 bg-primary hover:bg-primary-dark text-primary-foreground font-medium"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Changing Password...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Change Password
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card className="border border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Use a unique password that you don't use elsewhere</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Choose a password that's at least 8 characters long</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Include uppercase letters, lowercase letters, numbers, and symbols</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Avoid common words, personal information, or keyboard patterns</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
