"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useSignout } from "@/lib/hooks/useSignout"
import { 
  LayoutDashboard, 
  Store, 
  Key, 
  FileText, 
  Settings,
  Activity,
  Shield,
  LogOut,
  Users,
  GraduationCap,
  CalendarDays,
  ClipboardList,
  BookOpen,
  TrendingUp,
  School,
  Home,
  UserCheck,
  Award,
  DollarSign,
  UserPlus,
  MessageSquare,
  BarChart,
  Calendar,
  ChevronDown,
  PanelLeftOpen,
  PanelLeftClose,
  // New more representative icons
  Building2,
  Clock,
  Users2,
  Briefcase,
  CreditCard,
  FileCheck,
  BookMarked,
  CalendarCheck,
  TrendingDown,
  UserCog,
  Mail,
  ChartLine,
  UserRoundPlus,
  Medal,
  CheckSquare,
  Trophy,
  MessageCircle,
  PieChart,
  MoreHorizontal
} from "lucide-react"
import { LucideIcon } from "lucide-react"

interface SchoolSidebarProps {
  className?: string;
  subdomain: string;
  schoolName: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

interface NavigationItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface NavigationCategory {
  category: string;
  items: NavigationItem[];
}

// State for drawer visibility
interface DrawerState {
  isOpen: boolean;
}

// Main navigation items that will always be visible
const mainNavigationItems: NavigationItem[] = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard, // More specific than Home for dashboard/overview
  },
  {
    title: "Classes",
    href: "/classes",
    icon: Building2, // Represents classroom/building better than BookOpen
  },
  {
    title: "Timetable",
    href: "/timetable",
    icon: Clock, // More representative of time scheduling than Calendar
  },
  {
    title: "Students",
    href: "/students",
    icon: Users2, // More specific student group icon
  },
  {
    title: "Teachers",
    href: "/teachers",
    icon: GraduationCap, // Keep this as it's already perfect for teachers
  },
  {
    title: "Parents",
    href: "/parents",
    icon: Users, // Keep Users but distinguish from students
  },
  {
    title: "Staff",
    href: "/staff",
    icon: Briefcase, // More representative of staff/employees than UserCheck
  },
  {
    title: "Fees & Invoices",
    href: "/fees",
    icon: CreditCard, // More specific for payments/billing than DollarSign
  },
  {
    title: "Exams",
    href: "/exams",
    icon: FileCheck, // More representative of exam/testing than ClipboardList
  }
];

// Additional items that will be shown in the "More" drawer
const moreNavigationItems: NavigationItem[] = [
  {
    title: "Curriculum",
    href: "/curriculum",
    icon: BookMarked, // More representative of structured curriculum than BookOpen
  },
  {
    title: "School Years",
    href: "/school-years",
    icon: CalendarCheck, // Better represents academic years/terms than School
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText, // Keep this as it's already good for reports
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: PieChart, // More representative of data analytics than BarChart
  },
  {
    title: "New Applications",
    href: "/admissions/applications",
    icon: UserRoundPlus, // More specific for new student applications
  },
  {
    title: "Enrollment",
    href: "/enrollment",
    icon: Medal, // Better represents achievement/enrollment than Award
  },
  {
    title: "Attendances",
    href: "/attendances",
    icon: CheckSquare, // More representative of attendance checking than UserCheck
  },
  {
    title: "Grading",
    href: "/grading",
    icon: Trophy, // More representative of grades/achievements than Award
  },
  {
    title: "Communication",
    href: "/communication",
    icon: MessageCircle, // More modern/friendly than MessageSquare
  }
];

