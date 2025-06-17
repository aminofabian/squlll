import { Header } from "@/components/Header"
import { AuthWrapper } from "@/components/auth/AuthFormWrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

// SQUL Logo Component
function SQULLogo() {
  return (
    <div className="flex items-center justify-center mb-12">
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-b from-primary to-primary-dark border-2 border-primary/20 flex items-center justify-center shadow-2xl rounded-xl">
          <div className="text-white font-mono font-bold text-2xl tracking-wider">SQUL</div>
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-background"></div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
          <div className="max-w-5xl mx-auto space-y-12">
            <SQULLogo />
            
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-primary/5 border border-primary/20 text-xs font-mono tracking-wide text-primary uppercase">
                School Management System
              </div>
              
              <h1 className="text-6xl md:text-7xl font-mono font-bold tracking-tight">
                <span className="text-slate-900 dark:text-slate-100">SQ</span>
                <span className="text-primary">UL</span>
              </h1>
              
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
                Comprehensive School Management Solution
                <br />
                Student Information • Academic Records • Administrative Tools
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-14 px-12 min-w-[200px] font-mono tracking-wide uppercase text-sm">
                  login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" className="h-14 px-12 min-w-[200px] font-mono tracking-wide uppercase text-sm">
                  Try if for Free
                </Button>
              </Link>
            </div>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 max-w-5xl mx-auto">
              <div className="p-8 border-2 border-primary/20 bg-primary/5 rounded-xl">
                <div className="w-12 h-12 bg-primary flex items-center justify-center mb-6 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 3.727 1.51a1 1 0 00.788 0l7-3a1 1 0 000-1.84l-7-3z" />
                  </svg>
                </div>
                <h3 className="font-mono font-bold text-lg mb-3 uppercase tracking-wide">Student Management</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Complete student information system with enrollment, attendance tracking, and performance monitoring
                </p>
              </div>
              
              <div className="p-8 border-2 border-primary/20 bg-primary/5 rounded-xl">
                <div className="w-12 h-12 bg-primary flex items-center justify-center mb-6 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-mono font-bold text-lg mb-3 uppercase tracking-wide">Academic Records</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Comprehensive grade management, transcript generation, and academic progress tracking
                </p>
              </div>
              
              <div className="p-8 border-2 border-primary/20 bg-primary/5 rounded-xl">
                <div className="w-12 h-12 bg-primary flex items-center justify-center mb-6 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <h3 className="font-mono font-bold text-lg mb-3 uppercase tracking-wide">Staff Portal</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Teacher and staff management with scheduling, attendance, and performance evaluation tools
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication Section */}
        <div className="flex justify-center pb-32">
          <div className="w-full max-w-md">
            <div className="text-center mb-12 space-y-4">
              <div className="inline-block px-3 py-1 bg-primary/5 text-xs font-mono tracking-wider text-primary uppercase">
                Secure Access
              </div>
              <h2 className="text-3xl font-mono font-bold uppercase tracking-wide">Administrator Panel</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Authorized personnel only
              </p>
            </div>
            
            <div className="relative">
              <AuthWrapper 
                title="System Authentication" 
                description="Enter administrator credentials to access the control panel"
              >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-xs font-mono uppercase tracking-wide">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      className="mt-1"
                      placeholder="admin@school.edu"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password" className="text-xs font-mono uppercase tracking-wide">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <input 
                        id="remember" 
                        type="checkbox" 
                        className="w-4 h-4 border-2 border-primary/20 bg-primary/5"
                      />
                      <Label htmlFor="remember" className="text-xs font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Remember Session
                      </Label>
                    </div>
                    
                    <Link 
                      href="/forgot-password" 
                      className="text-xs font-mono text-primary hover:text-primary/80 uppercase tracking-wide"
                    >
                      Reset Access
                    </Link>
                  </div>

                  <Button className="w-full h-12 mt-8 font-mono tracking-wide uppercase text-sm">
                    Authenticate & Access
                  </Button>
                </div>
              </AuthWrapper>
              
              <div className="absolute -top-3 -right-3">
                <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 dark:bg-emerald-950 border-2 border-emerald-200 dark:border-emerald-800">
                  <div className="w-3 h-3 bg-emerald-500"></div>
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                    SECURE CONNECTION
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}