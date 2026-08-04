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
} from '@/components/ui/dropdown-menu'
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
      id: 'teachers',
      label: 'Set up teachers',
      description: 'Invite and manage teaching staff',
      icon: GraduationCap,
      path: '/teachers?action=add',
    },
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
  userRole: _userRole,
  isMobileSidebarOpen: _isMobileSidebarOpen,
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
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const newItemOptions = [
    {
      title: 'New Teacher',
      icon: GraduationCap,
      description: 'Add a new teacher to the system',
      action: () => router.push('/teachers?action=add'),
    },
    {
      title: 'New Class',
      icon: BookOpen,
      description: 'Create a new class or section',
      action: () => router.push('/classes'),
    },
    {
      title: 'New Student',
      icon: UserPlus,
      description: 'Register a new student',
      action: () => router.push('/students?action=add'),
    },
    {
      title: 'New Subject',
      icon: ClipboardList,
      description: 'Add a new subject or course',
      action: () => router.push('/classes?tab=subjects'),
    },
    {
      title: 'New Department',
      icon: School,
      description: 'Create a new department',
      action: () => router.push('/onboarding'),
    },
  ]

  const completedSteps = 2
  const currentStepIndex = Math.min(completedSteps, setupSteps.length - 1)
  const currentStep = setupSteps[currentStepIndex]

  const handleSetupStepClick = (step: SetupStep) => {
    router.push(step.path)
  }

  const iconButtonClass =
    'h-8 w-8 rounded-none text-[#1a4d42]/55 hover:bg-[#f3f7f5] hover:text-[#0a1f1a] dark:hover:bg-white/5 dark:hover:text-white transition-colors'

  const menuContentClass =
    'rounded-none border border-[#1a4d42]/15 bg-white shadow-[6px_6px_0_0_rgba(10,31,26,0.08)] dark:border-white/10 dark:bg-[#0c1a17] dark:shadow-[6px_6px_0_0_rgba(0,0,0,0.4)] p-1.5'

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-[#1a4d42]/12 bg-[#f8fbfa]/95 backdrop-blur-md dark:border-white/10 dark:bg-[#071411]/95">
      <div className="flex h-12 items-center gap-3 px-3 lg:px-5">
        {/* Left — page mark */}
        <div className="flex min-w-0 items-center gap-2.5">
          <Button
            variant="ghost"
            size="icon"
            className={cn(iconButtonClass, 'md:hidden')}
            onClick={onToggleMobileSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden min-w-0 items-center gap-2.5 sm:flex md:hidden lg:flex">
            <span
              className="hidden h-6 w-1 shrink-0 bg-[#246a59] lg:block"
              aria-hidden
            />
            <div className="min-w-0">
              <p className="hidden text-[9px] font-semibold uppercase tracking-[0.16em] text-[#246a59] xl:block">
                Workspace
              </p>
              <h1 className="truncate font-display text-lg leading-none tracking-tight text-[#0a1f1a] dark:text-white">
                {pageTitle}
              </h1>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mx-auto hidden max-w-sm flex-1 md:flex lg:max-w-md">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#1a4d42]/40" />
            <Input
              placeholder="Search school…"
              className="h-8 rounded-none border-[#1a4d42]/15 bg-white pl-8 text-sm shadow-none placeholder:text-[#1a4d42]/40 focus-visible:border-[#246a59]/50 focus-visible:ring-[#246a59]/20 dark:border-white/15 dark:bg-[#0c1a17]"
            />
          </div>
        </div>

        {/* Setup progress */}
        {showSetupInNav && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="hidden items-center gap-2 border border-[#1a4d42]/15 bg-white px-2.5 py-1.5 text-left transition-colors hover:border-[#246a59]/40 hover:bg-[#f3f7f5] lg:flex dark:border-white/15 dark:bg-[#0c1a17]"
                aria-label="Open school setup steps"
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#246a59]" />
                <span className="max-w-[8rem] truncate text-xs font-medium text-[#0a1f1a] dark:text-white">
                  {currentStep.label}
                </span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#1a4d42]/40" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className={cn('w-80', menuContentClass)}>
              <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1a4d42]/50">
                School setup
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#1a4d42]/10 dark:bg-white/10 my-1" />
              {setupSteps.map((step, index) => {
                const StepIcon = step.icon
                const isComplete = index < completedSteps
                const isCurrent = index === currentStepIndex

                return (
                  <DropdownMenuItem
                    key={step.id}
                    className={cn(
                      'flex items-start gap-3 rounded-none px-2.5 py-2 cursor-pointer',
                      isCurrent && 'bg-[#246a59]/8 dark:bg-[#246a59]/15',
                    )}
                    onSelect={() => handleSetupStepClick(step)}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center border',
                        isComplete
                          ? 'border-[#246a59]/25 bg-[#246a59]/10 text-[#246a59]'
                          : isCurrent
                            ? 'border-[#0a1f1a] bg-[#0a1f1a] text-white'
                            : 'border-[#1a4d42]/15 bg-[#f3f7f5] text-[#1a4d42]/50 dark:bg-[#071411]',
                      )}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <StepIcon className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#0a1f1a] dark:text-white">
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className="bg-[#246a59]/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#246a59]">
                            Next
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-xs text-[#1a4d42]/50">
                        {step.description}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-[#1a4d42]/25" />
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Right toolbar */}
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
          <div className="hidden items-center gap-1.5 md:flex">
            <TermsDropdown />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  className="h-8 gap-1 rounded-none bg-[#0a1f1a] px-2.5 text-white shadow-none hover:bg-[#246a59]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">New</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={cn('w-72', menuContentClass)}>
                <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1a4d42]/50">
                  Create new
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#1a4d42]/10 dark:bg-white/10 my-1" />
                {newItemOptions.map((option, index) => {
                  const Icon = option.icon
                  return (
                    <DropdownMenuItem
                      key={index}
                      className="flex cursor-pointer items-center gap-3 rounded-none px-2.5 py-2 hover:bg-[#f3f7f5] dark:hover:bg-white/5"
                      onClick={option.action}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#246a59]/20 bg-[#246a59]/10">
                        <Icon className="h-3.5 w-3.5 text-[#246a59]" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium text-[#0a1f1a] dark:text-white">
                          {option.title}
                        </span>
                        <span className="truncate text-xs text-[#1a4d42]/50">
                          {option.description}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <NotificationBell
              messagesHref="/communication"
              iconButtonClass={iconButtonClass}
            />

            <Button variant="ghost" size="icon" className={iconButtonClass} title="Help">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="hidden h-8 items-center gap-2 rounded-none border border-transparent px-1.5 hover:border-[#1a4d42]/12 hover:bg-[#f3f7f5] md:flex dark:hover:bg-white/5"
              >
                <Avatar className="h-6 w-6 rounded-none">
                  <AvatarFallback className="rounded-none bg-[#0a1f1a] text-[10px] font-semibold text-white">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-[6rem] truncate text-xs font-medium text-[#0a1f1a] dark:text-white">
                  {userName || 'User'}
                </span>
                <ChevronDown className="h-3 w-3 text-[#1a4d42]/40" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={cn('w-56', menuContentClass)}>
              <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1a4d42]/50">
                My account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#1a4d42]/10 dark:bg-white/10 my-1" />
              <DropdownMenuItem className="cursor-pointer rounded-none px-2.5 py-2 text-sm">
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-none px-2.5 py-2 text-sm">
                School Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-none px-2.5 py-2 text-sm">
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#1a4d42]/10 dark:bg-white/10 my-1" />
              <DropdownMenuItem
                onClick={signOut}
                disabled={isSigningOut}
                className="cursor-pointer rounded-none px-2.5 py-2 text-sm text-red-600 disabled:opacity-50 dark:text-red-400"
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
                  <Avatar className="h-7 w-7 rounded-none">
                    <AvatarFallback className="rounded-none bg-[#0a1f1a] text-[10px] font-semibold text-white">
                      {getInitials(userName || 'User')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={cn('w-48', menuContentClass)}>
                <DropdownMenuItem className="cursor-pointer rounded-none px-2.5 py-2 text-sm">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer rounded-none px-2.5 py-2 text-sm">
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#1a4d42]/10 dark:bg-white/10 my-1" />
                <DropdownMenuItem
                  onClick={signOut}
                  disabled={isSigningOut}
                  className="cursor-pointer rounded-none px-2.5 py-2 text-sm text-red-600 disabled:opacity-50 dark:text-red-400"
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
