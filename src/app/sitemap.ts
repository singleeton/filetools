import type { MetadataRoute } from 'next'
import { tools } from '@/lib/tools-registry'
import { siteConfig } from '@/lib/site-config'
import { locales } from '@/lib/i18n/config'
import { getPublishedPostsForSitemap } from '@/lib/blog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    entries.push({
      url: `${siteConfig.url}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    })

    for (const tool of tools) {
      entries.push({
        url: `${siteConfig.url}/${locale}${tool.href}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }

    entries.push({
      url: `${siteConfig.url}/${locale}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    })
  }

  const posts = await getPublishedPostsForSitemap()
  for (const post of posts) {
    entries.push({
      url: `${siteConfig.url}/${post.locale}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }

  return entries
}
