import { z } from 'zod';
import registryRaw from '../data/project_registry.json' with { type: 'json' };

export const LifecycleStateSchema = z.enum([
  'CONCEPT',
  'IN_DEVELOPMENT',
  'PRIVATE_BETA',
  'COMPLETED',
  'MAINTENANCE',
  'ARCHIVED',
]);
export type LifecycleState = z.infer<typeof LifecycleStateSchema>;

export const VisibilitySchema = z.enum([
  'PUBLIC',
  'UNLISTED',
  'PRIVATE',
  'DRAFT',
]);
export type Visibility = z.infer<typeof VisibilitySchema>;

export const SchemaTypeSchema = z.enum([
  'SoftwareApplication',
  'WebApplication',
  'CreativeWork',
]);
export type SchemaType = z.infer<typeof SchemaTypeSchema>;

export const ProjectRegistryEntrySchema = z.object({
  projectId: z.string().regex(/^PRJ-[A-Z0-9_-]+$/, 'Invalid projectId format (must match ^PRJ-[A-Z0-9_-]+$)'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format (must be lowercase alphanumeric with hyphens)'),
  name: z.string().min(1),
  category: z.string().min(1),
  lifecycleState: LifecycleStateSchema,
  visibility: VisibilitySchema,
  featured: z.boolean(),
  featuredOrder: z.number().int().nonnegative().optional(),
  catalogOrder: z.number().int().nonnegative(),
  hasCaseStudy: z.boolean(),
  contentRef: z.string().min(1),
  cardImage: z.string(),
  heroImage: z.string(),
  schemaType: SchemaTypeSchema,
  learningRefs: z.array(z.string()).default([]),
}).refine(
  (data) => !data.hasCaseStudy || data.visibility === 'PUBLIC',
  {
    message: 'Only PUBLIC projects may have hasCaseStudy=true',
    path: ['hasCaseStudy'],
  }
);

export type ProjectRegistryEntry = z.infer<typeof ProjectRegistryEntrySchema>;

const RegistryListSchema = z.array(ProjectRegistryEntrySchema).superRefine((projects, ctx) => {
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    if (seenIds.has(p.projectId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate projectId detected: ${p.projectId}`,
        path: [i, 'projectId'],
      });
    }
    seenIds.add(p.projectId);

    if (seenSlugs.has(p.slug)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate slug detected: ${p.slug}`,
        path: [i, 'slug'],
      });
    }
    seenSlugs.add(p.slug);

    if (p.hasCaseStudy && p.visibility !== 'PUBLIC') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Project ${p.projectId} declares hasCaseStudy=true but visibility is ${p.visibility}. Only PUBLIC projects may have public case studies.`,
        path: [i, 'hasCaseStudy'],
      });
    }
  }
});

// Validate registry at module load time to fail-fast on misconfiguration
export const projectRegistry: ProjectRegistryEntry[] = RegistryListSchema.parse(registryRaw);

export function getAllRegisteredProjects(): ProjectRegistryEntry[] {
  return [...projectRegistry];
}

export function getPublicProjects(): ProjectRegistryEntry[] {
  return projectRegistry
    .filter((p) => p.visibility === 'PUBLIC')
    .sort((a, b) => a.catalogOrder - b.catalogOrder);
}

export function getFeaturedProjects(): ProjectRegistryEntry[] {
  return projectRegistry
    .filter((p) => p.visibility === 'PUBLIC' && p.featured)
    .sort((a, b) => (a.featuredOrder ?? a.catalogOrder) - (b.featuredOrder ?? b.catalogOrder));
}

export function getCaseStudyProjects(): ProjectRegistryEntry[] {
  return projectRegistry
    .filter((p) => p.visibility === 'PUBLIC' && p.hasCaseStudy)
    .sort((a, b) => a.catalogOrder - b.catalogOrder);
}

export function getSitemapProjectRoutes(): string[] {
  return getCaseStudyProjects().map((p) => `/project-${p.slug}/`);
}

export function getProjectBySlug(slug: string): ProjectRegistryEntry | undefined {
  return projectRegistry.find((p) => p.slug === slug);
}

export function getProjectById(projectId: string): ProjectRegistryEntry | undefined {
  return projectRegistry.find((p) => p.projectId === projectId);
}

export function resolveProjectRef(ref: string): ProjectRegistryEntry | undefined {
  return projectRegistry.find((p) => p.projectId === ref || p.slug === ref);
}

export function getLifecycleBadgeClass(state: LifecycleState): string {
  switch (state) {
    case 'IN_DEVELOPMENT':
      return 'badge--dev';
    case 'PRIVATE_BETA':
      return 'badge--beta';
    case 'CONCEPT':
      return 'badge--concept';
    case 'COMPLETED':
      return 'badge--done';
    case 'MAINTENANCE':
    case 'ARCHIVED':
      return 'badge--exp';
    default:
      return 'badge--dev';
  }
}

export function getLifecycleLabel(state: LifecycleState): string {
  switch (state) {
    case 'IN_DEVELOPMENT':
      return 'In Entwicklung';
    case 'PRIVATE_BETA':
      return 'Private Beta';
    case 'CONCEPT':
      return 'Konzept / Aufbau';
    case 'COMPLETED':
      return 'Abgeschlossen';
    case 'MAINTENANCE':
      return 'Wartung';
    case 'ARCHIVED':
      return 'Archiviert';
    default:
      return state;
  }
}
