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
export declare const homepageThemeSchema: z.ZodObject<{
    primary: z.ZodString;
    primaryDark: z.ZodString;
    primaryLight: z.ZodString;
    accent: z.ZodString;
    ink: z.ZodString;
    paper: z.ZodString;
    radiusMode: z.ZodEnum<["sharp", "soft"]>;
}, "strip", z.ZodTypeAny, {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    accent: string;
    ink: string;
    paper: string;
    radiusMode: "sharp" | "soft";
}, {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    accent: string;
    ink: string;
    paper: string;
    radiusMode: "sharp" | "soft";
}>;
export declare const homepageSectionSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"nav">;
    slots: z.ZodObject<{
        showTagline: z.ZodOptional<z.ZodBoolean>;
        portalLabel: z.ZodOptional<z.ZodString>;
        applyLabel: z.ZodOptional<z.ZodString>;
        links: z.ZodOptional<z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            href: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            href: string;
            label: string;
        }, {
            href: string;
            label: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        showTagline?: boolean | undefined;
        portalLabel?: string | undefined;
        applyLabel?: string | undefined;
        links?: {
            href: string;
            label: string;
        }[] | undefined;
    }, {
        showTagline?: boolean | undefined;
        portalLabel?: string | undefined;
        applyLabel?: string | undefined;
        links?: {
            href: string;
            label: string;
        }[] | undefined;
    }>;
    id: z.ZodString;
    enabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "nav";
    slots: {
        showTagline?: boolean | undefined;
        portalLabel?: string | undefined;
        applyLabel?: string | undefined;
        links?: {
            href: string;
            label: string;
        }[] | undefined;
    };
    id: string;
    enabled: boolean;
}, {
    type: "nav";
    slots: {
        showTagline?: boolean | undefined;
        portalLabel?: string | undefined;
        applyLabel?: string | undefined;
        links?: {
            href: string;
            label: string;
        }[] | undefined;
    };
    id: string;
    enabled: boolean;
}>, z.ZodObject<{
    type: z.ZodLiteral<"hero">;
    slots: z.ZodObject<{
        backgroundImage: z.ZodOptional<z.ZodString>;
        overlayStrength: z.ZodOptional<z.ZodNumber>;
        eyebrow: z.ZodOptional<z.ZodString>;
        headline: z.ZodOptional<z.ZodString>;
        subcopy: z.ZodOptional<z.ZodString>;
        primaryCta: z.ZodOptional<z.ZodObject<{
            label: z.ZodString;
            href: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            href: string;
            label: string;
        }, {
            href: string;
            label: string;
        }>>;
        secondaryCta: z.ZodOptional<z.ZodObject<{
            label: z.ZodString;
            href: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            href: string;
            label: string;
        }, {
            href: string;
            label: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        backgroundImage?: string | undefined;
        overlayStrength?: number | undefined;
        eyebrow?: string | undefined;
        headline?: string | undefined;
        subcopy?: string | undefined;
        primaryCta?: {
            href: string;
            label: string;
        } | undefined;
        secondaryCta?: {
            href: string;
            label: string;
        } | undefined;
    }, {
        backgroundImage?: string | undefined;
        overlayStrength?: number | undefined;
        eyebrow?: string | undefined;
        headline?: string | undefined;
        subcopy?: string | undefined;
        primaryCta?: {
            href: string;
            label: string;
        } | undefined;
        secondaryCta?: {
            href: string;
            label: string;
        } | undefined;
    }>;
    id: z.ZodString;
    enabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "hero";
    slots: {
        backgroundImage?: string | undefined;
        overlayStrength?: number | undefined;
        eyebrow?: string | undefined;
        headline?: string | undefined;
        subcopy?: string | undefined;
        primaryCta?: {
            href: string;
            label: string;
        } | undefined;
        secondaryCta?: {
            href: string;
            label: string;
        } | undefined;
    };
    id: string;
    enabled: boolean;
}, {
    type: "hero";
    slots: {
        backgroundImage?: string | undefined;
        overlayStrength?: number | undefined;
        eyebrow?: string | undefined;
        headline?: string | undefined;
        subcopy?: string | undefined;
        primaryCta?: {
            href: string;
            label: string;
        } | undefined;
        secondaryCta?: {
            href: string;
            label: string;
        } | undefined;
    };
    id: string;
    enabled: boolean;
}>, z.ZodObject<{
    type: z.ZodLiteral<"stats">;
    slots: z.ZodObject<{
        items: z.ZodOptional<z.ZodArray<z.ZodObject<{
            value: z.ZodString;
            label: z.ZodString;
            hint: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            label: string;
            value: string;
            hint?: string | undefined;
        }, {
            label: string;
            value: string;
            hint?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        items?: {
            label: string;
            value: string;
            hint?: string | undefined;
        }[] | undefined;
    }, {
        items?: {
            label: string;
            value: string;
            hint?: string | undefined;
        }[] | undefined;
    }>;
    id: z.ZodString;
    enabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "stats";
    slots: {
        items?: {
            label: string;
            value: string;
            hint?: string | undefined;
        }[] | undefined;
    };
    id: string;
    enabled: boolean;
}, {
    type: "stats";
    slots: {
        items?: {
            label: string;
            value: string;
            hint?: string | undefined;
        }[] | undefined;
    };
    id: string;
    enabled: boolean;
}>, z.ZodObject<{
    type: z.ZodLiteral<"offerings">;
    slots: z.ZodObject<{
        eyebrow: z.ZodOptional<z.ZodString>;
        headline: z.ZodOptional<z.ZodString>;
        subcopy: z.ZodOptional<z.ZodString>;
        items: z.ZodOptional<z.ZodArray<z.ZodObject<{
            icon: z.ZodString;
            title: z.ZodString;
            body: z.ZodString;
            ctaLabel: z.ZodString;
            href: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            ctaLabel: string;
            href: string;
            body: string;
            icon: string;
            title: string;
        }, {
            ctaLabel: string;
            href: string;
            body: string;
            icon: string;
            title: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        eyebrow?: string | undefined;
        headline?: string | undefined;
        subcopy?: string | undefined;
        items?: {
            ctaLabel: string;
            href: string;
            body: string;
            icon: string;
            title: string;
        }[] | undefined;
    }, {
        eyebrow?: string | undefined;
        headline?: string | undefined;
        subcopy?: string | undefined;
        items?: {
            ctaLabel: string;
            href: string;
            body: string;
            icon: string;
            title: string;
        }[] | undefined;
    }>;
    id: z.ZodString;
    enabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "offerings";
    slots: {
        eyebrow?: string | undefined;
        headline?: string | undefined;
        subcopy?: string | undefined;
        items?: {
            ctaLabel: string;
            href: string;
            body: string;
            icon: string;
            title: string;
        }[] | undefined;
    };
    id: string;
    enabled: boolean;
}, {
    type: "offerings";
    slots: {
        eyebrow?: string | undefined;
        headline?: string | undefined;
        subcopy?: string | undefined;
        items?: {
            ctaLabel: string;
            href: string;
            body: string;
            icon: string;
            title: string;
        }[] | undefined;
    };
    id: string;
    enabled: boolean;
}>, z.ZodObject<{
    type: z.ZodLiteral<"programs">;
    slots: z.ZodObject<{
        eyebrow: z.ZodOptional<z.ZodString>;
        headline: z.ZodOptional<z.ZodString>;
        subcopy: z.ZodOptional<z.ZodString>;
        useSchoolConfig: z.ZodOptional<z.ZodBoolean>;
        ctaLabel: z.ZodOptional<z.ZodString>;
        href: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        eyebrow?: string | undefined;
        headline?: string | undefined;
        subcopy?: string | undefined;
        useSchoolConfig?: boolean | undefined;
        ctaLabel?: string | undefined;
        href?: string | undefined;
    }, {
        eyebrow?: string | undefined;
        headline?: string | undefined;
        subcopy?: string | undefined;
        useSchoolConfig?: boolean | undefined;
        ctaLabel?: string | undefined;
        href?: string | undefined;
    }>;
    id: z.ZodString;
    enabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "programs";
    slots: {
        eyebrow?: string | undefined;
        headline?: string | undefined;
        subcopy?: string | undefined;
        useSchoolConfig?: boolean | undefined;
        ctaLabel?: string | undefined;
        href?: string | undefined;
    };
    id: string;
    enabled: boolean;
}, {
    type: "programs";
    slots: {
        eyebrow?: string | undefined;
        headline?: string | undefined;
        subcopy?: string | undefined;
        useSchoolConfig?: boolean | undefined;
        ctaLabel?: string | undefined;
        href?: string | undefined;
    };
    id: string;
    enabled: boolean;
}>, z.ZodObject<{
    type: z.ZodLiteral<"feeDownloads">;
    slots: z.ZodObject<{
        eyebrow: z.ZodOptional<z.ZodString>;
        headline: z.ZodOptional<z.ZodString>;
        subcopy: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        eyebrow?: string | undefined;
        headline?: string | undefined;
        subcopy?: string | undefined;
    }, {
        eyebrow?: string | undefined;
        headline?: string | undefined;
        subcopy?: string | undefined;
    }>;
    id: z.ZodString;
    enabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "feeDownloads";
    slots: {
        eyebrow?: string | undefined;
        headline?: string | undefined;
        subcopy?: string | undefined;
    };
    id: string;
    enabled: boolean;
}, {
    type: "feeDownloads";
    slots: {
        eyebrow?: string | undefined;
        headline?: string | undefined;
        subcopy?: string | undefined;
    };
    id: string;
    enabled: boolean;
}>, z.ZodObject<{
    type: z.ZodLiteral<"gallery">;
    slots: z.ZodObject<{
        eyebrow: z.ZodOptional<z.ZodString>;
        headline: z.ZodOptional<z.ZodString>;
        images: z.ZodOptional<z.ZodArray<z.ZodObject<{
            url: z.ZodString;
            caption: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            url: string;
            caption?: string | undefined;
        }, {
            url: string;
            caption?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        eyebrow?: string | undefined;
        headline?: string | undefined;
        images?: {
            url: string;
            caption?: string | undefined;
        }[] | undefined;
    }, {
        eyebrow?: string | undefined;
        headline?: string | undefined;
        images?: {
            url: string;
            caption?: string | undefined;
        }[] | undefined;
    }>;
    id: z.ZodString;
    enabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "gallery";
    slots: {
        eyebrow?: string | undefined;
        headline?: string | undefined;
        images?: {
            url: string;
            caption?: string | undefined;
        }[] | undefined;
    };
    id: string;
    enabled: boolean;
}, {
    type: "gallery";
    slots: {
        eyebrow?: string | undefined;
        headline?: string | undefined;
        images?: {
            url: string;
            caption?: string | undefined;
        }[] | undefined;
    };
    id: string;
    enabled: boolean;
}>, z.ZodObject<{
    type: z.ZodLiteral<"testimonials">;
    slots: z.ZodObject<{
        eyebrow: z.ZodOptional<z.ZodString>;
        headline: z.ZodOptional<z.ZodString>;
        items: z.ZodOptional<z.ZodArray<z.ZodObject<{
            quote: z.ZodString;
            name: z.ZodString;
            role: z.ZodString;
            photoUrl: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            quote: string;
            name: string;
            role: string;
            photoUrl?: string | undefined;
        }, {
            quote: string;
            name: string;
            role: string;
            photoUrl?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        eyebrow?: string | undefined;
        headline?: string | undefined;
        items?: {
            quote: string;
            name: string;
            role: string;
            photoUrl?: string | undefined;
        }[] | undefined;
    }, {
        eyebrow?: string | undefined;
        headline?: string | undefined;
        items?: {
            quote: string;
            name: string;
            role: string;
            photoUrl?: string | undefined;
        }[] | undefined;
    }>;
    id: z.ZodString;
    enabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "testimonials";
    slots: {
        eyebrow?: string | undefined;
        headline?: string | undefined;
        items?: {
            quote: string;
            name: string;
            role: string;
            photoUrl?: string | undefined;
        }[] | undefined;
    };
    id: string;
    enabled: boolean;
}, {
    type: "testimonials";
    slots: {
        eyebrow?: string | undefined;
        headline?: string | undefined;
        items?: {
            quote: string;
            name: string;
            role: string;
            photoUrl?: string | undefined;
        }[] | undefined;
    };
    id: string;
    enabled: boolean;
}>, z.ZodObject<{
    type: z.ZodLiteral<"cta">;
    slots: z.ZodObject<{
        headline: z.ZodOptional<z.ZodString>;
        body: z.ZodOptional<z.ZodString>;
        primaryCta: z.ZodOptional<z.ZodObject<{
            label: z.ZodString;
            href: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            href: string;
            label: string;
        }, {
            href: string;
            label: string;
        }>>;
        secondaryCta: z.ZodOptional<z.ZodObject<{
            label: z.ZodString;
            href: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            href: string;
            label: string;
        }, {
            href: string;
            label: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        headline?: string | undefined;
        primaryCta?: {
            href: string;
            label: string;
        } | undefined;
        secondaryCta?: {
            href: string;
            label: string;
        } | undefined;
        body?: string | undefined;
    }, {
        headline?: string | undefined;
        primaryCta?: {
            href: string;
            label: string;
        } | undefined;
        secondaryCta?: {
            href: string;
            label: string;
        } | undefined;
        body?: string | undefined;
    }>;
    id: z.ZodString;
    enabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "cta";
    slots: {
        headline?: string | undefined;
        primaryCta?: {
            href: string;
            label: string;
        } | undefined;
        secondaryCta?: {
            href: string;
            label: string;
        } | undefined;
        body?: string | undefined;
    };
    id: string;
    enabled: boolean;
}, {
    type: "cta";
    slots: {
        headline?: string | undefined;
        primaryCta?: {
            href: string;
            label: string;
        } | undefined;
        secondaryCta?: {
            href: string;
            label: string;
        } | undefined;
        body?: string | undefined;
    };
    id: string;
    enabled: boolean;
}>, z.ZodObject<{
    type: z.ZodLiteral<"footer">;
    slots: z.ZodObject<{
        blurb: z.ZodOptional<z.ZodString>;
        quickLinks: z.ZodOptional<z.ZodArray<z.ZodObject<{
            label: z.ZodString;
            href: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            href: string;
            label: string;
        }, {
            href: string;
            label: string;
        }>, "many">>;
        email: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        blurb?: string | undefined;
        quickLinks?: {
            href: string;
            label: string;
        }[] | undefined;
        email?: string | undefined;
        phone?: string | undefined;
    }, {
        blurb?: string | undefined;
        quickLinks?: {
            href: string;
            label: string;
        }[] | undefined;
        email?: string | undefined;
        phone?: string | undefined;
    }>;
    id: z.ZodString;
    enabled: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    type: "footer";
    slots: {
        blurb?: string | undefined;
        quickLinks?: {
            href: string;
            label: string;
        }[] | undefined;
        email?: string | undefined;
        phone?: string | undefined;
    };
    id: string;
    enabled: boolean;
}, {
    type: "footer";
    slots: {
        blurb?: string | undefined;
        quickLinks?: {
            href: string;
            label: string;
        }[] | undefined;
        email?: string | undefined;
        phone?: string | undefined;
    };
    id: string;
    enabled: boolean;
}>]>;
/** Strict config contract. Unknown keys are stripped, wrong types rejected. */
export declare const homepageConfigSchema: z.ZodType<HomepageConfig>;
export declare function parseHomepageConfig(raw: unknown, schoolName?: string): HomepageConfig;
export declare function getSection<T extends Record<string, unknown> = Record<string, unknown>>(config: HomepageConfig, type: HomepageSectionType): {
    section: HomepageSection;
    slots: T;
} | null;
/** Recommended brand palette per look — applied when switching templates. */
export declare const HOMEPAGE_TEMPLATE_THEMES: Record<HomepageTemplateId, HomepageTheme>;
export declare function applyTemplateKeepContent(config: HomepageConfig, templateId: HomepageTemplateId): HomepageConfig;
