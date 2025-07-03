'use client'

import React, { createContext, useContext, useEffect } from 'react'
import { SchoolTheme } from '../../lib/types/school-config'
import { defaultSchoolTheme } from '../../lib/types/default-theme'

interface ThemeContextType {
  theme: SchoolTheme
  applyTheme: (theme: SchoolTheme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  theme?: SchoolTheme
}

export function ThemeProvider({ children, theme = defaultSchoolTheme }: ThemeProviderProps) {
  const applyTheme = (themeConfig: SchoolTheme) => {
    // Apply CSS custom properties to the document root
    const root = document.documentElement
    
    // Apply color variables
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
    
    // Apply typography variables
    root.style.setProperty('--font-family', themeConfig.typography.fontFamily)
    if (themeConfig.typography.headingFontFamily) {
      root.style.setProperty('--font-heading', themeConfig.typography.headingFontFamily)
    }
    root.style.setProperty('--font-weight-heading', themeConfig.typography.headingWeight)
    root.style.setProperty('--font-weight-body', themeConfig.typography.bodyWeight)
    root.style.setProperty('--font-weight-button', themeConfig.typography.buttonWeight)
    root.style.setProperty('--letter-spacing', themeConfig.typography.letterSpacing)
    root.style.setProperty('--letter-spacing-heading', themeConfig.typography.headingLetterSpacing)
    
    // Apply spacing variables
    root.style.setProperty('--border-radius', themeConfig.spacing.borderRadius)
    root.style.setProperty('--border-width', themeConfig.spacing.borderWidth)
    root.style.setProperty('--container-padding', themeConfig.spacing.containerPadding)
    root.style.setProperty('--section-padding', themeConfig.spacing.sectionPadding)
    
    // Apply custom CSS if provided
    if (themeConfig.customCSS) {
      const existingStyle = document.getElementById('custom-theme-css')
      if (existingStyle) {
        existingStyle.remove()
      }
      
      const style = document.createElement('style')
      style.id = 'custom-theme-css'
      style.textContent = themeConfig.customCSS
      document.head.appendChild(style)
    }
  }

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const contextValue: ThemeContextType = {
    theme,
    applyTheme,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Utility function to get theme-aware CSS classes
export function getThemeClasses(theme: SchoolTheme) {
  return {
    // Colors
    bgPrimary: 'bg-[var(--color-primary)]',
    bgPrimaryLight: 'bg-[var(--color-primaryLight)]',
    bgPrimaryDark: 'bg-[var(--color-primaryDark)]',
    bgSecondary: 'bg-[var(--color-secondary)]',
    bgSecondaryLight: 'bg-[var(--color-secondaryLight)]',
    bgSecondaryDark: 'bg-[var(--color-secondaryDark)]',
    bgAccent: 'bg-[var(--color-accent)]',
    bgAccentLight: 'bg-[var(--color-accentLight)]',
    bgAccentDark: 'bg-[var(--color-accentDark)]',
    bgSuccess: 'bg-[var(--color-success)]',
    bgWarning: 'bg-[var(--color-warning)]',
    bgError: 'bg-[var(--color-error)]',
    bgInfo: 'bg-[var(--color-info)]',
    bgBackground: 'bg-[var(--color-background)]',
    bgSurface: 'bg-[var(--color-surface)]',
    
    textPrimary: 'text-[var(--color-primary)]',
    textPrimaryLight: 'text-[var(--color-primaryLight)]',
    textPrimaryDark: 'text-[var(--color-primaryDark)]',
    textSecondary: 'text-[var(--color-secondary)]',
    textSecondaryLight: 'text-[var(--color-secondaryLight)]',
    textSecondaryDark: 'text-[var(--color-secondaryDark)]',
    textAccent: 'text-[var(--color-accent)]',
    textAccentLight: 'text-[var(--color-accentLight)]',
    textAccentDark: 'text-[var(--color-accentDark)]',
    textMain: 'text-[var(--color-text)]',
    textMuted: 'text-[var(--color-textSecondary)]',
    
    borderPrimary: 'border-[var(--color-primary)]',
    borderPrimaryDark: 'border-[var(--color-primaryDark)]',
    borderSecondary: 'border-[var(--color-secondary)]',
    borderSecondaryDark: 'border-[var(--color-secondaryDark)]',
    borderAccent: 'border-[var(--color-accent)]',
    borderAccentDark: 'border-[var(--color-accentDark)]',
    borderDefault: 'border-[var(--color-border)]',
    
    // Typography
    fontBase: 'font-[var(--font-family)]',
    fontHeading: `font-[var(--font-heading,var(--font-family))]`,
    fontWeightHeading: `font-[var(--font-weight-heading)]`,
    fontWeightBody: `font-[var(--font-weight-body)]`,
    fontWeightButton: `font-[var(--font-weight-button)]`,
    letterSpacing: `tracking-[var(--letter-spacing)]`,
    letterSpacingHeading: `tracking-[var(--letter-spacing-heading)]`,
    
    // Spacing
    borderRadius: `rounded-[var(--border-radius)]`,
    borderWidth: `border-[var(--border-width)]`,
  }
} 