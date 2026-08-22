import { defineCollection, reference, z } from 'astro:content';

const projectCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    description: z.string(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    schemaType: z.enum(['CreativeWork', 'SoftwareApplication', 'WebApplication']).optional(),
    
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

const learningCategoriesCollection = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().min(1),
    purpose: z.string().min(1),
    includedTopics: z.array(z.string().min(1)).nonempty(),
    excludedTopics: z.array(z.string().min(1)).nonempty(),
  })
});

const learningCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    category: reference('learningCategories'),
    learningLevel: z.enum(['public', 'beginner', 'intermediate', 'advanced']),
    publicationState: z.enum(['draft', 'review', 'published']),
    publicStatus: z.enum(['historical', 'corrected']).optional(),
    publishedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
  }).refine((data) => {
    // published articles must have a valid publishedAt date
    if (data.publicationState === 'published') {
      return data.publishedAt !== undefined;
    }
    // draft and review must NOT have an explicit publicStatus
    if (data.publicationState !== 'published') {
      return data.publicStatus === undefined;
    }
    return true;
  }, {
    message: "Published articles require publishedAt. Drafts/reviews cannot declare publicStatus.",
    path: ["publishedAt"]
  })
});

export const collections = {
  projects: projectCollection,
  pages: pagesCollection,
  learningCategories: learningCategoriesCollection,
  learning: learningCollection,
};