// Keep the original navigation categories for reference
const navigationCategories: NavigationCategory[] = [
  {
    category: "Overview",
    items: [
      {
        title: "Home",
        href: "/dashboard",
        icon: Home,
      },
      {
        title: "Time Table",
        href: "/timetable",
        icon: Calendar,
      },
    ]
  },
  {
    category: "Academic",
    items: [
      {
        title: "Classes",
        href: "/classes",
        icon: BookOpen,
      },
      {
        title: "Curriculum",
        href: "/curriculum",
        icon: ClipboardList,
      },
      {
        title: "School Years",
        href: "/school-years",
        icon: School,
      },
    ]
  },
  {
    category: "People",
    items: [
      {
        title: "Students",
        href: "/students",
        icon: Users,
      },
      {
        title: "Teachers",
        href: "/teachers",
        icon: GraduationCap,
      },
      {
        title: "Staff",
        href: "/staff",
        icon: UserCheck,
      }
    ]
  },
  {
    category: "Administration",
    items: [
      {
        title: "Reports",
        href: "/reports",
        icon: FileText,
      },
      {
        title: "Analytics",
        href: "/analytics",
        icon: BarChart,
      }
    ]
  },
  {
    category: "Admissions",
    items: [
      {
        title: "New Applications",
        href: "/applications",
        icon: UserPlus,
      },
      {
        title: "Enrollment",
        href: "/enrollment",
        icon: Award,
      },
    ]
  },
  {
    category: "Operations",
    items: [
      {
        title: "Attendances",
        href: "/attendances",
        icon: UserCheck,
      },
      {
        title: "Grading",
        href: "/grading",
        icon: Award,
      },
      {
        title: "Fees & Invoices",
        href: "/fees",
        icon: DollarSign,
      },
    ]
  },
  {
    category: "Insights",
    items: [
      {
        title: "Reports",
        href: "/reports",
        icon: BarChart,
      },
      {
        title: "Communication",
        href: "/communication",
        icon: MessageSquare,
      },
    ]
  },
  {
    category: "Admin",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ]
  },
]

// Function to style school name creatively
const styleSchoolName = (name: string): string => {
  // Remove hyphens and split into words
  const words = name.replace(/-/g, ' ').split(' ');
  
  // Capitalize each word and join with spaces
  return words.map(word => word.toUpperCase()).join(' ');
};

// Function to style initials creatively
const getSchoolInitials = (schoolName: string): string => {
  const words = schoolName.replace(/-/g, ' ').split(' ');
  if (words.length === 1) {
    // For single word, take first two letters
    return words[0].substring(0, 2).toUpperCase();
  }
  // For multiple words, take first letter of first two words
  return words.slice(0, 2).map(word => word[0].toUpperCase()).join('');
};

// Function to generate a deterministic color based on school name
const getSchoolColor = (schoolName: string): { from: string; to: string } => {
  // Simple hash function to generate a number from the school name
  const hash = schoolName.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  // List of nice color pairs (from, to) for gradients
  const colorPairs = [
    { from: '#246a59', to: '#1a4d41' }, // Original SQUL green
    { from: '#4a5568', to: '#2d3748' }, // Slate
    { from: '#3182ce', to: '#2b6cb0' }, // Blue
    { from: '#805ad5', to: '#6b46c1' }, // Purple
    { from: '#dd6b20', to: '#c05621' }, // Orange
    { from: '#e53e3e', to: '#c53030' }, // Red
    { from: '#38a169', to: '#2f855a' }, // Green
    { from: '#d69e2e', to: '#b7791f' }, // Yellow
  ];
  
  // Select a color pair based on the hash
  return colorPairs[hash % colorPairs.length];
};

