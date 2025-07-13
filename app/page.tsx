'use client'

import { Header } from "@/components/Header"
import { AuthWrapper } from "@/components/auth/AuthFormWrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useStudentsStore } from "@/lib/stores/useStudentsStore"
import { useSchoolConfigStore } from "@/lib/stores/useSchoolConfigStore"
import { mockClasses } from "@/lib/data/mockclasses"
import { useEffect, useMemo } from "react"
import { Users, GraduationCap, BookOpen, TrendingUp, DollarSign, Award } from "lucide-react"

// SQUL Logo Component
function SQULLogo() {
  return (
    <div className="flex items-center justify-center mb-12">
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-b from-primary to-primary-dark border-2 border-primary/20 flex items-center justify-center shadow-2xl">
          <div className="text-white font-mono font-bold text-2xl tracking-wider">SQUL</div>
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-background"></div>
      </div>
    </div>
  )
}

export default function Home() {
  const { students } = useStudentsStore()
  const { config } = useSchoolConfigStore()
  
  // Calculate real statistics from the stores
  const stats = useMemo(() => {
    const totalStudents = students.length
    const activeStudents = students.filter(s => s.isActive).length
    const totalFeesOwed = students.reduce((sum, s) => sum + s.feesOwed, 0)
    const totalFeesPaid = students.reduce((sum, s) => sum + s.totalFeesPaid, 0)
    const totalClasses = mockClasses.filter(c => c.status === 'active').length
    const totalSubjects = config?.selectedLevels.reduce((sum, level) => sum + level.subjects.length, 0) || 0
    
    // Calculate gender distribution
    const maleStudents = students.filter(s => s.gender.toLowerCase() === 'male').length
    const femaleStudents = students.filter(s => s.gender.toLowerCase() === 'female').length
    
    // Calculate fee collection rate
    const feeCollectionRate = totalFeesPaid > 0 ? Math.round((totalFeesPaid / (totalFeesPaid + totalFeesOwed)) * 100) : 0
    
    return {
      totalStudents,
      activeStudents,
      totalFeesOwed,
      totalFeesPaid,
      totalClasses,
      totalSubjects,
      maleStudents,
      femaleStudents,
      feeCollectionRate
    }
  }, [students, config])

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
              <Link href="/register">
                <Button size="lg" className="h-14 px-12 min-w-[200px] font-mono tracking-wide uppercase text-sm">
                  Try if for Free
                </Button>
              </Link>
            </div>
                       
            
            {/* Class Environment Section */}
            <div className="relative h-[400px] w-full overflow-hidden my-24">
              <div className="absolute inset-0">
                <img 
                  src="/home/students-3518726_1920.jpg" 
                  alt="Students in classroom" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/40"></div>
              </div>
              <div className="relative h-full flex items-center">
                <div className="px-12">
                  <div className="max-w-2xl">
                    <h2 className="text-4xl font-mono font-bold text-white mb-6">
                      Design the Perfect Class Environment
                    </h2>
                    <p className="text-xl text-white/90 leading-relaxed">
                      Run your institution smoothly and efficiently with tools that scale from small academies to large institutions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 max-w-5xl mx-auto">
              <div className="p-8 border-2 border-primary/20 bg-primary/5">
                <div className="w-12 h-12 bg-primary flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 3.727 1.51a1 1 0 00.788 0l7-3a1 1 0 000-1.84l-7-3z" />
                  </svg>
                </div>
                <h3 className="font-mono font-bold text-lg mb-3 uppercase tracking-wide">Modern School Management, Simplified</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Go paperless with digital admissions, smart gradebooks, and seamless online fee collection — all in one powerful platform.</p>
              </div>
              
              <div className="p-8 border-2 border-primary/20 bg-primary/5">
                <div className="w-12 h-12 bg-primary flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-mono font-bold text-lg mb-3 uppercase tracking-wide">Academic Records</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Comprehensive grade management, transcript generation, and academic progress tracking
                </p>
              </div>
              
              <div className="p-8 border-2 border-primary/20 bg-primary/5">
                <div className="w-12 h-12 bg-primary flex items-center justify-center mb-6">
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

        {/* Empowerment Section */}
        <section className="relative py-32 overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-white"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-primary/5 via-primary/20 to-primary/5"></div>
            <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-primary/5 via-primary/20 to-primary/5"></div>
            <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-6">
            {/* Header with Animated Elements */}
            <div className="relative mb-20">
              <div className="absolute -left-4 top-0 w-1 h-24 bg-gradient-to-b from-primary to-transparent"></div>
              <div className="pl-8">
                <div className="inline-flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 backdrop-blur-sm flex items-center justify-center">
                    <span className="font-mono text-primary">01</span>
                  </div>
                  <h2 className="text-4xl font-mono font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                    Empower Your School's
                  </h2>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex-grow">
                    <h2 className="text-5xl font-bold mb-6">Full Potential</h2>
                    <p className="text-lg text-slate-600 max-w-2xl">
                      Transform your educational institution with our comprehensive suite of tools designed to streamline operations, enhance learning experiences, and drive institutional growth.
                    </p>
                  </div>
                  <div className="hidden lg:block">
                    <div className="relative w-32 h-32">
                      <div className="absolute inset-0 border-2 border-primary transform rotate-45"></div>
                      <div className="absolute inset-4 bg-primary/10 transform -rotate-45 flex items-center justify-center">
                        <span className="font-mono text-primary text-sm transform rotate-45">INNOVATE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Grid with Unique Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: "📊",
                  title: "Data-Driven Insights",
                  description: "Transform raw data into actionable insights with our advanced analytics dashboard.",
                  highlight: "Real-time Analytics"
                },
                {
                  icon: "🎯",
                  title: "Strategic Planning",
                  description: "Plan and execute educational strategies with precision and foresight.",
                  highlight: "Smart Planning"
                },
                {
                  icon: "🚀",
                  title: "Growth Acceleration",
                  description: "Accelerate your institution's growth with scalable management solutions.",
                  highlight: "Scale Up"
                },
                {
                  icon: "🤝",
                  title: "Collaborative Tools",
                  description: "Foster seamless collaboration between staff, students, and parents.",
                  highlight: "Connect"
                },
                {
                  icon: "🎓",
                  title: "Academic Excellence",
                  description: "Elevate academic standards with comprehensive tracking and support.",
                  highlight: "Excel"
                },
                {
                  icon: "⚡",
                  title: "Operational Efficiency",
                  description: "Streamline administrative tasks and optimize resource allocation.",
                  highlight: "Optimize"
                }
              ].map((feature, index) => (
                <div key={feature.title} className="group relative">
                  {/* Card Background with Gradient Border */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative p-8 bg-white border border-slate-200 hover:border-primary/20 transition-colors">
                    {/* Feature Number */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-white border border-slate-200 group-hover:border-primary/20 flex items-center justify-center transition-colors">
                      <span className="font-mono text-xs text-primary">{String(index + 1).padStart(2, '0')}</span>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between mb-6">
                        <span className="text-2xl">{feature.icon}</span>
                        <div className="h-px w-12 bg-gradient-to-r from-primary/50 to-transparent mt-4"></div>
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                      <p className="text-slate-600 mb-6 flex-grow">{feature.description}</p>
                      
                      {/* Highlight Tag */}
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-primary/5 text-primary text-sm font-mono">
                          {feature.highlight}
                        </span>
                        <div className="w-6 h-px bg-primary/20"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-20 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"></div>
              <div className="relative p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Ready to Transform Your Institution?</h3>
                  <p className="text-slate-600">Join the educational revolution with SQUL</p>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" size="lg" className="h-12 px-6">
                    Learn More
                  </Button>
                  <Button size="lg" className="h-12 px-6">
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-32 overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute w-full h-full bg-[conic-gradient(from_0deg_at_50%_50%,white,rgba(var(--primary-rgb),0.05),white)]"></div>
            <div className="absolute w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(var(--primary-rgb),0.03),transparent_50%)]"></div>
            <div className="absolute w-full h-full bg-[radial-gradient(circle_at_100%_100%,rgba(var(--primary-rgb),0.03),transparent_50%)]"></div>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-6">
            {/* Section Header */}
            <div className="relative mb-24">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-primary/50 to-transparent"></div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-px w-8 bg-primary/30"></div>
                    <div className="px-4 py-2 bg-primary/5 backdrop-blur-sm border border-primary/10">
                      <span className="font-mono text-primary text-sm">Features</span>
                    </div>
                    <div className="h-px w-8 bg-primary/30"></div>
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">Comprehensive School Management</h2>
                <p className="text-lg text-slate-600 max-w-2xl text-center">
                  Experience a new standard in educational administration with our feature-rich platform designed for modern institutions.
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid gap-8">
              {/* Row 1 */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Academic Excellence */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative p-8 border border-slate-200 hover:border-primary/20 transition-colors">
                    <div className="flex items-start gap-6 mb-8">
                      <div className="relative">
                        <div className="w-16 h-16 bg-primary/10 flex items-center justify-center">
                          <span className="text-2xl">📚</span>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-full h-full border border-primary/20"></div>
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-2xl font-bold mb-2">Academic Excellence</h3>
                        <div className="h-1 w-12 bg-gradient-to-r from-primary/50 to-transparent"></div>
                      </div>
                      <div className="w-8 h-8 bg-primary/5 flex items-center justify-center">
                        <span className="font-mono text-xs text-primary">01</span>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="relative pl-6">
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/10 to-transparent"></div>
                        <p className="text-slate-600">
                          Elevate your institution's academic standards with our comprehensive suite of tools designed for modern education delivery and assessment.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {["Curriculum Planning", "Assessment Tools", "Learning Analytics", "Resource Management"].map((item) => (
                          <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                            <div className="w-1.5 h-1.5 bg-primary/40"></div>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Student Success */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative p-8 border border-slate-200 hover:border-primary/20 transition-colors">
                    <div className="flex items-start gap-6 mb-8">
                      <div className="relative">
                        <div className="w-16 h-16 bg-primary/10 flex items-center justify-center">
                          <span className="text-2xl">👨‍🎓</span>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-full h-full border border-primary/20"></div>
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-2xl font-bold mb-2">Student Success</h3>
                        <div className="h-1 w-12 bg-gradient-to-r from-primary/50 to-transparent"></div>
                      </div>
                      <div className="w-8 h-8 bg-primary/5 flex items-center justify-center">
                        <span className="font-mono text-xs text-primary">02</span>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="relative pl-6">
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/10 to-transparent"></div>
                        <p className="text-slate-600">
                          Foster student growth and achievement through personalized tracking, support systems, and comprehensive progress monitoring.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {["Performance Tracking", "Attendance System", "Behavior Monitoring", "Parent Portal"].map((item) => (
                          <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                            <div className="w-1.5 h-1.5 bg-primary/40"></div>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2 - Center Feature */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="relative p-8 border border-slate-200 hover:border-primary/20 transition-colors">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <div className="flex items-start gap-6 mb-8">
                        <div className="relative">
                          <div className="w-16 h-16 bg-primary/10 flex items-center justify-center">
                            <span className="text-2xl">⚡</span>
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-full h-full border border-primary/20"></div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-2">Administrative Power</h3>
                          <div className="h-1 w-12 bg-gradient-to-r from-primary/50 to-transparent"></div>
                        </div>
                      </div>
                      <div className="relative pl-6 mb-6">
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/10 to-transparent"></div>
                        <p className="text-slate-600">
                          Streamline your administrative processes with powerful tools designed for efficiency and precision in educational management.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      {[
                        { 
                          label: "Active Students", 
                          value: stats.activeStudents.toString(),
                          icon: Users,
                          color: "text-emerald-600"
                        },
                        { 
                          label: "Fee Collection", 
                          value: `${stats.feeCollectionRate}%`,
                          icon: DollarSign,
                          color: "text-blue-600"
                        },
                        { 
                          label: "Total Classes", 
                          value: stats.totalClasses.toString(),
                          icon: GraduationCap,
                          color: "text-purple-600"
                        },
                        { 
                          label: "Subjects Offered", 
                          value: stats.totalSubjects.toString(),
                          icon: BookOpen,
                          color: "text-orange-600"
                        }
                      ].map((stat) => (
                        <div key={stat.label} className="p-4 bg-primary/5 group-hover:bg-primary/10 transition-colors">
                          <div className="flex items-center gap-2 mb-2">
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            <div className={`font-mono text-xl font-bold ${stat.color}`}>{stat.value}</div>
                          </div>
                          <div className="text-sm text-slate-600">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Financial Management */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative p-8 border border-slate-200 hover:border-primary/20 transition-colors">
                    <div className="flex items-start gap-6 mb-8">
                      <div className="relative">
                        <div className="w-16 h-16 bg-primary/10 flex items-center justify-center">
                          <span className="text-2xl">💰</span>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-full h-full border border-primary/20"></div>
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-2xl font-bold mb-2">Financial Management</h3>
                        <div className="h-1 w-12 bg-gradient-to-r from-primary/50 to-transparent"></div>
                      </div>
                      <div className="w-8 h-8 bg-primary/5 flex items-center justify-center">
                        <span className="font-mono text-xs text-primary">04</span>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="relative pl-6">
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/10 to-transparent"></div>
                        <p className="text-slate-600">
                          Take control of your institution's finances with our comprehensive financial management and reporting tools.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {["Fee Management", "Budget Planning", "Expense Tracking", "Financial Reports"].map((item) => (
                          <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                            <div className="w-1.5 h-1.5 bg-primary/40"></div>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Communication Hub */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-tl from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative p-8 border border-slate-200 hover:border-primary/20 transition-colors">
                    <div className="flex items-start gap-6 mb-8">
                      <div className="relative">
                        <div className="w-16 h-16 bg-primary/10 flex items-center justify-center">
                          <span className="text-2xl">💬</span>
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-full h-full border border-primary/20"></div>
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-2xl font-bold mb-2">Communication Hub</h3>
                        <div className="h-1 w-12 bg-gradient-to-r from-primary/50 to-transparent"></div>
                      </div>
                      <div className="w-8 h-8 bg-primary/5 flex items-center justify-center">
                        <span className="font-mono text-xs text-primary">05</span>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="relative pl-6">
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/10 to-transparent"></div>
                        <p className="text-slate-600">
                          Foster seamless communication between administrators, teachers, students, and parents through our integrated messaging system.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {["Instant Messaging", "Announcements", "Event Calendar", "Document Sharing"].map((item) => (
                          <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                            <div className="w-1.5 h-1.5 bg-primary/40"></div>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-20 text-center">
              <div className="inline-flex items-center gap-4 p-2 border border-primary/20 bg-primary/5">
                <span className="px-4 py-2 bg-white text-primary font-mono text-sm">Ready to Transform Your Institution?</span>
                <Button size="lg" className="h-10">Get Started Today</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Comprehensive Features Section */}
        <div className="py-32 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-24">
              <div className="inline-block px-4 py-2 bg-primary/5 text-primary text-sm font-mono mb-6">
                All-in-One Solution
              </div>
              <h2 className="text-5xl font-mono font-bold mb-8 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                Empower Your School's Full Potential
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Unlock a smarter way to run your institution with SQUL's all-in-one school management system. 
                Designed for modern educators, SQUL centralizes every critical function into one seamless platform.
              </p>
            </div>

            {/* Academic Management */}
            <div className="grid md:grid-cols-2 gap-16 items-center mb-32 group">
              <div className="space-y-8">
                <div className="inline-flex items-center space-x-3 text-primary">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                    <span className="text-2xl">🎓</span>
                  </div>
                  <h3 className="text-2xl font-mono font-bold">Academic Management</h3>
                </div>
                <div className="space-y-6">
                  {[
                    {
                      title: "Classes",
                      description: "Organize and schedule classes with flexibility and precision."
                    },
                    {
                      title: "Learning Materials",
                      description: "Upload and share course content, homework, and resources digitally."
                    },
                    {
                      title: "Grading",
                      description: "Automate grade entry, calculations, and reports for real-time academic performance tracking."
                    }
                  ].map((item, index) => (
                    <div key={index} className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                      <h4 className="font-semibold mb-3 text-primary">{item.title}</h4>
                      <p className="text-slate-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white shadow-xl overflow-hidden transform group-hover:scale-[1.02] transition-transform duration-500">
                <div className="relative h-[400px]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <img 
                    src="/screenshots/class.jpg" 
                    alt="Academic Management Interface" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Student Information System */}
            <div className="grid md:grid-cols-2 gap-16 items-center mb-32 group">
              <div className="order-2 md:order-1">
                <div className="grid grid-cols-2 gap-4 overflow-hidden">
                  <div className="relative h-[300px]">
                    <img 
                      src="/screenshots/students-3518726_1920.jpg" 
                      alt="Students in classroom" 
                      className="w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                  <div className="relative h-[300px]">
                    <img 
                      src="/screenshots/students.jpg" 
                      alt="Students learning" 
                      className="w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2 space-y-8">
                <div className="inline-flex items-center space-x-3 text-primary">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🧑‍🎓</span>
                  </div>
                  <h3 className="text-2xl font-mono font-bold">Student Information System</h3>
                </div>
                <div className="space-y-6">
                  {[
                    {
                      title: "Admissions",
                      description: "Streamline enrollment with digital application workflows."
                    },
                    {
                      title: "Personal Profiles",
                      description: "Maintain comprehensive student records, including contact info, guardian details, and emergency contacts."
                    },
                    {
                      title: "Academic Records",
                      description: "Track progress, transcripts, and historical performance over time."
                    },
                    {
                      title: "Behavioral & Health Records",
                      description: "Monitor behavior reports and health notes to ensure student well-being."
                    },
                    {
                      title: "Attendance",
                      description: "Record, track, and report attendance in real time — from daily roll calls to detailed absentee summaries."
                    }
                  ].map((item, index) => (
                    <div key={index} className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                      <h4 className="font-semibold mb-3 text-primary">{item.title}</h4>
                      <p className="text-slate-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Financial & Administrative Tools */}
            <div className="grid md:grid-cols-2 gap-16 items-center group">
              <div className="space-y-8">
                <div className="inline-flex items-center space-x-3 text-primary">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h3 className="text-2xl font-mono font-bold">Financial & Administrative Tools</h3>
                </div>
                <div className="space-y-6">
                  {[
                    {
                      title: "Fees & Payments",
                      description: "Accept tuition fees online and manage invoices effortlessly."
                    },
                    {
                      title: "Reports & Insights",
                      description: "Gain valuable insights with custom reports across academics, finances, and operations."
                    }
                  ].map((item, index) => (
                    <div key={index} className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                      <h4 className="font-semibold mb-3 text-primary">{item.title}</h4>
                      <p className="text-slate-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative h-[400px] col-span-2">
                  <img 
                    src="/screenshots/ai-generated-9041893_1920.jpg" 
                    alt="Administrative Dashboard" 
                    className="w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent" />
                </div>
                <div className="relative h-[200px]">
                  <img 
                    src="/screenshots/class2.jpg" 
                    alt="Class Management" 
                    className="w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent" />
                </div>
                <div className="relative h-[200px]">
                  <img 
                    src="/screenshots/teachers.jpg" 
                    alt="Teacher Management" 
                    className="w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-32 bg-gradient-to-b from-white via-slate-50/50 to-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-24">
              <div className="inline-block px-4 py-2 bg-primary/5 text-primary text-sm font-mono mb-6">
                Common Questions
              </div>
              <h2 className="text-4xl font-mono font-bold mb-8">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Get quick answers to common questions about SQUL's school management system
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-l-4 border-primary hover:translate-x-1 transition-transform">
                  <h3 className="font-semibold text-lg mb-4 text-primary flex items-center">
                    <span className="w-8 h-8 bg-primary/10 flex items-center justify-center mr-3">🔒</span>
                    How secure is SQUL for managing student data?
                  </h3>
                  <p className="text-slate-600 pl-11">
                    SQUL implements enterprise-grade security measures including end-to-end encryption, regular security audits, and compliance with educational data protection standards to ensure your student information is always protected.
                  </p>
                </div>
                <div className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-l-4 border-primary hover:translate-x-1 transition-transform">
                  <h3 className="font-semibold text-lg mb-4 text-primary flex items-center">
                    <span className="w-8 h-8 bg-primary/10 flex items-center justify-center mr-3">🏢</span>
                    Can SQUL handle multiple campuses or branches?
                  </h3>
                  <p className="text-slate-600 pl-11">
                    Yes! SQUL is designed to scale. You can manage multiple campuses, each with its own settings, while maintaining centralized control and reporting across your entire institution.
                  </p>
                </div>
              </div>

              {/* Middle Column */}
              <div className="space-y-6 lg:translate-y-12">
                <div className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-l-4 border-primary hover:translate-x-1 transition-transform">
                  <h3 className="font-semibold text-lg mb-4 text-primary flex items-center">
                    <span className="w-8 h-8 bg-primary/10 flex items-center justify-center mr-3">💬</span>
                    Is technical support included?
                  </h3>
                  <p className="text-slate-600 pl-11">
                    Absolutely. All SQUL subscriptions include dedicated technical support, regular updates, and access to our comprehensive knowledge base and training resources.
                  </p>
                </div>
                <div className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-l-4 border-primary hover:translate-x-1 transition-transform">
                  <h3 className="font-semibold text-lg mb-4 text-primary flex items-center">
                    <span className="w-8 h-8 bg-primary/10 flex items-center justify-center mr-3">⏱️</span>
                    How long does it take to implement SQUL?
                  </h3>
                  <p className="text-slate-600 pl-11">
                    Most schools are up and running within 2-4 weeks. Our implementation team helps with data migration, staff training, and system configuration to ensure a smooth transition.
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-l-4 border-primary hover:translate-x-1 transition-transform">
                  <h3 className="font-semibold text-lg mb-4 text-primary flex items-center">
                    <span className="w-8 h-8 bg-primary/10 flex items-center justify-center mr-3">👨‍👩‍👧‍👦</span>
                    Can parents access their children's information?
                  </h3>
                  <p className="text-slate-600 pl-11">
                    Yes, SQUL provides a secure parent portal where guardians can view grades, attendance, schedules, and communicate with teachers - all from their mobile device or computer.
                  </p>
                </div>
                <div className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-l-4 border-primary hover:translate-x-1 transition-transform">
                  <h3 className="font-semibold text-lg mb-4 text-primary flex items-center">
                    <span className="w-8 h-8 bg-primary/10 flex items-center justify-center mr-3">📱</span>
                    Does SQUL work on mobile devices?
                  </h3>
                  <p className="text-slate-600 pl-11">
                    SQUL is fully responsive and works seamlessly on all devices. We also offer dedicated mobile apps for both iOS and Android platforms.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Contact Banner */}
            <div className="mt-24 p-12 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-t border-b border-primary/20">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h3 className="text-2xl font-mono font-bold text-primary mb-2">Still have questions?</h3>
                  <p className="text-slate-600">Our team is here to help you get started with SQUL</p>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" size="lg" className="h-12 px-6 font-mono">
                    View Documentation
                  </Button>
                  <Button size="lg" className="h-12 px-6 font-mono">
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative bg-slate-900 text-white overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-1/4 -top-1/4 w-1/2 h-1/2 bg-primary/5 blur-[100px] rounded-full"></div>
            <div className="absolute -left-1/4 -bottom-1/4 w-1/2 h-1/2 bg-primary/5 blur-[100px] rounded-full"></div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
          </div>

          {/* Main Footer Content */}
          <div className="relative">
            {/* Top Section with Unique Layout */}
            <div className="max-w-7xl mx-auto px-6 pt-20 pb-16">
              {/* Brand Section - Floating Design */}
              <div className="relative mb-20">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent -skew-y-2"></div>
                <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 p-8">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-primary relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-mono font-bold text-2xl">SQ</span>
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-full h-full border-2 border-primary"></div>
                    </div>
                  </div>
                  <div className="flex-grow text-center md:text-left">
                    <h2 className="font-mono text-3xl font-bold mb-4">SQUL</h2>
                    <p className="text-slate-400 max-w-2xl">
                      Pioneering the future of education management with innovative solutions that transform how institutions operate, teach, and grow.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="flex gap-3">
                      {["Twitter", "Instagram", "GitHub"].map((platform) => (
                        <a
                          key={platform}
                          href="#"
                          className="group relative w-12 h-12 bg-slate-800 flex items-center justify-center overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-primary transform origin-left -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                          <span className="relative text-xs font-mono">{platform[0]}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                {/* Quick Links - Staggered Layout */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative">
                    <h3 className="font-mono text-lg font-bold mb-8 flex items-center gap-3">
                      <span className="w-8 h-px bg-primary"></span>
                      Navigation
                    </h3>
                    <ul className="space-y-4">
                      {["About Us", "Features", "Pricing", "Case Studies", "Documentation"].map((link, i) => (
                        <li key={link} className="transform hover:-translate-y-1 transition-transform" style={{ transitionDelay: `${i * 50}ms` }}>
                          <a href="#" className="text-slate-400 hover:text-primary flex items-center gap-2">
                            <span className="w-4 h-px bg-primary/50"></span>
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Resources - Vertical Line Design */}
                <div className="relative group">
                  <div className="absolute left-0 top-0 w-px h-full bg-gradient-to-b from-primary/20 via-primary/5 to-transparent"></div>
                  <div className="relative pl-8">
                    <h3 className="font-mono text-lg font-bold mb-8">Resources</h3>
                    <ul className="space-y-4">
                      {["Help Center", "API Docs", "System Status", "Updates", "Changelog"].map((link) => (
                        <li key={link}>
                          <a href="#" className="text-slate-400 hover:text-primary inline-flex items-center gap-2 group/link">
                            <span className="w-2 h-2 bg-primary/30 group-hover/link:bg-primary transition-colors"></span>
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Community - Diagonal Design */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent -skew-x-6"></div>
                  <div className="relative p-6">
                    <h3 className="font-mono text-lg font-bold mb-8">Community</h3>
                    <ul className="space-y-6">
                      {[
                        { text: "Join Discord", icon: "💬" },
                        { text: "Tech Blog", icon: "📝" },
                        { text: "Forums", icon: "👥" },
                        { text: "Events", icon: "🎉" }
                      ].map((item) => (
                        <li key={item.text}>
                          <a href="#" className="group flex items-center gap-3 text-slate-400 hover:text-primary">
                            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-800 group-hover:bg-primary/20 transition-colors">
                              {item.icon}
                            </span>
                            {item.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Contact - Modern Card Design */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative p-6 border border-slate-800">
                    <h3 className="font-mono text-lg font-bold mb-8">Connect</h3>
                    <ul className="space-y-6">
                      <li className="transform hover:translate-x-2 transition-transform">
                        <a href="mailto:support@squl.edu" className="flex items-center gap-4 text-slate-400 hover:text-primary">
                          <div className="w-10 h-10 bg-slate-800 flex items-center justify-center">
                            <span className="font-mono text-xs">@</span>
                          </div>
                          support@squl.edu
                        </a>
                      </li>
                      <li className="transform hover:translate-x-2 transition-transform">
                        <a href="tel:+254700000000" className="flex items-center gap-4 text-slate-400 hover:text-primary">
                          <div className="w-10 h-10 bg-slate-800 flex items-center justify-center">
                            <span className="font-mono text-xs">T</span>
                          </div>
                          +254 700 000000
                        </a>
                      </li>
                      <li>
                        <div className="flex items-start gap-4 text-slate-400">
                          <div className="w-10 h-10 bg-slate-800 flex items-center justify-center flex-shrink-0">
                            <span className="font-mono text-xs">L</span>
                          </div>
                          <div>
                            Nairobi, Kenya<br />
                            Business District<br />
                            Innovation Hub
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar - Unique Design */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10"></div>
              <div className="relative max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-6">
                    <span className="text-slate-400 text-sm">© 2024 SQUL</span>
                    <div className="w-px h-4 bg-slate-700"></div>
                    <span className="text-slate-400 text-sm">All rights reserved</span>
                  </div>
                  <div className="flex items-center gap-8">
                    {["Privacy", "Terms", "Cookies"].map((text, i) => (
                      <a
                        key={text}
                        href="#"
                        className="text-slate-400 hover:text-primary text-sm relative group"
                      >
                        <span className="relative z-10">{text}</span>
                        <span className="absolute bottom-0 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300"></span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}