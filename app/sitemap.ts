import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://escola.igrejaseiva.com.br';

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  }).catch(() => []);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 1 },
    { url: `${base}/cursos`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/sobre`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  const courseRoutes: MetadataRoute.Sitemap = courses.map(c => ({
    url: `${base}/cursos/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...courseRoutes];
}
