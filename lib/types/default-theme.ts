import { SchoolTheme } from './school-config';

export const defaultSchoolTheme: SchoolTheme = {
  id: 'default',
  name: 'Default School Theme',
  colors: {
    primary: '#2563eb', // blue-600
    primaryLight: '#3b82f6', // blue-500
    primaryDark: '#1d4ed8', // blue-700
    secondary: '#059669', // emerald-600
    secondaryLight: '#10b981', // emerald-500
    secondaryDark: '#047857', // emerald-700
    accent: '#f59e0b', // amber-500
    accentLight: '#fbbf24', // amber-400
    accentDark: '#d97706', // amber-600
    success: '#059669', // emerald-600
    warning: '#f59e0b', // amber-500
    error: '#dc2626', // red-600
    info: '#0ea5e9', // sky-500
    background: '#f9fafb', // gray-50
    surface: '#ffffff', // white
    text: '#111827', // gray-900
    textSecondary: '#6b7280', // gray-500
    border: '#d1d5db', // gray-300
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    headingFontFamily: 'Inter, system-ui, sans-serif',
    headingWeight: '900', // font-black
    bodyWeight: '600', // font-semibold
    buttonWeight: '700', // font-bold
    letterSpacing: '0.025em', // tracking-wide
    headingLetterSpacing: '0.05em', // tracking-wider
  },
  spacing: {
    borderRadius: '0.375rem', // rounded-md
    borderWidth: '2px',
    shadowIntensity: 'lg',
    containerPadding: '1rem', // p-4
    sectionPadding: '5rem', // py-20
  },
  hero: {
    backgroundStyle: 'solid',
    title: 'WELCOME TO',
    subtitle: 'SHAPING TOMORROW\'S LEADERS THROUGH QUALITY EDUCATION, INNOVATION, AND CHARACTER DEVELOPMENT. DISCOVER YOUR POTENTIAL WITH US.',
    ctaButtons: {
      primary: { text: 'APPLY NOW', href: '/apply' },
      secondary: { text: 'VIRTUAL TOUR', href: '/virtual-tour' },
    },
  },
  navigation: {
    logoStyle: 'combined',
    showTagline: true,
    tagline: 'Excellence in Education',
    menuItems: [
      { label: 'HOME', href: '/', icon: 'Home' },
      { label: 'ABOUT', href: '/about', icon: 'School' },
      { label: 'PROGRAMS', href: '/programs', icon: 'BookOpen' },
      { label: 'ADMISSIONS', href: '/admissions', icon: 'Users' },
      { label: 'CONTACT', href: '/contact', icon: 'PhoneCall' },
    ],
  },
  footer: {
    showLogo: true,
    showQuickLinks: true,
    showContact: true,
    copyrightText: 'ALL RIGHTS RESERVED.',
    contactEmail: 'info@school.edu',
    contactPhone: '+1 (555) 123-4567',
  },
}; 