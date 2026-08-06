"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HOMEPAGE_TEMPLATE_THEMES = exports.homepageConfigSchema = exports.homepageSectionSchema = exports.homepageThemeSchema = exports.HOMEPAGE_TEMPLATES = exports.HOMEPAGE_TEMPLATE_IDS = void 0;
exports.createDefaultHomepageConfig = createDefaultHomepageConfig;
exports.parseHomepageConfig = parseHomepageConfig;
exports.getSection = getSection;
exports.applyTemplateKeepContent = applyTemplateKeepContent;
const zod_1 = require("zod");
/* ------------------------------------------------------------------ */
/* Template registry                                                   */
/* ------------------------------------------------------------------ */
exports.HOMEPAGE_TEMPLATE_IDS = [
    'campus-dawn',
    'assembly-hall',
    'playfield',
    'garden-court',
    'crest-motto',
    'skyline-cbc',
    'story-scroll',
    'horizon-board',
    'studio-day',
    'night-lights',
];
exports.HOMEPAGE_TEMPLATES = [
    {
        id: 'campus-dawn',
        name: 'Campus Dawn',
        tagline: 'Ledger clarity, forest ink, full-bleed campus',
        mood: 'Institutional',
    },
    {
        id: 'assembly-hall',
        name: 'Assembly Hall',
        tagline: 'Ruled paper, red margin, chalkboard numbers',
        mood: 'Notebook',
    },
    {
        id: 'playfield',
        name: 'Playfield',
        tagline: 'Boarding pass, departures board, terminal campus',
        mood: 'Travel',
    },
    {
        id: 'garden-court',
        name: 'Garden Court',
        tagline: 'Walled conservatory, herbarium labels, morning light',
        mood: 'Botanical',
    },
    {
        id: 'crest-motto',
        name: 'Crest & Motto',
        tagline: 'Traditional Kenyan private school crest',
        mood: 'Classic',
    },
    {
        id: 'skyline-cbc',
        name: 'Skyline CBC',
        tagline: 'Modular pathways, competency grid',
        mood: 'Modern',
    },
    {
        id: 'story-scroll',
        name: 'Story Scroll',
        tagline: 'Growing vine, greenhouse panes, harvest report',
        mood: 'Greenhouse',
    },
    {
        id: 'horizon-board',
        name: 'Horizon Board',
        tagline: 'Cinematic open-air, glass nav',
        mood: 'Airy',
    },
    {
        id: 'studio-day',
        name: 'Studio Day',
        tagline: 'Arts magazine, asymmetric crops',
        mood: 'Creative',
    },
    {
        id: 'night-lights',
        name: 'Night Lights',
        tagline: 'Evening prestige, luminous accents',
        mood: 'Dramatic',
    },
];
/* ------------------------------------------------------------------ */
/* Defaults                                                            */
/* ------------------------------------------------------------------ */
function createDefaultHomepageConfig(schoolName = 'Our School') {
    return {
        templateId: 'campus-dawn',
        theme: {
            primary: '#246a59',
            primaryDark: '#1a4c40',
            primaryLight: '#2d8570',
            accent: '#a7f3d0',
            ink: '#0a1f1a',
            paper: '#f3f7f5',
            radiusMode: 'sharp',
        },
        sections: [
            {
                id: 'nav',
                type: 'nav',
                enabled: true,
                slots: {
                    showTagline: true,
                    portalLabel: 'Portal',
                    applyLabel: 'Apply now',
                    links: [
                        { label: 'Home', href: '/' },
                        { label: 'About', href: '/about' },
                        { label: 'Programs', href: '/programs' },
                        { label: 'Admissions', href: '/admissions' },
                        { label: 'Contact', href: '/contact' },
                    ],
                },
            },
            {
                id: 'hero',
                type: 'hero',
                enabled: true,
                slots: {
                    backgroundImage: '/schooll.png',
                    overlayStrength: 0.55,
                    eyebrow: 'Inspiring excellence every day',
                    headline: schoolName,
                    subcopy: 'A place where curious minds grow into confident learners — through rigorous academics, character, and community.',
                    primaryCta: { label: 'Apply now', href: '/apply' },
                    secondaryCta: { label: 'Parent & student login', href: '/login' },
                },
            },
            {
                id: 'stats',
                type: 'stats',
                enabled: true,
                slots: {
                    items: [
                        { value: '1,200+', label: 'Students', hint: 'Thriving learners' },
                        { value: '98%', label: 'Success rate', hint: 'Academic excellence' },
                        { value: '40+', label: 'Subjects', hint: 'Diverse curriculum' },
                        { value: '25+', label: 'Years', hint: 'Of excellence' },
                    ],
                },
            },
            {
                id: 'offerings',
                type: 'offerings',
                enabled: true,
                slots: {
                    eyebrow: `Life at ${schoolName}`,
                    headline: 'What we offer',
                    subcopy: 'Academics, enrichment, and care — the essentials of a complete education, kept clear and close.',
                    items: [
                        {
                            icon: 'BookOpen',
                            title: 'Academic excellence',
                            body: 'A rigorous pathway across core disciplines — designed to challenge, inspire, and prepare every learner.',
                            ctaLabel: 'Explore academics',
                            href: '/academics',
                        },
                        {
                            icon: 'GraduationCap',
                            title: 'Life beyond class',
                            body: 'Sports, arts, clubs, and leadership — space for talent and character to grow outside the timetable.',
                            ctaLabel: 'View activities',
                            href: '/activities',
                        },
                        {
                            icon: 'Heart',
                            title: 'Student support',
                            body: "Guidance, tutoring, and care so every student has the academic and personal backing they need.",
                            ctaLabel: 'Learn more',
                            href: '/support',
                        },
                    ],
                },
            },
            {
                id: 'programs',
                type: 'programs',
                enabled: true,
                slots: {
                    eyebrow: 'Pathways',
                    headline: 'Educational programs',
                    subcopy: 'Structured levels and subjects that meet students where they are — and take them further.',
                    useSchoolConfig: true,
                    ctaLabel: 'View all programs',
                    href: '/programs',
                },
            },
            {
                id: 'feeDownloads',
                type: 'feeDownloads',
                enabled: true,
                slots: {
                    eyebrow: 'Fees & admissions',
                    headline: 'Download fee structure',
                    subcopy: 'Current fee plans — the same letters parents receive from the school fees office.',
                },
            },
            {
                id: 'gallery',
                type: 'gallery',
                enabled: false,
                slots: {
                    eyebrow: 'Campus life',
                    headline: 'Moments from our school',
                    images: [],
                },
            },
            {
                id: 'testimonials',
                type: 'testimonials',
                enabled: false,
                slots: {
                    eyebrow: 'Voices',
                    headline: 'What families say',
                    items: [],
                },
            },
            {
                id: 'cta',
                type: 'cta',
                enabled: true,
                slots: {
                    headline: 'Ready to join our community?',
                    body: `Start an application, or visit campus and see how ${schoolName} feels in person.`,
                    primaryCta: { label: 'Apply for admission', href: '/apply' },
                    secondaryCta: { label: 'Schedule a visit', href: '/visit' },
                },
            },
            {
                id: 'footer',
                type: 'footer',
                enabled: true,
                slots: {
                    blurb: 'A place where curious minds grow into confident learners — through rigorous academics, character, and community.',
                    quickLinks: [
                        { label: 'About us', href: '/about' },
                        { label: 'Admissions', href: '/admissions' },
                        { label: 'Programs', href: '/programs' },
                        { label: 'Fee structure', href: '/#fee-structure' },
                        { label: 'News & events', href: '/news' },
                    ],
                    email: '',
                    phone: '',
                },
            },
        ],
    };
}
/* ------------------------------------------------------------------ */
/* Validation schemas (canonical contract)                             */
/* ------------------------------------------------------------------ */
const ctaSchema = zod_1.z.object({ label: zod_1.z.string(), href: zod_1.z.string() });
const navLinkSchema = zod_1.z.object({ label: zod_1.z.string(), href: zod_1.z.string() });
const statItemSchema = zod_1.z.object({
    value: zod_1.z.string(),
    label: zod_1.z.string(),
    hint: zod_1.z.string().optional(),
});
const offeringItemSchema = zod_1.z.object({
    icon: zod_1.z.string(),
    title: zod_1.z.string(),
    body: zod_1.z.string(),
    ctaLabel: zod_1.z.string(),
    href: zod_1.z.string(),
});
const galleryImageSchema = zod_1.z.object({
    url: zod_1.z.string(),
    caption: zod_1.z.string().optional(),
});
const testimonialSchema = zod_1.z.object({
    quote: zod_1.z.string(),
    name: zod_1.z.string(),
    role: zod_1.z.string(),
    photoUrl: zod_1.z.string().optional(),
});
const colorSchema = zod_1.z.string().min(1);
const radiusModeSchema = zod_1.z.enum(['sharp', 'soft']);
exports.homepageThemeSchema = zod_1.z.object({
    primary: colorSchema,
    primaryDark: colorSchema,
    primaryLight: colorSchema,
    accent: colorSchema,
    ink: colorSchema,
    paper: colorSchema,
    radiusMode: radiusModeSchema,
});
const navSlotsSchema = zod_1.z.object({
    showTagline: zod_1.z.boolean().optional(),
    portalLabel: zod_1.z.string().optional(),
    applyLabel: zod_1.z.string().optional(),
    links: zod_1.z.array(navLinkSchema).optional(),
});
const heroSlotsSchema = zod_1.z.object({
    backgroundImage: zod_1.z.string().optional(),
    overlayStrength: zod_1.z.number().min(0.2).max(0.9).optional(),
    eyebrow: zod_1.z.string().optional(),
    headline: zod_1.z.string().optional(),
    subcopy: zod_1.z.string().optional(),
    primaryCta: ctaSchema.optional(),
    secondaryCta: ctaSchema.optional(),
});
const statsSlotsSchema = zod_1.z.object({
    items: zod_1.z.array(statItemSchema).optional(),
});
const offeringsSlotsSchema = zod_1.z.object({
    eyebrow: zod_1.z.string().optional(),
    headline: zod_1.z.string().optional(),
    subcopy: zod_1.z.string().optional(),
    items: zod_1.z.array(offeringItemSchema).optional(),
});
const programsSlotsSchema = zod_1.z.object({
    eyebrow: zod_1.z.string().optional(),
    headline: zod_1.z.string().optional(),
    subcopy: zod_1.z.string().optional(),
    useSchoolConfig: zod_1.z.boolean().optional(),
    ctaLabel: zod_1.z.string().optional(),
    href: zod_1.z.string().optional(),
});
const feeDownloadsSlotsSchema = zod_1.z.object({
    eyebrow: zod_1.z.string().optional(),
    headline: zod_1.z.string().optional(),
    subcopy: zod_1.z.string().optional(),
});
const gallerySlotsSchema = zod_1.z.object({
    eyebrow: zod_1.z.string().optional(),
    headline: zod_1.z.string().optional(),
    images: zod_1.z.array(galleryImageSchema).optional(),
});
const testimonialsSlotsSchema = zod_1.z.object({
    eyebrow: zod_1.z.string().optional(),
    headline: zod_1.z.string().optional(),
    items: zod_1.z.array(testimonialSchema).optional(),
});
const ctaSlotsSchema = zod_1.z.object({
    headline: zod_1.z.string().optional(),
    body: zod_1.z.string().optional(),
    primaryCta: ctaSchema.optional(),
    secondaryCta: ctaSchema.optional(),
});
const footerSlotsSchema = zod_1.z.object({
    blurb: zod_1.z.string().optional(),
    quickLinks: zod_1.z.array(navLinkSchema).optional(),
    email: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
});
const sectionSlotSchemas = {
    nav: navSlotsSchema,
    hero: heroSlotsSchema,
    stats: statsSlotsSchema,
    offerings: offeringsSlotsSchema,
    programs: programsSlotsSchema,
    feeDownloads: feeDownloadsSlotsSchema,
    gallery: gallerySlotsSchema,
    testimonials: testimonialsSlotsSchema,
    cta: ctaSlotsSchema,
    footer: footerSlotsSchema,
};
const sectionBaseSchema = { id: zod_1.z.string(), enabled: zod_1.z.boolean() };
exports.homepageSectionSchema = zod_1.z.discriminatedUnion('type', [
    zod_1.z.object({ ...sectionBaseSchema, type: zod_1.z.literal('nav'), slots: navSlotsSchema }),
    zod_1.z.object({ ...sectionBaseSchema, type: zod_1.z.literal('hero'), slots: heroSlotsSchema }),
    zod_1.z.object({ ...sectionBaseSchema, type: zod_1.z.literal('stats'), slots: statsSlotsSchema }),
    zod_1.z.object({
        ...sectionBaseSchema,
        type: zod_1.z.literal('offerings'),
        slots: offeringsSlotsSchema,
    }),
    zod_1.z.object({
        ...sectionBaseSchema,
        type: zod_1.z.literal('programs'),
        slots: programsSlotsSchema,
    }),
    zod_1.z.object({
        ...sectionBaseSchema,
        type: zod_1.z.literal('feeDownloads'),
        slots: feeDownloadsSlotsSchema,
    }),
    zod_1.z.object({
        ...sectionBaseSchema,
        type: zod_1.z.literal('gallery'),
        slots: gallerySlotsSchema,
    }),
    zod_1.z.object({
        ...sectionBaseSchema,
        type: zod_1.z.literal('testimonials'),
        slots: testimonialsSlotsSchema,
    }),
    zod_1.z.object({ ...sectionBaseSchema, type: zod_1.z.literal('cta'), slots: ctaSlotsSchema }),
    zod_1.z.object({
        ...sectionBaseSchema,
        type: zod_1.z.literal('footer'),
        slots: footerSlotsSchema,
    }),
]);
/** Strict config contract. Unknown keys are stripped, wrong types rejected. */
exports.homepageConfigSchema = zod_1.z.object({
    templateId: zod_1.z.enum(exports.HOMEPAGE_TEMPLATE_IDS),
    theme: exports.homepageThemeSchema,
    logoUrl: zod_1.z.string().optional(),
    sections: zod_1.z.array(exports.homepageSectionSchema),
});
/* ------------------------------------------------------------------ */
/* Tolerant normalization                                              */
/*                                                                     */
/* Always returns a valid HomepageConfig. Legacy or partially corrupt  */
/* payloads are repaired field-by-field against the defaults instead   */
/* of being rejected wholesale, so the public site and studio can      */
/* never be broken by bad stored data.                                 */
/* ------------------------------------------------------------------ */
function isHomepageSectionType(value) {
    return typeof value === 'string' && value in sectionSlotSchemas;
}
function parseTheme(raw, fallback) {
    if (!raw || typeof raw !== 'object')
        return fallback;
    const source = raw;
    const next = { ...fallback };
    for (const key of [
        'primary',
        'primaryDark',
        'primaryLight',
        'accent',
        'ink',
        'paper',
    ]) {
        const parsed = colorSchema.safeParse(source[key]);
        if (parsed.success)
            next[key] = parsed.data;
    }
    const radius = radiusModeSchema.safeParse(source.radiusMode);
    if (radius.success)
        next.radiusMode = radius.data;
    return next;
}
function parseSlotField(schema, value) {
    const parsed = schema.safeParse(value);
    if (parsed.success)
        return parsed.data;
    // Arrays: salvage valid elements instead of dropping the whole list.
    // Slot fields are declared `.optional()`, which wraps the array in a
    // ZodOptional — unwrap it before checking for ZodArray.
    const inner = schema instanceof zod_1.z.ZodOptional ? schema._def.innerType : schema;
    if (inner instanceof zod_1.z.ZodArray && Array.isArray(value)) {
        const salvaged = value
            .map((item) => inner.element.safeParse(item))
            .filter((r) => r.success)
            .map((r) => r.data);
        if (salvaged.length > 0)
            return salvaged;
    }
    return undefined;
}
function parseSlots(type, raw, baseSlots) {
    if (!raw || typeof raw !== 'object')
        return baseSlots;
    const schema = sectionSlotSchemas[type];
    const source = raw;
    const whole = schema.safeParse(source);
    if (whole.success)
        return { ...baseSlots, ...whole.data };
    const merged = { ...baseSlots };
    for (const [key, fieldSchema] of Object.entries(schema.shape)) {
        const value = source[key];
        if (value === undefined)
            continue;
        const parsed = parseSlotField(fieldSchema, value);
        if (parsed !== undefined)
            merged[key] = parsed;
    }
    return merged;
}
function parseSection(raw, base) {
    if (!raw || typeof raw !== 'object')
        return null;
    const source = raw;
    if (!isHomepageSectionType(source.type))
        return null;
    const type = source.type;
    const baseSection = base.sections.find((s) => s.type === type);
    if (!baseSection)
        return null;
    return {
        id: typeof source.id === 'string' ? source.id : baseSection.id,
        type,
        enabled: typeof source.enabled === 'boolean' ? source.enabled : baseSection.enabled,
        slots: parseSlots(type, source.slots, baseSection.slots),
    };
}
function parseHomepageConfig(raw, schoolName = 'Our School') {
    const base = createDefaultHomepageConfig(schoolName);
    if (!raw || typeof raw !== 'object')
        return base;
    const source = raw;
    const templateId = exports.HOMEPAGE_TEMPLATE_IDS.includes(source.templateId)
        ? source.templateId
        : base.templateId;
    const theme = parseTheme(source.theme, base.theme);
    const logoUrl = typeof source.logoUrl === 'string' && source.logoUrl.trim().length > 0
        ? source.logoUrl
        : undefined;
    const sections = [];
    const seenTypes = new Set();
    if (Array.isArray(source.sections)) {
        for (const rawSection of source.sections) {
            const section = parseSection(rawSection, base);
            if (section && !seenTypes.has(section.type)) {
                seenTypes.add(section.type);
                sections.push(section);
            }
        }
    }
    const result = {
        templateId,
        theme,
        sections: sections.length > 0 ? sections : base.sections,
    };
    if (logoUrl !== undefined)
        result.logoUrl = logoUrl;
    return result;
}
/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function getSection(config, type) {
    const section = config.sections.find((s) => s.type === type && s.enabled);
    if (!section)
        return null;
    return { section, slots: section.slots };
}
/** Recommended brand palette per look — applied when switching templates. */
exports.HOMEPAGE_TEMPLATE_THEMES = {
    'campus-dawn': {
        primary: '#246a59',
        primaryDark: '#1a4c40',
        primaryLight: '#2d8570',
        accent: '#a7f3d0',
        ink: '#0a1f1a',
        paper: '#f3f7f5',
        radiusMode: 'sharp',
    },
    'assembly-hall': {
        primary: '#AE3A2B',
        primaryDark: '#8B2E22',
        primaryLight: '#C45A4A',
        accent: '#CE9A22',
        ink: '#1C2B45',
        paper: '#ECE1C3',
        radiusMode: 'soft',
    },
    playfield: {
        primary: '#C79A3D',
        primaryDark: '#8E7134',
        primaryLight: '#DCAE4D',
        accent: '#C0432B',
        ink: '#0E2E33',
        paper: '#F1E8D6',
        radiusMode: 'soft',
    },
    'garden-court': {
        primary: '#5F7D5A',
        primaryDark: '#3F553C',
        primaryLight: '#7D9A78',
        accent: '#C17A4A',
        ink: '#243028',
        paper: '#F4EFE4',
        radiusMode: 'soft',
    },
    'crest-motto': {
        primary: '#854d0e',
        primaryDark: '#713f12',
        primaryLight: '#a16207',
        accent: '#fde68a',
        ink: '#1c1917',
        paper: '#fafaf9',
        radiusMode: 'sharp',
    },
    'skyline-cbc': {
        primary: '#0ea5e9',
        primaryDark: '#0369a1',
        primaryLight: '#38bdf8',
        accent: '#e0f2fe',
        ink: '#0f172a',
        paper: '#f8fafc',
        radiusMode: 'sharp',
    },
    'story-scroll': {
        primary: '#2F4A34',
        primaryDark: '#1F3226',
        primaryLight: '#3E6247',
        accent: '#C1652E',
        ink: '#26301F',
        paper: '#EEF0E2',
        radiusMode: 'soft',
    },
    'horizon-board': {
        primary: '#0ea5e9',
        primaryDark: '#0369a1',
        primaryLight: '#38bdf8',
        accent: '#e0f2fe',
        ink: '#0c4a6e',
        paper: '#f0f9ff',
        radiusMode: 'soft',
    },
    'studio-day': {
        primary: '#ea580c',
        primaryDark: '#c2410c',
        primaryLight: '#f97316',
        accent: '#fed7aa',
        ink: '#7c2d12',
        paper: '#fff7ed',
        radiusMode: 'soft',
    },
    'night-lights': {
        primary: '#134e4a',
        primaryDark: '#042f2e',
        primaryLight: '#0f766e',
        accent: '#5eead4',
        ink: '#070f0c',
        paper: '#0a1a16',
        radiusMode: 'sharp',
    },
};
function applyTemplateKeepContent(config, templateId) {
    return {
        ...config,
        templateId,
        theme: exports.HOMEPAGE_TEMPLATE_THEMES[templateId] || config.theme,
    };
}
