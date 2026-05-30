'use client'

import { Button } from '@/components/ui/button'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Bell, 
  Menu, 
  ChevronDown,
  Plus,
  GraduationCap,
  UserPlus,
  BookOpen,
  ClipboardList,
  School,
  PanelLeftOpen,
  PanelLeftClose,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TermsDropdown } from './TermsDropdown'
import { useSignout } from '@/lib/hooks/useSignout'
import { cn } from '@/lib/utils'

interface SchoolNavbarProps {
  userName: string
  userRole: string
  isSidebarMinimized: boolean
  isMobileSidebarOpen: boolean
  onToggleMobileSidebar: () => void
  onToggleSidebarMinimize: () => void
}

function formatRole(role: string) {
  if (!role) return 'Member'
  return role
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

type SetupStep = {
  id: string
  label: string
  description: string
  icon: LucideIcon
  path: string
}

function buildSetupSteps(): SetupStep[] {
  return [
    {
      id: 'classes',
      label: 'Set up classes',
      description: 'Add grades, streams & class structure',
      icon: BookOpen,
      path: '/classes',
    },
    {
      id: 'students',
      label: 'Set up students',
      description: 'Register and enroll students',
      icon: UserPlus,
      path: '/students?action=add',
    },
    {
      id: 'teachers',
      label: 'Set up teachers',
      description: 'Invite and manage teaching staff',
      icon: GraduationCap,
      path: '/teachers?action=add',
    },
    {
      id: 'subjects',
      label: 'Set up subjects',
      description: 'Configure curriculum subjects',
      icon: ClipboardList,
      path: '/classes?tab=subjects',
    },
    {
      id: 'school-details',
      label: 'School details',
      description: 'Complete your school profile',
      icon: School,
      path: '/onboarding',
    },
  ]
}

export function SchoolNavbar({
  userName,
  userRole,
  isSidebarMinimized,
  isMobileSidebarOpen,
  onToggleMobileSidebar,
  onToggleSidebarMinimize,
}: SchoolNavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { signOut, isSigningOut } = useSignout()
  const setupSteps = buildSetupSteps()
  const showSetupInNav = !pathname?.endsWith('/dashboard')
  
  const getInitials = (name: string) => {
    if (!name || name.trim() === '') return 'U'
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const newItemOptions = [
    {
      title: 'New Class',
      icon: BookOpen,
      description: 'Create a new class or section',
      action: () => router.push('/classes')
    },
    {
      title: 'New Teacher',
      icon: GraduationCap,
      description: 'Add a new teacher to the system',
      action: () => router.push('/teachers?action=add')
    },
    {
      title: 'New Student',
      icon: UserPlus,
      description: 'Register a new student',
      action: () => router.push('/students?action=add')
    },
    {
      title: 'New Subject',
      icon: ClipboardList,
      description: 'Add a new subject or course',
      action: () => router.push('/classes?tab=subjects')
    },
    {
      title: 'New Department',
      icon: School,
      description: 'Create a new department',
      action: () => router.push('/onboarding')
    }
  ]

  const completedSteps = 2
  const totalSteps = setupSteps.length
  const progressPercent = Math.round((completedSteps / totalSteps) * 100)
  const currentStepIndex = Math.min(completedSteps, setupSteps.length - 1)
  const currentStep = setupSteps[currentStepIndex]

  const handleSetupStepClick = (step: SetupStep) => {
    router.push(step.path)
  }

  const iconButtonClass =
    'h-9 w-9 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700/80 transition-all duration-200'

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      {/* Accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="h-[4.25rem] flex items-center justify-between gap-4 px-4 lg:px-5">
        {/* Left cluster */}
        <div className="flex items-center gap-2 min-w-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(iconButtonClass, 'md:hidden')}
            onClick={onToggleMobileSidebar}
          >
            <Menu className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(iconButtonClass, 'hidden md:flex')}
            onClick={onToggleSidebarMinimize}
            title={isSidebarMinimized ? "Expand sidebar" : "Minimize sidebar"}
          >
            {isSidebarMinimized ? (
              <PanelLeftOpen className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            ) : (
              <PanelLeftClose className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            )}
          </Button>

          {/* Setup progress — hidden on dashboard (banner lives there instead) */}
          {showSetupInNav && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="hidden lg:flex items-center gap-3 ml-1 pl-3 border-l border-slate-200/70 dark:border-slate-800/80 rounded-lg pr-2 py-1 -my-1 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group text-left"
                aria-label="Open setup steps"
              >
                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                  <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="text-slate-100 dark:text-slate-800"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray={`${progressPercent} 100`}
                      pathLength={100}
                      className="text-primary transition-all duration-700 ease-out"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-primary tabular-nums">
                    {completedSteps}/{totalSteps}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {currentStep.label}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    Click to continue setup
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-80 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-2"
            >
              <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                School setup
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />
              {setupSteps.map((step, index) => {
                const StepIcon = step.icon
                const isComplete = index < completedSteps
                const isCurrent = index === currentStepIndex

                return (
                  <DropdownMenuItem
                    key={step.id}
                    className={cn(
                      'flex items-start gap-3 px-3 py-2.5 rounded-xl cursor-pointer',
                      isCurrent && 'bg-primary/5 dark:bg-primary/10',
                    )}
                    onSelect={() => handleSetupStepClick(step)}
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                        isComplete
                          ? 'bg-primary/10 text-primary'
                          : isCurrent
                            ? 'bg-primary text-white shadow-sm shadow-primary/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500',
                      )}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <StepIcon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            Next
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {step.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0 mt-1" />
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          )}
        </div>

        {/* Right cluster — unified toolbar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/80 shadow-sm">
            <TermsDropdown />

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm" 
                  className="h-9 px-3.5 gap-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-sm shadow-primary/20 font-medium"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">New</span>
                  <ChevronDown className="h-3 w-3 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-72 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-2"
              >
                <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Create New
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />
                {newItemOptions.map((option, index) => {
                  const Icon = option.icon
                  return (
                    <DropdownMenuItem
                      key={index}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer rounded-xl"
                      onClick={option.action}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/15 ring-1 ring-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {option.title}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {option.description}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(iconButtonClass, 'relative bg-white/60 dark:bg-slate-950/40')}
                >
                  <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-80 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-2"
              >
                <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Notifications
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />
                <DropdownMenuItem className="flex flex-col items-start px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer rounded-xl">
                  <div className="flex items-start gap-3 w-full">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">New Student Registration</span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sarah Johnson has submitted enrollment forms</p>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">2 minutes ago</span>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer rounded-xl">
                  <div className="flex items-start gap-3 w-full">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-orange-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Attendance Alert</span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">3 students marked absent in Class 10A</p>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">1 hour ago</span>
                    </div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="hidden md:flex items-center gap-2.5 h-10 pl-1.5 pr-2.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-slate-200/60 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 hover:shadow-sm transition-all duration-200"
              >
                <Avatar className="h-8 w-8 ring-2 ring-primary/20 ring-offset-1 ring-offset-white dark:ring-offset-slate-950">
                  <AvatarFallback className="bg-gradient-to-br from-primary/90 to-primary text-white font-semibold text-xs">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start min-w-0 leading-none">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[7rem] lg:max-w-[9rem]">
                    {userName || 'User'}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 truncate max-w-[7rem] lg:max-w-[9rem] mt-0.5">
                    {formatRole(userRole)}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-2"
            >
              <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />
              <DropdownMenuItem className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer rounded-xl text-sm">
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer rounded-xl text-sm">
                School Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer rounded-xl text-sm">
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />
              <DropdownMenuItem 
                onClick={signOut}
                disabled={isSigningOut}
                className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer rounded-xl text-sm disabled:opacity-50"
              >
                {isSigningOut ? 'Signing Out...' : 'Log out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile profile */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={iconButtonClass}>
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-gradient-to-br from-primary/90 to-primary text-white font-semibold text-xs">
                      {getInitials(userName || 'User')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-2"
              >
                <DropdownMenuItem className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer rounded-xl text-sm">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer rounded-xl text-sm">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />
                <DropdownMenuItem 
                  onClick={signOut}
                  disabled={isSigningOut}
                  className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer rounded-xl text-sm disabled:opacity-50"
                >
                  {isSigningOut ? 'Signing Out...' : 'Log out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
