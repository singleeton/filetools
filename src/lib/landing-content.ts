import { db } from './db'
import type { Dictionary } from './i18n/dictionaries/en'

export async function getLandingOverrides(locale: string): Promise<Record<string, Record<string, string>>> {
  try {
    const content = await db.landingContent.findMany({
      where: { locale },
    })

    const overrides: Record<string, Record<string, string>> = {}
    for (const entry of content) {
      try {
        overrides[entry.section] = JSON.parse(entry.content)
      } catch {
        // skip invalid JSON
      }
    }
    return overrides
  } catch {
    return {}
  }
}

export function applyOverrides(
  dict: Dictionary,
  overrides: Record<string, Record<string, string>>,
): Dictionary {
  const result = JSON.parse(JSON.stringify(dict)) as Dictionary

  if (overrides.hero) {
    if (overrides.hero.title) result.hero.title = overrides.hero.title
    if (overrides.hero.subtitle) result.hero.subtitle = overrides.hero.subtitle
    if (overrides.hero.cta) result.hero.cta = overrides.hero.cta
    if (overrides.hero.heroImage) result.hero.image = overrides.hero.heroImage
  }

  if (overrides.features) {
    if (overrides.features.title) result.features.title = overrides.features.title
    if (overrides.features.subtitle) result.features.subtitle = overrides.features.subtitle
  }

  const featureKeys = ['fast', 'secure', 'noInstall', 'mobile'] as const
  featureKeys.forEach((key, i) => {
    const o = overrides[`feature_${i + 1}`]
    if (o) {
      if (o.title) result.features[key].title = o.title
      if (o.description) result.features[key].description = o.description
      if (o.image) result.features[key].image = o.image
    }
  })

  if (overrides.howItWorks) {
    if (overrides.howItWorks.title) result.howItWorks.title = overrides.howItWorks.title
    if (overrides.howItWorks.subtitle) result.howItWorks.subtitle = overrides.howItWorks.subtitle
  }

  const stepKeys = ['step1', 'step2', 'step3'] as const
  stepKeys.forEach((key, i) => {
    const o = overrides[`step_${i + 1}`]
    if (o) {
      if (o.title) result.howItWorks[key].title = o.title
      if (o.description) result.howItWorks[key].description = o.description
    }
  })

  if (overrides.trust) {
    if (overrides.trust.title) result.trust.title = overrides.trust.title
    if (overrides.trust.subtitle) result.trust.subtitle = overrides.trust.subtitle
  }

  const trustKeys = ['noStorage', 'autoDelete', 'encrypted'] as const
  trustKeys.forEach((key, i) => {
    const o = overrides[`trust_${i + 1}`]
    if (o) {
      if (o.title) result.trust[key].title = o.title
      if (o.description) result.trust[key].description = o.description
    }
  })

  if (overrides.cta) {
    if (overrides.cta.title) result.cta.title = overrides.cta.title
    if (overrides.cta.subtitle) result.cta.subtitle = overrides.cta.subtitle
    if (overrides.cta.button) result.cta.button = overrides.cta.button
  }

  const faqOverride = overrides.faq
  if (faqOverride && Array.isArray(faqOverride.items)) {
    const items = faqOverride.items as unknown as { question: string; answer: string }[]
    if (items.length > 0) {
      result.faq.items = items
    }
  }

  return result
}
