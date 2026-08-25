import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import portfolioConfig from '../config/portfolio.json';

export async function GET(context: APIContext) {
  const projects = await getCollection('projects');
  const siteUrl = context.site ? context.site.origin : 'https://bridgenta.de';
  const activeProjectSlugs = portfolioConfig.activeProjectSlugs;

  const staticPages = [
    '/',
    '/about/',
    '/projects/',
    '/contact/',
    '/impressum/',
    '/datenschutz/'
  ];

  const projectPages = projects
    .filter(project => activeProjectSlugs.includes(project.slug))
    .map(project => `/project-${project.slug}/`);

  // Fetch learning data dynamically
  const categories = await getCollection('learningCategories');
  const articles = await getCollection('learning');
  const publishedArticles = articles.filter(
    (art) => art.data.publicationState === 'published'
  );

  const learningPages: string[] = [];
  if (publishedArticles.length > 0) {
    learningPages.push('/lernen/');
    const activeCategories = categories.filter((cat) =>
      publishedArticles.some((art) => art.data.category.id === cat.id)
    );
    for (const cat of activeCategories) {
      learningPages.push(`/lernen/themen/${cat.id}/`);
    }
    for (const art of publishedArticles) {
      learningPages.push(`/lernen/${art.slug}/`);
    }
  }

  const allPages = [...staticPages, ...projectPages, ...learningPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPages.map(path => `
  <url>
    <loc>${siteUrl}${path}</loc>
    <changefreq>${path === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${path === '/' ? '1.0' : path.startsWith('/project-') ? '0.8' : '0.5'}</priority>
  </url>`).join('').trim()}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
}
