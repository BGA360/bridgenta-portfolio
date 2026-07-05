import { defineCollection, z } from 'astro:content';

const projectCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    category: z.string(),
    status: z.string(),
    technologies: z.string(),
    description: z.string(),
    
    // Golden Template additions
    subtitle: z.string().optional(),
    timeline: z.string().optional(),
    devStack: z.array(z.string()).optional(),
    aiBuilders: z.array(z.string()).optional(),
    role: z.string().optional(),
    notice: z.string().optional(),
    
    // Section Title overrides
    sectionTitles: z.object({
      overview: z.string().optional(),
      problem: z.string().optional(),
      approach: z.string().optional(),
      action: z.string().optional(),
      results: z.string().optional(),
      takeaways: z.string().optional(),
    }).optional(),

    // Structured items
    artifacts: z.array(z.object({
      image: z.string(),
      title: z.string(),
      description: z.string()
    })).optional(),
    resultsGrid: z.array(z.object({
      icon: z.string().optional(),
      title: z.string(),
      description: z.string()
    })).optional(),
    cta: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      primaryText: z.string().optional(),
      primaryLink: z.string().optional(),
      secondaryText: z.string().optional(),
      secondaryLink: z.string().optional()
    }).optional()
  }),
});

const pagesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    hero: z.object({
      badge: z.string(),
      title: z.string(),
      lede: z.string(),
      primaryCtaText: z.string(),
      primaryCtaLink: z.string(),
      secondaryCtaText: z.string(),
      secondaryCtaLink: z.string(),
      trustIndicator: z.string(),
    }),
    bridge: z.object({
      row: z.string(),
      label: z.string(),
    }),
    about: z.object({
      badge: z.string(),
      title: z.string(),
      text1: z.string(),
      text2: z.string(),
      ctaText: z.string(),
      ctaLink: z.string(),
      portraitBadge: z.string(),
    }),
    projectsHeader: z.object({
      eyebrow: z.string(),
      title: z.string(),
      description: z.string(),
    }),
    qualificationsHeader: z.object({
      eyebrow: z.string(),
      title: z.string(),
      description: z.string(),
    }),
    principlesHeader: z.object({
      eyebrow: z.string(),
      title: z.string(),
      description: z.string(),
    }),
    skillsHeader: z.object({
      eyebrow: z.string(),
      title: z.string(),
      description: z.string(),
    }),
  }),
});

export const collections = {
  projects: projectCollection,
  pages: pagesCollection,
};
