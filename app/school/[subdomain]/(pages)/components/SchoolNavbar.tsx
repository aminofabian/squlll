'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
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
  PanelLeftClose
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

interface SchoolNavbarProps {
  userName: string
  userRole: string
  isSidebarMinimized: boolean
  isMobileSidebarOpen: boolean
  onToggleMobileSidebar: () => void
  onToggleSidebarMinimize: () => void
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
  const { signOut, isSigningOut } = useSignout()
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name || name.trim() === '') {
      return 'U' // Default initial for unknown user
    }
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
      action: () => {
        router.push('./classes/new')
      }
    },
    {
      title: 'New Teacher',
      icon: GraduationCap,
      description: 'Add a new teacher to the system',
      action: () => {
        router.push('./teachers/new')
      }
    },
    {
      title: 'New Student',
      icon: UserPlus,
      description: 'Register a new student',
      action: () => {
        router.push('./students/new')
      }
    },
    {
      title: 'New Subject',
      icon: ClipboardList,
      description: 'Add a new subject or course',
      action: () => {
        router.push('./settings/subjects/new')
      }
    },
    {
      title: 'New Department',
      icon: School,
      description: 'Create a new department',
      action: () => {
        router.push('./settings/departments/new')
      }
    }
  ]

  // Progress indicator state (hardcoded for now)
  const completedSteps = 2;
  const totalSteps = 5;

  // Progress steps definition
  const progressSteps = [
    { label: 'Set up classes', icon: BookOpen },
    { label: 'Set up students', icon: UserPlus },
    { label: 'Set up teachers', icon: GraduationCap },
    { label: 'Set up subjects', icon: ClipboardList },
    { label: 'School details', icon: School },
  ];
  const currentStepIndex = Math.min(completedSteps, progressSteps.length - 1);
  const currentStep = progressSteps[currentStepIndex];

  // ProgressIndicator component (themed for school management, blends with navbar)
  const ProgressIndicator = () => (
    <div className="flex items-center bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 rounded-xl border border-primary/20 px-4 py-2.5 mr-6 h-14 shadow-sm">
      <div className="relative flex items-center justify-center w-10 h-10 mr-3">
        <svg className="w-10 h-10" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="rgb(241 245 249)" // slate-100
            strokeWidth="3"
            className="opacity-60"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeDasharray={2 * Math.PI * 16}
            strokeDashoffset={2 * Math.PI * 16 * (1 - completedSteps / totalSteps)}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <span className="absolute text-xs font-bold text-primary select-none">
          {completedSteps}/{totalSteps}
        </span>
      </div>
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary leading-tight">
          {currentStep.icon && <currentStep.icon className="w-4 h-4 text-primary/80" />}
          <span className="truncate">{currentStep.label}</span>
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-400 leading-tight truncate">
          Complete setup to unlock features
        </div>
      </div>
    </div>
  );

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-700/60 h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden h-9 w-9 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 rounded-lg"
          onClick={onToggleMobileSidebar}
        >
          <Menu className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        </Button>
        
        {/* Desktop sidebar toggle button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="hidden md:flex h-9 w-9 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 rounded-lg"
          onClick={onToggleSidebarMinimize}
          title={isSidebarMinimized ? "Expand sidebar" : "Minimize sidebar"}
        >
          {isSidebarMinimized ? (
            <PanelLeftOpen className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          ) : (
            <PanelLeftClose className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          )}
        </Button>
        
        {/* Progress Indicator Section */}
        <div className="hidden lg:block ml-2">
          <ProgressIndicator />
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="hidden md:flex items-center space-x-2">
          {/* Terms Dropdown - Moved to right */}
          <div className="mr-2">
            <TermsDropdown  />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="default" 
                size="sm" 
                className="h-9 px-3 space-x-2 transition-all duration-200 rounded-lg shadow-sm bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 text-white" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 text-white">New</span>
                <ChevronDown className="h-3 w-3 text-slate-100 dark:text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-64 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg rounded-xl p-2"
            >
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Create New
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-700 my-1" />
              {newItemOptions.map((option, index) => {
                const Icon = option.icon
                return (
                  <DropdownMenuItem
                    key={index}
                    className="flex items-center space-x-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer rounded-lg"
                    onClick={option.action}
                  >
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700">
                      <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 rounded-lg relative"
              >
                <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-80 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg rounded-xl p-2"
            >
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Notifications
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-700 my-1" />
              <DropdownMenuItem className="flex flex-col items-start px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer rounded-lg">
                <div className="flex items-start space-x-3 w-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">New Student Registration</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sarah Johnson has submitted enrollment forms</p>
                    <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">2 minutes ago</span>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer rounded-lg">
                <div className="flex items-start space-x-3 w-full">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Attendance Alert</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">3 students marked absent in Class 10A</p>
                    <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">1 hour ago</span>
                  </div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center space-x-3 px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 rounded-lg h-10"
              >
                <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                  <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-700 dark:text-slate-300 font-semibold text-sm">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate max-w-24">
                    {userName || 'User'}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-24">
                    {userRole || 'Member'}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-slate-500 dark:text-slate-400 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg rounded-xl p-2"
            >
              <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-700 my-1" />
              <DropdownMenuItem className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer rounded-lg text-sm">
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer rounded-lg text-sm">
                School Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer rounded-lg text-sm">
                Help & Support
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-700 my-1" />
              <DropdownMenuItem 
                onClick={signOut}
                disabled={isSigningOut}
                className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 cursor-pointer rounded-lg text-sm disabled:opacity-50"
              >
                {isSigningOut ? 'Signing Out...' : 'Log out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 rounded-lg">
                <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                  <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-700 dark:text-slate-300 font-semibold text-sm">
                    {getInitials(userName || 'User')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg rounded-xl p-2"
            >
              <DropdownMenuItem className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer rounded-lg text-sm">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer rounded-lg text-sm">
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-700 my-1" />
              <DropdownMenuItem 
                onClick={signOut}
                disabled={isSigningOut}
                className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 cursor-pointer rounded-lg text-sm disabled:opacity-50"
              >
                {isSigningOut ? 'Signing Out...' : 'Log out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
