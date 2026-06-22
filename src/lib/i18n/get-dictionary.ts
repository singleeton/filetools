import type { Locale } from './config'
import { defaultLocale } from './config'
import type { Dictionary } from './dictionaries/en'

const dictionaries: Record<string, () => Promise<Dictionary>> = {
  en: () => import('./dictionaries/en').then((m) => m.en),
  tr: () => import('./dictionaries/tr').then((m) => m.tr),
  ru: () => import('./dictionaries/ru').then((m) => m.ru),
  zh: () => import('./dictionaries/zh').then((m) => m.zh),
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const loader = dictionaries[locale] || dictionaries[defaultLocale]
  return loader()
}
