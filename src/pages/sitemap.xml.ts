import { getCollection } from 'astro:content';

export async function GET() {
  const projects = await getCollection('projects');
  const siteUrl = 'https://bridgenta.de';

  const staticPages = [
    '',
    '/about',
    '/projects',
    '/contact',
    '/impressum',
    '/datenschutz'
  ];

  const projectPages = projects.map(project => `/project-${project.slug}`);
  const allPages = [...staticPages, ...projectPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPages.map(path => `
  <url>
    <loc>${siteUrl}${path}</loc>
    <changefreq>${path === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${path === '' ? '1.0' : path.startsWith('/project-') ? '0.8' : '0.5'}</priority>
  </url>`).join('').trim()}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
}
