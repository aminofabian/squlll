import { z } from 'zod';
export declare const HOMEPAGE_TEMPLATE_IDS: readonly ["campus-dawn", "assembly-hall", "playfield", "garden-court", "crest-motto", "skyline-cbc", "story-scroll", "horizon-board", "studio-day", "night-lights"];
export type HomepageTemplateId = (typeof HOMEPAGE_TEMPLATE_IDS)[number];
export type HomepageTemplateMeta = {
    id: HomepageTemplateId;
    name: string;
    tagline: string;
    mood: string;
};
export declare const HOMEPAGE_TEMPLATES: HomepageTemplateMeta[];
export type HomepageCta = {
    label: string;
    href: string;
};
export type HomepageNavLink = {
    label: string;
    href: string;
};
export type HomepageStatItem = {
    value: string;
    label: string;
    hint?: string;
};
export type HomepageOfferingItem = {
    icon: string;
    title: string;
    body: string;
    ctaLabel: string;
    href: string;
};
export type HomepageGalleryImage = {
    url: string;
    caption?: string;
};
export type HomepageTestimonial = {
    quote: string;
    name: string;
    role: string;
    photoUrl?: string;
};
export type HomepageTheme = {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    accent: string;
    ink: string;
    paper: string;
    radiusMode: 'sharp' | 'soft';
};
export type HomepageSectionType = 'nav' | 'hero' | 'stats' | 'offerings' | 'programs' | 'feeDownloads' | 'gallery' | 'testimonials' | 'cta' | 'footer';
export type HomepageSection = {
    id: string;
    type: HomepageSectionType;
    enabled: boolean;
    slots: Record<string, unknown>;
};
export type HomepageConfig = {
    templateId: HomepageTemplateId;
    theme: HomepageTheme;
    /** School logo URL (uploaded in Website Studio brand tab) */
    logoUrl?: string;
    sections: HomepageSection[];
    /** Optional school profile for SEO / structured data. */
    seo?: HomepageSeo;
};
/**
 * Optional school-profile fields used for SEO and schema.org structured data.
 * They live inside the homepage config so they ride the existing Website
 * Studio save + publish flow and the public `publicHomepageConfig` read — no
 * extra table or endpoint. All fields are optional and repaired field-by-field.
 */
export type HomepageSeo = {
    /** Official school name as it should appear in search results. */
    schoolName?: string;
    /** School motto / tagline. */
    motto?: string;
    /** e.g. Primary School, Secondary School, Mixed Day School. */
    schoolType?: string;
    foundedYear?: number;
    streetAddress?: string;
    /** Town / city. */
    addressLocality?: string;
    /** County. */
    addressRegion?: string;
    postalCode?: string;
    /** Defaults to Kenya. */
    addressCountry?: string;
    latitude?: number;
    longitude?: number;
    email?: string;
    phone?: string;
};
export type PublicSchoolGradeLevel = {
    id: string;
    name: string;
};
export type PublicSchoolSubject = {
    id: string;
    name: string;
};
export type PublicSchoolLevel = {
    id: string;
    name: string;
    description?: string;
    gradeLevels: PublicSchoolGradeLevel[];
    subjects: PublicSchoolSubject[];
};
export declare function createDefaultHomepageConfig(schoolName?: string): HomepageConfig;
export declare const homepageThemeSchema: any;
export declare const homepageSectionSchema: any;
/** Optional school-profile contract for SEO / structured data. */
export declare const homepageSeoSchema: any;
export declare const homepageConfigSchema: z.ZodType<HomepageConfig>;
export declare function parseHomepageConfig(raw: unknown, schoolName?: string): HomepageConfig;
export declare function getSection<T extends Record<string, unknown> = Record<string, unknown>>(config: HomepageConfig, type: HomepageSectionType): {
    section: HomepageSection;
    slots: T;
} | null;
/** Recommended brand palette per look — applied when switching templates. */
export declare const HOMEPAGE_TEMPLATE_THEMES: Record<HomepageTemplateId, HomepageTheme>;
export declare function applyTemplateKeepContent(config: HomepageConfig, templateId: HomepageTemplateId): HomepageConfig;
