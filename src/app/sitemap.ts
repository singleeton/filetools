import type { MetadataRoute } from 'next'
import { tools } from '@/lib/tools-registry'
import { siteConfig } from '@/lib/site-config'
import { locales } from '@/lib/i18n/config'

export default function sitemap(): MetadataRoute.Sitemap {
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
  }

  return entries
}
