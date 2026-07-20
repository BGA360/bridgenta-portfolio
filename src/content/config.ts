import { defineCollection, z } from 'astro:content';

const projectCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    description: z.string(),
    
    // Sidebar fields grouped
    sidebar: z.object({
      category: z.string(),
      status: z.string(),
      timeline: z.string().optional(),
      role: z.string().optional(),
      technologies: z.string(),
      devStack: z.array(z.string()).optional(),
      aiBuilders: z.array(z.string()).optional(),
      notice: z.string().optional(),
      evaluatedCommitSha: z.string().optional(),
      evaluationBaseline: z.string().optional(),
    }),
    
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
  schema: z.any(),
});

export const collections = {
  projects: projectCollection,
  pages: pagesCollection,
};
