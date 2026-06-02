'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Menu, 
  ChevronDown,
  Plus,
  GraduationCap,
  UserPlus,
  BookOpen,
  ClipboardList,
  School,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Search,
  HelpCircle,
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
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { getSchoolPageTitle } from '@/lib/school/schoolShell'

interface SchoolNavbarProps {
  userName: string
  userRole: string
  isMobileSidebarOpen: boolean
  onToggleMobileSidebar: () => void
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
  isMobileSidebarOpen,
  onToggleMobileSidebar,
}: SchoolNavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { signOut, isSigningOut } = useSignout()
  const setupSteps = buildSetupSteps()
  const showSetupInNav = !pathname?.endsWith('/dashboard')
  const pageTitle = getSchoolPageTitle(pathname ?? '')
  
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
    'h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors'

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-5">
        {/* Left */}
        <div className="flex min-w-0 items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(iconButtonClass, 'md:hidden')}
            onClick={onToggleMobileSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <h1 className="hidden truncate text-sm font-semibold text-slate-800 dark:text-slate-100 sm:block md:hidden lg:block">
            {pageTitle}
          </h1>
        </div>

        {/* Search — Monday-style center bar */}
        <div className="mx-auto hidden max-w-md flex-1 sm:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search for anything..."
              className="h-9 rounded-md border-slate-200/80 bg-[#f5f6f8]/80 pl-9 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-[#0073ea]/40 focus-visible:ring-[#0073ea]/20 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
        </div>

        {/* Setup progress — compact on non-dashboard pages */}
        {showSetupInNav && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="hidden items-center gap-2 rounded-lg border border-slate-200/70 bg-[#f5f6f8]/50 px-2.5 py-1.5 text-left transition-colors hover:bg-[#f5f6f8] lg:flex dark:border-slate-700 dark:bg-slate-900"
                aria-label="Open school setup steps"
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#0073ea]" />
                <span className="max-w-[8rem] truncate text-xs font-medium text-slate-700 dark:text-slate-200">
                  {currentStep.label}
                </span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" />
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

        {/* Right toolbar */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <div className="hidden items-center gap-1 md:flex">
            <TermsDropdown />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm" 
                  className="h-8 gap-1 rounded-md bg-[#0073ea] px-3 text-white shadow-none hover:bg-[#0060c2]"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">New</span>
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
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#dcebfd]">
                        <Icon className="h-4 w-4 text-[#0073ea]" />
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

            <NotificationBell messagesHref="/communication" iconButtonClass={iconButtonClass} />

            <Button variant="ghost" size="icon" className={iconButtonClass} title="Help">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="hidden h-9 items-center gap-2 rounded-lg px-2 hover:bg-slate-100 md:flex dark:hover:bg-slate-800"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-[#dcebfd] text-xs font-semibold text-[#0073ea]">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-[6rem] truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                  {userName || 'User'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
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
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#dcebfd] text-xs font-semibold text-[#0073ea]">
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
