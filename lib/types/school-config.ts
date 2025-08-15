// Base subject information that can come from either subject or customSubject
export interface BaseSubject {
  id: string;
  name: string;
  code: string;
  category: string | null;
  department: string | null;
  shortName: string | null;
}

// Curriculum information
export interface Curriculum {
  id: string;
  name: string;
}

// Tenant subject that wraps either a system subject or custom subject
export interface TenantSubject {
  id: string;
  subjectType: 'core' | 'elective' | 'optional';
  isCompulsory: boolean;
  totalMarks: number;
  passingMarks: number;
  creditHours: number;
  isActive: boolean;
  curriculum: Curriculum;
  subject: BaseSubject | null; // System subject
  customSubject: BaseSubject | null; // Custom subject
}

// Legacy Subject interface for backward compatibility
export interface Subject {
  id: string;
  name: string;
  code: string;
  subjectType: string;
  category: string | null;
  department: string | null;
  shortName: string | null;
  isCompulsory: boolean | null;
  totalMarks: number | null;
  passingMarks: number | null;
  creditHours: number | null;
  curriculum: string | null;
}

export interface Stream {
  id: string;
  name: string;
}

export interface GradeLevel {
  id: string;
  name: string;
  age: number | null;
  streams: Stream[];
}

export interface Level {
  id: string;
  name: string;
  description: string;
  subjects?: Subject[]; // Optional for backward compatibility
  gradeLevels: GradeLevel[];
}

export interface School {
  id: string;
  schoolName: string;
  subdomain: string;
}

// Theme Configuration Types
export interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export interface Typography {
  fontFamily: string;
  headingFontFamily?: string;
  headingWeight: string;
  bodyWeight: string;
  buttonWeight: string;
  letterSpacing: string;
  headingLetterSpacing: string;
}

export interface Spacing {
  borderRadius: string;
  borderWidth: string;
  shadowIntensity: string;
  containerPadding: string;
  sectionPadding: string;
}

export interface HeroConfig {
  backgroundStyle: 'solid' | 'gradient' | 'image';
  backgroundImage?: string;
  title: string;
  subtitle: string;
  ctaButtons: {
    primary: { text: string; href: string; };
    secondary: { text: string; href: string; };
  };
}

export interface NavigationConfig {
  logoStyle: 'text' | 'icon' | 'combined';
  showTagline: boolean;
  tagline: string;
  menuItems: Array<{
    label: string;
    href: string;
    icon?: string;
  }>;
}

export interface FooterConfig {
  showLogo: boolean;
  showQuickLinks: boolean;
  showContact: boolean;
  copyrightText: string;
  contactEmail: string;
  contactPhone: string;
}

export interface SchoolTheme {
  id: string;
  name: string;
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  hero: HeroConfig;
  navigation: NavigationConfig;
  footer: FooterConfig;
  customCSS?: string;
}

export interface SchoolConfiguration {
  id: string;
  selectedLevels: Level[];
  tenant: School;
  theme?: SchoolTheme;
}

export interface LevelClass {
  name: string;
  age: string;
}

export interface LevelInput {
  name: string;
  description: string;
  classes: LevelClass[];
} 