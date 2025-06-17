"use client"

import { AuthWrapper } from "@/components/auth/AuthFormWrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Info, User, Mail, Building2, KeyRound, RefreshCw, Globe2, ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// Form validation schema
const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  schoolName: z.string().min(2, "School name must be at least 2 characters"),
  schoolUrl: z.string().optional()
})

type SignupFormValues = z.infer<typeof signupSchema>

interface SignupResponse {
  user: {
    id: string
    email: string
    name: string
    userRole: string
  }
  school: {
    schoolName: string
  }
  subdomainUrl: string
}

const steps = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Enter your personal details',
    icon: User,
  },
  {
    id: 'school',
    title: 'School Details',
    description: 'Tell us about your institution',
    icon: Building2,
  }
]

const inputStyles = {
  base: `h-12 w-full bg-white border-0 px-4 pl-11 text-slate-900 
    ring-1 ring-inset ring-gray-200
    placeholder:text-gray-400 
    focus:ring-2 focus:ring-inset focus:ring-[#246a59]
    transition-all duration-300 ease-out
    hover:ring-[#246a59]/20`,
  icon: `absolute left-3 top-4 h-4 w-4 text-[#246a59]/60
    transition-all duration-300 ease-out
    group-focus-within:text-[#246a59]
    group-hover:text-[#246a59]/80`,
  label: `text-slate-900 text-[16px] leading-loose mb-3 block relative z-10 font-medium
    flex items-center gap-2
    before:content-[''] before:w-1.5 before:h-1.5 before:bg-[#246a59]/80 before:rounded-sm before:transition-all before:duration-300
    group-focus-within:before:scale-110 group-focus-within:before:bg-[#246a59]`,
  error: "text-sm text-red-500 mt-2 pl-4 border-l-2 border-red-500/30",
  container: `group relative mt-2`,
  formItem: `mb-6`,
  stepIndicator: `w-10 h-10 flex items-center justify-center relative z-10 
    transition-all duration-300 ease-out rounded-lg
    bg-white ring-1 ring-inset ring-[#246a59]/20
    before:absolute before:inset-0 before:bg-[#246a59]/5 before:rounded-lg before:transition-opacity before:duration-300
    hover:before:opacity-0`,
  stepIndicatorActive: `bg-[#246a59] text-white shadow-lg shadow-[#246a59]/20
    ring-0 before:opacity-0`,
  stepTitle: `font-medium transition-colors duration-300`,
  stepTitleActive: `text-[#246a59]`,
  stepDescription: `text-sm text-gray-500`,
  stepContainer: `flex items-center space-x-3 relative
    before:absolute before:left-5 before:top-[calc(100%+0.5rem)] before:h-[calc(100%-1rem)] before:w-[2px]
    before:bg-gradient-to-b before:from-[#246a59]/10 before:via-[#246a59]/5 before:to-transparent
    last:before:hidden`,
  nextButton: `px-6 py-2 bg-[#246a59] text-white hover:bg-[#246a59]/90 transition-all duration-300
    relative overflow-hidden group
    before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-transparent before:opacity-0
    before:transition-opacity before:duration-300 hover:before:opacity-100
    after:absolute after:inset-0 after:border after:border-[#246a59] after:translate-x-[2px] after:translate-y-[2px]
    after:transition-transform after:duration-300 hover:after:translate-x-1 hover:after:translate-y-1`,
  prevButton: `px-6 py-2 border border-[#246a59]/20 text-[#246a59] hover:bg-[#246a59]/5 transition-all duration-300
    relative overflow-hidden group
    before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#246a59]/5 before:to-transparent before:opacity-0
    before:transition-opacity before:duration-300 hover:before:opacity-100`
}

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<SignupResponse | null>(null)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isUrlEdited, setIsUrlEdited] = useState(false)
  const router = useRouter()

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      schoolName: "",
      schoolUrl: "",
    },
  })

  // Watch schoolName to update URL
  const schoolName = form.watch("schoolName")

  // Update school URL when school name changes
  useEffect(() => {
    if (!isUrlEdited && schoolName) {
      const generatedUrl = schoolName
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, '') // Remove special characters
        .replace(/(high|secondary|school)/g, '') // Remove common words first
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
        
      // Ensure the URL meets minimum length requirement
      if (generatedUrl.length < 3) {
        // If too short, use the full school name without removing common words
        const fullUrl = schoolName
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 63)
        
        form.setValue("schoolUrl", fullUrl)
      } else {
        form.setValue("schoolUrl", generatedUrl.slice(0, 63))
      }
    }
  }, [schoolName, isUrlEdited, form])

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const mutation = `
      mutation {
        createUser(createUserInput: {
          email: "${data.email}"
          password: "${data.password}"
          name: "${data.name}"
          userRole: "SUPER_ADMIN"
          schoolName: "${data.schoolName}"
          schoolUrl: "${data.schoolUrl}"
        }) {
          user {
            id
            email
            schoolUrl
          }
          school {
            schoolName
          }
          subdomainUrl
          tokens {
            accessToken
            refreshToken
          }
        }
      }
    `

    try {
      // Ensure we have the correct API URL
      const apiUrl = 'https://skool.zelisline.com/graphql'
      console.log('Using API URL:', apiUrl)

      const requestBody = JSON.stringify({ query: mutation })
      console.log('Request body:', requestBody)

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: requestBody,
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', {
        type: response.headers.get('content-type'),
        ...Object.fromEntries([...response.headers])
      })

      // Log raw response for debugging
      const rawResponse = await response.text()
      console.log('Raw response:', rawResponse)

      // Check if we actually got a response
      if (!rawResponse) {
        throw new Error('Empty response from server')
      }

      // Try to clean the response if it has any BOM or whitespace
      const cleanResponse = rawResponse.trim().replace(/^\uFEFF/, '')
      console.log('Cleaned response:', cleanResponse)

      let result
      try {
        result = JSON.parse(cleanResponse)
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError)
        console.error('Response that failed to parse:', {
          raw: rawResponse,
          cleaned: cleanResponse,
          length: cleanResponse.length,
          firstChar: cleanResponse.charCodeAt(0)
        })
        throw new Error(`Server returned invalid JSON. Raw response: ${rawResponse.substring(0, 100)}...`)
      }

      if (result.errors) {
        throw new Error(result.errors[0].message || 'Signup failed')
      }

      setSuccess(result.data.createUser)
      
      // Store tokens in localStorage or your preferred state management solution
      if (result.data.createUser.tokens) {
        localStorage.setItem('accessToken', result.data.createUser.tokens.accessToken)
        localStorage.setItem('refreshToken', result.data.createUser.tokens.refreshToken)
      }

      // Redirect to dashboard after successful signup
      setTimeout(() => {
        const subdomain = result.data.createUser.subdomainUrl
        const isProd = process.env.NODE_ENV === 'production'
        const baseUrl = isProd ? 'https://' : 'http://'
        const domain = isProd ? 'squl.co.ke' : 'localhost:3000'
        
        // Extract just the subdomain part
        const subdomainPrefix = subdomain.split('.')[0]
        const dashboardUrl = `${baseUrl}${subdomainPrefix}.${domain}`
        
        console.log('Redirecting to:', dashboardUrl)
        window.location.href = dashboardUrl
      }, 3000)

    } catch (error) {
      console.error('Registration error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred during signup')
    } finally {
      setIsLoading(false)
    }
  }

  const passwordRequirements = [
    { test: (pass: string) => pass.length >= 8, text: "At least 8 characters" },
    { test: (pass: string) => /[A-Z]/.test(pass), text: "One uppercase letter" },
    { test: (pass: string) => /[a-z]/.test(pass), text: "One lowercase letter" },
    { test: (pass: string) => /[0-9]/.test(pass), text: "One number" },
  ]

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className={inputStyles.formItem}>
                  <FormLabel className={inputStyles.label}>Full Name</FormLabel>
                  <FormControl>
                    <div className={inputStyles.container}>
                      <Input 
                        placeholder="Enter your full name"
                        className={inputStyles.base}
                        disabled={isLoading}
                        {...field}
                      />
                      <User className={inputStyles.icon} />
                    </div>
                  </FormControl>
                  <FormMessage className={inputStyles.error} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className={inputStyles.formItem}>
                  <FormLabel className={inputStyles.label}>Email Address</FormLabel>
                  <FormControl>
                    <div className={inputStyles.container}>
                      <Input 
                        type="email"
                        placeholder="Enter your email address"
                        className={inputStyles.base}
                        disabled={isLoading}
                        {...field}
                      />
                      <Mail className={inputStyles.icon} />
                    </div>
                  </FormControl>
                  <FormMessage className={inputStyles.error} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className={cn(inputStyles.formItem, "col-span-2")}>
                  <FormLabel className={inputStyles.label}>Password</FormLabel>
                  <FormControl>
                    <div className={inputStyles.container}>
                      <Input 
                        type="password"
                        placeholder="Create a secure password"
                        className={inputStyles.base}
                        disabled={isLoading}
                        onFocus={() => setPasswordFocused(true)}
                        {...field}
                        onBlur={() => {
                          field.onBlur();
                          setPasswordFocused(false);
                        }}
                      />
                      <KeyRound className={inputStyles.icon} />
                    </div>
                  </FormControl>
                  {passwordFocused && (
                    <div className="mt-3 p-3 bg-gray-50/80 backdrop-blur-sm rounded-lg space-y-2 animate-in fade-in-50 slide-in-from-top-5 border border-gray-100">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200",
                            req.test(field.value) 
                              ? "bg-[#246a59] scale-110" 
                              : "bg-gray-200"
                          )}>
                            {req.test(field.value) && (
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className={cn(
                            "text-sm transition-colors duration-200",
                            req.test(field.value) ? "text-[#246a59]" : "text-gray-500"
                          )}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <FormMessage className={inputStyles.error} />
                </FormItem>
              )}
            />
          </>
        )
      case 1:
        return (
          <>
            <FormField
              control={form.control}
              name="schoolName"
              render={({ field }) => (
                <FormItem className={cn(inputStyles.formItem, "col-span-2")}>
                  <FormLabel className={inputStyles.label}>School Name</FormLabel>
                  <FormControl>
                    <div className={inputStyles.container}>
                      <Input 
                        placeholder="Enter your school name"
                        className={inputStyles.base}
                        disabled={isLoading}
                        {...field}
                      />
                      <Building2 className={inputStyles.icon} />
                    </div>
                  </FormControl>
                  <FormMessage className={inputStyles.error} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="schoolUrl"
              render={({ field }) => (
                <FormItem className={cn(inputStyles.formItem, "col-span-2")}>
                  <FormLabel className={inputStyles.label}>
                    <div className="flex items-center justify-between">
                      <span>School URL</span>
                      {isUrlEdited && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsUrlEdited(false);
                            const event = new Event('input', { bubbles: true });
                            const schoolNameInput = document.querySelector('input[name="schoolName"]');
                            schoolNameInput?.dispatchEvent(event);
                          }}
                          className="h-7 text-xs font-normal text-gray-500 hover:text-[#246a59] hover:bg-[#246a59]/5"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Reset to auto-generated
                        </Button>
                      )}
                    </div>
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <div className="flex rounded-lg shadow-sm ring-1 ring-inset ring-gray-200 focus-within:ring-2 focus-within:ring-[#246a59] transition-all duration-200">
                        <span className="flex select-none items-center px-3 rounded-l-lg border-0 bg-gray-50 text-gray-500 text-sm sm:text-base">
                          https://
                        </span>
                        <div className="relative flex-1">
                          <Input 
                            placeholder="your-school"
                            className="block w-full rounded-none border-0 py-3 pl-3 pr-[105px] text-gray-900 ring-0 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            disabled={isLoading}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setIsUrlEdited(true);
                            }}
                          />
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                            .squl.co.ke
                          </span>
                        </div>
                        <div className="relative -ml-px">
                          <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-gray-200 via-gray-200 to-transparent"></div>
                          <div className="flex items-center px-3 rounded-r-lg border-0 bg-gray-50">
                            <Globe2 className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <div className="mt-2.5 flex items-start space-x-2">
                    <Info className="w-4 h-4 mt-0.5 text-gray-400" />
                    <p className="text-sm text-gray-500 leading-tight">
                      This will be your school's unique URL. Auto-generated from school name for convenience.
                    </p>
                  </div>
                  <FormMessage className={inputStyles.error} />
                </FormItem>
              )}
            />
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08),0_8px_24px_-4px_rgba(36,106,89,0.05)] overflow-hidden
        relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-white before:to-gray-50/50
        border-t-4 border-t-[#246a59]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100
          relative overflow-hidden
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-[#246a59]/5 before:to-transparent">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-b from-[#246a59] to-[#1a4c40] border border-[#1d5547] flex items-center justify-center rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 3.727 1.51a1 1 0 00.788 0l7-3a1 1 0 000-1.84l-7-3z" />
                <path d="M3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <div className="font-mono font-bold text-lg tracking-wide">
              <span className="text-[#246a59] dark:text-[#2d8570]">SQ</span>
              <span className="text-[#246a59]">UL</span>
            </div>
          </Link>
          <Link 
            href="/login"
            className="text-sm font-medium px-4 py-2 rounded-lg bg-gray-50 text-gray-900 hover:bg-gray-100 transition-colors"
          >
            Sign in
          </Link>
        </div>
        
        <div className="flex flex-col lg:flex-row">
          {/* Left sidebar */}
          <div className="w-full lg:w-[280px] p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-[#246a59]">Step {currentStep + 1}</h2>
              <p className="text-gray-500 text-sm mt-1">Enter your details</p>
            </div>

            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={step.id} className={inputStyles.stepContainer}>
                  <div className={cn(
                    inputStyles.stepIndicator,
                    currentStep === index && inputStyles.stepIndicatorActive
                  )}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={cn(
                      inputStyles.stepTitle,
                      currentStep === index && inputStyles.stepTitleActive
                    )}>
                      {step.title}
                    </h3>
                    <p className={inputStyles.stepDescription}>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 p-6 lg:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
                {error && (
                  <Alert variant="destructive" className="animate-in fade-in-50 slide-in-from-top-2 border-l-4 border-l-red-500
                    relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-red-500/5 before:via-red-500/2 before:to-transparent">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="animate-in fade-in-50 slide-in-from-top-2 border-l-4 border-l-[#246a59]
                    relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#246a59]/5 before:via-[#246a59]/2 before:to-transparent">
                    <CheckCircle2 className="h-4 w-4 text-[#246a59]" />
                    <AlertTitle className="text-[#246a59]">Success!</AlertTitle>
                    <AlertDescription className="text-[#246a59]/80">
                      Account created successfully. Redirecting...
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentStep === 0 ? (
                    <>
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className={inputStyles.formItem}>
                            <FormLabel className={inputStyles.label}>Full Name</FormLabel>
                            <FormControl>
                              <div className={inputStyles.container}>
                                <Input 
                                  placeholder="Enter your full name"
                                  className={inputStyles.base}
                                  disabled={isLoading}
                                  {...field}
                                />
                                <User className={inputStyles.icon} />
                              </div>
                            </FormControl>
                            <FormMessage className={inputStyles.error} />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className={inputStyles.formItem}>
                            <FormLabel className={inputStyles.label}>Email Address</FormLabel>
                            <FormControl>
                              <div className={inputStyles.container}>
                                <Input 
                                  type="email"
                                  placeholder="Enter your email address"
                                  className={inputStyles.base}
                                  disabled={isLoading}
                                  {...field}
                                />
                                <Mail className={inputStyles.icon} />
                              </div>
                            </FormControl>
                            <FormMessage className={inputStyles.error} />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className={cn(inputStyles.formItem, "col-span-2")}>
                            <FormLabel className={inputStyles.label}>Password</FormLabel>
                            <FormControl>
                              <div className={inputStyles.container}>
                                <Input 
                                  type="password"
                                  placeholder="Create a secure password"
                                  className={inputStyles.base}
                                  disabled={isLoading}
                                  onFocus={() => setPasswordFocused(true)}
                                  {...field}
                                  onBlur={() => {
                                    field.onBlur();
                                    setPasswordFocused(false);
                                  }}
                                />
                                <KeyRound className={inputStyles.icon} />
                              </div>
                            </FormControl>
                            {passwordFocused && (
                              <div className="mt-3 p-3 bg-gray-50/80 backdrop-blur-sm rounded-lg space-y-2 animate-in fade-in-50 slide-in-from-top-5 border border-gray-100">
                                {passwordRequirements.map((req, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <div className={cn(
                                      "w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200",
                                      req.test(field.value) 
                                        ? "bg-[#246a59] scale-110" 
                                        : "bg-gray-200"
                                    )}>
                                      {req.test(field.value) && (
                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                      )}
                                    </div>
                                    <span className={cn(
                                      "text-sm transition-colors duration-200",
                                      req.test(field.value) ? "text-[#246a59]" : "text-gray-500"
                                    )}>
                                      {req.text}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <FormMessage className={inputStyles.error} />
                          </FormItem>
                        )}
                      />
                    </>
                  ) : (
                    <>
                      <FormField
                        control={form.control}
                        name="schoolName"
                        render={({ field }) => (
                          <FormItem className={cn(inputStyles.formItem, "col-span-2")}>
                            <FormLabel className={inputStyles.label}>School Name</FormLabel>
                            <FormControl>
                              <div className={inputStyles.container}>
                                <Input 
                                  placeholder="Enter your school name"
                                  className={inputStyles.base}
                                  disabled={isLoading}
                                  {...field}
                                />
                                <Building2 className={inputStyles.icon} />
                              </div>
                            </FormControl>
                            <FormMessage className={inputStyles.error} />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="schoolUrl"
                        render={({ field }) => (
                          <FormItem className={cn(inputStyles.formItem, "col-span-2")}>
                            <FormLabel className={inputStyles.label}>
                              <div className="flex items-center justify-between">
                                <span>School URL</span>
                                {isUrlEdited && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setIsUrlEdited(false);
                                      const event = new Event('input', { bubbles: true });
                                      const schoolNameInput = document.querySelector('input[name="schoolName"]');
                                      schoolNameInput?.dispatchEvent(event);
                                    }}
                                    className="h-7 text-xs font-normal text-gray-500 hover:text-[#246a59] hover:bg-[#246a59]/5"
                                  >
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                    Reset to auto-generated
                                  </Button>
                                )}
                              </div>
                            </FormLabel>
                            <FormControl>
                              <div className="relative group">
                                <div className="flex rounded-lg shadow-sm ring-1 ring-inset ring-gray-200 focus-within:ring-2 focus-within:ring-[#246a59] transition-all duration-200">
                                  <span className="flex select-none items-center px-3 rounded-l-lg border-0 bg-gray-50 text-gray-500 text-sm sm:text-base">
                                    https://
                                  </span>
                                  <div className="relative flex-1">
                                    <Input 
                                      placeholder="your-school"
                                      className="block w-full rounded-none border-0 py-3 pl-3 pr-[105px] text-gray-900 ring-0 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                      disabled={isLoading}
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(e);
                                        setIsUrlEdited(true);
                                      }}
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                                      .squl.co.ke
                                    </span>
                                  </div>
                                  <div className="relative -ml-px">
                                    <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-gray-200 via-gray-200 to-transparent"></div>
                                    <div className="flex items-center px-3 rounded-r-lg border-0 bg-gray-50">
                                      <Globe2 className="w-5 h-5 text-gray-400" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </FormControl>
                            <div className="mt-2.5 flex items-start space-x-2">
                              <Info className="w-4 h-4 mt-0.5 text-gray-400" />
                              <p className="text-sm text-gray-500 leading-tight">
                                This will be your school's unique URL. Auto-generated from school name for convenience.
                              </p>
                            </div>
                            <FormMessage className={inputStyles.error} />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  {currentStep > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className={inputStyles.prevButton}
                      disabled={isLoading}
                    >
                      <span className="relative z-10 flex items-center">
                        <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
                        Previous
                      </span>
                    </Button>
                  )}
                  
                  <Button
                    type={currentStep === steps.length - 1 ? "submit" : "button"}
                    onClick={currentStep === steps.length - 1 ? undefined : nextStep}
                    className={inputStyles.nextButton}
                    disabled={isLoading}
                  >
                    <span className="relative z-10 flex items-center">
                      {currentStep === steps.length - 1 
                        ? (isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              Create Account
                              <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                            </>
                          ))
                        : (
                          <>
                            Next
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                          </>
                        )
                      }
                    </span>
                  </Button>
                </div>

                <div className="mt-8 pt-6 text-center relative">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-sm text-gray-400
                    before:absolute before:-left-2 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-1 before:bg-gray-300 before:rotate-45
                    after:absolute after:-right-2 after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-1 after:bg-gray-300 after:rotate-45">
                    or
                  </div>
                  <p className="text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link 
                      href="/login" 
                      className="font-medium text-[#246a59] hover:text-[#246a59]/90 transition-all duration-300
                        relative group
                        after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] 
                        after:bg-[#246a59]/30 hover:after:bg-[#246a59]
                        after:transition-all after:duration-300
                        before:absolute before:bottom-0 before:left-1/2 before:w-0 before:h-[1px]
                        before:bg-[#246a59] hover:before:w-full hover:before:left-0
                        before:transition-all before:duration-300"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
} 