'use client'

import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card'
import { Button } from '../../../../../components/ui/button'
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  TrendingUp,
  School,
  ChevronRight,
  Clock,
  MapPin,
  Star,
  Award,
  Target,
  Heart,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Globe,
  Shield,
  Zap,
  BarChart3,
  Settings,
  LogIn,
  Menu,
  X,
  Home,
  UserPlus,
  PhoneCall,
  Mail,
  Building2,
  Library
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SchoolConfiguration } from '../../../../../lib/types/school-config'
import brandingJson from '../../../../../lib/data/tenant-branding.template.json'

interface SchoolHomepageProps {
  config?: SchoolConfiguration
}

export function SchoolHomepage({ config }: SchoolHomepageProps) {
  const params = useParams()
  const subdomain = params.subdomain as string
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const branding = brandingJson as any

  // Extract school name from subdomain
  const getSchoolNameFromSubdomain = (subdomain: string) => {
    // Convert subdomain to title case and handle special cases
    const name = subdomain
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
    
    return name
  }

  // Resolve school name with fallbacks: branding -> cookie -> subdomain-derived
  const readCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()!.split(';').shift() || null
    return null
  }

  const initialName = (branding?.brand?.name as string) || getSchoolNameFromSubdomain(subdomain)
  const [resolvedSchoolName, setResolvedSchoolName] = useState<string>(initialName)

  useEffect(() => {
    if (!branding?.brand?.name) {
      const cookieName = readCookie('schoolName')
      if (cookieName && cookieName.trim().length > 0) {
        setResolvedSchoolName(cookieName)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tagline = (branding?.brand?.tagline as string) || 'Excellence in Education'

  const primary = branding?.colors?.primary
  const primaryDark = branding?.colors?.primaryDark || primary
  const primaryLight = branding?.colors?.primaryLight || primary
  const themeVars: Record<string, string> = {}
  if (primary) themeVars['--primary'] = primary
  if (primaryDark) themeVars['--primary-dark'] = primaryDark
  if (primaryLight) themeVars['--primary-light'] = primaryLight
  const totalLevels = config?.selectedLevels?.length || 0
  const totalGrades = config?.selectedLevels?.reduce((acc, level) => acc + level.gradeLevels.length, 0) || 0
  const totalSubjects = config?.selectedLevels?.reduce((acc, level) => acc + level.subjects.length, 0) || 0

  return (
    <div className="min-h-screen bg-gray-50" style={themeVars}>
      {/* Navigation */}
      <nav className="bg-white border-b-4 border-primary sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center max-w-xs lg:max-w-sm">
              <div className="flex-shrink-0 flex items-center">
                <div className="relative">
                  {/* Main logo */}
                  {branding?.logos?.primary ? (
                    <img
                      src={branding.logos.primary as string}
                      alt={`${resolvedSchoolName} logo`}
                      className="w-12 h-12 md:w-14 md:h-14 object-contain border-2 border-white shadow-lg bg-white"
                    />
                  ) : (
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-primary via-primary-light to-primary-dark border-3 border-white shadow-lg flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/10"></div>
                      <Building2 className="h-6 w-6 md:h-7 md:w-7 text-white z-10 relative" />
                      <div className="absolute top-1 right-1 w-3 h-3 md:w-4 md:h-4 bg-yellow-400 border border-yellow-500 flex items-center justify-center z-20">
                        <BookOpen className="h-2 w-2 md:h-2.5 md:w-2.5 text-primary-dark" />
                      </div>
                      <div className="absolute bottom-1 left-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-white border border-primary-dark flex items-center justify-center z-20">
                        <Star className="h-1 w-1 md:h-1.5 md:w-1.5 text-primary fill-current" />
                      </div>
                    </div>
                  )}
                  
                  {/* School name abbreviation overlay */}
                  <div className="absolute -bottom-1.5 -right-0.5 md:-bottom-2 md:-right-1 w-5 h-5 md:w-6 md:h-6 bg-primary-dark border-2 border-white flex items-center justify-center text-xs font-black text-white">
                    {resolvedSchoolName.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                </div>
                
                <div className="ml-3 md:ml-4 min-w-0">
                  <span className="text-sm md:text-lg font-black text-gray-900 tracking-tight block leading-tight truncate">
                    {resolvedSchoolName.toUpperCase()}
                  </span>
                  <span className="text-xs font-semibold text-primary uppercase tracking-tight truncate block">
                    {tagline.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-6">
                <Link href={`/`} className="text-gray-700 hover:text-primary px-4 py-2 border-2 border-transparent hover:border-primary text-sm font-semibold transition-all">
                  <Home className="w-4 h-4 inline mr-2" />
                  HOME
                </Link>
                <Link href={`/about`} className="text-gray-700 hover:text-primary px-4 py-2 border-2 border-transparent hover:border-primary text-sm font-semibold transition-all">
                  <School className="w-4 h-4 inline mr-2" />
                  ABOUT
                </Link>
                <Link href={`/programs`} className="text-gray-700 hover:text-primary px-4 py-2 border-2 border-transparent hover:border-primary text-sm font-semibold transition-all">
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  PROGRAMS
                </Link>
                <Link href={`/admissions`} className="text-gray-700 hover:text-primary px-4 py-2 border-2 border-transparent hover:border-primary text-sm font-semibold transition-all">
                  <Users className="w-4 h-4 inline mr-2" />
                  ADMISSIONS
                </Link>
                <Link href={`/contact`} className="text-gray-700 hover:text-primary px-4 py-2 border-2 border-transparent hover:border-primary text-sm font-semibold transition-all">
                  <PhoneCall className="w-4 h-4 inline mr-2" />
                  CONTACT
                </Link>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6 space-x-4">
                <Button asChild variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold px-6 py-2">
                  <Link href={`/login`}>
                    <Users className="w-4 h-4 mr-2" />
                    STUDENT PORTAL
                  </Link>
                </Button>
                <Button asChild className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2 border-2 border-primary-dark">
                  <Link href={`/apply`}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    APPLY NOW
                  </Link>
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 text-gray-700 hover:text-primary border-2 border-transparent hover:border-primary"
              >
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t-2 border-primary bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href={`/`} className="text-gray-700 hover:text-primary block px-3 py-2 font-semibold border-2 border-transparent hover:border-primary">
                <Home className="w-4 h-4 inline mr-2" />
                HOME
              </Link>
              <Link href={`/about`} className="text-gray-700 hover:text-primary block px-3 py-2 font-semibold border-2 border-transparent hover:border-primary">
                <School className="w-4 h-4 inline mr-2" />
                ABOUT
              </Link>
              <Link href={`/programs`} className="text-gray-700 hover:text-primary block px-3 py-2 font-semibold border-2 border-transparent hover:border-primary">
                <BookOpen className="w-4 h-4 inline mr-2" />
                PROGRAMS
              </Link>
              <Link href={`/admissions`} className="text-gray-700 hover:text-primary block px-3 py-2 font-semibold border-2 border-transparent hover:border-primary">
                <Users className="w-4 h-4 inline mr-2" />
                ADMISSIONS
              </Link>
              <Link href={`/contact`} className="text-gray-700 hover:text-primary block px-3 py-2 font-semibold border-2 border-transparent hover:border-primary">
                <PhoneCall className="w-4 h-4 inline mr-2" />
                CONTACT
              </Link>
            </div>
            <div className="pt-4 pb-3 border-t-2 border-primary">
              <div className="px-2 space-y-2">
                <Button asChild variant="outline" className="w-full justify-start border-2 border-primary text-primary font-semibold">
                  <Link href={`/login`}>
                    <Users className="w-4 h-4 mr-2" />
                    STUDENT PORTAL
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start bg-primary hover:bg-primary-dark border-2 border-primary-dark font-semibold">
                  <Link href={`/apply`}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    APPLY NOW
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="bg-primary border-b-4 border-primary-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-white border-4 border-primary-dark px-6 py-3">
                <span className="text-primary font-bold text-lg flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  {tagline.toUpperCase()}
                </span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight tracking-wider">
              WELCOME TO
            </h1>
            <h2 className="text-4xl md:text-6xl font-black text-yellow-400 mb-8 leading-tight tracking-wider border-4 border-yellow-400 inline-block px-8 py-4">
              {resolvedSchoolName.toUpperCase()}
            </h2>
            
            <p className="text-xl md:text-2xl text-green-100 mb-12 max-w-4xl mx-auto leading-relaxed font-semibold">
              {branding?.brand?.description || "SHAPING TOMORROW'S LEADERS THROUGH QUALITY EDUCATION, INNOVATION, AND CHARACTER DEVELOPMENT. DISCOVER YOUR POTENTIAL WITH US."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-yellow-400 hover:text-primary-dark font-black px-12 py-6 text-xl border-4 border-primary-dark transition-all">
                <Link href={`/apply`}>
                  APPLY NOW
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-yellow-400 text-primary-dark hover:bg-white hover:text-primary font-black px-12 py-6 text-xl border-4 border-primary-dark transition-all">
                <Link href={`/login`}>
                  <Globe className="mr-3 h-6 w-6" />
                  Login (Teacher/Student/Parent)                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white border-b-4 border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-wider">
              OUR SCHOOL AT A GLANCE
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-semibold">
              DISCOVER THE EXCELLENCE THAT MAKES OUR SCHOOL A LEADER IN EDUCATION
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center bg-white border-4 border-primary p-8 hover:bg-green-50 transition-colors">
              <div className="bg-primary border-2 border-primary-dark w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-3">1,200+</h3>
              <p className="text-gray-600 font-bold text-lg">STUDENTS</p>
              <p className="text-sm text-gray-500 font-semibold mt-2">THRIVING LEARNERS</p>
            </div>
            
            <div className="text-center bg-white border-4 border-green-600 p-8 hover:bg-green-50 transition-colors">
              <div className="bg-green-600 border-2 border-green-800 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-3">98%</h3>
              <p className="text-gray-600 font-bold text-lg">SUCCESS RATE</p>
              <p className="text-sm text-gray-500 font-semibold mt-2">ACADEMIC EXCELLENCE</p>
            </div>
            
            <div className="text-center bg-white border-4 border-purple-600 p-8 hover:bg-purple-50 transition-colors">
              <div className="bg-purple-600 border-2 border-purple-800 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-3">{totalSubjects}+</h3>
              <p className="text-gray-600 font-bold text-lg">PROGRAMS</p>
              <p className="text-sm text-gray-500 font-semibold mt-2">DIVERSE CURRICULUM</p>
            </div>
            
            <div className="text-center bg-white border-4 border-orange-600 p-8 hover:bg-orange-50 transition-colors">
              <div className="bg-orange-600 border-2 border-orange-800 w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-3">25+</h3>
              <p className="text-gray-600 font-bold text-lg">YEARS</p>
              <p className="text-sm text-gray-500 font-semibold mt-2">OF EXCELLENCE</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-100 border-b-4 border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-wider">
              WHAT WE OFFER
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto font-semibold">
              COMPREHENSIVE EDUCATIONAL PROGRAMS DESIGNED TO NURTURE ACADEMIC EXCELLENCE AND PERSONAL GROWTH FOR EVERY STUDENT.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Academic Excellence */}
            <div className="bg-white border-4 border-primary p-8 hover:bg-green-50 transition-colors">
              <div className="w-16 h-16 bg-primary border-2 border-primary-dark flex items-center justify-center mb-6">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">ACADEMIC EXCELLENCE</h3>
              <p className="text-gray-600 mb-6 font-semibold">
                Rigorous curriculum designed to challenge and inspire students across all academic disciplines.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600 font-semibold">
                  <div className="w-2 h-2 bg-primary mr-3"></div>
                  Advanced STEM Programs
                </div>
                <div className="flex items-center text-gray-600 font-semibold">
                  <div className="w-2 h-2 bg-primary mr-3"></div>
                  Language Arts & Literature
                </div>
                <div className="flex items-center text-gray-600 font-semibold">
                  <div className="w-2 h-2 bg-primary mr-3"></div>
                  Social Sciences & History
                </div>
              </div>
              <Button asChild className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 text-lg border-2 border-primary-dark">
                <Link href={`/academics`}>
                  EXPLORE ACADEMICS
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Extracurricular Activities */}
            <div className="bg-white border-4 border-green-600 p-8 hover:bg-green-50 transition-colors">
              <div className="w-16 h-16 bg-green-600 border-2 border-green-800 flex items-center justify-center mb-6">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">EXTRACURRICULAR ACTIVITIES</h3>
              <p className="text-gray-600 mb-6 font-semibold">
                Diverse programs to develop talents, build character, and foster leadership skills beyond the classroom.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600 font-semibold">
                  <div className="w-2 h-2 bg-green-600 mr-3"></div>
                  Sports & Athletics
                </div>
                <div className="flex items-center text-gray-600 font-semibold">
                  <div className="w-2 h-2 bg-green-600 mr-3"></div>
                  Arts & Music Programs
                </div>
                <div className="flex items-center text-gray-600 font-semibold">
                  <div className="w-2 h-2 bg-green-600 mr-3"></div>
                  Student Clubs & Organizations
                </div>
              </div>
              <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 text-lg border-2 border-green-800">
                <Link href={`/activities`}>
                  VIEW ACTIVITIES
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Student Support */}
            <div className="bg-white border-4 border-purple-600 p-8 hover:bg-purple-50 transition-colors">
              <div className="w-16 h-16 bg-purple-600 border-2 border-purple-800 flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">STUDENT SUPPORT</h3>
              <p className="text-gray-600 mb-6 font-semibold">
                Comprehensive support services to ensure every student's academic, social, and emotional well-being.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600 font-semibold">
                  <div className="w-2 h-2 bg-purple-600 mr-3"></div>
                  Guidance Counseling
                </div>
                <div className="flex items-center text-gray-600 font-semibold">
                  <div className="w-2 h-2 bg-purple-600 mr-3"></div>
                  Academic Tutoring
                </div>
                <div className="flex items-center text-gray-600 font-semibold">
                  <div className="w-2 h-2 bg-purple-600 mr-3"></div>
                  Career Guidance
                </div>
              </div>
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 text-lg border-2 border-purple-800">
                <Link href={`/support`}>
                  LEARN MORE
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Configuration Overview */}
      <section className="py-20 bg-white border-b-4 border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-wider">
              OUR EDUCATIONAL PROGRAMS
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto font-semibold">
              DISCOVER OUR COMPREHENSIVE EDUCATIONAL PATHWAYS DESIGNED TO MEET EVERY STUDENT'S LEARNING JOURNEY.
            </p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-2">
            {config?.selectedLevels?.map((level, index) => (
              <div key={level.id} className="bg-white border-4 border-gray-600 p-8 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 mb-2">{level.name.toUpperCase()}</h3>
                    <p className="text-gray-600 font-semibold">{level.description}</p>
                  </div>
                  <div className="w-16 h-16 bg-primary border-2 border-primary-dark flex items-center justify-center">
                    <span className="text-white font-black text-2xl">{index + 1}</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-black text-gray-900 mb-4 text-lg">GRADE LEVELS ({level.gradeLevels.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {level.gradeLevels.map((grade) => (
                        <span key={grade.id} className="bg-green-100 text-primary-dark border-2 border-primary px-3 py-1 font-bold">
                          {grade.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-black text-gray-900 mb-4 text-lg">SUBJECTS ({level.subjects.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {level.subjects.slice(0, 6).map((subject) => (
                        <span key={subject.id} className="bg-gray-100 text-gray-800 border-2 border-gray-600 px-3 py-1 font-bold">
                          {subject.name}
                        </span>
                      ))}
                      {level.subjects.length > 6 && (
                        <span className="bg-gray-100 text-gray-800 border-2 border-gray-600 px-3 py-1 font-bold">
                          +{level.subjects.length - 6} MORE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black px-12 py-6 text-xl border-4 border-gray-900">
              <Link href={`/programs`}>
                <BookOpen className="mr-3 h-6 w-6" />
                VIEW ALL PROGRAMS
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary border-b-4 border-primary-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-wider">
            READY TO JOIN OUR COMMUNITY?
          </h2>
          <p className="text-xl text-green-100 mb-12 max-w-3xl mx-auto font-semibold">
            BECOME PART OF OUR THRIVING EDUCATIONAL COMMUNITY. START YOUR JOURNEY WITH US TODAY AND UNLOCK YOUR FULL POTENTIAL.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-yellow-400 hover:text-primary-dark font-black px-12 py-6 text-xl border-4 border-primary-dark">
              <Link href={`/apply`}>
                <UserPlus className="mr-3 h-6 w-6" />
                APPLY FOR ADMISSION
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-yellow-400 text-primary-dark hover:bg-white hover:text-primary font-black px-12 py-6 text-xl border-4 border-primary-dark">
              <Link href={`/visit`}>
                <MapPin className="mr-3 h-6 w-6" />
                SCHEDULE A VISIT
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 border-t-4 border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-6">
                <div className="relative">
                  {/* Footer logo with monochrome styling */}
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 border-2 border-gray-400 shadow-lg flex items-center justify-center relative overflow-hidden">
                    {/* Background pattern */}
                    <div className="absolute inset-0 bg-white/5"></div>
                    
                    {/* Main building icon */}
                    <Building2 className="h-6 w-6 text-white z-10 relative" />
                    
                    {/* Educational elements */}
                    <div className="absolute top-1 right-1 w-3 h-3 bg-primary border border-primary-dark flex items-center justify-center z-20">
                      <BookOpen className="h-2 w-2 text-white" />
                    </div>
                    
                    {/* Academic excellence indicator */}
                    <div className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-gray-300 border border-gray-600 flex items-center justify-center z-20">
                      <Star className="h-1 w-1 text-gray-800 fill-current" />
                    </div>
                  </div>
                  
                  {/* School name abbreviation overlay */}
                  <div className="absolute -bottom-1.5 -right-1 w-5 h-5 bg-primary border-2 border-gray-400 flex items-center justify-center text-xs font-black text-white">
                    {resolvedSchoolName.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                </div>
                
                <div className="ml-3">
                  <span className="text-xl font-black text-white block leading-tight">
                    {resolvedSchoolName.toUpperCase()}
                  </span>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {tagline.toUpperCase()}
                  </span>
                </div>
              </div>
              <p className="text-gray-400 font-semibold">
                {branding?.brand?.description || 'EMPOWERING EDUCATION THROUGH INNOVATIVE SCHOOL MANAGEMENT SOLUTIONS.'}
              </p>
            </div>
            
            <div>
              <h3 className="font-black mb-6 text-lg">QUICK LINKS</h3>
              <ul className="space-y-3 font-semibold">
                <li><Link href={`/about`} className="text-gray-400 hover:text-white transition-colors border-b-2 border-transparent hover:border-white">ABOUT US</Link></li>
                <li><Link href={`/admissions`} className="text-gray-400 hover:text-white transition-colors border-b-2 border-transparent hover:border-white">ADMISSIONS</Link></li>
                <li><Link href={`/programs`} className="text-gray-400 hover:text-white transition-colors border-b-2 border-transparent hover:border-white">PROGRAMS</Link></li>
                <li><Link href={`/news`} className="text-gray-400 hover:text-white transition-colors border-b-2 border-transparent hover:border-white">NEWS & EVENTS</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-black mb-6 text-lg">CONTACT</h3>
              <div className="space-y-3 font-semibold text-gray-400">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-3" />
                  {branding?.contact?.email || `info@${subdomain}.edu`}
                </div>
                <div className="flex items-center">
                  <PhoneCall className="w-5 h-5 mr-3" />
                  {branding?.contact?.phone || '+1 (555) 123-4567'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t-2 border-gray-700 text-center font-semibold text-gray-400">
            <p>&copy; {new Date().getFullYear()} {resolvedSchoolName.toUpperCase()}. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 