export const SchoolSidebar = ({ className, subdomain, schoolName, isMinimized = false, onToggleMinimize }: SchoolSidebarProps) => {
  const pathname = usePathname();
  const { signOut, isSigningOut } = useSignout();
  
  // State for the More drawer
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  
  // Generate school initials for logo
  const initials = getSchoolInitials(schoolName);
  
  // Generate school color for branding
  const { from: fromColor, to: toColor } = getSchoolColor(schoolName);
  
  // Replace [subdomain] in href with actual subdomain
  const getHref = (href: string) => {
    return href.replace("[subdomain]", subdomain);
  };
  
  // Toggle drawer visibility
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render drawer content until mounted to prevent hydration issues
  const shouldShowDrawer = isMounted && drawerOpen;

  return (
    <div className={cn(
      "flex flex-col h-full bg-white dark:bg-slate-900 shadow-xl border-r-2 border-primary/20",
      className
    )}>
      {/* Header with School Logo */}
      <div className={`bg-primary/5 border-b-2 border-primary/20 ${isMinimized ? 'p-2' : 'p-4'}`}>
        <Link href={`/school`} className="flex items-center gap-3 group relative">
          <div className="relative">
            {/* Main logo container with stacked layout */}
            <div 
              className="w-12 h-12 rounded-2xl shadow-lg flex flex-col items-center justify-center transform transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-xl group-hover:rotate-3 relative z-10 overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${fromColor}, ${toColor})` 
              }}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-4 h-4 bg-white/10 rounded-bl-xl" />
              <div className="absolute bottom-0 left-0 w-3 h-3 bg-black/10 rounded-tr-lg" />
              
              {/* School initials - split into two lines for design */}
              <div className="flex flex-col items-center justify-center h-full relative z-10">
                <div className="text-white font-mono font-black text-sm tracking-wider leading-none">
                  {getSchoolInitials(schoolName).split('').join('\n')}
                </div>
                <div className="w-3 h-0.5 bg-white/30 my-0.5 rounded-full" />
                <div className="text-[0.5rem] text-white/70 font-semibold tracking-wider">EDU</div>
              </div>

              {/* Inner glow and patterns */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  background: `radial-gradient(circle at 70% 30%, ${fromColor}00, ${toColor} 70%)`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            </div>
            
            {/* Subtle glow effect */}
            <div 
              className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-300"
              style={{ 
                background: `linear-gradient(135deg, ${fromColor}, ${toColor})` 
              }}
            />
          </div>

          {/* School name and details with refined typography - hidden when minimized */}
          {!isMinimized && (
            <div className="relative py-0.5">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono font-bold text-sm tracking-[0.15em] text-slate-900 dark:text-slate-100 relative group-hover:translate-x-1 transition-all duration-300">
                    {styleSchoolName(schoolName)}
                    {/* Animated underline */}
                    <div 
                      className="absolute bottom-0 left-0 w-0 h-px group-hover:w-full transition-all duration-300"
                      style={{ 
                        background: `linear-gradient(to right, ${fromColor}, ${toColor})` 
                      }}
                    />
                  </span>
                  <div 
                    className="text-[0.6rem] font-medium px-1 rounded"
                    style={{ color: fromColor }}
                  >
                    PRO
                  </div>
                </div>
                
                {/* Tagline with dot separator */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span 
                    className="text-[0.65rem] tracking-wider opacity-60 group-hover:opacity-90 transition-all duration-300"
                    style={{ color: fromColor }}
                  >
                    ACADEMY
                  </span>
                </div>
              </div>
            </div>
          )}
        </Link>
        
        {/* Toggle button for minimize/expand */}
        {onToggleMinimize && (
          <button
            onClick={onToggleMinimize}
            className={`mt-2 w-full flex items-center justify-center p-2 rounded-lg bg-white dark:bg-slate-800 border-2 border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 ${
              isMinimized ? 'mt-2' : 'mt-3'
            }`}
            title={isMinimized ? "Expand sidebar" : "Minimize sidebar"}
          >
            {isMinimized ? (
              <PanelLeftOpen className="h-4 w-4 text-primary" />
            ) : (
              <PanelLeftClose className="h-4 w-4 text-primary" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto ${isMinimized ? 'p-2' : 'p-4'} space-y-1`}>
        <div className="border-2 border-primary/20 bg-primary/5 rounded-xl overflow-hidden shadow-sm">
          <div className={`space-y-0.5 ${isMinimized ? 'p-1' : 'p-1.5'}`}>
            {/* Main Navigation Items */}
            {mainNavigationItems.map((item) => {
              const Icon = item.icon;
              const href = getHref(item.href);
              const isActive = pathname === href || 
                (href !== `/school/${subdomain}` && pathname.startsWith(href));
              
              return (
                <Link key={item.href} href={href} className="block">
                  <div 
                    className={cn(
                      "w-full flex items-center rounded-lg transition-all duration-200 relative group h-10", // Fixed height
                      isMinimized ? "px-2 py-2 justify-center" : "px-3 py-2",
                      isActive 
                        ? "bg-white dark:bg-slate-800 shadow-md text-slate-900 dark:text-white" 
                        : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm"
                    )}
                  >
                    {/* Active indicator - left border */}
                    {isActive && (
                      <div 
                        className="absolute left-0 top-1 bottom-1 w-1 rounded-r-full"
                        style={{ backgroundColor: fromColor }}
                      />
                    )}
                    
                    {/* Colored background indicator on hover */}
                    <div 
                      className={cn(
                        "absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200",
                        isActive ? "opacity-5" : "group-hover:opacity-5"
                      )}
                      style={{ backgroundColor: fromColor }}
                    />
                    
                    {/* Icon with creative styling */}
                    <div 
                      className={cn(
                        "relative flex items-center justify-center w-8 h-8 overflow-hidden",
                        !isMinimized && "mr-3",
                        isActive 
                          ? "text-white" 
                          : "text-slate-600 dark:text-slate-400 group-hover:text-white"
                      )}
                    >
                      {/* Background gradient circle */}
                      <div 
                        className={cn(
                          "absolute inset-0 rounded-full transition-opacity duration-300",
                          isActive 
                            ? "opacity-100" 
                            : "opacity-0 group-hover:opacity-90"
                        )}
                        style={{ 
                          background: isActive 
                            ? `linear-gradient(135deg, ${fromColor}, ${toColor})` 
                            : `linear-gradient(135deg, ${fromColor}CC, ${toColor}CC)`
                        }}
                      />
                      
                      {/* Decorative ring */}
                      <div 
                        className={cn(
                          "absolute inset-0.5 rounded-full transition-opacity duration-300 border-2",
                          isActive 
                            ? "opacity-20" 
                            : "opacity-0 group-hover:opacity-20"
                        )}
                        style={{ borderColor: 'white' }}
                      />
                      
                      {/* Icon with subtle shadow */}
                      <Icon className={cn(
                        "h-4 w-4 z-10 transition-transform duration-300",
                        isActive 
                          ? "drop-shadow-md" 
                          : "group-hover:drop-shadow-md group-hover:scale-110"
                      )} />
                    </div>
                    
                    {/* Title with hover effect - hidden when minimized */}
                    {!isMinimized && (
                      <span className="flex-1 font-mono font-medium text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300">{item.title}</span>
                    )}
                    
                    {/* Subtle indicator dot for active item */}
                    {isActive && !isMinimized && (
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: fromColor }}></div>
                    )}
                  </div>
                </Link>
              );
            })}
            
            {/* More Button */}
            <div 
              className={cn(
                "w-full flex items-center rounded-lg transition-all duration-200 relative group cursor-pointer mt-2 h-10", // Fixed height
                isMinimized ? "px-2 py-2 justify-center" : "px-3 py-2",
                drawerOpen 
                  ? "bg-white dark:bg-slate-800 shadow-md text-slate-900 dark:text-white" 
                  : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm"
              )}
              onClick={toggleDrawer}
            >
              {/* Colored background indicator on hover */}
              <div 
                className={cn(
                  "absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200",
                  drawerOpen ? "opacity-5" : "group-hover:opacity-5"
                )}
                style={{ backgroundColor: fromColor }}
              />
              
              {/* Icon with creative styling */}
              <div 
                className={cn(
                  "relative flex items-center justify-center w-8 h-8 overflow-hidden",
                  !isMinimized && "mr-3",
                  drawerOpen 
                    ? "text-white" 
                    : "text-slate-600 dark:text-slate-400 group-hover:text-white"
                )}
              >
                {/* Background gradient circle */}
                <div 
                  className={cn(
                    "absolute inset-0 rounded-full transition-opacity duration-300",
                    drawerOpen 
                      ? "opacity-100" 
                      : "opacity-0 group-hover:opacity-90"
                  )}
                  style={{ 
                    background: drawerOpen 
                      ? `linear-gradient(135deg, ${fromColor}, ${toColor})` 
                      : `linear-gradient(135deg, ${fromColor}CC, ${toColor}CC)`
                  }}
                />
                
                {/* Decorative ring */}
                <div 
                  className={cn(
                    "absolute inset-0.5 rounded-full transition-opacity duration-300 border-2",
                    drawerOpen 
                      ? "opacity-20" 
                      : "opacity-0 group-hover:opacity-20"
                  )}
                  style={{ borderColor: 'white' }}
                />
                
                {/* Icon with subtle shadow */}
                <MoreHorizontal className={cn(
                  "h-4 w-4 z-10 transition-transform duration-300",
                  drawerOpen 
                    ? "drop-shadow-md" 
                    : "group-hover:drop-shadow-md group-hover:scale-110"
                )} />
              </div>
              
              {/* Title with hover effect - hidden when minimized */}
              {!isMinimized && (
                <span className="flex-1 font-mono font-medium text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300">More</span>
              )}
              
              {/* Animated chevron - hidden when minimized */}
              {!isMinimized && (
                <div 
                  className={cn(
                    "w-5 h-5 flex items-center justify-center transition-transform duration-300",
                    drawerOpen ? "rotate-180" : ""
                  )}
                >
                  <ChevronDown className="h-4 w-4" />
                </div>
              )}
            </div>
            
            {/* More Drawer - hidden when minimized */}
            {shouldShowDrawer && !isMinimized && (
              <div 
                className="mt-1 pl-3 ml-4 border-l-2 space-y-0.5 py-1"
                style={{ borderColor: `${fromColor}33` }} // Using hex opacity
              >
                {moreNavigationItems.map((item) => {
                  const Icon = item.icon;
                  const href = getHref(item.href);
                  const isActive = pathname === href || 
                    (href !== `/school/${subdomain}` && pathname.startsWith(href));
                  
                  return (
                    <Link key={item.href} href={href} className="block">
                      <div 
                        className={cn(
                          "w-full flex items-center px-2.5 py-1.5 rounded-md transition-all duration-200 relative group h-8", // Fixed height
                          isActive 
                            ? "bg-white dark:bg-slate-800 shadow-md text-slate-900 dark:text-white" 
                            : "text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm"
                        )}
                      >
                        {/* Active indicator - left border */}
                        {isActive && (
                          <div 
                            className="absolute left-0 top-0.5 bottom-0.5 w-0.5 rounded-r-full"
                            style={{ backgroundColor: fromColor }}
                          />
                        )}
                        
                        {/* Colored background indicator on hover */}
                        <div 
                          className={cn(
                            "absolute inset-0 rounded-md opacity-0 transition-opacity duration-200",
                            isActive ? "opacity-5" : "group-hover:opacity-5"
                          )}
                          style={{ backgroundColor: fromColor }}
                        />
                        
                        {/* Icon with creative styling - smaller version */}
                        <div 
                          className={cn(
                            "relative flex items-center justify-center w-6 h-6 mr-2 overflow-hidden",
                            isActive 
                              ? "text-white" 
                              : "text-slate-600 dark:text-slate-400 group-hover:text-white"
                          )}
                        >
                          {/* Background gradient circle */}
                          <div 
                            className={cn(
                              "absolute inset-0 rounded-full transition-opacity duration-300",
                              isActive 
                                ? "opacity-100" 
                                : "opacity-0 group-hover:opacity-90"
                            )}
                            style={{ 
                              background: isActive 
                                ? `linear-gradient(135deg, ${fromColor}, ${toColor})` 
                                : `linear-gradient(135deg, ${fromColor}CC, ${toColor}CC)`
                            }}
                          />
                          
                          {/* Decorative ring - thinner for smaller icons */}
                          <div 
                            className={cn(
                              "absolute inset-0.5 rounded-full transition-opacity duration-300 border",
                              isActive 
                                ? "opacity-20" 
                                : "opacity-0 group-hover:opacity-20"
                            )}
                            style={{ borderColor: 'white' }}
                          />
                          
                          {/* Icon with subtle shadow */}
                          <Icon className={cn(
                            "h-3 w-3 z-10 transition-transform duration-300",
                            isActive 
                              ? "drop-shadow-sm" 
                              : "group-hover:drop-shadow-sm group-hover:scale-110"
                          )} />
                        </div>
                        
                        {/* Title with hover effect */}
                        <span className="flex-1 font-mono font-medium text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300">{item.title}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* School Status */}
      <div className={`bg-primary/5 border-t-2 border-primary/20 ${isMinimized ? 'px-2 py-2' : 'px-4 py-4'}`}>
        {!isMinimized && (
          <>
            <div className="text-xs font-mono uppercase tracking-wide text-primary mb-3">
              School Status
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border-2 border-primary/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary shadow-sm"></div>
                  <span className="text-xs font-mono uppercase tracking-wide text-slate-700 dark:text-slate-300">ATTENDANCE</span>
                </div>
                <span className="text-xs font-mono text-primary">95.8%</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border-2 border-primary/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary shadow-sm"></div>
                  <span className="text-xs font-mono uppercase tracking-wide text-slate-700 dark:text-slate-300">PERFORMANCE</span>
                </div>
                <span className="text-xs font-mono text-primary">87.5%</span>
              </div>
            </div>
          </>
        )}
        
        {/* Settings Button */}
        <div className={isMinimized ? "mt-2" : "mt-4"}>
          <Link href={getHref("/school/[subdomain]/settings")} className="block">
            <div 
              className={cn(
                "w-full flex items-center rounded-lg transition-all duration-200 relative group bg-white dark:bg-slate-800 shadow-sm hover:shadow-md border-2 border-primary/20 hover:border-primary/30",
                isMinimized ? "px-2 py-2 justify-center" : "px-3 py-2.5"
              )}
            >
              {/* Colored background indicator on hover */}
              <div 
                className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-5"
                style={{ backgroundColor: fromColor }}
              />
              
              {/* Icon with creative styling */}
              <div 
                className={cn(
                  "relative flex items-center justify-center w-8 h-8 overflow-hidden",
                  !isMinimized && "mr-3"
                )}
              >
                {/* Background gradient circle */}
                <div 
                  className="absolute inset-0 rounded-full transition-opacity duration-300 opacity-0 group-hover:opacity-90"
                  style={{ 
                    background: `linear-gradient(135deg, ${fromColor}CC, ${toColor}CC)`
                  }}
                />
                
                {/* Static background for non-hover state */}
                <div 
                  className="absolute inset-0 rounded-full bg-slate-100 dark:bg-slate-700 group-hover:opacity-0 transition-opacity duration-300"
                />
                
                {/* Decorative ring */}
                <div 
                  className="absolute inset-0.5 rounded-full transition-opacity duration-300 border-2 opacity-0 group-hover:opacity-20"
                  style={{ borderColor: 'white' }}
                />
                
                {/* Icon with subtle shadow */}
                <Settings className="h-4 w-4 z-10 transition-all duration-300 text-slate-600 dark:text-slate-300 group-hover:text-white group-hover:drop-shadow-md group-hover:scale-110" />
              </div>
              
              {/* Title - hidden when minimized */}
              {!isMinimized && (
                <span className="flex-1 font-mono font-medium text-xs uppercase tracking-wide text-slate-800 dark:text-slate-200">Settings</span>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-primary/5 border-t-2 border-primary/20 space-y-2">
        <div 
          onClick={signOut}
          className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 relative group cursor-pointer bg-white dark:bg-slate-800 shadow-sm hover:shadow-md border-2 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 ${isSigningOut ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {/* Colored background indicator on hover */}
          <div 
            className="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-5"
            style={{ backgroundColor: '#e53e3e' }}
          />
          
          {/* Icon with creative styling */}
          <div 
            className="relative flex items-center justify-center w-8 h-8 mr-3 overflow-hidden"
          >
            {/* Background gradient circle */}
            <div 
              className="absolute inset-0 rounded-full transition-opacity duration-300 opacity-0 group-hover:opacity-90"
              style={{ 
                background: `linear-gradient(135deg, #f56565, #e53e3e)`
              }}
            />
            
            {/* Static background for non-hover state */}
            <div 
              className="absolute inset-0 rounded-full bg-red-50 dark:bg-red-900/20 group-hover:opacity-0 transition-opacity duration-300"
            />
            
            {/* Decorative ring */}
            <div 
              className="absolute inset-0.5 rounded-full transition-opacity duration-300 border-2 opacity-0 group-hover:opacity-20"
              style={{ borderColor: 'white' }}
            />
            
            {/* Icon with subtle shadow */}
            <LogOut className="h-4 w-4 z-10 transition-all duration-300 text-red-500 dark:text-red-400 group-hover:text-white group-hover:drop-shadow-md group-hover:scale-110" />
          </div>
          
          {/* Title */}
          <span className="flex-1 font-mono font-medium text-xs uppercase tracking-wide text-red-600 dark:text-red-400">
            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
          </span>
        </div>
      </div>
    </div>
  );
}
